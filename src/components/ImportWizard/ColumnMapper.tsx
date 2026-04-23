import type { CSVMapping, ParsedCSVRow } from '@/utils/csvParser';
import { HelpCircle } from 'lucide-react';

interface ColumnMapperProps {
  headers: string[];
  sampleData: ParsedCSVRow[];
  mapping: CSVMapping;
  onMappingChange: (mapping: CSVMapping) => void;
}

export default function ColumnMapper({
  headers,
  sampleData,
  mapping,
  onMappingChange,
}: ColumnMapperProps) {
  const handleChange = (field: keyof CSVMapping, value: string) => {
    onMappingChange({ ...mapping, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 p-4 rounded-xl flex gap-3 text-sm text-amber-700 dark:text-amber-400">
        <HelpCircle className="w-5 h-5 shrink-0" />
        <p>
          Mapeie as colunas do seu arquivo CSV para os campos do sistema. 
          Confira se os formatos de data e separadores estão corretos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mapping Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Coluna de Data
            </label>
            <select
              value={mapping.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              <option value="">Selecione...</option>
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Coluna de Descrição
            </label>
            <select
              value={mapping.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              <option value="">Selecione...</option>
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Coluna de Valor
            </label>
            <select
              value={mapping.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              <option value="">Selecione...</option>
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Formato da Data
            </label>
            <select
              value={mapping.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              <option value="yyyy-MM-dd">2026-03-22 (AAAA-MM-DD)</option>
              <option value="dd/MM/yyyy">22/03/2026 (DD/MM/AAAA)</option>
              <option value="MM/dd/yyyy">03/22/2026 (MM/DD/AAAA)</option>
              <option value="dd-MM-yyyy">22-03-2026 (DD-MM-AAAA)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Separador de Decimais
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={mapping.decimalSeparator === '.'}
                  onChange={() => handleChange('decimalSeparator', '.')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Ponto (.)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={mapping.decimalSeparator === ','}
                  onChange={() => handleChange('decimalSeparator', ',')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Vírgula (,)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
            Dados de Exemplo (Primeira Linha)
          </h3>
          <div className="space-y-3">
            {headers.slice(0, 8).map((header) => {
              const isAmount = header === mapping.amount;
              const rawValue = sampleData[0]?.[header] || '-';
              
              return (
                <div key={header} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 truncate mr-4">{header}</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100 truncate">
                      {rawValue}
                    </span>
                  </div>
                  {isAmount && rawValue !== '-' && (
                    <div className="flex justify-end">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                        Processado: {(() => {
                          try {
                            const val = mapping.decimalSeparator === ',' 
                              ? rawValue.toString().replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')
                              : rawValue.toString().replace(/[R$\s]/g, '').replace(/,/g, '');
                            const parsed = parseFloat(val);
                            return isNaN(parsed) 
                              ? 'Valor inválido' 
                              : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(parsed));
                          } catch (e) {
                            return 'Erro no formato';
                          }
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            {headers.length > 8 && (
              <p className="text-[10px] text-gray-400 text-center mt-2">
                + {headers.length - 8} outras colunas...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
