import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Github } from 'lucide-react';
import { PasswordInput } from '@/components/PasswordInput';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuthActions } from '@/hooks/useAuthActions';
import PageTransition from '@/components/PageTransition';

// ── SCHEMAS ──────────────────────────────────────────────────────────────────

import { loginSchema, registerSchema, type LoginFormValues as LoginForm, type RegisterFormValues as RegisterForm } from '@/utils/auth-schemas';
import { AUTH_TRANSLATIONS } from '@/utils/auth-translations';

const COPY: any = AUTH_TRANSLATIONS;

// ── COMPONENT ────────────────────────────────────────────────────────────────

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [isRegistered, setIsRegistered] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem('language') || 'pt-BR');
  
  const { isLoading, handleLogin, handleRegister, handleSocialLogin } = useAuthActions();
  
  useEffect(() => {
    localStorage.setItem('language', lang);
  }, [lang]);
  
  const t = COPY[lang];

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    if (window.innerWidth <= 820) {
      navigate('/welcome', { replace: true });
    }
  }, [location.pathname, navigate]);

  const toggleMode = (mode: 'login' | 'register') => {
    setIsLogin(mode === 'login');
    window.history.pushState({}, '', mode === 'login' ? '/login' : '/register');
  };

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onLoginSubmit = (data: LoginForm) => handleLogin(data);
  const onRegisterSubmit = (data: RegisterForm) => handleRegister(data, () => setIsRegistered(true));

  if (isRegistered) {
    return (
      <PageTransition className="min-h-screen flex items-center justify-center p-8 bg-white dark:bg-[#0c0c1d] relative overflow-hidden">
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
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            ></div>

            <div className="relative inline-flex mb-8">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">{t.success.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">{t.success.subtitle}</p>

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
              <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline">{t.success.resend}</button>
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
          <button onClick={() => setLang('pt-BR')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'pt-BR' ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-500' : 'text-gray-500'}`}>PT</button>
          <button onClick={() => setLang('en')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-500' : 'text-gray-500'}`}>EN</button>
        </div>
        <ThemeToggle />
      </div>
      
      <motion.div
        className="hidden lg:flex absolute top-0 bottom-0 w-1/2 bg-[#0c0c1d] dark:bg-[#161629] z-20 items-center justify-center p-16 overflow-hidden"
        initial={false}
        animate={{ x: isLogin ? '0%' : '100%', borderRadius: isLogin ? '0 40px 40px 0' : '40px 0 0 40px' }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -mr-48 -mt-48"></div>
        <div className="relative z-10 max-w-lg">
          <h2 className="text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            {t.register.sidebarTitle}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              {t.register.sidebarSubtitle}
            </span>
          </h2>
          <p className="text-lg text-white/60 leading-relaxed mb-16">
            {t.register.sidebarDesc}
          </p>
        </div>
      </motion.div>

      <div className="flex w-full h-full min-h-screen">
        <motion.div
          className="w-full lg:w-1/2 flex flex-col p-8 lg:p-16 justify-center bg-white dark:bg-[#0c0c1d]"
          animate={{ x: isLogin ? '100%' : '0%' }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <div className="max-w-md w-full mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <img src="/logo-expense-tracker.png" alt="Logo" className="w-8 h-8 rounded-xl" />
                <span className="font-semibold text-gray-900 dark:text-white text-lg">Expense Tracker</span>
              </div>

              {/* Desktop Toggle */}
              <div className="flex bg-gray-100 dark:bg-white/5 rounded-2xl p-1 shadow-inner">
                <button 
                  onClick={() => toggleMode('register')}
                  className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${!isLogin ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                  {t.register.signup}
                </button>
                <button 
                  onClick={() => toggleMode('login')}
                  className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${isLogin ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                  {t.register.signin}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={isLogin ? 'login' : 'register'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{isLogin ? t.login.title : t.register.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">{isLogin ? t.login.subtitle : t.register.subtitle}</p>
              </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button onClick={() => handleSocialLogin('google')} disabled={isLoading} className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-[#161629] transition-colors text-gray-700 dark:text-white font-medium disabled:opacity-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button onClick={() => handleSocialLogin('github')} disabled={isLoading} className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-[#161629] transition-colors text-gray-700 dark:text-white font-medium disabled:opacity-50">
                <Github className="w-5 h-5" />
                GitHub
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form key="form-login" onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-mono">{t.login.email}</label>
                    <input type="email" {...loginForm.register('email')} className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#161629] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" placeholder={t.login.emailPlaceholder} />
                    {loginForm.formState.errors.email && <p className="mt-1 text-xs text-red-600">{loginForm.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-mono">{t.login.password}</label>
                    <PasswordInput {...loginForm.register('password')} placeholder={t.login.passwordPlaceholder} error={loginForm.formState.errors.password?.message} className="!bg-gray-50 dark:!bg-[#161629] !border-gray-200 dark:!border-gray-800 !rounded-xl !py-3.5" />
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-[#0c0c1d] dark:bg-white hover:bg-[#1a1a33] dark:hover:bg-gray-100 text-white dark:text-[#0c0c1d] font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98]">
                    {isLoading ? '...' : `${t.login.button} →`}
                  </button>
                </motion.form>
              ) : (
                <motion.form key="form-register" onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-mono">{t.register.name}</label>
                    <input type="text" {...registerForm.register('fullName')} className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#161629] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" placeholder={t.register.namePlaceholder} />
                    {registerForm.formState.errors.fullName && <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-mono">{t.register.email}</label>
                    <input type="email" {...registerForm.register('email')} className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#161629] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" placeholder={t.register.emailPlaceholder} />
                    {registerForm.formState.errors.email && <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-mono">{t.register.password}</label>
                    <PasswordInput {...registerForm.register('password')} placeholder={t.register.passwordPlaceholder} error={registerForm.formState.errors.password?.message} className="!bg-gray-50 dark:!bg-[#161629] !border-gray-200 dark:!border-gray-800 !rounded-xl !py-3.5" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-mono">{t.register.confirm}</label>
                    <PasswordInput {...registerForm.register('confirmPassword')} placeholder={t.register.confirmPasswordPlaceholder} error={registerForm.formState.errors.confirmPassword?.message} className="!bg-gray-50 dark:!bg-[#161629] !border-gray-200 dark:!border-gray-800 !rounded-xl !py-3.5" />
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-[#0c0c1d] dark:bg-white hover:bg-[#1a1a33] dark:hover:bg-gray-100 text-white dark:text-[#0c0c1d] font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] mt-4">
                    {isLoading ? '...' : `${t.register.button} →`}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="mt-8 text-center text-sm text-gray-500">
              {isLogin ? (
                <>{t.login.noAccount} <button onClick={() => toggleMode('register')} className="text-blue-600 font-bold dark:text-blue-400">{t.login.create}</button></>
              ) : (
                <>{t.register.hasAccount} <button onClick={() => toggleMode('login')} className="text-blue-600 font-bold dark:text-blue-400">{t.register.signin}</button></>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
