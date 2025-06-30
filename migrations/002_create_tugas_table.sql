-- Migration: 002_create_tugas_table.sql
-- Description: Membuat tabel tugas dengan relasi ke users

-- Tabel tugas
CREATE TABLE public.tugas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    deskripsi TEXT,
    penyuluh_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    konsultan_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    tanggal_dibuat DATE DEFAULT CURRENT_DATE,
    tanggal_mulai DATE,
    deadline DATE NOT NULL,
    status TEXT DEFAULT 'Belum Dikerjakan' CHECK (status IN ('Belum Dikerjakan', 'Sedang Berlangsung', 'Selesai')),
    lampiran_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk optimasi query
CREATE INDEX idx_tugas_penyuluh_id ON public.tugas(penyuluh_id);
CREATE INDEX idx_tugas_konsultan_id ON public.tugas(konsultan_id);
CREATE INDEX idx_tugas_status ON public.tugas(status);
CREATE INDEX idx_tugas_deadline ON public.tugas(deadline);

-- Function untuk update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk auto-update updated_at
CREATE TRIGGER update_tugas_updated_at BEFORE UPDATE ON public.tugas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.tugas ENABLE ROW LEVEL SECURITY;

-- Tugas policies
CREATE POLICY "Penyuluh can view tasks they created" ON public.tugas
    FOR SELECT USING (
        penyuluh_id = auth.uid() OR
        konsultan_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Penyuluh can create tasks" ON public.tugas
    FOR INSERT WITH CHECK (
        penyuluh_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'penyuluh'
        )
    );

CREATE POLICY "Penyuluh can update tasks they created" ON public.tugas
    FOR UPDATE USING (
        penyuluh_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Penyuluh can delete tasks they created" ON public.tugas
    FOR DELETE USING (
        penyuluh_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Konsultan can update task status
CREATE POLICY "Konsultan can update task status" ON public.tugas
    FOR UPDATE USING (
        konsultan_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'konsultan_tani'
        )
    );

-- Function untuk mendapatkan daftar konsultan
CREATE OR REPLACE FUNCTION get_konsultan_list()
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.name, u.email
    FROM public.users u
    WHERE u.role = 'konsultan_tani'
    ORDER BY u.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function untuk mendapatkan tugas dengan detail
CREATE OR REPLACE FUNCTION get_tugas_with_details(tugas_id UUID)
RETURNS TABLE (
    id UUID,
    judul TEXT,
    deskripsi TEXT,
    penyuluh_id UUID,
    penyuluh_nama TEXT,
    konsultan_id UUID,
    konsultan_nama TEXT,
    tanggal_dibuat DATE,
    tanggal_mulai DATE,
    deadline DATE,
    status TEXT,
    lampiran_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.judul,
        t.deskripsi,
        t.penyuluh_id,
        p.name as penyuluh_nama,
        t.konsultan_id,
        k.name as konsultan_nama,
        t.tanggal_dibuat,
        t.tanggal_mulai,
        t.deadline,
        t.status,
        t.lampiran_url,
        t.created_at,
        t.updated_at
    FROM public.tugas t
    JOIN public.users p ON t.penyuluh_id = p.id
    JOIN public.users k ON t.konsultan_id = k.id
    WHERE t.id = tugas_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 