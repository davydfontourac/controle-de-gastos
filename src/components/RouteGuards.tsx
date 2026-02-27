import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Bloqueia acesso de anônimos às páginas secretas (Dashboard)
export function PrivateRoute() {
  const { user, isLoading } = useAuth();

  // Enquanto descobre se está logado ou não, mostra tela branca ou um spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se não tem usuário logado, chuta pra tela de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se passou por tudo, permite que o app renderize a rota
  return <Outlet />;
}

// Impede que usuários logados visitem a tela de Login ou Cadastro novamente
export function PublicRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se está logado, arremessa direto pro Dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
