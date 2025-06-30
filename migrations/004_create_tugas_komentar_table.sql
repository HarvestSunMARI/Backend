-- Migration: 004_create_tugas_komentar_table.sql
-- Description: Membuat tabel komentar tugas

-- Tabel komentar tugas
CREATE TABLE public.tugas_komentar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tugas_id UUID REFERENCES public.tugas(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    komentar TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk optimasi query
CREATE INDEX idx_tugas_komentar_tugas_id ON public.tugas_komentar(tugas_id);
CREATE INDEX idx_tugas_komentar_user_id ON public.tugas_komentar(user_id);
CREATE INDEX idx_tugas_komentar_created_at ON public.tugas_komentar(created_at);

-- Trigger untuk auto-update updated_at
CREATE TRIGGER update_tugas_komentar_updated_at BEFORE UPDATE ON public.tugas_komentar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.tugas_komentar ENABLE ROW LEVEL SECURITY;

-- Tugas komentar policies
CREATE POLICY "Users can view task comments" ON public.tugas_komentar
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tugas 
            WHERE id = tugas_id AND (penyuluh_id = auth.uid() OR konsultan_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can create comments on their tasks" ON public.tugas_komentar
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tugas 
            WHERE id = tugas_id AND (penyuluh_id = auth.uid() OR konsultan_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own comments" ON public.tugas_komentar
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON public.tugas_komentar
    FOR DELETE USING (user_id = auth.uid());

-- Function untuk mendapatkan komentar tugas dengan detail user
CREATE OR REPLACE FUNCTION get_tugas_komentar(tugas_id UUID)
RETURNS TABLE (
    id UUID,
    komentar TEXT,
    user_id UUID,
    user_name TEXT,
    user_role TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tk.id,
        tk.komentar,
        tk.user_id,
        u.name as user_name,
        u.role as user_role,
        tk.created_at,
        tk.updated_at
    FROM public.tugas_komentar tk
    JOIN public.users u ON tk.user_id = u.id
    WHERE tk.tugas_id = tugas_id
    ORDER BY tk.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 