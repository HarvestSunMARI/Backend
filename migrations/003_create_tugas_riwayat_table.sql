-- Migration: 003_create_tugas_riwayat_table.sql
-- Description: Membuat tabel riwayat perubahan tugas

-- Tabel riwayat perubahan tugas
CREATE TABLE public.tugas_riwayat (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tugas_id UUID REFERENCES public.tugas(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    perubahan TEXT NOT NULL,
    status_sebelum TEXT,
    status_sesudah TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk optimasi query
CREATE INDEX idx_tugas_riwayat_tugas_id ON public.tugas_riwayat(tugas_id);
CREATE INDEX idx_tugas_riwayat_user_id ON public.tugas_riwayat(user_id);
CREATE INDEX idx_tugas_riwayat_created_at ON public.tugas_riwayat(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE public.tugas_riwayat ENABLE ROW LEVEL SECURITY;

-- Tugas riwayat policies
CREATE POLICY "Users can view task history" ON public.tugas_riwayat
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

CREATE POLICY "System can insert task history" ON public.tugas_riwayat
    FOR INSERT WITH CHECK (true);

-- Function untuk update status tugas dan mencatat riwayat
CREATE OR REPLACE FUNCTION update_tugas_status(
    p_tugas_id UUID,
    p_status TEXT,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_status_sebelum TEXT;
BEGIN
    -- Get current status
    SELECT status INTO v_status_sebelum
    FROM public.tugas
    WHERE id = p_tugas_id;
    
    -- Update status
    UPDATE public.tugas
    SET status = p_status, updated_at = NOW()
    WHERE id = p_tugas_id;
    
    -- Record history if status changed
    IF v_status_sebelum != p_status THEN
        INSERT INTO public.tugas_riwayat (tugas_id, user_id, perubahan, status_sebelum, status_sesudah)
        VALUES (p_tugas_id, p_user_id, 
                'Status diubah dari ' || v_status_sebelum || ' menjadi ' || p_status,
                v_status_sebelum, p_status);
    END IF;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 