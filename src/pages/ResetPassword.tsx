import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, AlertCircle } from 'lucide-react';
import { PasswordInput } from '@/components/PasswordInput';
import { supabase } from '@/services/supabase';
import { ThemeToggle } from '@/components/ThemeToggle';
import PageTransition from '@/components/PageTransition'; // Added this import

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) throw updateError;
      
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir a senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50 dark:bg-gray-950 transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-expense-tracker.png" alt="Expense Tracker Logo" className="object-contain" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nova Senha</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 text-center">
            Digite sua nova senha abaixo para acessar sua conta
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {isSuccess ? (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg text-center font-medium">
            Senha atualizada com sucesso! Redirecionando...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <PasswordInput
              id="reset-password"
              label="Nova Senha"
              {...register('password')}
              placeholder="••••••"
              error={errors.password?.message}
            />

            <PasswordInput
              id="reset-confirm"
              label="Confirmar Nova Senha"
              {...register('confirmPassword')}
              placeholder="••••••"
              error={errors.confirmPassword?.message}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Redefinir Senha
                  <KeyRound className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </PageTransition>
  );
}
