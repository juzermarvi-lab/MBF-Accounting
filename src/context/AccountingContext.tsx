import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { auth, db, googleProvider, testConnection } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { defaultBackupData } from '../data/initialBackup';
import { standardFreshChartOfAccounts, initialTaxCodes } from '../data/accounts';
import { initialUsers } from '../data/business';
import {
  AppTabId,
  AuditLogItem,
  BackupData,
  BankAccount,
  BusinessDetails,
  ChartOfAccountItem,
  Customer,
  InventoryItem,
  NewBusinessInput,
  Payment,
  PurchaseInvoice,
  Receipt,
  SalesInvoice,
  SummarySettings,
  Supplier,
  Transfer,
  UserItem
} from '../types/accounting';

const BUSINESSES_STORAGE_KEY = 'mbf_businesses_v2';
const ACTIVE_BIZ_KEY = 'mbf_active_business_id';
const LEGACY_STORAGE_KEY = 'mbf_accounting_backup_v1';

export type ReportType =
  | 'customer-transactions'
  | 'supplier-transactions'
  | 'profit-loss'
  | 'balance-sheet'
  | 'trial-balance'
  | 'customer-aging'
  | 'supplier-payables'
  | 'inventory-valuation';

export interface ReportFilterState {
  reportType: ReportType;
  selectedCustomerId?: string | null;
  selectedSupplierId?: string | null;
  startDate?: string;
  endDate?: string;
}

export type CloudSyncStatus = 'connected' | 'syncing' | 'offline' | 'error';

interface AccountingContextType {
  data: BackupData;
  businesses: BackupData[];
  activeBusinessId: string;
  switchBusiness: (businessId: string) => void;
  addBusiness: (input: NewBusinessInput) => string;
  duplicateBusiness: (sourceBusinessId: string, newName: string) => string;
  deleteBusiness: (businessId: string) => { success: boolean; error?: string };
  exportAllBusinessesBackup: () => void;
  activeTab: AppTabId;
  setActiveTab: (tab: AppTabId) => void;
  currentUser: UserItem;
  setCurrentUser: (user: UserItem) => void;
  // Firebase Cloud & Live Collaboration
  authUser: FirebaseUser | null;
  authLoading: boolean;
  cloudSyncStatus: CloudSyncStatus;
  cloudSyncError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutGoogle: () => Promise<void>;
  reportFilterState: ReportFilterState;
  setReportFilterState: React.Dispatch<React.SetStateAction<ReportFilterState>>;
  navigateToReport: (reportType: ReportType, entityId?: { customerId?: string; supplierId?: string }) => void;
  resetToDefaultBackup: () => void;
  importBackupJSON: (jsonString: string, asNewBusiness?: boolean) => { success: boolean; error?: string; businessId?: string };
  exportBackupJSON: () => void;
  // Mutations on active business
  addSalesInvoice: (invoice: Omit<SalesInvoice, 'id'>) => void;
  updateSalesInvoice: (invoice: SalesInvoice) => void;
  deleteSalesInvoice: (id: string) => void;
  addPurchaseInvoice: (invoice: Omit<PurchaseInvoice, 'id'>) => void;
  updatePurchaseInvoice: (invoice: PurchaseInvoice) => void;
  deletePurchaseInvoice: (id: string) => void;
  addReceipt: (receipt: Omit<Receipt, 'id'>) => void;
  updateReceipt: (receipt: Receipt) => void;
  deleteReceipt: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  addTransfer: (transfer: Omit<Transfer, 'id'>) => void;
  deleteTransfer: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  addBankAccount: (account: Omit<BankAccount, 'id'>) => void;
  updateBankAccount: (account: BankAccount) => void;
  deleteBankAccount: (id: string) => void;
  addChartAccount: (acc: Omit<ChartOfAccountItem, 'id'>) => void;
  updateBusinessDetails: (details: BusinessDetails) => void;
  updateSummarySettings: (settings: SummarySettings) => void;
  logAuditAction: (action: 'Create' | 'Update' | 'Delete', entityType: string, summary: string) => void;
  batchImportEntities: (entityKey: keyof BackupData, items: any[], label: string, matchKey?: string) => { created: number; updated: number };
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load businesses list from local storage initial cache
  const [businesses, setBusinesses] = useState<BackupData[]>(() => {
    try {
      const savedList = localStorage.getItem(BUSINESSES_STORAGE_KEY);
      if (savedList) {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacySaved) {
        const parsedLegacy = JSON.parse(legacySaved);
        if (parsedLegacy && parsedLegacy.name && Array.isArray(parsedLegacy.chartOfAccounts)) {
          return [parsedLegacy];
        }
      }
    } catch (e) {
      console.warn("Could not load from localStorage, falling back to backup file", e);
    }
    return [defaultBackupData];
  });

