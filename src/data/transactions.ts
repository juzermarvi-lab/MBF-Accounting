import { Payment, PurchaseInvoice, Receipt, SalesInvoice, Transfer } from '../types/accounting';

export const initialReceipts: Receipt[] = [
  {
    reference: "RCP-2026-001",
    taxInclusive: false,
    id: "rcp-1791187597450",
    receivedInAccountId: "bank-1790928412719",
    customerId: "cust-1791187527602-2",
    payerName: "Haleema Kv-406",
    date: "2026-10-05",
    lines: [
      {
        accountId: "acc-ar",
        subAccountId: "cust-1791187527602-2",
        id: "rl-1791187597450",
        invoiceId: "OPENING_BALANCE",
        qty: 1,
        unitPrice: 100,
        description: "Opening Balance Receipt — Haleema Kv-406"
      }
    ],
    description: "Opening Balance Receipt — Haleema Kv-406",
    payerType: "Customer",
    clearedStatus: "Cleared"
  },
  {
    reference: "RCP-2026-002",
    customerId: "cust-1791188734036",
    description: "Receipt for Invoice #7298",
    lines: [
      {
        id: "rl-1791188902311",
        qty: 1,
        accountId: "acc-ar",
        subAccountId: "cust-1791188734036",
        unitPrice: 4560,
        invoiceId: "sinv-1791188781641-13",
        description: "Invoice #7298 settlement"
      }
    ],
    receivedInAccountId: "bank-1790928412719",
    clearedStatus: "Cleared",
    taxInclusive: false,
    date: "2026-10-05",
    payerName: "Nisreen Munawar Selamwala",
    payerType: "Customer",
    id: "rcp-1791188902313"
  },
  {
    clearedStatus: "Cleared",
    lines: [
      {
        subAccountId: "cust-1791188710500",
        id: "rl-1791188952621",
        accountId: "acc-ar",
        invoiceId: "sinv-1791188781641-12",
        qty: 1,
        unitPrice: 650,
        description: "Invoice #7299 settlement"
      }
    ],
    date: "2026-10-05",
    description: "Receipt for Invoice #7299",
    reference: "RCP-2026-003",
    receivedInAccountId: "bank-1790928412719",
    payerType: "Customer",
    customerId: "cust-1791188710500",
    id: "rcp-1791188952622",
    taxInclusive: false,
    payerName: "Hussaina KV-202"
  },
  {
    reference: "RCP-2026-004",
    customerId: "cust-1791188690961",
    lines: [
      {
        subAccountId: "cust-1791188690961",
        qty: 1,
        accountId: "acc-ar",
        id: "rl-1791188989539",
        invoiceId: "sinv-1791188781641-11",
        unitPrice: 2600,
        description: "Invoice #7300 settlement"
      }
    ],
    id: "rcp-1791188989540",
    receivedInAccountId: "bank-1790928412719",
    clearedStatus: "Cleared",
    payerName: "Arwa Clifton C/O Samia",
    description: "Receipt for Invoice #7300",
    taxInclusive: false,
    payerType: "Customer",
    date: "2026-10-05"
  },
  {
    reference: "RCP-2026-005",
    description: "Receipt for Invoice #7302",
    customerId: "cust-1791188624789",
    receivedInAccountId: "bank-1790934033978",
    id: "rcp-1791189080901",
    taxInclusive: false,
    payerName: "Nafisa Shakir Clifton",
    date: "2026-10-05",
    lines: [
      {
        unitPrice: 1100,
        invoiceId: "sinv-1791188781641-9",
        qty: 1,
        accountId: "acc-ar",
        subAccountId: "cust-1791188624789",
        id: "rl-1791189080900",
        description: "Invoice #7302 settlement"
      }
    ],
    clearedStatus: "Cleared",
    payerType: "Customer"
  },
  {
    taxInclusive: false,
    description: "Receipt for Invoice #7303",
    id: "rcp-1791189142379",
    payerName: "Rehana Qamri Cilifton",
    payerType: "Customer",
    receivedInAccountId: "bank-1790928412719",
    customerId: "cust-1791188605287",
    reference: "RCP-2026-006",
    date: "2026-10-05",
    clearedStatus: "Cleared",
    lines: [
      {
        subAccountId: "cust-1791188605287",
        accountId: "acc-ar",
        id: "rl-1791189142377",
        description: "Invoice #7303 settlement",
        qty: 1,
        unitPrice: 950,
        invoiceId: "sinv-1791188781641-8"
      }
    ]
  },
  {
    payerType: "Customer",
    description: "Receipt for Invoice #7304",
    taxInclusive: false,
    payerName: "Insia Clifton",
    id: "rcp-1791189173046",
    receivedInAccountId: "bank-1790934033978",
    date: "2026-10-05",
    customerId: "cust-1791188554972",
    clearedStatus: "Cleared",
    lines: [
      {
        unitPrice: 2800,
        qty: 1,
        invoiceId: "sinv-1791188781641-7",
        subAccountId: "cust-1791188554972",
        accountId: "acc-ar",
        description: "Invoice #7304 settlement",
        id: "rl-1791189173044"
      }
    ],
    reference: "RCP-2026-007"
  },
  {
    description: "Receipt for Invoice #7306",
    reference: "RCP-2026-008",
    payerType: "Customer",
    clearedStatus: "Cleared",
    date: "2026-10-05",
    customerId: "cust-1791188470388",
    lines: [
      {
        invoiceId: "sinv-1791188781641-5",
        id: "rl-1791189242956",
        subAccountId: "cust-1791188470388",
        unitPrice: 1000,
        qty: 1,
        accountId: "acc-ar",
        description: "Invoice #7306 settlement"
      }
    ],
    id: "rcp-1791189242957",
    taxInclusive: false,
    payerName: "Sakina Rashida Chachi",
    receivedInAccountId: "bank-1790928412719"
  },
  {
    lines: [
      {
        id: "rl-1791189326617",
        unitPrice: 4400,
        description: "Invoice #7307 settlement",
        invoiceId: "sinv-1791188781641-4",
        qty: 1,
        accountId: "acc-ar",
        subAccountId: "cust-1791188444176"
      }
    ],
    reference: "RCP-2026-009",
    date: "2026-10-05",
    payerType: "Customer",
    taxInclusive: false,
    clearedStatus: "Cleared",
    description: "Receipt for Invoice #7307",
    customerId: "cust-1791188444176",
    payerName: "Afroz C/O Facebooh Haideri",
    receivedInAccountId: "bank-1790928412719",
    id: "rcp-1791189326619"
  },
  {
    customerId: "cust-1791187527602-2",
    receivedInAccountId: "bank-1790928412719",
    id: "rcp-1791189369761",
    lines: [
      {
        accountId: "acc-ar",
        id: "rl-1791189369760",
        subAccountId: "cust-1791187527602-2",
        qty: 1,
        unitPrice: 650,
        description: "Invoice #7308 settlement",
        invoiceId: "sinv-1791188781641-3"
      }
    ],
    reference: "RCP-2026-0010",
    taxInclusive: false,
    description: "Receipt for Invoice #7308",
    clearedStatus: "Cleared",
    payerType: "Customer",
    payerName: "Haleema Kv-406",
    date: "2026-10-05"
  },
  {
    payerName: "Salma Dr. Hina Mother",
    description: "Receipt for Invoice #7309",
    payerType: "Customer",
    customerId: "cust-1791189508842",
    id: "rcp-1791189576025",
    reference: "RCP-2026-0011",
    receivedInAccountId: "bank-1790934033978",
    clearedStatus: "Cleared",
    lines: [
      {
        invoiceId: "sinv-1791188781641-2",
        unitPrice: 2200,
        id: "rl-1791189576024",
        subAccountId: "cust-1791189508842",
        qty: 1,
        accountId: "acc-ar",
        description: "Invoice #7309 settlement"
      }
    ],
    taxInclusive: false,
    date: "2026-10-05"
  },
  {
    id: "rcp-1791366044329",
    date: "2026-10-06",
    reference: "RCP-2026-0012",
    receivedInAccountId: "bank-1790934033978",
    clearedStatus: "Cleared",
    payerType: "Customer",
    customerId: "cust-1791365547879",
    payerName: "Khadija Hamza Parekh",
    description: "Receipt for Invoice #INV-7312",
    taxInclusive: false,
    lines: [
      {
        id: "rl-1791366044326",
        accountId: "acc-ar",
        subAccountId: "cust-1791365547879",
        invoiceId: "sinv-1791365262333-9",
        description: "Invoice #INV-7312 settlement",
        qty: 1,
        unitPrice: 720
      }
    ]
  },
  {
    id: "rcp-1791366087353",
    date: "2026-10-06",
    reference: "RCP-2026-0013",
    receivedInAccountId: "bank-1790934033978",
    clearedStatus: "Cleared",
    payerType: "Customer",
    customerId: "cust-1791365505202",
    payerName: "Abbas Ali Tahira Brother",
    description: "Receipt for Invoice #INV-7313",
    taxInclusive: false,
    lines: [
      {
        id: "rl-1791366087351",
        accountId: "acc-ar",
        subAccountId: "cust-1791365505202",
        invoiceId: "sinv-1791365262333-8",
        description: "Invoice #INV-7313 settlement",
        qty: 1,
        unitPrice: 3840
      }
    ]
  },
  {
    id: "rcp-1791366135368",
    date: "2026-10-06",
    reference: "RCP-2026-0014",
    receivedInAccountId: "bank-1790934033978",
    clearedStatus: "Cleared",
    payerType: "Customer",
    customerId: "cust-1791365450665",
    payerName: "Shirin Highway C/O Batool Club",
    description: "Receipt for Invoice #INV-7316",
    taxInclusive: false,
    lines: [
      {
        id: "rl-1791366135366",
        accountId: "acc-ar",
        subAccountId: "cust-1791365450665",
        invoiceId: "sinv-1791365262333-5",
        description: "Invoice #INV-7316 settlement",
        qty: 1,
        unitPrice: 1800
      }
    ]
  },
  {
    id: "rcp-1791366184167",
    date: "2026-10-06",
    reference: "RCP-2026-0015",
    receivedInAccountId: "bank-1790934033978",
    clearedStatus: "Cleared",
    payerType: "Customer",
    customerId: "cust-1791365384690",
    payerName: "Batool Ali Asghar Saddar",
    description: "Receipt for Invoice #INV-7319",
    taxInclusive: false,
    lines: [
      {
        id: "rl-1791366184165",
        accountId: "acc-ar",
        subAccountId: "cust-1791365384690",
        invoiceId: "sinv-1791365262333-2",
        description: "Invoice #INV-7319 settlement",
        qty: 1,
        unitPrice: 1910
      }
    ]
  },
  {
    id: "rcp-1791366221113",
    date: "2026-10-06",
    reference: "RCP-2026-0016",
    receivedInAccountId: "bank-1790934033978",
    clearedStatus: "Cleared",
    payerType: "Customer",
    customerId: "cust-1791365358832",
    payerName: "Farida Babuji Pride",
    description: "Receipt for Invoice #INV-7320",
    taxInclusive: false,
    lines: [
      {
        id: "rl-1791366221111",
        accountId: "acc-ar",
        subAccountId: "cust-1791365358832",
        invoiceId: "sinv-1791365262333-1",
        description: "Invoice #INV-7320 settlement",
        qty: 1,
        unitPrice: 700
      }
    ]
  },
  {
    id: "rcp-1791366252239",
    date: "2026-10-06",
    reference: "RCP-2026-0017",
    receivedInAccountId: "bank-1790934033978",
    clearedStatus: "Cleared",
    payerType: "Customer",
    customerId: "cust-1791365318295",
    payerName: "Fatema Saddar (Bohra Food)",
    description: "Receipt for Invoice #INV-7321",
    taxInclusive: false,
    lines: [
      {
        id: "rl-1791366252237",
        accountId: "acc-ar",
        subAccountId: "cust-1791365318295",
        invoiceId: "sinv-1791365262333-0",
        description: "Invoice #INV-7321 settlement",
        qty: 1,
        unitPrice: 4340
      }
    ]
  },
  {
    id: "rcp-1791368176148",
    date: "2026-10-06",
    reference: "RCP-2026-0018",
    receivedInAccountId: "bank-1790934033978",
    clearedStatus: "Cleared",
    payerType: "Customer",
    customerId: "cust-1791188664346",
    payerName: "Samia Clifton",
    description: "Receipt for Invoice #7301",
    taxInclusive: false,
    lines: [
      {
        id: "rl-1791368176146",
        accountId: "acc-ar",
        subAccountId: "cust-1791188664346",
        invoiceId: "sinv-1791188781641-10",
        description: "Invoice #7301 settlement",
        qty: 1,
        unitPrice: 3410
      }
    ]
  },
  {
    id: "rcp-1791368789141",
    date: "2026-10-04",
    reference: "RCP-2026-0019",
    receivedInAccountId: "bank-1790934033978",
    clearedStatus: "Cleared",
    payerType: "Customer",
    customerId: "cust-1791188391690",
    payerName: "Sakina Aun Ali Clifton",
    description: "Receipt for Invoice #7310",
    taxInclusive: false,
    lines: [
      {
        id: "rl-1791368789139",
        accountId: "acc-ar",
        subAccountId: "cust-1791188391690",
        invoiceId: "sinv-1791188781641-1",
        description: "Invoice #7310 settlement",
        qty: 1,
        unitPrice: 1680
      }
    ]
  },
  {
    id: "rcp-1791370362578",
    date: "2026-10-07",
    reference: "RCP-2026-0020",
    receivedInAccountId: "bank-1790934033978",
    clearedStatus: "Cleared",
    payerType: "Customer",
    customerId: "cust-1791188492398",
    payerName: "Dr. Hina DHA",
    description: "Receipt for Invoice #7305",
    taxInclusive: false,
    lines: [
      {
        id: "rl-1791370362575",
        accountId: "acc-ar",
        subAccountId: "cust-1791188492398",
        invoiceId: "sinv-1791188781641-6",
        description: "Invoice #7305 settlement",
        qty: 1,
        unitPrice: 2780
      }
    ]
  },
  {
    id: "rcp-1791370396463",
    date: "2026-10-07",
    reference: "RCP-2026-0021",
    receivedInAccountId: "bank-1790934033978",
    clearedStatus: "Cleared",
    payerType: "Customer",
    customerId: "cust-1791365435990",
    payerName: "Alifya Motani Highway",
    description: "Receipt for Invoice #INV-7317",
    taxInclusive: false,
    lines: [
      {
        id: "rl-1791370396461",
        accountId: "acc-ar",
        subAccountId: "cust-1791365435990",
        invoiceId: "sinv-1791365262333-4",
        description: "Invoice #INV-7317 settlement",
        qty: 1,
        unitPrice: 2440
      }
    ]
  }
];

