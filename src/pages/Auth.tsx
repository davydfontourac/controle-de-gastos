import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Github } from 'lucide-react';
import { PasswordInput } from '@/components/PasswordInput';
import { supabase } from '@/services/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import PageTransition from '@/components/PageTransition';

// ── SCHEMAS ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

const registerSchema = z
  .object({
    fullName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
      .regex(/\d/, 'Deve conter pelo menos um número')
      .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos um símbolo'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: 'Você deve aceitar os termos',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const COPY: any = {
  'pt-BR': {
    login: {
      title: 'Bem-vindo de volta',
      subtitle: 'Entre para gerenciar suas finanças de forma inteligente.',
      email: 'E-mail',
      password: 'Senha',
      forgot: 'Esqueceu a senha?',
      button: 'Entrar',
      buttonLoading: 'Entrando...',
      noAccount: 'Ainda não tem conta?',
      create: 'Crie uma agora',
      or: 'ou continue com'
    },
    register: {
      title: 'Crie sua conta',
      subtitle: 'Comece a rastrear seus gastos em menos de 1 minuto.',
      name: 'Nome completo',
      email: 'E-mail',
      password: 'Senha',
      confirm: 'Confirmar senha',
      button: 'Criar conta',
      buttonLoading: 'Criando...',
      hasAccount: 'Já tem uma conta?',
      signin: 'Entrar',
      terms: 'Concordo com os Termos e Privacidade.',
      termsLink: 'Termos',
      termsError: 'Você deve aceitar os termos',
      termsText: 'Ao continuar, você concorda com nossos'
    },
    success: {
      title: 'Verifique seu e-mail',
      subtitle: 'Enviamos um link de confirmação especial para o seu e-mail. Acesse sua caixa de entrada para ativar sua conta e começar sua jornada.',
      button: 'Ir para o Login',
      noEmail: 'Não recebeu?',
      resend: 'Reenviar link'
    }
  },
  'en': {
    login: {
      title: 'Welcome back',
      subtitle: 'Sign in to manage your finances intelligently.',
      email: 'Email',
      password: 'Password',
      forgot: 'Forgot password?',
      button: 'Sign in',
      buttonLoading: 'Signing in...',
      noAccount: "Don't have an account?",
      create: 'Create one now',
      or: 'or continue with'
    },
    register: {
      title: 'Create your account',
      subtitle: 'Start tracking your expenses in less than 1 minute.',
      name: 'Full name',
      email: 'Email',
      password: 'Password',
      confirm: 'Confirm password',
      button: 'Create account',
      buttonLoading: 'Creating...',
      hasAccount: 'Already have an account?',
      signin: 'Sign in',
      terms: 'I agree to the Terms and Privacy.',
      termsLink: 'Terms',
      termsError: 'You must accept the terms',
      termsText: 'By continuing, you agree to our'
    },
    success: {
      title: 'Check your email',
      subtitle: "We've sent a special confirmation link to your email. Check your inbox to activate your account and start your journey.",
      button: 'Go to Login',
      noEmail: "Didn't receive it?",
      resend: 'Resend link'
    }
  }
};

// ── COMPONENT ────────────────────────────────────────────────────────────────

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');

  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem('language') || 'pt-BR');
  
  useEffect(() => {
    localStorage.setItem('language', lang);
  }, [lang]);
  
  const t = COPY[lang];

  // Sync state with URL if it changes externally
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    
    // Redirect mobile users to the dedicated flow
    if (window.innerWidth <= 820) {
      navigate('/welcome', { replace: true });
    }
  }, [location.pathname, navigate]);

  const toggleMode = (mode: 'login' | 'register') => {
    setIsLogin(mode === 'login');
    // Update URL without full reload
    window.history.pushState({}, '', mode === 'login' ? '/login' : '/register');
  };

  // Forms
  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onLoginSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      toast.success(lang === 'pt-BR' ? 'Login realizado com sucesso!' : 'Login successful!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || (lang === 'pt-BR' ? 'Erro ao realizar login' : 'Error logging in'));
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.fullName } },
      });
      if (error) throw error;
      setIsRegistered(true);
      toast.success(lang === 'pt-BR' ? 'Cadastro realizado! Verifique seu e-mail.' : 'Registered successfully! Check your email.');
    } catch (err: any) {
      toast.error(err.message || (lang === 'pt-BR' ? 'Erro ao realizar cadastro' : 'Error registering'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      setIsOAuthLoading(provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: globalThis.location.origin },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || (lang === 'pt-BR' ? `Erro ao conectar com ${provider}` : `Error connecting with ${provider}`));
    } finally {
      setIsOAuthLoading(null);
    }
  };

  if (isRegistered) {
    return (
      <PageTransition className="min-h-screen flex items-center justify-center p-8 bg-white dark:bg-[#0c0c1d] relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -ml-48 -mb-48"></div>

        <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 mr-2">
            <button 
              onClick={() => setLang('pt-BR')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'pt-BR' ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              PT
            </button>
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              EN
            </button>
          </div>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white dark:bg-[#161629] rounded-[32px] shadow-2xl p-10 border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
            {/* Decorative Background Pattern */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            ></div>

            <div className="relative inline-flex mb-8">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
                <svg
                  className="w-12 h-12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white dark:border-[#161629] rounded-full flex items-center justify-center text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              {t.success.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
              {t.success.subtitle}
            </p>

            <button
              onClick={() => {
                setIsRegistered(false);
                toggleMode('login');
              }}
              className="w-full bg-[#0c0c1d] dark:bg-white hover:bg-[#1a1a33] dark:hover:bg-gray-100 text-white dark:text-[#0c0c1d] font-bold py-4 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              {t.success.button} →
            </button>

            <p className="mt-8 text-xs text-gray-400 dark:text-gray-500 font-medium">
              {t.success.noEmail}{' '}
              <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                {t.success.resend}
              </button>
            </p>
          </div>
        </motion.div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen relative overflow-hidden bg-white dark:bg-[#0c0c1d] transition-colors">
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 mr-2">
          <button 
            onClick={() => setLang('pt-BR')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'pt-BR' ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            PT
          </button>
          <button 
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            EN
          </button>
        </div>
        <ThemeToggle />
      </div>
      {/* ── BACKGROUND / SLIDING BRANDING ── */}
      <motion.div
        className="hidden lg:flex absolute top-0 bottom-0 w-1/2 bg-[#0c0c1d] dark:bg-[#161629] z-20 items-center justify-center p-16 overflow-hidden"
        initial={false}
        animate={{
          x: isLogin ? '0%' : '100%',
          borderTopLeftRadius: isLogin ? 0 : 40,
          borderBottomLeftRadius: isLogin ? 0 : 40,
          borderTopRightRadius: isLogin ? 40 : 0,
          borderBottomRightRadius: isLogin ? 40 : 0,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -ml-48 -mb-48"></div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
              100% Open Source
            </span>
          </div>
          <h2 className="text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            {lang === 'pt-BR' ? 'Seu dinheiro, ' : 'Your money, '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              {lang === 'pt-BR' ? 'sob controle.' : 'under control.'}
            </span>
          </h2>
          <p className="text-lg text-white/60 leading-relaxed mb-16">
            {lang === 'pt-BR' 
              ? 'Dashboard inteligente, importação de extratos em CSV, categorias customizáveis e segurança Supabase.' 
              : 'Smart dashboard, CSV statement import, customizable categories and Supabase security.'}
          </p>
          <div className="grid grid-cols-2 gap-y-12 gap-x-8">
            {[
              ['5min', lang === 'pt-BR' ? 'Até o primeiro relatório' : 'Until first report'],
              ['R$ 0', lang === 'pt-BR' ? 'Grátis para sempre' : 'Free forever'],
              ['∞', lang === 'pt-BR' ? 'Categorias customizáveis' : 'Custom categories'],
              ['RLS', lang === 'pt-BR' ? 'Segurança Supabase' : 'Supabase Security'],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-4xl font-bold text-white mb-2">{v}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── FORMS CONTAINER ── */}
      <div className="flex w-full h-full min-h-screen">
        {/* Form area that stays "behind" or moves */}
        <motion.div
          className="w-full lg:w-1/2 flex flex-col p-8 lg:p-16 justify-center bg-white dark:bg-[#0c0c1d]"
          animate={{ x: isLogin ? '100%' : '0%' }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <div className="max-w-md w-full mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <img src="/logo-expense-tracker.png" alt="Logo" className="w-8 h-8 object-contain" />
              <span className="font-semibold text-gray-900 dark:text-white text-lg">
                Expense Tracker
              </span>
            </div>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t.login.title}</h1>
                  <p className="text-gray-500 dark:text-gray-400 mb-8">
                    {t.login.subtitle}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {t.register.title}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mb-8">
                    {t.register.subtitle}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle Buttons */}
            <div className="flex bg-gray-100 dark:bg-[#161629] p-1 rounded-xl mb-8 w-fit">
              <button
                onClick={() => toggleMode('register')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-white dark:bg-[#0c0c1d] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t.register.signin === 'Sign in' ? 'Register' : 'Cadastrar'}
              </button>
              <button
                onClick={() => toggleMode('login')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-white dark:bg-[#0c0c1d] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t.register.signin === 'Sign in' ? 'Login' : 'Entrar'}
              </button>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={!!isOAuthLoading || isLoading}
                className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-[#161629] transition-colors text-gray-700 dark:text-white font-medium disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {isOAuthLoading === 'google' ? '...' : 'Google'}
              </button>
              <button
                onClick={() => handleOAuthLogin('github')}
                disabled={!!isOAuthLoading || isLoading}
                className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-[#161629] transition-colors text-gray-700 dark:text-white font-medium disabled:opacity-50"
              >
                <Github className="w-5 h-5" />
                {isOAuthLoading === 'github' ? '...' : 'GitHub'}
              </button>
            </div>

            <p className="text-[10px] text-gray-500 text-center mb-8 px-4 leading-relaxed">
              {t.register.termsText}{' '}
              <Link to="/terms" className="text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-700">
                {t.register.termsLink}
              </Link>
            </p>

            {/* Separator */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white dark:bg-[#0c0c1d] px-4 text-gray-400 font-mono tracking-widest">
                  {t.login.or}
                </span>
              </div>
            </div>

            {/* Forms */}
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form
                  key="form-login"
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-6"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-mono">
                      {t.login.email}
                    </label>
                    <input
                      type="email"
                      {...loginForm.register('email')}
                      className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#161629] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all"
                      placeholder={lang === 'pt-BR' ? 'Digite seu email' : 'Enter your email'}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-mono">
                      {t.login.password}
                    </label>
                    <PasswordInput
                      {...loginForm.register('password')}
                      placeholder={lang === 'pt-BR' ? 'Digite sua senha' : 'Enter your password'}
                      error={loginForm.formState.errors.password?.message}
                      className="!bg-gray-50 dark:!bg-[#161629] !border-gray-200 dark:!border-gray-800 !rounded-xl !py-3.5"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-sm text-gray-600">{lang === 'pt-BR' ? 'Lembrar de mim' : 'Remember me'}</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {t.login.forgot}
                    </Link>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0c0c1d] dark:bg-white hover:bg-[#1a1a33] dark:hover:bg-gray-100 text-white dark:text-[#0c0c1d] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-[#0c0c1d]/30 dark:border-t-[#0c0c1d] rounded-full animate-spin" />
                    ) : (
                      `${t.login.button} →`
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="form-register"
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                  className="space-y-4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-mono">
                      {t.register.name}
                    </label>
                    <input
                      type="text"
                      {...registerForm.register('fullName')}
                      className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#161629] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all"
                      placeholder={lang === 'pt-BR' ? 'Como devemos te chamar?' : 'How should we call you?'}
                    />
                    {registerForm.formState.errors.fullName && (
                      <p className="mt-1 text-xs text-red-600">
                        {registerForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-mono">
                      {t.register.email}
                    </label>
                    <input
                      type="email"
                      {...registerForm.register('email')}
                      className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#161629] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all"
                      placeholder={lang === 'pt-BR' ? 'Digite seu email' : 'Enter your email'}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-mono">
                      {t.register.password}
                    </label>
                    <PasswordInput
                      {...registerForm.register('password')}
                      placeholder={lang === 'pt-BR' ? 'Mínimo 8 caracteres' : 'Minimum 8 characters'}
                      error={registerForm.formState.errors.password?.message}
                      className="!bg-gray-50 dark:!bg-[#161629] !border-gray-200 dark:!border-gray-800 !rounded-xl !py-3.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-mono">
                      {t.register.confirm}
                    </label>
                    <PasswordInput
                      {...registerForm.register('confirmPassword')}
                      placeholder={lang === 'pt-BR' ? 'Confirme sua senha' : 'Confirm your password'}
                      error={registerForm.formState.errors.confirmPassword?.message}
                      className="!bg-gray-50 dark:!bg-[#161629] !border-gray-200 dark:!border-gray-800 !rounded-xl !py-3.5"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0c0c1d] dark:bg-white hover:bg-[#1a1a33] dark:hover:bg-gray-100 text-white dark:text-[#0c0c1d] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg active:scale-[0.98] mt-4"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-[#0c0c1d]/30 dark:border-t-[#0c0c1d] rounded-full animate-spin" />
                    ) : (
                      `${t.register.button} →`
                    )}
                  </button>

                  <div className="flex flex-col gap-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        {...registerForm.register('acceptTerms')}
                        className="mt-1 w-5 h-5 rounded border-gray-200 dark:border-gray-800 text-blue-600 focus:ring-blue-600/20 bg-gray-50 dark:bg-[#161629]"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t.register.terms.split(t.register.termsLink).map((part: string, i: number) => (
                          <span key={i}>
                            {part}
                            {i === 0 && <Link to="/terms" className="text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-700">{t.register.termsLink}</Link>}
                          </span>
                        ))}
                      </span>
                    </label>
                    {registerForm.formState.errors.acceptTerms && (
                      <p className="text-xs text-red-600">
                        {lang === 'pt-BR' ? t.register.termsError : 'You must accept the terms'}
                      </p>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="mt-8 text-center text-sm text-gray-500">
              {isLogin ? (
                <>
                  {t.login.noAccount}{' '}
                  <button
                    onClick={() => toggleMode('register')}
                    className="text-blue-600 font-bold hover:text-blue-700 dark:text-blue-400"
                  >
                    {t.login.create}
                  </button>
                </>
              ) : (
                <>
                  {t.register.hasAccount}{' '}
                  <button
                    onClick={() => toggleMode('login')}
                    className="text-blue-600 font-bold hover:text-blue-700 dark:text-blue-400"
                  >
                    {t.register.signin}
                  </button>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
