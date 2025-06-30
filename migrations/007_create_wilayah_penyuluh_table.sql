-- Migration: Create wilayah_penyuluh table
-- Menghubungkan penyuluh dengan wilayah yang dibawahinya

CREATE TABLE IF NOT EXISTS wilayah_penyuluh (
  id SERIAL PRIMARY KEY,
  penyuluh_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wilayah VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(penyuluh_id, wilayah)
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_wilayah_penyuluh_penyuluh_id ON wilayah_penyuluh(penyuluh_id);
CREATE INDEX IF NOT EXISTS idx_wilayah_penyuluh_wilayah ON wilayah_penyuluh(wilayah);

-- RLS Policies
ALTER TABLE wilayah_penyuluh ENABLE ROW LEVEL SECURITY;

-- Penyuluh hanya bisa melihat wilayah yang dibawahinya
CREATE POLICY "Penyuluh can view their supervised areas" ON wilayah_penyuluh
  FOR SELECT USING (penyuluh_id = auth.uid());

-- Penyuluh bisa menambah wilayah yang dibawahinya
CREATE POLICY "Penyuluh can insert their supervised areas" ON wilayah_penyuluh
  FOR INSERT WITH CHECK (penyuluh_id = auth.uid());

-- Penyuluh bisa update wilayah yang dibawahinya
CREATE POLICY "Penyuluh can update their supervised areas" ON wilayah_penyuluh
  FOR UPDATE USING (penyuluh_id = auth.uid());

-- Penyuluh bisa hapus wilayah yang dibawahinya
CREATE POLICY "Penyuluh can delete their supervised areas" ON wilayah_penyuluh
  FOR DELETE USING (penyuluh_id = auth.uid());

-- Admin bisa akses semua
CREATE POLICY "Admin can access all wilayah_penyuluh" ON wilayah_penyuluh
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  ); 