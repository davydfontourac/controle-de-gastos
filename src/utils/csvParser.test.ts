import { describe, it, expect, vi } from 'vitest';
import { parseCSV, transformCSVData } from './csvParser';
import type { CSVMapping, ParsedCSVRow } from './csvParser';
import Papa from 'papaparse';

vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn(),
  },
}));

describe('csvParser', () => {
  describe('parseCSV', () => {
    it('deve resolver com os dados quando o parse tem sucesso', async () => {
      const mockData = [{ Col1: 'Val1' }];
      (Papa.parse as any).mockImplementationOnce((_file: any, config: any) => {
        config.complete({ data: mockData });
      });

      const file = new File([''], 'test.csv');
      const result = await parseCSV(file);
      expect(result).toEqual(mockData);
    });

    it('deve rejeitar com erro quando o parse falha', async () => {
      const mockError = new Error('Parse error');
      (Papa.parse as any).mockImplementationOnce((_file: any, config: any) => {
        config.error(mockError);
      });

      const file = new File([''], 'test.csv');
      await expect(parseCSV(file)).rejects.toThrow('Parse error');
    });
  });

  describe('transformCSVData', () => {
    const categories = [
      { id: 'cat-1', name: 'Supermercado' },
      { id: 'cat-2', name: 'Caixinha' },
    ];

    const defaultMapping: CSVMapping = {
      date: 'Data',
      description: 'Desc',
      amount: 'Valor',
      dateFormat: 'dd/MM/yyyy',
      decimalSeparator: ',',
    };

    it('deve formatar data corretamente e detectar virgula como decimal', () => {
      const data: ParsedCSVRow[] = [
        { Data: '23/04/2026', Desc: 'Mercado Zaffari', Valor: '-1.332,74' },
      ];

      const result = transformCSVData(data, defaultMapping, categories);

      expect(result[0].date).toBe('2026-04-23');
      expect(result[0].amount).toBe(1332.74);
      expect(result[0].type).toBe('expense');
      expect(result[0].category_id).toBe('cat-1');
    });

    it('deve lidar com separador decimal ponto corretamente mesmo configurado para virgula se detectar ponto', () => {
      const data: ParsedCSVRow[] = [
        { Data: '23/04/2026', Desc: 'Teste', Valor: '-1332.74' },
      ];

      const result = transformCSVData(data, defaultMapping, categories);

      expect(result[0].amount).toBe(1332.74);
    });

    it('deve lidar com falha no parse da data fazendo fallback para hoje', () => {
      const data: ParsedCSVRow[] = [
        { Data: 'data-invalida', Desc: 'Teste', Valor: '10,00' },
      ];

      const result = transformCSVData(data, defaultMapping, categories);

      // We just check it didn't crash and returns a valid date format YYYY-MM-DD
      expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('deve mapear categoria Caixinha como transfer_in quando positivo', () => {
      const data: ParsedCSVRow[] = [
        { Data: '23/04/2026', Desc: 'Resgate RDB', Valor: '100,00' },
      ];

      const result = transformCSVData(data, defaultMapping, categories);

      expect(result[0].type).toBe('transfer_in');
      expect(result[0].category_id).toBe('cat-2');
    });

    it('deve mapear categoria Caixinha como transfer_out quando negativo', () => {
      const data: ParsedCSVRow[] = [
        { Data: '23/04/2026', Desc: 'Aplicacao RDB', Valor: '-100,00' },
      ];

      const result = transformCSVData(data, defaultMapping, categories);

      expect(result[0].type).toBe('transfer_out');
      expect(result[0].category_id).toBe('cat-2');
    });

    it('deve usar a coluna de tipo explicitamente mapeada', () => {
      const mappingWithType: CSVMapping = {
        ...defaultMapping,
        type: 'Tipo',
      };

      const data: ParsedCSVRow[] = [
        { Data: '23/04/2026', Desc: 'Teste', Valor: '100,00', Tipo: 'Receita' },
      ];

      const result = transformCSVData(data, mappingWithType, categories);
      expect(result[0].type).toBe('income');
    });
  });
});
