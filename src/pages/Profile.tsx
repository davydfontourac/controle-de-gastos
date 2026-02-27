import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { 
  Trash2, 
  AlertTriangle,
  User, 
  Mail, 
  Camera, 
  ArrowLeft, 
  Save, 
  Loader2,
  CheckCircle2
} from 'lucide-react';


export default function Profile() {
  const { user, profile, isLoading: isAuthLoading, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Sincroniza campos locais com o perfil global quando carregado
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

      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      await refreshProfile();
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar perfil');
      console.error('Error updating profile:', error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteAccount() {
    try {
      setIsDeleting(true);
      const response = await api.delete('/users');
      
      if (response.status === 200) {
        toast.success('Sua conta foi excluída permanentemente.');
        await signOut();
        navigate('/login');
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

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      await refreshProfile();
      toast.success('Foto carregada com sucesso!');
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error uploading avatar:', error.message);
    } finally {
      setUploading(false);
    }
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Premium */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard" 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900 border-l border-gray-100 pl-4">
                Meu Perfil
              </h1>
            </div>
            <button
              onClick={updateProfile}
              disabled={isSaving || uploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Sessão de Avatar */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-blue-700 transition-colors border-4 border-white active:scale-90 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
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
            <div className="mt-4">
              <h2 className="text-xl font-bold text-gray-900">{fullName || 'Seu Nome'}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </section>

          {/* Dados Pessoais */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Informações Pessoais</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                    placeholder="Como você prefere ser chamado?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1 select-none">
                  E-mail (Não editável)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Informações da Conta (Segurança/Futuro) */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Status da Conta</h4>
                <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">Ativa e Verificada</p>
              </div>
            </div>
            <div className="text-xs text-gray-400 font-medium">
              ID: {user?.id.slice(0, 8)}...
            </div>
          </section>

          {/* Zona de Perigo */}
          <section className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Zona de Perigo</h3>
            </div>

            <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100">
              <p className="text-sm text-red-800 font-medium">
                Ao excluir sua conta, todos os seus dados (transações, categorias e perfil) serão removidos permanentemente. Esta ação não pode ser desfeita.
              </p>
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Excluir Minha Conta
            </button>
          </section>
        </div>
      </main>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Tem certeza absoluta?</h3>
              <p className="text-gray-500 mb-8">
                Esta ação é irreversível. Todos os seus dados de gastos e categorias serão perdidos para sempre.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteAccount}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  <span>Sim, excluir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
