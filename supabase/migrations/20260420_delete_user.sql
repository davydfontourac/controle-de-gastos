-- Migration: RPC para Deletar Usuário
-- Issue: #04

CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void AS $$
BEGIN
  -- Deleta o usuário da tabela auth.users. 
  -- Como idenas tabelas public tem ON DELETE CASCADE referenciando auth.users(id),
  -- isso apagará automaticamente perfis, transações e categorias.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.delete_user() IS 'Permite que um usuário logado delete a própria conta e todos os dados associados.';
