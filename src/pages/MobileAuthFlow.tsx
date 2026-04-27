import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Github, Chrome, Mail, Eye, EyeOff, CheckCircle2, Menu, X, Globe, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/services/supabase';
import { toast } from 'sonner';

// --- SCHEMAS ---
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

const registerSchema = z.object({
  fullName: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirme sua senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

const COPY: any = {
  'pt-BR': {
    splash: { subtitle: 'Seu dinheiro, sob controle.' },
    onboarding: {
      step1: { title: 'Rastreie tudo em um só lugar.', desc: 'Despesas, receitas e caixinhas. Sem planilhas, sem fricção.' },
      step2: { title: 'Importe extratos em 2 cliques.', desc: 'Suporte a CSV de qualquer banco. Nós mapeamos as colunas para você.' },
      step3: { title: 'Insights que fazem sentido.', desc: 'Categorização automática e relatórios visuais para você economizar.' },
      skip: 'Pular',
      next: 'Próximo',
      finish: 'Começar agora'
    },
    register: {
      title: 'Crie sua conta.',
      subtitle: 'É grátis. Seus dados são seus. Criptografia em repouso por padrão.',
      name: 'Nome',
      namePlaceholder: 'Digite seu nome',
      email: 'E-mail',
      emailPlaceholder: 'Digite seu email',
      password: 'Senha',
      passwordPlaceholder: 'Digite sua senha',
      confirmPassword: 'Confirmar Senha',
      confirmPasswordPlaceholder: 'Confirme sua senha',
      terms: 'Concordo com os Termos e Privacidade.',
      termsLink: 'Termos',
      button: 'Criar conta grátis',
      buttonLoading: 'Criando conta...',
      or: 'ou',
      hasAccount: 'Já tem conta? Entrar',
      hasAccountLink: 'Entrar'
    },
    login: {
      title: 'Bem-vindo de volta.',
      subtitle: 'Entre para continuar acompanhando suas finanças.',
      forgot: 'Esqueci minha senha',
      button: 'Entrar',
      buttonLoading: 'Entrando...',
      or: 'ou continue com',
      noAccount: 'Ainda não tem conta? Criar conta',
      noAccountLink: 'Criar conta'
    },
    forgot: {
      title: 'Esqueceu a senha?',
      subtitle: 'Digite seu e-mail e mandaremos um link para você redefinir.',
      button: 'Enviar link',
      buttonLoading: 'Enviando...',
      cancel: 'Cancelar',
      footer: 'Verifique seu inbox · Spam'
    },
    menu: {
      home: 'Página Inicial',
      theme: 'Tema',
      language: 'Idioma'
    }
  },
  'en': {
    splash: { subtitle: 'Your money, under control.' },
    onboarding: {
      step1: { title: 'Track everything in one place.', desc: 'Expenses, income and goals. No spreadsheets, no friction.' },
      step2: { title: 'Import statements in 2 clicks.', desc: 'CSV support for any bank. We map the columns for you.' },
      step3: { title: 'Insights that make sense.', desc: 'Automatic categorization and visual reports to help you save.' },
      skip: 'Skip',
      next: 'Next',
      finish: 'Get started'
    },
    register: {
      title: 'Create your account.',
      subtitle: "It's free. Your data is yours. Encryption at rest by default.",
      name: 'Name',
      namePlaceholder: 'Enter your name',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm your password',
      terms: 'I agree to the Terms and Privacy.',
      termsLink: 'Terms',
      button: 'Create free account',
      buttonLoading: 'Creating account...',
      or: 'or',
      hasAccount: 'Already have an account? Sign in',
      hasAccountLink: 'Sign in'
    },
    login: {
      title: 'Welcome back.',
      subtitle: 'Sign in to continue tracking your finances.',
      forgot: 'Forgot my password',
      button: 'Sign in',
      buttonLoading: 'Signing in...',
      or: 'or continue with',
      noAccount: "Don't have an account? Create one",
      noAccountLink: 'Create one'
    },
    forgot: {
      title: 'Forgot password?',
      subtitle: "Enter your email and we'll send you a link to reset.",
      button: 'Send link',
      buttonLoading: 'Sending...',
      cancel: 'Cancel',
      footer: 'Check your inbox · Spam'
    },
    menu: {
      home: 'Home Page',
      theme: 'Theme',
      language: 'Language'
    }
  }
};

type Step = 'splash' | 'onboarding1' | 'onboarding2' | 'onboarding3' | 'register' | 'login' | 'forgot_password';

export default function MobileAuthFlow() {
  const [step, setStep] = useState<Step>('splash');
  const [direction, setDirection] = useState(0); // 1 for next, -1 for back
  const [lang, setLang] = useState('pt-BR');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const t = COPY[lang];

  // Handle splash timeout
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        nextStep('onboarding1');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const nextStep = (next: Step) => {
    setDirection(1);
    setStep(next);
  };

  const prevStep = (prev: Step) => {
    setDirection(-1);
    setStep(prev);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0c1d] flex flex-col font-sans overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="flex-1 flex flex-col"
        >
          {step === 'splash' && <SplashStep t={t} />}
          {step === 'onboarding1' && <OnboardingStep
            num="01"
            title={t.onboarding.step1.title}
            desc={t.onboarding.step1.desc}
            t={t}
            onNext={() => nextStep('onboarding2')}
            onSkip={() => nextStep('register')}
            image={<TrackIllustration />}
          />}
          {step === 'onboarding2' && <OnboardingStep
            num="02"
            title={t.onboarding.step2.title}
            desc={t.onboarding.step2.desc}
            t={t}
            onNext={() => nextStep('onboarding3')}
            onSkip={() => nextStep('register')}
            image={<ImportIllustration />}
          />}
          {step === 'onboarding3' && <OnboardingStep
            num="03"
            title={t.onboarding.step3.title}
            desc={t.onboarding.step3.desc}
            t={t}
            onNext={() => nextStep('register')}
            onSkip={() => nextStep('register')}
            isLast
            image={<InsightsIllustration />}
          />}
          {step === 'register' && <RegisterStep
            t={t}
            onBack={() => prevStep('onboarding3')}
            onLogin={() => nextStep('login')}
            onOpenMenu={() => setIsMenuOpen(true)}
          />}
          {step === 'login' && <LoginStep
            t={t}
            onBack={() => prevStep('register')}
            onRegister={() => nextStep('register')}
            onForgotPassword={() => nextStep('forgot_password')}
            onOpenMenu={() => setIsMenuOpen(true)}
          />}
          {step === 'forgot_password' && <ForgotPasswordStep
            t={t}
            lang={lang}
            onBack={() => prevStep('login')}
          />}
        </motion.div>
      </AnimatePresence>

      {/* Hamburger Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white dark:bg-[#0c0c1d] shadow-2xl z-[70] flex flex-col p-8"
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500 dark:text-gray-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                  <img src="/logo-expense-tracker.png" alt="Logo" className="w-6 h-6 brightness-0 invert" />
                </div>
                <span className="text-xl font-bold dark:text-white">Expense Tracker</span>
              </div>

              <div className="space-y-6 flex-1">
                <button 
                  onClick={() => navigate('/')} 
                  className="flex items-center gap-4 w-full text-left text-gray-600 dark:text-gray-300 font-bold hover:text-indigo-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  {t.menu.home}
                </button>
                
                <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-white/5 pt-6">
                  <span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t.menu.theme}</span>
                  <ThemeToggle dropdownPosition="top" align="right" />
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t.menu.language}</span>
                  <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1">
                    <button 
                      onClick={() => setLang('pt-BR')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'pt-BR' ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-500' : 'text-gray-500'}`}
                    >
                      PT
                    </button>
                    <button 
                      onClick={() => setLang('en')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'en' ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-500' : 'text-gray-500'}`}
                    >
                      EN
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center text-[10px] text-gray-400 dark:text-gray-600 font-medium">
                &copy; 2026 Expense Tracker
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SplashStep({ t }: { t: any }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#f8f5ff] to-[#ffffff] dark:from-[#0c0c1d] dark:to-[#161629] relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 blur-[80px] rounded-full"></div>
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-indigo-500 rounded-[28px] shadow-2xl shadow-indigo-500/20 flex items-center justify-center mb-8">
           <img src="/logo-expense-tracker.png" alt="Logo" className="w-12 h-12 brightness-0 invert" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Expense Tracker</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-12">{t.splash.subtitle}</p>
        
        <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </motion.div>
    </div>
  );
}

function OnboardingStep({ num, title, desc, onNext, onSkip, isLast, image, t }: { num: string, title: string, desc: string, onNext: () => void, onSkip: () => void, isLast?: boolean, image: React.ReactNode, t: any }) {
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0c0c1d]">
      <header className="p-8 flex justify-between items-center">
        <div className="text-xl font-mono font-bold text-indigo-500">{num}</div>
        {!isLast && (
          <button onClick={onSkip} className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            {t.onboarding.skip}
          </button>
        )}
      </header>
      
      <div className="flex-1 flex flex-col items-center justify-center py-8 px-8">
        <div className="w-full max-w-[280px] aspect-square mb-12">
          {image}
        </div>
        
        <div className="w-full text-left space-y-4">
          <h2 className="text-[32px] font-bold leading-[1.1] text-gray-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
            {desc}
          </p>
        </div>
      </div>
      
      <div className="p-8 mt-auto flex flex-col items-center gap-8">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                parseInt(num) === i ? 'w-8 bg-gray-900 dark:bg-white' : 'w-2 bg-gray-200 dark:bg-gray-800'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={onNext}
          className="w-full bg-[#0c0c1d] dark:bg-white text-white dark:text-[#0c0c1d] font-bold py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98]"
        >
          {isLast ? t.onboarding.finish : t.onboarding.next}
        </button>
      </div>
    </div>
  );
}

// --- ILLUSTRATIONS ---

function TrackIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full"></div>
      <div className="relative w-full bg-white dark:bg-[#161629] p-6 rounded-[24px] shadow-2xl border border-gray-100 dark:border-white/5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Saldo</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">R$ 2.014,70</div>
          </div>
          <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
             <div className="w-8 h-8 bg-orange-500/20 text-orange-500 rounded-lg flex items-center justify-center text-xs">🍔</div>
             <div className="flex-1">
               <div className="text-xs font-bold text-gray-900 dark:text-white">iFood - Almoço</div>
               <div className="text-[10px] text-gray-500">Hoje, 12:30</div>
             </div>
             <div className="text-xs font-bold text-red-500">- R$ 32,50</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImportIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full"></div>
      <div className="relative w-48 h-48 bg-white dark:bg-[#161629] rounded-[32px] shadow-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900 dark:text-white">extrato.csv</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-1">124 transações</div>
        </div>
      </div>
    </div>
  );
}

function InsightsIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full"></div>
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Simple Donut Chart SVG */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-white/5" />
          <circle cx="50" cy="50" r="40" stroke="#6366f1" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset="62.8" />
          <circle cx="50" cy="50" r="40" stroke="#f59e0b" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset="200" />
          <circle cx="50" cy="50" r="40" stroke="#06b6d4" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset="230" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Abr</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">R$ 1.292</div>
        </div>
      </div>
    </div>
  );
}

// --- FORMS ---

function RegisterStep({ onBack, onLogin, onOpenMenu, t }: { onBack: () => void, onLogin: () => void, onOpenMenu: () => void, t: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.fullName } }
      });
      if (error) throw error;
      toast.success('Cadastro realizado! Verifique seu e-mail.');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao realizar cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: globalThis.location.origin },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || `Erro ao conectar com ${provider}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0c0c1d] p-8 overflow-y-auto">
      <header className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-900 dark:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo-expense-tracker.png" alt="Logo" className="w-6 h-6" />
          <span className="text-sm font-bold dark:text-white">Expense Tracker</span>
        </div>
        <button onClick={onOpenMenu} className="p-2 -mr-2 text-gray-900 dark:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <div className="mb-8">
        <h1 className="text-[32px] font-bold leading-tight text-gray-900 dark:text-white mb-2">{t.register.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t.register.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label={t.register.name} placeholder={t.register.namePlaceholder} {...register('fullName')} error={errors.fullName?.message as string} />
        <Input label={t.register.email} placeholder={t.register.emailPlaceholder} type="email" {...register('email')} error={errors.email?.message as string} />
        <div className="relative">
          <Input label={t.register.password} placeholder={t.register.passwordPlaceholder} type={showPassword ? 'text' : 'password'} {...register('password')} error={errors.password?.message as string} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[42px] text-gray-400">
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative">
          <Input label={t.register.confirmPassword} placeholder={t.register.confirmPasswordPlaceholder} type={showConfirmPassword ? 'text' : 'password'} {...register('confirmPassword')} error={errors.confirmPassword?.message as string} />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-[42px] text-gray-400">
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-start gap-3 py-2">
          <input type="checkbox" className="mt-1 w-5 h-5 rounded-md border-gray-200 dark:border-white/10 dark:bg-white/5" defaultChecked />
          <p className="text-xs text-gray-500 leading-relaxed">
            {t.register.terms.split(t.register.termsLink).map((part: string, i: number) => (
              <React.Fragment key={i}>
                {part}
                {i === 0 && <span className="text-blue-500 font-bold underline">{t.register.termsLink}</span>}
              </React.Fragment>
            ))}
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] mt-4"
        >
          {isLoading ? t.register.buttonLoading : t.register.button}
        </button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-6">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-white/5"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 bg-white dark:bg-[#0c0c1d] px-4">{t.register.or}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <SocialButton 
            icon={<Chrome className="w-5 h-5 text-gray-500" />} 
            label="Google" 
            onClick={() => handleSocialLogin('google')}
          />
          <SocialButton 
            icon={<Github className="w-5 h-5 text-gray-500" />} 
            label="GitHub" 
            onClick={() => handleSocialLogin('github')}
          />
        </div>

        <button onClick={onLogin} className="text-sm font-medium text-gray-500">
          {t.register.hasAccount.split(t.register.hasAccountLink).map((part: string, i: number) => (
            <React.Fragment key={i}>
              {part}
              {i === 0 && <span className="text-gray-900 dark:text-white font-bold">{t.register.hasAccountLink}</span>}
            </React.Fragment>
          ))}
        </button>
      </div>
    </div>
  );
}

function LoginStep({ onBack, onRegister, onForgotPassword, onOpenMenu, t }: { onBack: () => void, onRegister: () => void, onForgotPassword: () => void, onOpenMenu: () => void, t: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      if (error) throw error;
      toast.success('Bem-vindo de volta!');
      window.location.href = '/dashboard';
    } catch (err: any) {
      toast.error(err.message || 'Erro ao realizar login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: globalThis.location.origin },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || `Erro ao conectar com ${provider}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0c0c1d] p-8 overflow-y-auto">
      <header className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-900 dark:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo-expense-tracker.png" alt="Logo" className="w-6 h-6" />
          <span className="text-sm font-bold dark:text-white">Expense Tracker</span>
        </div>
        <button onClick={onOpenMenu} className="p-2 -mr-2 text-gray-900 dark:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <div className="mb-8">
        <h1 className="text-[32px] font-bold leading-tight text-gray-900 dark:text-white mb-2">{t.login.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t.login.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input label={t.register.email} placeholder={t.register.emailPlaceholder} type="email" {...register('email')} error={errors.email?.message as string} />
        <div className="space-y-2">
          <Input label={t.register.password} placeholder={t.register.passwordPlaceholder} type="password" {...register('password')} error={errors.password?.message as string} />
          <div className="flex justify-end">
            <button type="button" onClick={onForgotPassword} className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
              {t.login.forgot}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0c0c1d] dark:bg-white text-white dark:text-[#0c0c1d] font-bold py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98] mt-4"
        >
          {isLoading ? t.login.buttonLoading : t.login.button}
        </button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-6">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-white/5"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 bg-white dark:bg-[#0c0c1d] px-4">{t.login.or}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <SocialButton 
            icon={<Chrome className="w-5 h-5 text-gray-500" />} 
            label="Google" 
            onClick={() => handleSocialLogin('google')}
          />
          <SocialButton 
            icon={<Github className="w-5 h-5 text-gray-500" />} 
            label="GitHub" 
            onClick={() => handleSocialLogin('github')}
          />
        </div>

        <button onClick={onRegister} className="text-sm font-medium text-gray-500">
          {t.login.noAccount.split(t.login.noAccountLink).map((part: string, i: number) => (
            <React.Fragment key={i}>
              {part}
              {i === 0 && <span className="text-gray-900 dark:text-white font-bold">{t.login.noAccountLink}</span>}
            </React.Fragment>
          ))}
        </button>
      </div>
    </div>
  );
}

