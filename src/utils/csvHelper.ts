/**
 * Universal CSV & JSON parsing and exporting utility
 */

export function arrayToCSV<T extends Record<string, any>>(data: T[], columns?: { key: keyof T; header: string }[]): string {
  if (!data || data.length === 0) return '';

  const headers = columns ? columns.map(c => c.header) : Object.keys(data[0]);
  const keys = columns ? columns.map(c => c.key) : Object.keys(data[0]);

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map(escapeCSV).join(',');
  const rows = data.map(item => {
    return keys.map(k => escapeCSV(item[k])).join(',');
  });

  return [headerRow, ...rows].join('\n');
}

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  const parseRow = (rowStr: string): string[] => {
    const values: string[] = [];
    let curVal = '';
    let insideQuote = false;

    for (let i = 0; i < rowStr.length; i++) {
      const c = rowStr[i];
      const nc = rowStr[i + 1];

      if (c === '"') {
        if (insideQuote && nc === '"') {
          curVal += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (c === ',' && !insideQuote) {
        values.push(curVal.trim());
        curVal = '';
      } else {
        curVal += c;
      }
    }
    values.push(curVal.trim());
    return values;
  };

  const headers = parseRow(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const rowObj: Record<string, string> = {};
    headers.forEach((h, colIndex) => {
      rowObj[h] = values[colIndex] ?? '';
    });
    results.push(rowObj);
  }

  return results;
}

export function downloadFile(content: string, filename: string, type: 'text/csv' | 'application/json' = 'text/csv') {
  const blob = new Blob([content], { type: `${type};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