export const initialPayments: Payment[] = [
  {
    reference: "PMT-2026-001",
    clearedStatus: "Cleared",
    supplierId: "sup-1790935942473",
    date: "2026-10-02",
    paidFromAccountId: "bank-1790928412719",
    payeeType: "Other",
    taxInclusive: false,
    lines: [
      {
        accountId: "acc-custom-1790935000129",
        description: "Delivery fuel and transit expense",
        id: "pl-1791196695399",
        unitPrice: 1110,
        qty: 1
      }
    ],
    id: "pmt-1791196695399",
    payeeName: "Delivery Expenses",
    description: "Delivery Rider fuel settlement"
  },
  {
    payeeType: "Supplier",
    description: "Lump Sum Payment — Hussain Bhai",
    clearedStatus: "Cleared",
    id: "pmt-1791197697881",
    reference: "PMT-2026-002",
    lines: [
      {
        subAccountId: "sup-1790935942473",
        unitPrice: 20000,
        description: "Lump Sum Payment — Hussain Bhai (Auto-settled against Opening Balance & Purchase Invoices)",
        qty: 1,
        id: "pl-lump-1791197726379",
        accountId: "acc-ap"
      }
    ],
    paidFromAccountId: "bank-1790934033978",
    payeeName: "Hussain Bhai",
    supplierId: "sup-1790935942473",
    taxInclusive: false,
    date: "2026-10-03"
  },
  {
    id: "pmt-1791316036013",
    date: "2026-10-06",
    reference: "PMT-2026-003",
    paidFromAccountId: "bank-1790934033978",
    clearedStatus: "Cleared",
    payeeType: "Supplier",
    supplierId: "sup-1790936466275",
    payeeName: "Nadeem Bhai",
    description: "Payment for Purchase Invoice #PINV-9015",
    taxInclusive: false,
    lines: [
      {
        id: "pl-lump-1791316054869",
        accountId: "acc-ap",
        subAccountId: "sup-1790936466275",
        description: "Lump Sum Payment — Nadeem Bhai (Auto-settled against Opening Balance & Purchase Invoices)",
        qty: 1,
        unitPrice: 5000
      }
    ]
  },
  {
    id: "pmt-1791363848542",
    date: "2026-10-06",
    reference: "PMT-2026-004",
    paidFromAccountId: "bank-1790934033978",
    clearedStatus: "Cleared",
    payeeType: "Supplier",
    supplierId: "sup-1790935942473",
    payeeName: "Hussain Bhai",
    description: "Lump Sum Payment — Hussain Bhai",
    taxInclusive: false,
    lines: [
      {
        id: "pl-lump-1791363875299",
        accountId: "acc-ap",
        subAccountId: "sup-1790935942473",
        description: "Lump Sum Payment — Hussain Bhai (Auto-settled against Opening Balance & Purchase Invoices)",
        qty: 1,
        unitPrice: 10000
      }
    ],
    payerName: "Hussain Bhai"
  },
  {
    id: "pmt-1791369105446",
    date: "2026-10-06",
    reference: "PMT-2026-006",
    paidFromAccountId: "bank-1790928412719",
    clearedStatus: "Cleared",
    payeeType: "Other",
    payeeName: "Supplier Delivery Charges",
    description: "Cartage & Supplier drop off charges",
    taxInclusive: false,
    lines: [
      {
        id: "pl-1791369105446",
        accountId: "acc-custom-1791369248007",
        description: "Supplier Delivery Charges",
        qty: 1,
        unitPrice: 200
      }
    ]
  }
];