function ForgotPasswordStep({ onBack, t, lang }: { onBack: () => void, t: any, lang: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${globalThis.location.origin}/reset-password`
      });
      if (error) throw error;
      setIsSuccess(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao solicitar recuperação');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0c0c1d] p-8 items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {lang === 'pt-BR' ? 'Verifique seu inbox.' : 'Check your inbox.'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-12">
          {lang === 'pt-BR' 
            ? 'Enviamos um link de recuperação para o seu e-mail. Se não chegar em alguns minutos, verifique sua caixa de spam.' 
            : "We've sent a recovery link to your email. If it doesn't arrive in a few minutes, check your spam folder."}
        </p>
        <button onClick={onBack} className="w-full bg-[#0c0c1d] dark:bg-white text-white dark:text-[#0c0c1d] font-bold py-5 rounded-2xl">
          {lang === 'pt-BR' ? 'Voltar para o Login' : 'Back to Login'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0c0c1d] p-8">
       <header className="flex items-center mb-12">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-900 dark:text-white flex items-center gap-2 font-bold text-sm">
          <ArrowLeft className="w-5 h-5" /> Voltar
        </button>
      </header>

      <div className="mb-12">
        <h1 className="text-[32px] font-bold leading-tight text-gray-900 dark:text-white mb-2">{t.forgot.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t.forgot.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Input label={t.register.email} placeholder={t.register.emailPlaceholder} type="email" {...register('email')} error={errors.email?.message as string} />
        
        <div className="space-y-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0c0c1d] dark:bg-white text-white dark:text-[#0c0c1d] font-bold py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98]"
          >
            {isLoading ? t.forgot.buttonLoading : t.forgot.button}
          </button>
          <button type="button" onClick={onBack} className="w-full py-5 text-gray-500 font-bold text-sm">
            {t.forgot.cancel}
          </button>
        </div>
      </form>

      <div className="mt-auto text-center py-8">
        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{t.forgot.footer}</p>
      </div>
    </div>
  );
}

// --- SHARED UI ---

const Input = React.forwardRef<HTMLInputElement, any>(({ label, error, ...props }, ref) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest font-mono">{label}</label>
    <input
      ref={ref}
      className={`w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border ${error ? 'border-red-500' : 'border-gray-100 dark:border-white/10'} rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-700`}
      {...props}
    />
    {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">{error}</p>}
  </div>
));

function SocialButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-center gap-3 px-4 py-4 bg-white dark:bg-[#161629] border border-gray-100 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm active:scale-[0.98]">
      {icon}
      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{label}</span>
    </button>
  );
}
