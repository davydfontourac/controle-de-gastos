import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from '@/pages/Auth';
import Landing from '@/pages/Landing';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/Transactions';
import Categories from '@/pages/Categories';
import Savings from '@/pages/Savings';
import Profile from '@/pages/Profile';
import { AuthProvider } from '@/context/AuthContext';
import { PrivacyProvider } from '@/context/PrivacyContext';
import { PrivateRoute, PublicRoute } from '@/components/RouteGuards';
import { MainLayout } from '@/components/MainLayout';
import MobileAuthFlow from '@/pages/MobileAuthFlow';
import Terms from '@/pages/Terms';
import Docs from '@/pages/Docs';
import Changelog from '@/pages/Changelog';
import Privacy from '@/pages/Privacy';

function App() {
  return (
    <AuthProvider>
      <PrivacyProvider>
      <Routes>
        {/* Rotas Públicas (apenas deslogados) */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/welcome" element={<MobileAuthFlow />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>

        {/* Rotas Privadas (apenas logados) */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Fallback de rotas inexistentes redireciona pra home para o App processar */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </PrivacyProvider>
    </AuthProvider>
  );
}

export default App;
