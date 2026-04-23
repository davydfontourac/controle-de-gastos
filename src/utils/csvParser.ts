import Papa from 'papaparse';
import { format, parse } from 'date-fns';

export interface CSVMapping {
  date: string;
  description: string;
  amount: string;
  type?: string;
  dateFormat: string;
  decimalSeparator: '.' | ',';
}

export interface ParsedCSVRow {
  [key: string]: string;
}

export const parseCSV = (file: File): Promise<ParsedCSVRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as ParsedCSVRow[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const transformCSVData = (
  data: ParsedCSVRow[],
  mapping: CSVMapping,
  categories: any[] = []
) => {
  return data.map((row) => {
    const rawAmount = row[mapping.amount] || '0';
    
    // Sanitize amount string: remove currency symbols and whitespace
    let cleanAmount = rawAmount.toString().replace(/[R$\s]/g, '');
    
    // Intelligent decimal detection if we're unsure or if the chosen separator isn't present
    let effectiveSeparator = mapping.decimalSeparator;
    if (effectiveSeparator === ',' && !cleanAmount.includes(',') && cleanAmount.includes('.')) {
      // If we expect comma but find point and no comma, it's likely point-based (like Nubank)
      effectiveSeparator = '.';
    } else if (effectiveSeparator === '.' && !cleanAmount.includes('.') && cleanAmount.includes(',')) {
      // Vice-versa
      effectiveSeparator = ',';
    }

    if (effectiveSeparator === ',') {
      // Brazilian style: 1.332,74 -> remove dots, replace comma with point
      cleanAmount = cleanAmount.replace(/\./g, '').replace(',', '.');
    } else {
      // US style: 1,332.74 -> remove commas
      cleanAmount = cleanAmount.replace(/,/g, '');
    }

    const amount = parseFloat(cleanAmount);
    const dateStr = row[mapping.date];
    let parsedDate: Date;

    try {
      parsedDate = parse(dateStr, mapping.dateFormat, new Date());
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (e) {
      console.error(`Failed to parse date: ${dateStr} with format ${mapping.dateFormat}`, e);
      parsedDate = new Date(); // Fallback to now
    }

    // Determine type (income/expense/transfer)
    let type: 'income' | 'expense' | 'transfer_in' | 'transfer_out' = 'expense';
    if (mapping.type && row[mapping.type]) {
      const typeVal = row[mapping.type].toLowerCase();
      if (typeVal.includes('receita') || typeVal.includes('income') || typeVal.includes('entrada') || typeVal.includes('credit')) {
        type = 'income';
      }
    } else {
      // Auto-detect by sign
      type = amount >= 0 ? 'income' : 'expense';
    }

    // Intelligent Category Guessing
    let category_id = null;
    const normalize = (str: string) => 
      str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    const desc = normalize(row[mapping.description] || '');
    
    const categoryRules = [
      { keywords: ['fatura', 'pagamento de fatura', 'cartao', 'credit card'], category: 'cartão' },
      { keywords: ['uber', '99', 'trip', 'taxi', 'transporte', 'combustivel', 'posto'], category: 'transporte' },
      { keywords: ['ifood', 'mcdonalds', 'restaurante', 'lanche', 'pizza', 'burger', 'bk', 'confeitaria', 'padaria'], category: 'alimentação' },
      { keywords: ['mercado', 'viezzer', 'zaffari', 'bourbon', 'carrefour', 'super'], category: 'supermercado' },
      { keywords: ['pix', 'transferencia recebida', 'transferencia enviada'], category: 'pix' },
      { keywords: ['compra no debito', 'debito'], category: 'débito' },
      { keywords: ['aplicacao rdb', 'resgate rdb', 'rdb', 'caixinha', 'investimento'], category: 'caixinha' },
      { keywords: ['netflix', 'spotify', 'disney', 'hbomax', 'prime video', 'apple.com', 'google services'], category: 'assinaturas' },
      { keywords: ['luz', 'zap', 'energia', 'ceee', 'equatorial'], category: 'conta de luz' },
      { keywords: ['agua', 'corsan', 'dmae'], category: 'conta de água' },
      { keywords: ['claro', 'vivo', 'tim', 'oi', 'internet', 'net '], category: 'internet' },
      { keywords: ['salario', 'vencimento', 'recebimento de salario'], category: 'salário' },
    ];

    for (const rule of categoryRules) {
      if (rule.keywords.some(k => desc.includes(normalize(k)))) {
        const found = categories.find(c => normalize(c.name).includes(normalize(rule.category)));
        if (found) {
          category_id = found.id;
          
          // Special handling for Caixinha (RDB) to mark as transfer
          if (rule.category === 'caixinha') {
            type = amount >= 0 ? 'transfer_in' : 'transfer_out';
          }
          break;
        }
      }
    }

    return {
      date: format(parsedDate, 'yyyy-MM-dd'),
      description: row[mapping.description] || 'Imported Transaction',
      amount: Math.abs(amount),
      type,
      category_id,
    };
  });
};