export const initialTransfers: Transfer[] = [];

export const initialPurchaseInvoices: PurchaseInvoice[] = [
  {
    supplierDiscountAmount: 0,
    reference: "PINV-9015",
    id: "pi-1791197294370",
    supplierDiscountPercent: 0,
    description: "Beef Chapli Kababs batch",
    deliveryCharges: 0,
    date: "2026-10-03",
    taxInclusive: false,
    lines: [
      {
        id: "l-1791197294370",
        accountId: "acc-inventory",
        qty: 10,
        itemId: "item-1790934400570",
        description: "Chapli Kabab Beef",
        unitPrice: 420
      }
    ],
    dueDate: "2026-11-04",
    supplierId: "sup-1790936466275"
  },
  {
    dueDate: "2026-11-04",
    supplierDiscountPercent: 0,
    date: "2026-10-03",
    lines: [
      {
        qty: 15,
        accountId: "acc-inventory",
        itemId: "item-1790934553474",
        description: "Shami Kabab Beef",
        id: "l-1791197454719",
        unitPrice: 470
      },
      {
        qty: 15,
        id: "l-1791197495680-0.8066005349405961",
        unitPrice: 486,
        discountPercent: 0,
        description: "Shami Kabab Chicken",
        accountId: "acc-inventory",
        itemId: "item-1790939829005-26"
      }
    ],
    taxInclusive: false,
    supplierId: "sup-1791197484450",
    reference: "PINV-9016",
    deliveryCharges: 0,
    id: "pi-1791197454719",
    supplierDiscountAmount: 0,
    description: "Anees Bhai Kababs consignment"
  },
  {
    id: "pi-1791369372465",
    date: "2026-10-05",
    dueDate: "2026-11-06",
    reference: "PINV-9017",
    supplierId: "sup-1790935942473",
    description: "Bulk Samosas & Rolls stock order",
    taxInclusive: false,
    supplierDiscountPercent: 0,
    supplierDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      {
        id: "l-1791369372466",
        accountId: "acc-inventory",
        description: "Chicken Samosa",
        qty: 10,
        unitPrice: 290,
        itemId: "item-1790939829005-18"
      },
      {
        id: "l-1791369447827-0.4578197055182661",
        accountId: "acc-inventory",
        description: "Chicken Sticks",
        qty: 4,
        unitPrice: 480,
        itemId: "item-1790939829005-20"
      },
      {
        id: "l-1791369466178-0.0429184469782683",
        accountId: "acc-inventory",
        description: "Chicken Chinese Roll",
        qty: 12,
        unitPrice: 290,
        itemId: "item-1790939829004-9"
      },
      {
        id: "l-1791369466937-0.6266210503565902",
        accountId: "acc-inventory",
        description: "Chicken Bar B.Q Roll",
        qty: 6,
        unitPrice: 480,
        itemId: "item-1790939829004-5"
      },
      {
        id: "l-1791369471485-0.5486577417298248",
        accountId: "acc-inventory",
        description: "Allo Samosa",
        qty: 12,
        unitPrice: 240,
        itemId: "item-1790933907250"
      },
      {
        id: "l-1791369492919-0.8082369629935696",
        accountId: "acc-inventory",
        description: "Qeema Samosa",
        qty: 12,
        unitPrice: 290,
        itemId: "item-1790939829005-24"
      }
    ]
  }
];

