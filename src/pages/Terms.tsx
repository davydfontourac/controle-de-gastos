import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

const COPY: any = {
  'pt-BR': {
    title: 'Termos e Privacidade',
    hero: {
      title: 'Termos de Serviço',
      subtitle: 'Última atualização: Abril de 2026. Leia atentamente como protegemos você e seus dados.'
    },
    sections: [
      {
        title: 'Privacidade e Segurança',
        content: 'Seus dados financeiros são protegidos por Row Level Security (RLS) do Supabase. Somente você tem acesso às suas transações e contas.'
      },
      {
        title: 'Segurança de Dados',
        content: 'Utilizamos criptografia de ponta a ponta e padrões da indústria para garantir que suas informações nunca sejam expostas a terceiros.'
      },
      {
        title: 'Transparência',
        content: 'O Expense Tracker é um projeto open source. Você pode auditar nosso código no GitHub para verificar como tratamos suas informações.'
      },
      {
        title: 'Uso do Serviço',
        content: 'Esta é uma ferramenta de auxílio à gestão financeira pessoal. Não nos responsabilizamos por decisões financeiras tomadas com base nos dados aqui apresentados.'
      }
    ],
    faq: {
      title: 'Dúvidas?',
      content: 'Como somos um projeto de código aberto, você pode abrir uma issue em nosso repositório no GitHub ou entrar em contato através da nossa comunidade.'
    }
  },
  'en': {
    title: 'Terms and Privacy',
    hero: {
      title: 'Terms of Service',
      subtitle: 'Last update: April 2026. Read carefully how we protect you and your data.'
    },
    sections: [
      {
        title: 'Privacy and Security',
        content: 'Your financial data is protected by Supabase Row Level Security (RLS). Only you have access to your transactions and accounts.'
      },
      {
        title: 'Data Security',
        content: 'We use end-to-end encryption and industry standards to ensure your information is never exposed to third parties.'
      },
      {
        title: 'Transparency',
        content: 'Expense Tracker is an open-source project. You can audit our code on GitHub to verify how we handle your information.'
      },
      {
        title: 'Service Usage',
        content: 'This is a tool to help personal financial management. We are not responsible for financial decisions made based on the data presented here.'
      }
    ],
    faq: {
      title: 'Questions?',
      content: 'As we are an open-source project, you can open an issue in our GitHub repository or contact us through our community.'
    }
  }
};

export default function Terms() {
  const navigate = useNavigate();
  const [lang] = useState(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'pt-BR') return saved;
    return 'pt-BR';
  });
  const t = COPY[lang];

  const icons = [
    <Shield key="1" className="w-6 h-6 text-blue-500" />,
    <Lock key="2" className="w-6 h-6 text-indigo-500" />,
    <Eye key="3" className="w-6 h-6 text-cyan-500" />,
    <FileText key="4" className="w-6 h-6 text-purple-500" />
  ];

  return (
    <PageTransition className="min-h-screen bg-white dark:bg-[#0c0c1d] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0c0c1d]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 p-6">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 pt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <section className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-500/10 rounded-[28px] flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{t.hero.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              {t.hero.subtitle}
            </p>
          </section>

          <div className="grid gap-8">
            {t.sections.map((section: any, idx: number) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-6 p-6 bg-gray-50 dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/5"
              >
                <div className="shrink-0 w-12 h-12 bg-white dark:bg-[#161629] rounded-2xl shadow-sm flex items-center justify-center">
                  {icons[idx]}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{section.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                    {section.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <section className="p-8 bg-indigo-500/5 rounded-[32px] border border-indigo-500/10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.faq.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {t.faq.content}
            </p>
          </section>
        </motion.div>
      </main>
    </PageTransition>
  );
}
