import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Trash2, Camera, Save, Loader2, User, ShieldCheck, Smartphone, ArrowLeft, ChevronRight, Bell, Palette, Globe, DollarSign, Clock, Calendar, Database, HardDrive, Info, Github, History, Milestone, Bug, Lock, Eye, EyeOff, BarChart, LogOut, CheckCircle2, Moon, Sun, Monitor } from 'lucide-react';
import { PasswordInput } from '@/components/PasswordInput';
import ConfirmModal from '@/components/ConfirmModal';
import PageTransition from '@/components/PageTransition';
import { useMobile } from '@/hooks/useMobile';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';

export default function Profile() {
  const { user, profile, isLoading: isAuthLoading, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [view, setView] = useState<'main' | 'edit' | 'settings' | 'security' | 'notifications' | 'appearance' | 'about'>('main');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { theme, setTheme } = useTheme();

  const { summary, fetchTransactions, transactions } = useTransactions();
  const { categories, fetchCategories } = useCategories();

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  useEffect(() => {
    const now = new Date();
    const currentMonth = (now.getMonth() + 1).toString();
    const currentYear = now.getFullYear().toString();
    
    fetchTransactions({ type: 'all', month: currentMonth, year: currentYear, search: '' });
    fetchCategories();
  }, [fetchTransactions, fetchCategories]);

  async function updateProfile() {
    try {
      setIsSaving(true);
      if (!user) return;

      // 1. Update Profile Data
      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase.from('profiles').upsert(updates);
      if (profileError) throw profileError;

      // 2. Update Password if provided
      if (newPassword) {
        if (newPassword.length < 8) {
          throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
        }

        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwdError) throw pwdError;

        setCurrentPassword('');
        setNewPassword('');
        toast.success('Senha atualizada com sucesso!');
      }

      await refreshProfile();
      toast.success('Perfil atualizado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
      console.error('Error updating profile:', error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteAccount() {
    try {
      setIsDeleting(true);
      const { error } = await supabase.rpc('delete_user');

      if (!error) {
        toast.success('Sua conta foi excluída permanentemente.');
        await signOut();
        navigate('/');
      }
    } catch (error: any) {
      toast.error('Erro ao excluir conta. Tente novamente mais tarde.');
      console.error('Error deleting account:', error.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0)
        throw new Error('Selecione uma imagem.');

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(publicUrl);

      // Update profile immediately with new avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);
      if (updateError) throw updateError;

      await refreshProfile();
      toast.success('Foto atualizada!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  }

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // --- Mobile Components ---
  const MobileMenuItem = ({ icon: Icon, label, value, onClick, danger }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 bg-white dark:bg-[#161629] active:bg-gray-50 dark:active:bg-white/5 transition-colors first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-100 dark:border-white/5 last:border-0",
        danger && "text-red-500"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400", danger && "bg-red-50 dark:bg-red-500/10 text-red-500")}>
          <Icon size={18} />
        </div>
        <span className="text-[14px] font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs text-gray-400 font-medium">{value}</span>}
        <ChevronRight size={14} className="text-gray-300" />
      </div>
    </button>
  );

  const MobileHeader = ({ title, onBack }: { title: string; onBack?: () => void }) => (
    <header className="px-6 pt-12 pb-6 flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="p-2 -ml-2 text-gray-900 dark:text-white">
          <ArrowLeft size={24} />
        </button>
      )}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
    </header>
  );

  const MobileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="px-6 mb-8">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1 opacity-70">
        {title}
      </div>
      <div className="bg-white dark:bg-[#161629] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <PageTransition className="min-h-screen bg-[#f8f9fc] dark:bg-[#0c0c1d] pb-32">
        {view === 'main' && (
          <div className="flex flex-col">
            <MobileHeader title="Conta" />

            {/* Profile Info */}
            <div className="px-6 flex flex-col items-center mb-10 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl shadow-blue-500/20 border-4 border-white dark:border-[#161629]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  fullName.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{fullName || 'Davy Camargo'}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user?.email}</p>
              <div className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-500/20 flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                CONTA VERIFICADA
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 grid grid-cols-3 gap-3 mb-10">
              <div className="bg-white dark:bg-[#161629] p-4 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="text-gray-900 dark:text-white font-bold text-sm">R$ {Math.round(summary.caixinhaBalance / 1000)}k</div>
                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1">POUPADO</div>
              </div>
              <div className="bg-white dark:bg-[#161629] p-4 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="text-gray-900 dark:text-white font-bold text-sm">{transactions.length}</div>
                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1">TRANSAÇÕES</div>
              </div>
              <div className="bg-white dark:bg-[#161629] p-4 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="text-gray-900 dark:text-white font-bold text-sm">{categories.length}</div>
                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1">CATEGORIAS</div>
              </div>
            </div>

            {/* Navigation Groups */}
            <MobileSection title="Preferências">
              <MobileMenuItem icon={User} label="Editar perfil" onClick={() => setView('edit')} />
              <MobileMenuItem icon={Bell} label="Notificações" value="Ativadas" onClick={() => setView('notifications')} />
              <MobileMenuItem icon={Palette} label="Aparência" value={theme === 'dark' ? 'Escuro' : theme === 'light' ? 'Claro' : 'Sistema'} onClick={() => setView('appearance')} />
              <MobileMenuItem icon={Globe} label="Idioma" value="Português (BR)" onClick={() => setView('settings')} />
              <MobileMenuItem icon={DollarSign} label="Moeda" value="BRL" onClick={() => setView('settings')} />
            </MobileSection>

            <MobileSection title="Segurança & Privacidade">
              <MobileMenuItem icon={ShieldCheck} label="Senha & biometria" onClick={() => setView('security')} />
            </MobileSection>

            <MobileSection title="Dados">
              <MobileMenuItem icon={Database} label="Importar CSV" onClick={() => navigate('/dashboard')} />
              <MobileMenuItem icon={HardDrive} label="Exportar dados" onClick={() => {}} />
              <MobileMenuItem icon={Trash2} label="Limpar cache" value="2.4 MB" onClick={() => {}} />
            </MobileSection>

            <MobileSection title="Sobre">
              <MobileMenuItem icon={Info} label="Sobre o app" onClick={() => setView('about')} />
              <MobileMenuItem icon={LogOut} label="Sair da conta" danger onClick={() => signOut()} />
            </MobileSection>
          </div>
        )}

        {view === 'edit' && (
          <div className="flex flex-col">
            <MobileHeader title="Editar perfil" onBack={() => setView('main')} />
            <div className="px-6 space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden border-4 border-white dark:border-[#161629]">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                        {fullName.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                    <Camera size={16} />
                    <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white dark:bg-[#161629] border border-gray-100 dark:border-white/5 rounded-2xl py-4 px-5 text-[15px] outline-none focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">E-mail (Não editável)</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-gray-100 dark:bg-[#161629]/50 border border-gray-100 dark:border-white/5 rounded-2xl py-4 px-5 text-[15px] text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                onClick={updateProfile}
                disabled={isSaving || uploading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-70 mt-8"
              >
                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                Salvar alterações
              </button>
            </div>
          </div>
        )}

        {view === 'security' && (
          <div className="flex flex-col">
            <MobileHeader title="Segurança" onBack={() => setView('main')} />
            <div className="px-6 space-y-8">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex gap-4">
                <ShieldCheck size={24} className="text-green-500 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">Sua conta está protegida</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Senha forte e autenticação ativa.</p>
                </div>
              </div>

              <MobileSection title="Autenticação">
                <MobileMenuItem icon={Lock} label="Alterar senha" value="Últ. alt. 42 dias" onClick={() => {}} />
                <div className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400"><History size={18} /></div>
                     <span className="text-[14px] font-medium">Autenticação 2 fatores</span>
                   </div>
                   <input type="checkbox" className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-green-500 transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all checked:after:left-5 cursor-pointer" />
                </div>
                <div className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400"><Smartphone size={18} /></div>
                     <span className="text-[14px] font-medium">Face ID</span>
                   </div>
                   <input type="checkbox" defaultChecked className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-green-500 transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all checked:after:left-5 cursor-pointer" />
                </div>
                <MobileMenuItem icon={Clock} label="Bloqueio automático" value="1 min" onClick={() => {}} />
              </MobileSection>

              <MobileSection title="Privacidade">
                 <div className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400"><EyeOff size={18} /></div>
                     <span className="text-[14px] font-medium">Ocultar saldo ao abrir</span>
                   </div>
                   <input type="checkbox" className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-green-500 transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all checked:after:left-5 cursor-pointer" />
                </div>
                <div className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400"><History size={18} /></div>
                     <span className="text-[14px] font-medium">Ocultar valores em screenshots</span>
                   </div>
                   <input type="checkbox" defaultChecked className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-green-500 transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all checked:after:left-5 cursor-pointer" />
                </div>
              </MobileSection>

              <MobileSection title="Sessões Ativas">
                <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <Smartphone size={24} className="text-gray-400" />
                    <div>
                      <div className="text-xs font-bold">iPhone 15 — Este dispositivo</div>
                      <div className="text-[10px] text-green-500 font-bold uppercase tracking-wider">AGORA</div>
                    </div>
                  </div>
                </div>
                <button className="w-full p-4 text-center text-sm font-bold text-red-500 active:bg-red-50 dark:active:bg-red-500/5 transition-colors">
                   Encerrar todas as sessões
                </button>
              </MobileSection>
            </div>
          </div>
        )}

        {view === 'appearance' && (
          <div className="flex flex-col">
            <MobileHeader title="Aparência" onBack={() => setView('main')} />
            <div className="px-6 space-y-8">
              <MobileSection title="Tema">
                <div className="p-4 grid grid-cols-3 gap-3">
                  <button onClick={() => setTheme('light')} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl border transition-all", theme === 'light' ? "border-blue-500 bg-blue-500/5" : "border-gray-100 dark:border-white/5")}>
                    <Sun size={20} className={theme === 'light' ? "text-blue-500" : "text-gray-400"} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Claro</span>
                  </button>
                  <button onClick={() => setTheme('dark')} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl border transition-all", theme === 'dark' ? "border-blue-500 bg-blue-500/5" : "border-gray-100 dark:border-white/5")}>
                    <Moon size={20} className={theme === 'dark' ? "text-blue-500" : "text-gray-400"} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Escuro</span>
                  </button>
                  <button onClick={() => setTheme('system')} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl border transition-all", theme === 'system' ? "border-blue-500 bg-blue-500/5" : "border-gray-100 dark:border-white/5")}>
                    <Monitor size={20} className={theme === 'system' ? "text-blue-500" : "text-gray-400"} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Sistema</span>
                  </button>
                </div>
              </MobileSection>

              <MobileSection title="Cor de destaque">
                <div className="p-4 flex gap-4 overflow-x-auto no-scrollbar">
                  {['#6366f1', '#a855f7', '#0ea5e9', '#10b981', '#f59e0b'].map(color => (
                    <button key={color} className="w-10 h-10 rounded-full shrink-0 border-2 border-white dark:border-[#161629] shadow-sm" style={{ background: color }} />
                  ))}
                </div>
              </MobileSection>

              <MobileSection title="Tipografia">
                <MobileMenuItem icon={Palette} label="Tamanho" value="Padrão" onClick={() => {}} />
                <MobileMenuItem icon={Palette} label="Peso das fontes" value="Regular" onClick={() => {}} />
              </MobileSection>

              <MobileSection title="Acessibilidade">
                <div className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400"><Eye size={18} /></div>
                     <span className="text-[14px] font-medium">Alto contraste</span>
                   </div>
                   <input type="checkbox" className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-green-500 transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all checked:after:left-5 cursor-pointer" />
                </div>
              </MobileSection>
            </div>
          </div>
        )}

        {view === 'about' && (
          <div className="flex flex-col">
            <MobileHeader title="Sobre" onBack={() => setView('main')} />
            <div className="px-6 flex flex-col items-center">
              <img src="/logo-expense-tracker.png" alt="Logo" className="w-20 h-20 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Tracker</h2>
              <p className="text-sm text-gray-400 font-mono mt-1 mb-6">VERSÃO 1.2.0 · BUILD 204</p>
              
              <div className="p-6 bg-white dark:bg-[#161629] rounded-[32px] border border-gray-100 dark:border-white/5 text-center mb-10 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Aplicativo open source para gestão de finanças pessoais. Feito com React, TypeScript e Supabase.
                </p>
                <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-4">
                  MADE BY @DAVYDFONTOURAC
                </div>
              </div>

              <div className="w-full space-y-3">
                <MobileMenuItem icon={Github} label="GitHub" onClick={() => window.open('https://github.com/davydfontourac', '_blank', 'noopener,noreferrer')} />
                <MobileMenuItem icon={History} label="Changelog" onClick={() => {}} />
                <MobileMenuItem icon={Milestone} label="Roadmap" onClick={() => {}} />
                <MobileMenuItem icon={Bug} label="Reportar um bug" onClick={() => {}} />
              </div>
            </div>
          </div>
        )}

        {view === 'notifications' && (
          <div className="flex flex-col">
            <MobileHeader title="Notificações" onBack={() => setView('main')} />
            <div className="px-6 space-y-8">
              <MobileSection title="Push">
                <div className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400"><Bell size={18} /></div>
                     <span className="text-[14px] font-medium">Todas as notificações</span>
                   </div>
                   <input type="checkbox" defaultChecked className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-green-500 transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all checked:after:left-5 cursor-pointer" />
                </div>
                <div className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400"><BarChart size={18} /></div>
                     <span className="text-[14px] font-medium">Alertas de orçamento</span>
                   </div>
                   <input type="checkbox" defaultChecked className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-green-500 transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all checked:after:left-5 cursor-pointer" />
                </div>
              </MobileSection>

              <MobileSection title="E-mail">
                <div className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400"><Globe size={18} /></div>
                     <span className="text-[14px] font-medium">Resumo mensal</span>
                   </div>
                   <input type="checkbox" defaultChecked className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-green-500 transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all checked:after:left-5 cursor-pointer" />
                </div>
              </MobileSection>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="flex flex-col">
            <MobileHeader title="Configurações" onBack={() => setView('main')} />
            <div className="px-6 space-y-8">
              <MobileSection title="Geral">
                <MobileMenuItem icon={Globe} label="Idioma" value="Português (BR)" onClick={() => {}} />
                <MobileMenuItem icon={DollarSign} label="Moeda principal" value="BRL" onClick={() => {}} />
                <MobileMenuItem icon={Clock} label="Fuso horário" value="GMT-3" onClick={() => {}} />
                <MobileMenuItem icon={Calendar} label="Início da semana" value="Segunda" onClick={() => {}} />
              </MobileSection>

              <MobileSection title="Comportamento">
                <div className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400"><History size={18} /></div>
                     <span className="text-[14px] font-medium">Sempre começar no Dashboard</span>
                   </div>
                   <input type="checkbox" defaultChecked className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-green-500 transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all checked:after:left-5 cursor-pointer" />
                </div>
              </MobileSection>
            </div>
          </div>
        )}
      </PageTransition>
    );
  }

  return (
    <PageTransition className="A-main h-screen overflow-y-auto w-full">
      <div className="max-w-6xl">
        {/* Top Header */}
        <div className="A-top">
          <div>
            <h1 className="text-gray-900 dark:text-white font-bold">Meu Perfil</h1>
            <div className="sub">Gerencie suas informações pessoais e preferências</div>
          </div>
          <button
            onClick={updateProfile}
            disabled={isSaving || uploading}
            className="px-6 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-70 text-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar alterações
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Left Card: Avatar & Status */}
          <div className="A-card flex flex-col items-center py-10 h-fit text-center">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-[6px] border-white dark:border-gray-800 shadow-2xl bg-gradient-to-br from-[#0ea5e9] to-[#22d3ee] flex items-center justify-center text-white text-5xl font-bold">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  fullName.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-1 right-1 w-10 h-10 bg-[#0ea5e9] text-white rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl cursor-pointer hover:bg-[#0284c7] transition-all active:scale-90"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={18} />}
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadAvatar}
                  disabled={uploading}
                />
              </label>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {fullName || 'Davy Camargo'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">{user?.email}</p>

            <div className="px-4 py-1.5 bg-[#f0fdf4] dark:bg-green-900/10 text-[#16a34a] dark:text-green-500 text-[10px] font-bold uppercase tracking-[2px] rounded-full border border-[#dcfce7] dark:border-green-800/30 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
              ATIVA E VERIFICADA
            </div>
          </div>

          {/* Right Section: Forms */}
          <div className="space-y-6">
            {/* Personal Info */}
            <div className="A-card space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[#0ea5e9] flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">
                    Informações Pessoais
                  </h3>
                </div>
                <div className="text-[10px] font-mono text-gray-400 uppercase">
                  ID: {user?.id.slice(0, 8)}...
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#0ea5e9] transition-all"
                    placeholder="Seu nome"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    E-mail (Não editável)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-5 text-sm text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="A-card space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[#0ea5e9] flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">Segurança</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Senha Atual
                  </label>
                  <PasswordInput
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="**********"
                    className="!bg-gray-50 dark:!bg-gray-800/50 !border-gray-100 dark:!border-gray-700 !rounded-2xl !py-4"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Nova Senha
                  </label>
                  <PasswordInput
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha"
                    helperText="Mínimo 8 caracteres, incluindo letras maiúsculas, números e símbolos."
                    className="!bg-gray-50 dark:!bg-gray-800/50 !border-gray-100 dark:!border-gray-700 !rounded-2xl !py-4"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Smartphone size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      Autenticação em 2 fatores
                    </div>
                    <p className="text-xs text-gray-500">Adicione uma camada extra de proteção</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all">
                  Ativar
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="A-card border-red-100 dark:border-red-900/20 bg-red-50/5 dark:bg-red-900/5 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">
                  Zona de Perigo
                </h3>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed">
                Ao excluir sua conta, todos os seus dados (transações, categorias, caixinhas e
                perfil) serão removidos permanentemente. Esta ação não pode ser desfeita.
              </p>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-6 py-3 border border-red-100 dark:border-red-900/30 text-red-600 font-bold text-sm rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
              >
                <Trash2 size={16} />
                Excluir minha conta
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteAccount}
        title="Tem certeza absoluta?"
        description="Esta ação é irreversível. Todos os seus dados de gastos e categorias serão perdidos para sempre."
        isLoading={isDeleting}
      />
    </PageTransition>
  );
}