export const initialSalesInvoices: SalesInvoice[] = [
  {
    date: "2026-10-03",
    reference: "7311",
    id: "sinv-1791188781641-0",
    billingAddress: "Shabbirabad Block B",
    lines: [
      { description: "Chicken Chinese Roll", id: "line-1791188781640-0", unitPrice: 450, itemId: "item-1790939829004-9", discountPercent: 0, qty: 2, accountId: "acc-sales" },
      { accountId: "acc-sales", id: "line-1791188781641-1", qty: 2, itemId: "item-1790939829005-18", unitPrice: 430, discountPercent: 0, description: "Chicken Samosa" },
      { discountPercent: 0, unitPrice: 360, itemId: "item-1790933907250", description: "Allo Samosa", id: "line-1791188781641-2", accountId: "acc-sales", qty: 2 },
      { accountId: "acc-sales", id: "line-1791188781641-3", itemId: "item-1790939829004-11", description: "Chicken Cutless", qty: 1, unitPrice: 720, discountPercent: 0 },
      { description: "Shami Kabab Chicken", accountId: "acc-sales", discountPercent: 0, unitPrice: 720, id: "line-1791188781641-4", qty: 1, itemId: "item-1790939829005-26" },
      { id: "line-1791188781641-5", qty: 1, description: "Allo One Bite Samosa", discountPercent: 0, itemId: "item-1790931929068", accountId: "acc-sales", unitPrice: 450 }
    ],
    dueDate: "2026-10-03",
    customerDiscountPercent: 0,
    deliveryCharges: 0,
    customerDiscountAmount: 0,
    description: "Sales invoice - Party Order",
    customerId: "cust-1791188363074",
    taxInclusive: false
  },
  {
    deliveryCharges: 0,
    id: "sinv-1791188781641-1",
    customerDiscountAmount: 0,
    customerId: "cust-1791188391690",
    dueDate: "2026-10-03",
    customerDiscountPercent: 0,
    date: "2026-10-03",
    description: "Sales invoice",
    billingAddress: "Clifton",
    lines: [
      { accountId: "acc-sales", qty: 2, description: "Qeema Samosa", unitPrice: 450, itemId: "item-1790939829005-24", discountPercent: 0, id: "line-1791188781641-6" },
      { accountId: "acc-sales", description: "Beef Cutlets", id: "line-1791188781641-7", discountPercent: 0, unitPrice: 820, itemId: "item-1790934247810", qty: 1 },
      { qty: 1, discountPercent: 0, unitPrice: -40, description: "Special Discount", id: "l-1791198330022-0", accountId: "acc-custom-1790934974257" }
    ],
    taxInclusive: false,
    reference: "7310"
  },
  {
    description: "Sales invoice",
    deliveryCharges: 0,
    lines: [
      { itemId: "item-1790934553474", description: "Shami Kabab Beef", accountId: "acc-sales", unitPrice: 740, qty: 1, id: "line-1791188781641-8", discountPercent: 0 },
      { discountPercent: 0, unitPrice: 720, qty: 2, description: "Shami Kabab Chicken", itemId: "item-1790939829005-26", id: "line-1791188781641-9", accountId: "acc-sales" }
    ],
    dueDate: "2026-10-02",
    date: "2026-10-02",
    customerDiscountPercent: 0,
    id: "sinv-1791188781641-2",
    reference: "7309",
    taxInclusive: false,
    customerId: "cust-1791189508842",
    customerDiscountAmount: 0,
    billingAddress: "DHA Phase 6"
  },
  {
    customerId: "cust-1791187527602-2",
    description: "Sales invoice",
    dueDate: "2026-10-02",
    taxInclusive: false,
    id: "sinv-1791188781641-3",
    reference: "7308",
    billingAddress: "KDA Scheme 1",
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    date: "2026-10-02",
    lines: [
      { id: "line-1791188781641-10", accountId: "acc-sales", qty: 1, description: "Chapli Kabab Beef", itemId: "item-1790934400570", discountPercent: 0, unitPrice: 670 },
      { accountId: "acc-custom-1790934974257", discountPercent: 0, description: "Special Discount", qty: 1, id: "l-1791197864173-0", unitPrice: -20 }
    ],
    customerDiscountPercent: 0
  },
  {
    id: "sinv-1791188781641-4",
    reference: "7307",
    description: "Sales invoice",
    customerId: "cust-1791188444176",
    dueDate: "2026-10-02",
    billingAddress: "Haideri",
    taxInclusive: false,
    customerDiscountPercent: 0,
    deliveryCharges: 0,
    lines: [
      { accountId: "acc-sales", qty: 1, discountPercent: 0, unitPrice: 740, itemId: "item-1790934553474", id: "line-1791188781641-11", description: "Shami Kabab Beef" },
      { accountId: "acc-sales", qty: 1, discountPercent: 0, description: "Shami Kabab Chicken", id: "line-1791188781641-12", unitPrice: 720, itemId: "item-1790939829005-26" },
      { discountPercent: 0, id: "line-1791188781641-13", unitPrice: 620, itemId: "item-1790939829005-19", qty: 2, description: "Chicken Sheekh Kabab", accountId: "acc-sales" },
      { itemId: "item-1790934400570", unitPrice: 670, id: "line-1791188781641-14", description: "Chapli Kabab Beef", discountPercent: 0, qty: 2, accountId: "acc-sales" },
      { discountPercent: 0, unitPrice: 700, id: "line-1791188781641-15", description: "Chicken Gola Kabab", accountId: "acc-sales", qty: 1, itemId: "item-1790939829004-13" },
      { accountId: "acc-custom-1790934974257", id: "l-1791197979073-0", qty: 1, description: "Bulk Discount", unitPrice: -340, discountPercent: 0 }
    ],
    date: "2026-10-02",
    customerDiscountAmount: 0
  },
  {
    customerDiscountPercent: 0,
    lines: [
      { qty: 1, unitPrice: 720, id: "line-1791188781641-16", itemId: "item-1790939829005-26", discountPercent: 0, accountId: "acc-sales", description: "Shami Kabab Chicken" },
      { description: "Chicken Chimmy Changa", unitPrice: 450, id: "line-1791188781641-17", accountId: "acc-sales", itemId: "item-1790939829004-8", discountPercent: 0, qty: 1 },
      { qty: 1, description: "Chicken Wonton", id: "line-1791188781641-18", accountId: "acc-sales", discountPercent: 0, itemId: "item-1790939829005-21", unitPrice: 360 },
      { id: "l-1791198029468-0", accountId: "acc-custom-1790934974257", unitPrice: -530, description: "Discount", qty: 1, discountPercent: 0 }
    ],
    date: "2026-10-02",
    dueDate: "2026-10-02",
    description: "Sales invoice",
    id: "sinv-1791188781641-5",
    customerDiscountAmount: 0,
    customerId: "cust-1791188470388",
    reference: "7306",
    taxInclusive: false,
    deliveryCharges: 0,
    billingAddress: "Karachi"
  },
  {
    reference: "7305",
    id: "sinv-1791188781641-6",
    description: "Sales invoice",
    customerId: "cust-1791188492398",
    billingAddress: "DHA Phase 6",
    deliveryCharges: 0,
    taxInclusive: false,
    dueDate: "2026-10-02",
    lines: [
      { qty: 2, accountId: "acc-sales", discountPercent: 0, id: "line-1791188781641-19", unitPrice: 720, description: "Shami Kabab Chicken", itemId: "item-1790939829005-26" },
      { itemId: "item-1790939829005-20", accountId: "acc-sales", description: "Chicken Sticks", discountPercent: 0, id: "line-1791188781641-20", qty: 2, unitPrice: 670 }
    ],
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    date: "2026-10-02"
  },
  {
    deliveryCharges: 0,
    billingAddress: "Clifton",
    id: "sinv-1791188781641-7",
    dueDate: "2026-10-02",
    date: "2026-10-02",
    taxInclusive: false,
    reference: "7304",
    description: "Sales invoice",
    customerDiscountAmount: 0,
    lines: [
      { accountId: "acc-sales", id: "line-1791188781641-21", itemId: "item-1790939829005-19", description: "Chicken Sheekh Kabab", discountPercent: 0, qty: 1, unitPrice: 620 },
      { accountId: "acc-sales", qty: 1, itemId: "item-1790939829005-21", description: "Chicken Wonton", id: "line-1791188781641-22", discountPercent: 0, unitPrice: 360 },
      { unitPrice: 450, itemId: "item-1790931929068", qty: 1, discountPercent: 0, accountId: "acc-sales", description: "Allo One Bite Samosa", id: "line-1791188781641-23" },
      { accountId: "acc-sales", description: "Chicken Burger Patty", id: "line-1791188781641-24", itemId: "item-1790939829004-6", qty: 1, unitPrice: 650, discountPercent: 0 },
      { accountId: "acc-sales", itemId: "item-1790939829004-11", qty: 1, unitPrice: 720, description: "Chicken Cutless", id: "line-1791188781641-25", discountPercent: 0 }
    ],
    customerDiscountPercent: 0,
    customerId: "cust-1791188554972"
  },
  {
    billingAddress: "Clifton",
    customerDiscountAmount: 0,
    id: "sinv-1791188781641-8",
    taxInclusive: false,
    description: "Sales invoice",
    reference: "7303",
    date: "2026-10-02",
    lines: [
      { accountId: "acc-sales", description: "Shami Kabab Beef", qty: 0.5, unitPrice: 740, discountPercent: 0, itemId: "item-1790934553474", id: "line-1791188781641-26" },
      { unitPrice: 450, qty: 0.5, discountPercent: 0, id: "line-1791188781641-27", description: "Chicken Chinese Roll", itemId: "item-1790939829004-9", accountId: "acc-sales" },
      { qty: 0.5, id: "line-1791188781641-28", accountId: "acc-sales", discountPercent: 0, description: "Allo Samosa", itemId: "item-1790933907250", unitPrice: 360 },
      { id: "line-1791188781641-29", unitPrice: 450, itemId: "item-1790939829005-24", description: "Qeema Samosa", qty: 0.5, discountPercent: 0, accountId: "acc-sales" },
      { accountId: "acc-custom-1790934974257", qty: 1, discountPercent: 0, unitPrice: -50, description: "Round off", id: "l-1791198065533-0" }
    ],
    dueDate: "2026-10-02",
    customerId: "cust-1791188605287",
    deliveryCharges: 0,
    customerDiscountPercent: 0
  },
  {
    billingAddress: "Clifton",
    customerDiscountAmount: 0,
    customerId: "cust-1791188624789",
    lines: [
      { description: "Chicken Cutless", qty: 0.5, unitPrice: 720, discountPercent: 0, id: "line-1791188781641-30", itemId: "item-1790939829004-11", accountId: "acc-sales" },
      { discountPercent: 0, accountId: "acc-sales", itemId: "item-1790939829005-26", qty: 0.5, unitPrice: 720, description: "Shami Kabab Chicken", id: "line-1791188781641-31" },
      { id: "line-1791188781641-32", discountPercent: 0, qty: 0.5, itemId: "item-1790939829005-24", unitPrice: 450, description: "Qeema Samosa", accountId: "acc-sales" },
      { accountId: "acc-sales", itemId: "item-1790939829004-9", description: "Chicken Chinese Roll", unitPrice: 450, id: "line-1791188781641-33", qty: 0.5, discountPercent: 0 },
      { accountId: "acc-custom-1790934974257", discountPercent: 0, id: "l-1791198098002-0", qty: 1, unitPrice: -70, description: "Discount" }
    ],
    deliveryCharges: 0,
    date: "2026-10-02",
    taxInclusive: false,
    description: "Sales invoice",
    reference: "7302",
    dueDate: "2026-10-02",
    id: "sinv-1791188781641-9",
    customerDiscountPercent: 0
  },
  {
    id: "sinv-1791188781641-10",
    reference: "7301",
    deliveryCharges: 0,
    dueDate: "2026-10-02",
    description: "Sales invoice",
    taxInclusive: false,
    customerId: "cust-1791188664346",
    billingAddress: "Clifton",
    customerDiscountAmount: 0,
    date: "2026-10-02",
    lines: [
      { discountPercent: 0, id: "line-1791188781641-34", itemId: "item-1790934400570", accountId: "acc-sales", description: "Chapli Kabab Beef", unitPrice: 670, qty: 2 },
      { unitPrice: 360, itemId: "item-1790933907250", discountPercent: 0, accountId: "acc-sales", id: "line-1791188781641-35", description: "Allo Samosa", qty: 2 },
      { unitPrice: 450, id: "line-1791188781641-36", description: "Chicken Nuggets", qty: 2, discountPercent: 0, itemId: "item-1790939829004-16", accountId: "acc-sales" },
      { id: "line-1791188781641-37", description: "Chicken Chinese Roll", qty: 1, itemId: "item-1790939829004-9", unitPrice: 450, accountId: "acc-sales", discountPercent: 0 }
    ],
    customerDiscountPercent: 0
  },
  {
    id: "sinv-1791188781641-11",
    deliveryCharges: 0,
    description: "Sales invoice",
    customerId: "cust-1791188690961",
    dueDate: "2026-10-02",
    billingAddress: "Clifton",
    customerDiscountAmount: 0,
    reference: "7300",
    taxInclusive: false,
    date: "2026-10-02",
    customerDiscountPercent: 0,
    lines: [
      { qty: 4, description: "Chicken Burger Patty", id: "line-1791188781641-38", accountId: "acc-sales", discountPercent: 0, itemId: "item-1790939829004-6", unitPrice: 650 }
    ]
  },
  {
    dueDate: "2026-10-02",
    date: "2026-10-02",
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    billingAddress: "KV-202",
    customerId: "cust-1791188710500",
    id: "sinv-1791188781641-12",
    taxInclusive: false,
    description: "Sales invoice",
    lines: [
      { description: "Chicken Bar B. Q Samosa", qty: 1, accountId: "acc-sales", discountPercent: 0, itemId: "item-1790939829004-4", id: "line-1791188781641-39", unitPrice: 650 }
    ],
    deliveryCharges: 0,
    reference: "7299"
  },
  {
    description: "Sales invoice",
    billingAddress: "Karachi",
    dueDate: "2026-10-02",
    taxInclusive: false,
    reference: "7298",
    id: "sinv-1791188781641-13",
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { itemId: "item-1790933907250", unitPrice: 360, id: "line-1791188781641-40", description: "Allo Samosa", discountPercent: 0, accountId: "acc-sales", qty: 4 },
      { description: "Beef Cutlets", accountId: "acc-sales", discountPercent: 0, unitPrice: 820, qty: 2, id: "line-1791188781641-41", itemId: "item-1790934247810" },
      { itemId: "item-1790934553474", unitPrice: 740, id: "line-1791188781641-42", qty: 2, discountPercent: 0, description: "Shami Kabab Beef", accountId: "acc-sales" }
    ],
    date: "2026-10-02",
    customerId: "cust-1791188734036"
  },
  {
    id: "sinv-1791365262333-0",
    date: "2026-10-05",
    dueDate: "2026-10-05",
    reference: "INV-7321",
    customerId: "cust-1791365318295",
    description: "Sales invoice",
    billingAddress: "Saddar",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "line-1791365262333-0", itemId: "item-1790934400570", accountId: "acc-sales", description: "Chapli Kabab Beef", qty: 7, unitPrice: 670, discountPercent: 0 },
      { id: "line-1791365262333-1", accountId: "acc-custom-1790934974257", description: "Sales Item Discount", qty: 1, unitPrice: -350, discountPercent: 0 }
    ]
  },
  {
    id: "sinv-1791365262333-1",
    date: "2026-10-05",
    dueDate: "2026-10-05",
    reference: "INV-7320",
    customerId: "cust-1791365358832",
    description: "Sales invoice",
    billingAddress: "Pride Appt",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "line-1791365262333-2", itemId: "item-1790939829004-13", accountId: "acc-sales", description: "Chicken Gola Kabab", qty: 1, unitPrice: 700, discountPercent: 0 }
    ]
  },
  {
    id: "sinv-1791365262333-2",
    date: "2026-10-05",
    dueDate: "2026-10-05",
    reference: "INV-7319",
    customerId: "cust-1791365384690",
    description: "Sales invoice",
    billingAddress: "Saddar",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "line-1791365262333-3", itemId: "item-1790939829004-5", accountId: "acc-sales", description: "Chicken Bar B.Q Roll", qty: 1, unitPrice: 650, discountPercent: 0 },
      { id: "line-1791365262333-4", itemId: "item-1790931929068", accountId: "acc-sales", description: "Allo One Bite Samosa", qty: 1, unitPrice: 450, discountPercent: 0 },
      { id: "line-1791365262333-5", itemId: "item-1790939829005-24", accountId: "acc-sales", description: "Qeema Samosa", qty: 1, unitPrice: 450, discountPercent: 0 },
      { id: "line-1791365262333-6", itemId: "item-1790939829005-22", accountId: "acc-sales", description: "Daal Samosa", qty: 1, unitPrice: 360, discountPercent: 0 }
    ]
  },
  {
    id: "sinv-1791365262333-3",
    date: "2026-10-04",
    dueDate: "2026-10-04",
    reference: "INV-7318",
    customerId: "cust-1791365419053",
    description: "Sales invoice",
    billingAddress: "Godhra",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "line-1791365262333-7", itemId: "item-1790939829005-19", accountId: "acc-sales", description: "Chicken Sheekh Kabab", qty: 2, unitPrice: 620, discountPercent: 0 },
      { id: "line-1791365262333-8", accountId: "acc-custom-1790934974257", description: "Sales Item Discount", qty: 1, unitPrice: -40, discountPercent: 0 }
    ]
  },
  {
    id: "sinv-1791365262333-4",
    date: "2026-10-04",
    dueDate: "2026-10-04",
    reference: "INV-7317",
    customerId: "cust-1791365435990",
    description: "Sales invoice",
    billingAddress: "Highway",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "line-1791365262333-9", itemId: "item-1790939829004-11", accountId: "acc-sales", description: "Chicken Cutless", qty: 1, unitPrice: 720, discountPercent: 0 },
      { id: "line-1791365262333-10", itemId: "item-1790934247810", accountId: "acc-sales", description: "Beef Cutlets", qty: 1, unitPrice: 820, discountPercent: 0 },
      { id: "line-1791365262333-11", itemId: "item-1790931929068", accountId: "acc-sales", description: "Allo One Bite Samosa", qty: 2, unitPrice: 450, discountPercent: 0 }
    ]
  },
  {
    id: "sinv-1791365262333-5",
    date: "2026-10-04",
    dueDate: "2026-10-04",
    reference: "INV-7316",
    customerId: "cust-1791365450665",
    description: "Sales invoice",
    billingAddress: "Highway",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "line-1791365262333-12", itemId: "item-1790939829004-5", accountId: "acc-sales", description: "Chicken Bar B.Q Roll", qty: 1, unitPrice: 650, discountPercent: 0 },
      { id: "line-1791365262333-13", itemId: "item-1790939829005-22", accountId: "acc-sales", description: "Daal Samosa", qty: 1, unitPrice: 360, discountPercent: 0 },
      { id: "line-1791365262333-14", itemId: "item-1790933907250", accountId: "acc-sales", description: "Allo Samosa", qty: 1, unitPrice: 360, discountPercent: 0 },
      { id: "line-1791365262333-15", itemId: "item-1790939829005-18", accountId: "acc-sales", description: "Chicken Samosa", qty: 1, unitPrice: 430, discountPercent: 0 }
    ]
  },
  {
    id: "sinv-1791365262333-6",
    date: "2026-10-04",
    dueDate: "2026-10-04",
    reference: "INV-7315",
    customerId: "cust-1791365464132",
    description: "Sales invoice",
    billingAddress: "Highway",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "line-1791365262333-16", itemId: "item-1790939829005-26", accountId: "acc-sales", description: "Shami Kabab Chicken", qty: 2, unitPrice: 720, discountPercent: 0 },
      { id: "line-1791365262333-17", itemId: "item-1790931929068", accountId: "acc-sales", description: "Allo One Bite Samosa", qty: 1, unitPrice: 450, discountPercent: 0 }
    ]
  },
  {
    id: "sinv-1791365262333-7",
    date: "2026-10-04",
    dueDate: "2026-10-04",
    reference: "INV-7314",
    customerId: "cust-1791365483888",
    description: "Sales invoice",
    billingAddress: "Highway",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "line-1791365262333-18", itemId: "item-1790934400570", accountId: "acc-sales", description: "Chapli Kabab Beef", qty: 2, unitPrice: 670, discountPercent: 0 }
    ]
  },
  {
    id: "sinv-1791365262333-8",
    date: "2026-10-04",
    dueDate: "2026-10-04",
    reference: "INV-7313",
    customerId: "cust-1791365505202",
    description: "Sales invoice",
    billingAddress: "Karachi",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "line-1791365262333-19", itemId: "item-1790939829005-24", accountId: "acc-sales", description: "Qeema Samosa", qty: 2, unitPrice: 450, discountPercent: 0 },
      { id: "line-1791365262333-20", itemId: "item-1790939829005-26", accountId: "acc-sales", description: "Shami Kabab Chicken", qty: 2, unitPrice: 720, discountPercent: 0 },
      { id: "line-1791365262333-21", itemId: "item-1790931929068", accountId: "acc-sales", description: "Allo One Bite Samosa", qty: 1, unitPrice: 450, discountPercent: 0 },
      { id: "line-1791365262333-22", itemId: "item-1790939829005-17", accountId: "acc-sales", description: "Chicken One Bite Samosa", qty: 1, unitPrice: 570, discountPercent: 0 },
      { id: "line-1791365262333-23", itemId: "item-1790939829004-12", accountId: "acc-sales", description: "Chicken Donuts", qty: 1, unitPrice: 480, discountPercent: 0 }
    ]
  },
  {
    id: "sinv-1791365262333-9",
    date: "2026-10-03",
    dueDate: "2026-10-03",
    reference: "INV-7312",
    customerId: "cust-1791365547879",
    description: "Sales invoice",
    billingAddress: "Karachi",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "line-1791365262333-24", itemId: "item-1790939829005-26", accountId: "acc-sales", description: "Shami Kabab Chicken", qty: 1, unitPrice: 720, discountPercent: 0 }
    ]
  },
  {
    id: "si-1791371867711",
    date: "2026-10-06",
    dueDate: "2026-11-06",
    reference: "INV-2026-0025",
    customerId: "cust-1791371850748",
    description: "Regular order",
    billingAddress: "KV-301",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "l-1791371867711", accountId: "acc-inventory-sales", description: "Shami Kabab Beef", qty: 1, unitPrice: 740, itemId: "item-1790934553474" },
      { id: "l-1791371898404-0", accountId: "acc-inventory-sales", description: "Beef Cutlets", qty: 1, unitPrice: 820, discountPercent: 0, itemId: "item-1790934247810" }
    ]
  },
  {
    id: "si-1791372031198",
    date: "2026-10-06",
    dueDate: "2026-11-06",
    reference: "INV-2026-0026",
    customerId: "cust-1791371997313",
    description: "Variety Pack",
    billingAddress: "Panmandi",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "l-1791372031198", accountId: "acc-inventory-sales", description: "Shami Kabab Beef", qty: 0.5, unitPrice: 740, itemId: "item-1790934553474" },
      { id: "l-1791372042804-0", accountId: "acc-inventory-sales", description: "Qeema Samosa", qty: 0.5, unitPrice: 450, discountPercent: 0, itemId: "item-1790939829005-24" },
      { id: "l-1791372063625-0", accountId: "acc-inventory-sales", description: "Allo Samosa", qty: 0.5, unitPrice: 360, discountPercent: 0, itemId: "item-1790933907250" },
      { id: "l-1791372071080-0", accountId: "acc-inventory-sales", description: "Chicken Chinese Roll", qty: 0.5, unitPrice: 450, discountPercent: 0, itemId: "item-1790939829004-9" },
      { id: "l-1791372080556-0", accountId: "acc-custom-1790934974257", description: "Discount", qty: 1, unitPrice: -50, discountPercent: 0 }
    ]
  },
  {
    id: "si-1791372503811",
    date: "2026-10-06",
    dueDate: "2026-11-06",
    reference: "INV-2026-0027",
    customerId: "cust-1791372493213",
    description: "Kababs assortment",
    billingAddress: "Hyderi",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "l-1791372503811", accountId: "acc-inventory-sales", description: "Shami Kabab Beef", qty: 0.5, unitPrice: 740, itemId: "item-1790934553474" },
      { id: "l-1791372541497-0", accountId: "acc-inventory-sales", description: "Shami Kabab Chicken", qty: 0.5, unitPrice: 720, discountPercent: 0, itemId: "item-1790939829005-26" },
      { id: "l-1791372547347-0", accountId: "acc-inventory-sales", description: "Chicken Sheekh Kabab", qty: 1, unitPrice: 620, discountPercent: 0, itemId: "item-1790939829005-19" },
      { id: "l-1791372568182-0", accountId: "acc-inventory-sales", description: "Chapli Kabab Beef", qty: 1, unitPrice: 670, discountPercent: 0, itemId: "item-1790934400570" },
      { id: "l-1791372578366-0", accountId: "acc-inventory-sales", description: "Chicken Gola Kabab", qty: 0.3, unitPrice: 700, discountPercent: 0, itemId: "item-1790939829004-13" },
      { id: "l-1791372682183-0", accountId: "acc-custom-1790934974257", description: "Customer Discount", qty: 1, unitPrice: -30, discountPercent: 0 }
    ]
  },
  {
    id: "si-1791378018032",
    date: "2026-10-07",
    dueDate: "2026-11-06",
    reference: "INV-2026-0028",
    customerId: "cust-1791377987381",
    description: "Party Catering Order",
    billingAddress: "Hyderi",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "l-1791378018032", accountId: "acc-inventory-sales", description: "Chicken Cone Samosa", qty: 1, unitPrice: 450, itemId: "item-1790939829004-10" },
      { id: "l-1791378037908-0", accountId: "acc-inventory-sales", description: "Chicken One Bite Samosa", qty: 1, unitPrice: 570, discountPercent: 0, itemId: "item-1790939829005-17" },
      { id: "l-1791378038709-0", accountId: "acc-inventory-sales", description: "Chapli Kabab Beef", qty: 1, unitPrice: 670, discountPercent: 0, itemId: "item-1790934400570" },
      { id: "l-1791378040241-0", accountId: "acc-inventory-sales", description: "Chicken Sheekh Kabab", qty: 1, unitPrice: 620, discountPercent: 0, itemId: "item-1790939829005-19" },
      { id: "l-1791378041301-0", accountId: "acc-inventory-sales", description: "Shami Kabab Beef", qty: 1, unitPrice: 740, discountPercent: 0, itemId: "item-1790934553474" },
      { id: "l-1791378085746-0", accountId: "acc-inventory-sales", description: "Shami Kabab Chicken", qty: 1, unitPrice: 720, discountPercent: 0, itemId: "item-1790939829005-26" },
      { id: "l-1791378122088-0", accountId: "acc-inventory-sales", description: "Chicken Chinese Roll", qty: 1, unitPrice: 450, discountPercent: 0, itemId: "item-1790939829004-9" },
      { id: "l-1791378135000-0", accountId: "acc-inventory-sales", description: "Daal Samosa", qty: 1, unitPrice: 360, discountPercent: 0, itemId: "item-1790939829005-22" },
      { id: "l-1791378162839-0", accountId: "acc-custom-1790934974257", description: "Volume Discount", qty: 1, unitPrice: -180, discountPercent: 0 }
    ]
  },
  {
    id: "si-1791378261196",
    date: "2026-10-06",
    dueDate: "2026-11-06",
    reference: "INV-2026-0029",
    customerId: "cust-1791378240107",
    description: "Beef Shami Packs",
    billingAddress: "Karbala Salar",
    taxInclusive: false,
    customerDiscountPercent: 0,
    customerDiscountAmount: 0,
    deliveryCharges: 0,
    lines: [
      { id: "l-1791378261196", accountId: "acc-inventory-sales", description: "Shami Kabab Beef", qty: 5.5, unitPrice: 740, itemId: "item-1790934553474" },
      { id: "l-1791378298805-0", accountId: "acc-custom-1790934974257", description: "Discount", qty: 1, unitPrice: -110, discountPercent: 0 }
    ]
  }
];
