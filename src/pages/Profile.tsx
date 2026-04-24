import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Trash2,
  Camera,
  Save,
  Loader2,
  User,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { PasswordInput } from '@/components/PasswordInput';
import ConfirmModal from '@/components/ConfirmModal';
import PageTransition from '@/components/PageTransition';

export default function Profile() {
  const { user, profile, isLoading: isAuthLoading, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
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
      if (!event.target.files || event.target.files.length === 0) throw new Error('Selecione uma imagem.');

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
      
      // Update profile immediately with new avatar
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user?.id);
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
                <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={uploading} />
              </label>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{fullName || 'Davy Camargo'}</h2>
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">Informações Pessoais</h3>
                </div>
                <div className="text-[10px] font-mono text-gray-400 uppercase">ID: {user?.id.slice(0, 8)}...</div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#0ea5e9] transition-all"
                    placeholder="Seu nome"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">E-mail (Não editável)</label>
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
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Senha Atual</label>
                  <PasswordInput
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="**********"
                    className="!bg-gray-50 dark:!bg-gray-800/50 !border-gray-100 dark:!border-gray-700 !rounded-2xl !py-4"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nova Senha</label>
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
                    <div className="text-sm font-bold text-gray-900 dark:text-white">Autenticação em 2 fatores</div>
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">Zona de Perigo</h3>
              </div>
              
              <p className="text-sm text-gray-500 leading-relaxed">
                Ao excluir sua conta, todos os seus dados (transações, categorias, caixinhas e perfil) serão removidos permanentemente. Esta ação não pode ser desfeita.
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