  // Active business ID
  const [activeBusinessId, setActiveBusinessId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_BIZ_KEY);
      if (savedId) return savedId;
    } catch (e) {}
    return businesses[0]?.id || defaultBackupData.id;
  });

  // Resolve current active business
  const activeBusiness: BackupData =
    businesses.find(b => b.id === activeBusinessId) || businesses[0] || defaultBackupData;

  const [activeTab, setActiveTab] = useState<AppTabId>('summary');
  const [currentUser, setCurrentUser] = useState<UserItem>(
    () => activeBusiness.users?.[0] || defaultBackupData.users[0]
  );

  // Firebase Auth & Live Cloud Synchronization State
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('offline');
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);

  const [reportFilterState, setReportFilterState] = useState<ReportFilterState>({
    reportType: 'customer-transactions',
    selectedCustomerId: null,
    selectedSupplierId: null,
    startDate: '2026-01-01',
    endDate: '2026-12-31'
  });

  const navigateToReport = (reportType: ReportType, entityId?: { customerId?: string; supplierId?: string }) => {
    setReportFilterState(prev => ({
      ...prev,
      reportType,
      selectedCustomerId: entityId?.customerId !== undefined ? entityId.customerId : prev.selectedCustomerId,
      selectedSupplierId: entityId?.supplierId !== undefined ? entityId.supplierId : prev.selectedSupplierId
    }));
    setActiveTab('reports');
  };

  // Local storage caching for offline resilience
  useEffect(() => {
    try {
      localStorage.setItem(BUSINESSES_STORAGE_KEY, JSON.stringify(businesses));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(activeBusiness));
    } catch (e) {
      console.error("Failed to save businesses to localStorage", e);
    }
  }, [businesses, activeBusiness]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_BIZ_KEY, activeBusinessId);
    } catch (e) {}
  }, [activeBusinessId]);

  // Test connection on boot per SKILL.md mandate
  useEffect(() => {
    testConnection().catch(err => {
      console.warn("Initial Firestore connection probe:", err);
    });
  }, []);

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setAuthUser(user);
      setAuthLoading(false);
      if (user) {
        setCloudSyncStatus('syncing');
        // Update user context name if available
        if (user.displayName || user.email) {
          setCurrentUser(prev => ({
            ...prev,
            name: user.displayName || user.email?.split('@')[0] || prev.name,
            email: user.email || prev.email
          }));
        }
      } else {
        setCloudSyncStatus('offline');
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper to persist a single business into Firestore
  const saveBusinessToCloud = async (biz: BackupData) => {
    if (!auth.currentUser) return;
    const path = `businesses/${biz.id}`;
    try {
      setCloudSyncStatus('syncing');
      const sanitized = JSON.parse(JSON.stringify(biz));
      await setDoc(doc(db, 'businesses', biz.id), sanitized);
      setCloudSyncStatus('connected');
      setCloudSyncError(null);
    } catch (err) {
      setCloudSyncStatus('error');
      setCloudSyncError(err instanceof Error ? err.message : String(err));
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  // Live real-time Firestore listener when authenticated
  useEffect(() => {
    if (!authUser) {
      setCloudSyncStatus('offline');
      return;
    }

    setCloudSyncStatus('syncing');
    const pathForOnSnapshot = 'businesses';

    const unsubscribe = onSnapshot(
      collection(db, pathForOnSnapshot),
      async snapshot => {
        if (snapshot.empty) {
          // If Firestore is empty on first setup, seed with local businesses
          try {
            setCloudSyncStatus('syncing');
            for (const b of businesses) {
              const sanitized = JSON.parse(JSON.stringify(b));
              await setDoc(doc(db, 'businesses', b.id), sanitized);
            }
            setCloudSyncStatus('connected');
            setCloudSyncError(null);
          } catch (seedErr) {
            setCloudSyncStatus('error');
            handleFirestoreError(seedErr, OperationType.WRITE, pathForOnSnapshot);
          }
        } else {
          // Live documents received from Cloud Firestore
          const cloudList: BackupData[] = [];
          snapshot.forEach(docSnap => {
            const item = docSnap.data() as BackupData;
            if (item && item.id && item.name) {
              cloudList.push(item);
            }
          });

          if (cloudList.length > 0) {
            setBusinesses(cloudList);
            setCloudSyncStatus('connected');
            setCloudSyncError(null);
          }
        }
      },
      error => {
        setCloudSyncStatus('error');
        setCloudSyncError(error.message);
        handleFirestoreError(error, OperationType.LIST, pathForOnSnapshot);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  // Helper to mutate active business and sync to Firestore
  const updateActiveBusiness = (updater: (prev: BackupData) => BackupData) => {
    setBusinesses(prevList => {
      let updatedTarget: BackupData | null = null;
      const nextList = prevList.map(biz => {
        if (biz.id === activeBusiness.id) {
          const updated = updater(biz);
          updatedTarget = updated;
          return updated;
        }
        return biz;
      });

      if (updatedTarget) {
        saveBusinessToCloud(updatedTarget);
      }

      return nextList;
    });
  };

  const logAudit = (action: 'Create' | 'Update' | 'Delete', entityType: string, summary: string) => {
    const userLabel = authUser?.displayName
      ? `${authUser.displayName} (${authUser.email}) · Live Cloud`
      : `${currentUser.name} (${currentUser.email.split('@')[0]}) · Chrome · Desktop`;

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      user: userLabel,
      action,
      entityType,
      reference: activeBusiness.name || "MBF",
      summary
    };
    updateActiveBusiness(prev => ({
      ...prev,
      auditHistory: [newLog, ...prev.auditHistory]
    }));
  };

  // Google Sign-In & Sign-Out handlers
  const signInWithGoogle = async () => {
    try {
      setCloudSyncStatus('syncing');
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      setCloudSyncStatus('offline');
      setCloudSyncError(err.message || 'Failed to authenticate with Google');
    }
  };

  const signOutGoogle = async () => {
    try {
      await signOut(auth);
      setCloudSyncStatus('offline');
    } catch (err: any) {
      console.error("Google Sign-Out error:", err);
    }
  };

  // Switch Business
  const switchBusiness = (businessId: string) => {
    const found = businesses.find(b => b.id === businessId);
    if (!found) return;
    setActiveBusinessId(businessId);
    if (found.users && found.users.length > 0) {
      const match = found.users.find(u => u.email === currentUser.email) || found.users[0];
      setCurrentUser(match);
    }
  };

  // Add Business
  const addBusiness = (input: NewBusinessInput): string => {
    const newId = `biz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const tradeName = input.name.trim();

    const chartOfAccounts =
      input.templateType === 'clone_current'
        ? JSON.parse(JSON.stringify(activeBusiness.chartOfAccounts))
        : standardFreshChartOfAccounts;

    const taxCodes =
      input.templateType === 'clone_current'
        ? JSON.parse(JSON.stringify(activeBusiness.taxCodes))
        : initialTaxCodes;

    const initialBank: BankAccount = {
      id: `bnk-${Date.now()}`,
      code: 'BNK-101',
      name: input.initialBankName?.trim() || 'Cash in Hand / Main Account',
      institution: input.initialBankName?.trim() || 'Main Operating Account',
      accountNumber: `${input.currency.code}-001`,
      startingBalance: Number(input.initialBankBalance) || 0
    };

    const newBiz: BackupData = {
      id: newId,
      name: tradeName,
      sector: input.sector?.trim() || 'General Business',
      currency: input.currency,
      businessDetails: {
        id: newId,
        name: tradeName,
        legalName: input.legalName?.trim() || tradeName,
        sector: input.sector?.trim() || 'General Business',
        email: input.email?.trim() || `accounts@${tradeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: input.phone?.trim() || '+1 555-0100',
        taxId: input.taxId?.trim() || 'REG-TAX-01',
        address: input.address?.trim() || 'Headquarters Office',
        footerNote: input.footerNote?.trim() || `Thank you for choosing ${tradeName}!`
      },
      summarySettings: {
        balanceSheetDate: new Date().toISOString().split('T')[0],
        accountingMethod: 'Accrual',
        showZeroBalances: false,
        periodStart: `${new Date().getFullYear()}-01-01`,
        periodEnd: `${new Date().getFullYear()}-12-31`
      },
      enabledTabs: [
        'summary',
        'bank-accounts',
        'receipts',
        'payments',
        'transfers',
        'customers',
        'sales-invoices',
        'suppliers',
        'purchase-invoices',
        'inventory-items',
        'chart-of-accounts',
        'reports',
        'audit-trail',
        'users',
        'settings'
      ],
      chartOfAccounts,
      taxCodes,
      bankAccounts: [initialBank],
      receipts: [],
      payments: [],
      transfers: [],
      customers: [],
      suppliers: [],
      inventoryItems: [],
      salesInvoices: [],
      purchaseInvoices: [],
      auditHistory: [
        {
          id: `log-init-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: authUser?.displayName || `${currentUser.name} (${currentUser.email.split('@')[0]})`,
          action: 'Create',
          entityType: 'Settings',
          reference: tradeName,
          summary: `Created business entity "${tradeName}" (${input.currency.code} ${input.currency.symbol})`
        }
      ],
      users: initialUsers.map(u => ({
        ...u,
        assignedBusinessIds: ['*']
      })),
      activeSessions: [
        {
          sessionId: `sess-${Date.now().toString(36)}`,
          userId: currentUser.id,
          userName: authUser?.displayName || currentUser.name,
          userEmail: authUser?.email || currentUser.email,
          rolePreset: currentUser.rolePreset,
          deviceLabel: 'Chrome · Desktop (Active)',
          activeBusinessId: newId,
          activeTab: 'summary',
          lastActiveAt: new Date().toISOString()
        }
      ]
    };

    setBusinesses(prev => [...prev, newBiz]);
    setActiveBusinessId(newId);
    saveBusinessToCloud(newBiz);
    return newId;
  };

  // Duplicate Business
  const duplicateBusiness = (sourceBusinessId: string, newName: string): string => {
    const source = businesses.find(b => b.id === sourceBusinessId) || activeBusiness;
    const newId = `biz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const cloned: BackupData = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      name: newName.trim(),
      businessDetails: {
        ...source.businessDetails,
        id: newId,
        name: newName.trim(),
        legalName: `${newName.trim()} (Subsidiary/Branch)`
      },
      auditHistory: [
        {
          id: `log-dup-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: authUser?.displayName || currentUser.name,
          action: 'Create',
          entityType: 'Settings',
          reference: newName.trim(),
          summary: `Cloned business profile from "${source.name}"`
        }
      ]
    };

    setBusinesses(prev => [...prev, cloned]);
    setActiveBusinessId(newId);
    saveBusinessToCloud(cloned);
    return newId;
  };

  // Delete Business
  const deleteBusiness = (businessId: string): { success: boolean; error?: string } => {
    if (businesses.length <= 1) {
      return { success: false, error: 'Cannot delete the only remaining business in the system.' };
    }
    const remaining = businesses.filter(b => b.id !== businessId);
    setBusinesses(remaining);
    if (activeBusinessId === businessId) {
      setActiveBusinessId(remaining[0].id);
    }
    // Delete from cloud if authenticated
    if (auth.currentUser) {
      deleteDoc(doc(db, 'businesses', businessId)).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `businesses/${businessId}`);
      });
    }
    return { success: true };
  };

  // Export Bundle of all businesses
  const exportAllBusinessesBackup = () => {
    const bundle = {
      exportVersion: '2.0',
      exportedAt: new Date().toISOString(),
      activeBusinessId,
      businesses
    };
    const jsonStr = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mbf-all-companies-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logAudit('Update', 'Settings', `Exported all ${businesses.length} companies bundle`);
  };

  const resetToDefaultBackup = () => {
    updateActiveBusiness(() => defaultBackupData);
    logAudit('Update', 'Settings', 'Reset active business database to factory template');
  };

  const importBackupJSON = (jsonString: string, asNewBusiness?: boolean) => {
    try {
      const parsed = JSON.parse(jsonString);

      if (parsed && Array.isArray(parsed.businesses) && parsed.businesses.length > 0) {
        setBusinesses(parsed.businesses);
        const targetId =
          parsed.activeBusinessId && parsed.businesses.some((b: any) => b.id === parsed.activeBusinessId)
            ? parsed.activeBusinessId
            : parsed.businesses[0].id;
        setActiveBusinessId(targetId);

        // Upload to cloud if signed in
        if (auth.currentUser) {
          for (const b of parsed.businesses) {
            saveBusinessToCloud(b);
          }
        }
        return { success: true, businessId: targetId };
      }

      if (!parsed || !parsed.name || !Array.isArray(parsed.chartOfAccounts)) {
        return { success: false, error: 'Invalid backup structure. Missing name or chart of accounts.' };
      }

      if (asNewBusiness) {
        const newId = `biz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newBiz: BackupData = {
          ...parsed,
          id: newId,
          name: `${parsed.name} (Imported)`,
          businessDetails: {
            ...parsed.businessDetails,
            id: newId,
            name: `${parsed.name} (Imported)`
          }
        };
        setBusinesses(prev => [...prev, newBiz]);
        setActiveBusinessId(newId);
        saveBusinessToCloud(newBiz);
        return { success: true, businessId: newId };
      }

      // Replace current business
      updateActiveBusiness(() => parsed);
      logAudit('Update', 'Settings', `Imported backup for company: ${parsed.name}`);
      return { success: true, businessId: parsed.id };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid JSON syntax' };
    }
  };

  const exportBackupJSON = () => {
    const jsonStr = JSON.stringify(activeBusiness, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeBusiness.name || 'MBF'}-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logAudit('Update', 'Settings', `Exported full company backup JSON for ${activeBusiness.name}`);
  };

  // Sales Invoices
  const addSalesInvoice = (inv: Omit<SalesInvoice, 'id'>) => {
    const id = `sinv-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newInvoice: SalesInvoice = { ...inv, id };
    updateActiveBusiness(prev => ({ ...prev, salesInvoices: [newInvoice, ...prev.salesInvoices] }));
    logAudit('Create', 'Sales Invoices', `Created Sales Invoice #${newInvoice.reference}`);
  };

  const updateSalesInvoice = (inv: SalesInvoice) => {
    updateActiveBusiness(prev => ({
      ...prev,
      salesInvoices: prev.salesInvoices.map(i => (i.id === inv.id ? inv : i))
    }));
    logAudit('Update', 'Sales Invoices', `Updated Sales Invoice #${inv.reference}`);
  };

  const deleteSalesInvoice = (id: string) => {
    const target = activeBusiness.salesInvoices.find(i => i.id === id);
    updateActiveBusiness(prev => ({
      ...prev,
      salesInvoices: prev.salesInvoices.filter(i => i.id !== id)
    }));
    logAudit('Delete', 'Sales Invoices', `Deleted Sales Invoice #${target?.reference || id}`);
  };

  // Purchase Invoices
  const addPurchaseInvoice = (inv: Omit<PurchaseInvoice, 'id'>) => {
    const id = `pi-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newInvoice: PurchaseInvoice = { ...inv, id };
    updateActiveBusiness(prev => ({ ...prev, purchaseInvoices: [newInvoice, ...prev.purchaseInvoices] }));
    logAudit('Create', 'Purchase Invoices', `Created Purchase Invoice #${newInvoice.reference}`);
  };

  const updatePurchaseInvoice = (inv: PurchaseInvoice) => {
    updateActiveBusiness(prev => ({
      ...prev,
      purchaseInvoices: prev.purchaseInvoices.map(i => (i.id === inv.id ? inv : i))
    }));
    logAudit('Update', 'Purchase Invoices', `Updated Purchase Invoice #${inv.reference}`);
  };

  const deletePurchaseInvoice = (id: string) => {
    const target = activeBusiness.purchaseInvoices.find(i => i.id === id);
    updateActiveBusiness(prev => ({
      ...prev,
      purchaseInvoices: prev.purchaseInvoices.filter(i => i.id !== id)
    }));
    logAudit('Delete', 'Purchase Invoices', `Deleted Purchase Invoice #${target?.reference || id}`);
  };

  // Receipts
  const addReceipt = (r: Omit<Receipt, 'id'>) => {
    const id = `rcp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newReceipt: Receipt = { ...r, id };
    updateActiveBusiness(prev => ({ ...prev, receipts: [newReceipt, ...prev.receipts] }));
    logAudit('Create', 'Receipts', `Recorded Receipt ${newReceipt.reference} from ${newReceipt.payerName}`);
  };

  const updateReceipt = (r: Receipt) => {
    updateActiveBusiness(prev => ({
      ...prev,
      receipts: prev.receipts.map(item => (item.id === r.id ? r : item))
    }));
    logAudit('Update', 'Receipts', `Updated Receipt ${r.reference}`);
  };

  const deleteReceipt = (id: string) => {
    const target = activeBusiness.receipts.find(item => item.id === id);
    updateActiveBusiness(prev => ({
      ...prev,
      receipts: prev.receipts.filter(item => item.id !== id)
    }));
    logAudit('Delete', 'Receipts', `Deleted Receipt ${target?.reference || id}`);
  };

  // Payments
  const addPayment = (p: Omit<Payment, 'id'>) => {
    const id = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newPayment: Payment = { ...p, id };
    updateActiveBusiness(prev => ({ ...prev, payments: [newPayment, ...prev.payments] }));
    logAudit('Create', 'Payments', `Recorded Payment ${newPayment.reference} to ${newPayment.payeeName}`);
  };

  const updatePayment = (p: Payment) => {
    updateActiveBusiness(prev => ({
      ...prev,
      payments: prev.payments.map(item => (item.id === p.id ? p : item))
    }));
    logAudit('Update', 'Payments', `Updated Payment ${p.reference}`);
  };

  const deletePayment = (id: string) => {
    const target = activeBusiness.payments.find(item => item.id === id);
    updateActiveBusiness(prev => ({
      ...prev,
      payments: prev.payments.filter(item => item.id !== id)
    }));
    logAudit('Delete', 'Payments', `Deleted Payment ${target?.reference || id}`);
  };

  // Transfers
  const addTransfer = (t: Omit<Transfer, 'id'>) => {
    const id = `trn-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newTransfer: Transfer = { ...t, id };
    updateActiveBusiness(prev => ({ ...prev, transfers: [newTransfer, ...prev.transfers] }));
    logAudit('Create', 'Bank Transfers', `Recorded Transfer ${newTransfer.reference} of ${newTransfer.amount}`);
  };

  const deleteTransfer = (id: string) => {
    const target = activeBusiness.transfers.find(item => item.id === id);
    updateActiveBusiness(prev => ({
      ...prev,
      transfers: prev.transfers.filter(item => item.id !== id)
    }));
    logAudit('Delete', 'Bank Transfers', `Deleted Transfer ${target?.reference || id}`);
  };

  // Customers
  const addCustomer = (c: Omit<Customer, 'id'>) => {
    const id = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newCustomer: Customer = { ...c, id };
    updateActiveBusiness(prev => ({ ...prev, customers: [...prev.customers, newCustomer] }));
    logAudit('Create', 'Customers', `Added customer "${newCustomer.name}" (${newCustomer.code})`);
  };

  const updateCustomer = (c: Customer) => {
    updateActiveBusiness(prev => ({
      ...prev,
      customers: prev.customers.map(item => (item.id === c.id ? c : item))
    }));
    logAudit('Update', 'Customers', `Updated customer "${c.name}"`);
  };

  const deleteCustomer = (id: string) => {
    const target = activeBusiness.customers.find(item => item.id === id);
    updateActiveBusiness(prev => ({
      ...prev,
      customers: prev.customers.filter(item => item.id !== id)
    }));
    logAudit('Delete', 'Customers', `Deleted customer "${target?.name || id}"`);
  };

  // Suppliers
  const addSupplier = (s: Omit<Supplier, 'id'>) => {
    const id = `sup-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newSupplier: Supplier = { ...s, id };
    updateActiveBusiness(prev => ({ ...prev, suppliers: [...prev.suppliers, newSupplier] }));
    logAudit('Create', 'Suppliers', `Added supplier "${newSupplier.name}" (${newSupplier.code})`);
  };

  const updateSupplier = (s: Supplier) => {
    updateActiveBusiness(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(item => (item.id === s.id ? s : item))
    }));
    logAudit('Update', 'Suppliers', `Updated supplier "${s.name}"`);
  };

  const deleteSupplier = (id: string) => {
    const target = activeBusiness.suppliers.find(item => item.id === id);
    updateActiveBusiness(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter(item => item.id !== id)
    }));
    logAudit('Delete', 'Suppliers', `Deleted supplier "${target?.name || id}"`);
  };

  // Inventory
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const id = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newItem: InventoryItem = { ...item, id };
    updateActiveBusiness(prev => ({ ...prev, inventoryItems: [...prev.inventoryItems, newItem] }));
    logAudit('Create', 'Inventory', `Created product "${newItem.name}" (${newItem.code})`);
  };

  const updateInventoryItem = (item: InventoryItem) => {
    updateActiveBusiness(prev => ({
      ...prev,
      inventoryItems: prev.inventoryItems.map(i => (i.id === item.id ? item : i))
    }));
    logAudit('Update', 'Inventory', `Updated product "${item.name}"`);
  };

  const deleteInventoryItem = (id: string) => {
    const target = activeBusiness.inventoryItems.find(i => i.id === id);
    updateActiveBusiness(prev => ({
      ...prev,
      inventoryItems: prev.inventoryItems.filter(i => i.id !== id)
    }));
    logAudit('Delete', 'Inventory', `Deleted product "${target?.name || id}"`);
  };

  // Bank Accounts
  const addBankAccount = (acc: Omit<BankAccount, 'id'>) => {
    const id = `bank-${Date.now()}`;
    const newAcc: BankAccount = { ...acc, id };
    updateActiveBusiness(prev => ({ ...prev, bankAccounts: [...prev.bankAccounts, newAcc] }));
    logAudit('Create', 'Bank Accounts', `Added bank account "${newAcc.name}" (${newAcc.institution})`);
  };

  const updateBankAccount = (acc: BankAccount) => {
    updateActiveBusiness(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map(b => (b.id === acc.id ? acc : b))
    }));
    logAudit('Update', 'Bank Accounts', `Updated bank account "${acc.name}"`);
  };

  const deleteBankAccount = (id: string) => {
    const target = activeBusiness.bankAccounts.find(b => b.id === id);
    updateActiveBusiness(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter(b => b.id !== id)
    }));
    logAudit('Delete', 'Bank Accounts', `Deleted bank account "${target?.name || id}"`);
  };

  // Chart of accounts
  const addChartAccount = (acc: Omit<ChartOfAccountItem, 'id'>) => {
    const id = `acc-custom-${Date.now()}`;
    const newAcc: ChartOfAccountItem = { ...acc, id };
    updateActiveBusiness(prev => ({ ...prev, chartOfAccounts: [...prev.chartOfAccounts, newAcc] }));
    logAudit('Update', 'Settings', `Created Chart of Accounts ledger "${newAcc.code} — ${newAcc.name}"`);
  };

  const updateBusinessDetails = (details: BusinessDetails) => {
    updateActiveBusiness(prev => ({
      ...prev,
      businessDetails: details,
      name: details.name,
      sector: details.sector || prev.sector
    }));
    logAudit('Update', 'Settings', `Updated Business Details for ${details.name}`);
  };

  const updateSummarySettings = (settings: SummarySettings) => {
    updateActiveBusiness(prev => ({ ...prev, summarySettings: settings }));
    logAudit('Update', 'Summary', `Updated Summary View (${settings.accountingMethod} basis)`);
  };

  const batchImportEntities = (
    entityKey: keyof BackupData,
    incomingItems: any[],
    label: string,
    matchKey: string = 'code'
  ): { created: number; updated: number } => {
    let created = 0;
    let updated = 0;

    updateActiveBusiness(prev => {
      const existingList = (prev[entityKey] as any[]) || [];
      const updatedList = [...existingList];

      incomingItems.forEach(item => {
        const existingIdx = updatedList.findIndex(existing => {
          if (item.id && existing.id === item.id) return true;
          if (matchKey && item[matchKey] && existing[matchKey] && item[matchKey] === existing[matchKey]) return true;
          if (item.reference && existing.reference && item.reference === existing.reference) return true;
          if (item.name && existing.name && item.name.toLowerCase() === existing.name.toLowerCase()) return true;
          return false;
        });

        if (existingIdx >= 0) {
          updatedList[existingIdx] = { ...updatedList[existingIdx], ...item };
          updated++;
        } else {
          const generatedId =
            item.id || `${entityKey.toString().slice(0, 4)}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          updatedList.push({ ...item, id: generatedId });
          created++;
        }
      });

      return {
        ...prev,
        [entityKey]: updatedList
      };
    });

    logAudit('Update', label, `CSV/JSON Batch Operations on ${label}: ${created} created, ${updated} updated`);
    return { created, updated };
  };

  return (
    <AccountingContext.Provider
      value={{
        data: activeBusiness,
        businesses,
        activeBusinessId: activeBusiness.id,
        switchBusiness,
        addBusiness,
        duplicateBusiness,
        deleteBusiness,
        exportAllBusinessesBackup,
        activeTab,
        setActiveTab,
        currentUser,
        setCurrentUser,
        authUser,
        authLoading,
        cloudSyncStatus,
        cloudSyncError,
        signInWithGoogle,
        signOutGoogle,
        reportFilterState,
        setReportFilterState,
        navigateToReport,
        resetToDefaultBackup,
        importBackupJSON,
        exportBackupJSON,
        addSalesInvoice,
        updateSalesInvoice,
        deleteSalesInvoice,
        addPurchaseInvoice,
        updatePurchaseInvoice,
        deletePurchaseInvoice,
        addReceipt,
        updateReceipt,
        deleteReceipt,
        addPayment,
        updatePayment,
        deletePayment,
        addTransfer,
        deleteTransfer,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        addChartAccount,
        updateBusinessDetails,
        updateSummarySettings,
        logAuditAction: logAudit,
        batchImportEntities
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};
