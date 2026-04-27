import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import PageTransition from '@/components/PageTransition';

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;


export default function ForgotPassword() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.innerWidth <= 820) {
      navigate('/welcome', { replace: true });
    }
  }, [navigate]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${globalThis.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao solicitar redefinição de senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen relative overflow-hidden bg-white dark:bg-[#0c0c1d] transition-colors">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* ── RIGHT SIDE (Branding/Steps) ── */}
      <div className="hidden lg:flex absolute top-0 bottom-0 right-0 w-1/2 bg-[#0c0c1d] z-20 items-center justify-center p-16 overflow-hidden">
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

        <div className="relative z-10 max-w-lg w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
              Conexão Criptografada
            </span>
          </div>
          <h2 className="text-5xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Redefina sua senha em{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              3 passos.
            </span>
          </h2>
          <p className="text-lg text-white/60 leading-relaxed mb-12">
            Link único, válido por 1 hora, enviado direto para o e-mail cadastrado. Sua conta fica
            segura durante todo o processo.
          </p>

          <div className="space-y-4">
            {[
              {
                step: '01',
                title: 'Digite seu e-mail',
                desc: 'Usamos o mesmo e-mail que você cadastrou originalmente.',
              },
              {
                step: '02',
                title: 'Abra o link no seu inbox',
                desc: 'Verifique spam se não chegar em 2 minutos.',
              },
              {
                step: '03',
                title: 'Crie uma nova senha',
                desc: 'Mínimo 8 caracteres. Você é deslogado de todas as sessões.',
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shrink-0 shadow-lg shadow-blue-600/20">
                  {s.step}
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">{s.title}</div>
                  <div className="text-sm text-white/40 leading-relaxed">{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex gap-6 text-[10px] font-mono uppercase tracking-widest text-white/30">
            <span>RLS</span> <span>•</span> <span>Supabase</span> <span>•</span>{' '}
            <span>Open Source</span>
          </div>
        </div>
      </div>

      {/* ── LEFT SIDE (Form) ── */}
      <div className="flex w-full lg:w-1/2 min-h-screen items-center justify-center p-8 lg:p-16 bg-white dark:bg-[#0c0c1d]">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-16">
            <img src="/logo-expense-tracker.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
              Expense Tracker
            </span>
          </div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form-recovery"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-10">
                  <div className="w-16 h-16 bg-cyan-400 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-cyan-400/20 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Mail className="w-8 h-8 text-white relative z-10" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">
                    Recuperar senha
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    Digite o e-mail da sua conta e enviaremos um link seguro para você redefinir sua
                    senha em menos de 2 minutos.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-mono">
                      Seu E-mail
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#161629] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all"
                      placeholder="Digite seu email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600 font-medium">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-900/30">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0c0c1d] dark:bg-white hover:bg-[#1a1a33] dark:hover:bg-gray-100 text-white dark:text-[#0c0c1d] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-[#0c0c1d]/30 dark:border-t-[#0c0c1d] rounded-full animate-spin" />
                    ) : (
                      <>
                        Enviar link de recuperação <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar para o login
                  </Link>
                </form>

                <div className="mt-16 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161629]/30">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                    Não recebeu o e-mail?
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Verifique sua caixa de spam ou aguarde até 5 minutos. Se ainda precisar de
                    ajuda, entre em contato em{' '}
                    <a
                      href="mailto:suporte@expense-tracker.app"
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      suporte@expense-tracker.app
                    </a>
                    .
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                  E-mail enviado!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-10 max-w-sm mx-auto">
                  Enviamos as instruções de recuperação para o e-mail informado. Por favor,
                  verifique sua caixa de entrada.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0c0c1d] dark:bg-white text-white dark:text-[#0c0c1d] font-bold rounded-xl hover:bg-[#1a1a33] dark:hover:bg-gray-100 transition-all shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar para o Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
