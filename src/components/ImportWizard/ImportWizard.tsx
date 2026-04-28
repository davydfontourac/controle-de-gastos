import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { parseCSV, transformCSVData } from '@/utils/csvParser';
import type { CSVMapping, ParsedCSVRow } from '@/utils/csvParser';
import FileUpload from './FileUpload';
import ColumnMapper from './ColumnMapper';
import ImportPreview from './ImportPreview';

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = [
  { id: 'upload', title: 'Upload', description: 'Selecione o arquivo CSV' },
  { id: 'mapping', title: 'Mapeamento', description: 'Associe as colunas' },
  { id: 'preview', title: 'Revisão e Categorias', description: 'Confira e categorize os dados' },
];

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export default function ImportWizard({ isOpen, onClose, onSuccess }: ImportWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rawData, setRawData] = useState<ParsedCSVRow[]>([]);
  const [mapping, setMapping] = useState<CSVMapping>({
    date: '',
    description: '',
    amount: '',
    dateFormat: 'dd/MM/yyyy',
    decimalSeparator: ',',
  });

  const [transformedData, setTransformedData] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (file) {
      parseCSV(file).then((data) => {
        if (data.length > 0) {
          setRawData(data);
          const cols = Object.keys(data[0]);
          setHeaders(cols);

          // Auto-detect mappings if possible
          const newMapping = { ...mapping };
          cols.forEach((col) => {
            const low = col.toLowerCase();
            if (low.includes('data') || low.includes('date')) newMapping.date = col;
            if (low.includes('desc') || low.includes('hist') || low.includes('title'))
              newMapping.description = col;
            if (low.includes('valor') || low.includes('amount')) {
              newMapping.amount = col;

              // Detect decimal separator from the first row of data
              const firstVal = data[0][col];
              if (firstVal && !firstVal.includes(',') && firstVal.includes('.')) {
                newMapping.decimalSeparator = '.';
              } else if (firstVal && firstVal.includes(',') && !firstVal.includes('.')) {
                newMapping.decimalSeparator = ',';
              }
            }
          });
          setMapping(newMapping);
        }
      });
    } else {
      setRawData([]);
      setHeaders([]);
      setStep(0);
    }
  }, [file]);

  useEffect(() => {
    if (step === 2 && rawData.length > 0) {
      const transformed = transformCSVData(rawData, mapping, categories);
      setTransformedData(transformed);
    }
  }, [step, mapping, rawData, categories]);

  const handleNext = () => {
    if (step === 0 && !file) {
      toast.error('Selecione um arquivo primeiro');
      return;
    }
    if (step === 1 && (!mapping.date || !mapping.description || !mapping.amount)) {
      toast.error('Mapeie todas as colunas obrigatórias');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleImport = async () => {
    if (!user) return;

    setIsImporting(true);
    try {
      const transactionsToInsert = transformedData.map((t) => ({
        ...t,
        user_id: user.id,
      }));

      const { error } = await supabase.from('transactions').insert(transactionsToInsert);

      if (error) throw error;

      toast.success(`${transactionsToInsert.length} transações importadas com sucesso!`);
      onSuccess();
      onClose();
      // Reset state
      setFile(null);
      setStep(0);
    } catch (error: any) {
      console.error('Erro na importação:', error);
      toast.error('Erro ao importar transações: ' + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center lg:p-4 bg-white dark:bg-[#0c0c1d] lg:bg-transparent">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm hidden lg:block"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full h-full lg:h-auto lg:max-w-2xl bg-white dark:bg-gray-900 lg:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Importar Transações
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{STEPS[step].description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i <= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span
                className={`text-xs font-semibold ${
                  i <= step ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                }`}
              >
                {s.title}
              </span>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px bg-gray-200 dark:bg-gray-700 ml-2" />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && <FileUpload file={file} onFileSelect={setFile} />}
              {step === 1 && (
                <ColumnMapper
                  headers={headers}
                  sampleData={rawData.slice(0, 5)}
                  mapping={mapping}
                  onMappingChange={setMapping}
                />
              )}
              {step === 2 && (
                <ImportPreview
                  transactions={transformedData}
                  categories={categories}
                  onTransactionsChange={setTransformedData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <button
            onClick={step === 0 ? onClose : handleBack}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {step === 0 ? (
              'Cancelar'
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </>
            )}
          </button>

          <button
            onClick={step === STEPS.length - 1 ? handleImport : handleNext}
            disabled={isImporting || (step === 0 && !file)}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importando...
              </>
            ) : step === STEPS.length - 1 ? (
              <>
                Confirmar Importação
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
