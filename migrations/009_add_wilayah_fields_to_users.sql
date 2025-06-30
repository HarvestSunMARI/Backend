-- Migration: Tambah kolom kabupaten, kecamatan, desa pada tabel users
ALTER TABLE users ADD COLUMN IF NOT EXISTS kabupaten VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS kecamatan VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS desa VARCHAR(100); 