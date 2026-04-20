import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import { PasswordInput } from '@/components/PasswordInput';
import { supabase } from '@/services/supabase';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import PageTransition from '@/components/PageTransition';

const registerSchema = z
  .object({
    fullName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
      .regex(/\d/, 'Deve conter pelo menos um número')
      .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos um símbolo'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);

      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          }
        }
      });

      if (signUpError) throw signUpError;

      setIsRegistered(true);
      toast.success('Cadastro realizado! Verifique seu e-mail.');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao realizar cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setIsGoogleLoading(true);
      
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: globalThis.location.origin,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err: any) {
      toast.error(err.message || 'Erro ao conectar com Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50 dark:bg-gray-950 transition-colors">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 text-center transition-colors">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">📧</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Verifique seu e-mail</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Enviamos um link de confirmação para o seu e-mail. Por favor, acesse sua caixa de entrada para ativar sua conta.
          </p>
          <Link 
            to="/login" 
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Ir para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-expense-tracker.png" alt="Expense Tracker Logo" className="object-contain" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Crie sua conta</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Comece a ter controle do seu dinheiro</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
              <input
                id="reg-name"
                type="text"
                {...register('fullName')}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Seu nome"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
              <input
                id="reg-email"
                type="email"
                {...register('email')}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="seu@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
            </div>

            <PasswordInput
              id="reg-password"
              label="Senha"
              {...register('password')}
              placeholder="••••••••"
              helperText="Mínimo 8 caracteres, com maiúsculas, minúsculas, números e símbolos"
              error={errors.password?.message}
            />

            <PasswordInput
              id="reg-confirm"
              label="Confirmar Senha"
              {...register('confirmPassword')}
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Cadastrar
                  <UserPlus className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="h-px w-full bg-gray-200 dark:bg-gray-800"></div>
          <span className="text-sm text-gray-400 dark:text-gray-500">ou</span>
          <div className="h-px w-full bg-gray-200 dark:bg-gray-800"></div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleRegister}
            disabled={isGoogleLoading || isLoading}
            type="button"
            className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <>
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
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Cadastrar com o Google
              </>
            )}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-500 font-medium hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </PageTransition>
  );
}
