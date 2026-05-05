import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PageTransition from '@/components/PageTransition';

// Import markdown content as raw string
import privacyMarkdown from '../../privacy_policy.md?raw';

export default function Privacy() {
  const navigate = useNavigate();
  const [lang] = useState(() => localStorage.getItem('language') || 'pt-BR');
  
  const downloadPrivacy = () => {
    const element = document.createElement("a");
    const file = new Blob([privacyMarkdown], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "privacy_policy.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <PageTransition className="min-h-screen bg-white dark:bg-[#0c0c1d] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0c0c1d]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {lang === 'pt-BR' ? 'Política de Privacidade' : 'Privacy Policy'}
            </h1>
          </div>
          <button 
            onClick={downloadPrivacy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download MD</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 pt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 dark:bg-white/5 rounded-[40px] border border-gray-100 dark:border-white/5 p-8 sm:p-12"
        >
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 bg-blue-500/10 rounded-[28px] flex items-center justify-center">
              <Shield className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight 
            prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:leading-relaxed
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-hr:border-gray-200 dark:prose-hr:border-white/10
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-500/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl
            prose-li:text-gray-600 dark:prose-li:text-gray-400
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {privacyMarkdown}
            </ReactMarkdown>
          </div>
        </motion.div>
      </main>
    </PageTransition>
  );
}
