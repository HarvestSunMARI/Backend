-- Migration: 006_update_users_table.sql
-- Description: Memperbaiki struktur tabel users

-- Tambah kolom yang diperlukan
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wilayah TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Tambah index untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_wilayah ON public.users(wilayah);

-- Update comment untuk dokumentasi
COMMENT ON TABLE public.users IS 'Tabel users yang extends auth.users dari Supabase Auth';
COMMENT ON COLUMN public.users.id IS 'UUID yang mereferensi auth.users(id)';
COMMENT ON COLUMN public.users.name IS 'Nama lengkap user';
COMMENT ON COLUMN public.users.email IS 'Email user (unique)';
COMMENT ON COLUMN public.users.role IS 'Role user: konsultan_tani, penyuluh, admin';
COMMENT ON COLUMN public.users.wilayah IS 'Wilayah kerja untuk konsultan/penyuluh';
COMMENT ON COLUMN public.users.phone IS 'Nomor telepon user';
COMMENT ON COLUMN public.users.avatar_url IS 'URL foto profil user'; 