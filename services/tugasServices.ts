import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// Interface untuk data tugas
export interface TugasData {
  judul: string;
  deskripsi?: string;
  jenis: string;
  gapoktan_id: string;
  tanggal_mulai?: string;
  deadline: string;
  lampiran_url?: string;
}

export interface TugasWithDetails {
  id: string;
  judul: string;
  deskripsi?: string;
  penyuluh_id: string;
  penyuluh_nama: string;
  gapoktan_id: string;
  gapoktan_nama: string;
  gapoktan_wilayah?: string;
  tanggal_dibuat: string;
  tanggal_mulai?: string;
  deadline: string;
  status: string;
  lampiran_url?: string;
  created_at: string;
  updated_at: string;
  jenis: string;
}

export interface GapoktanData {
  id: string;
  nama_gapoktan: string;
  desa_binaan: string[];
  ketua_gapoktan_id: string;
  ketua: {
    id: string;
    name: string;
    email: string;
  };
  jumlah_anggota: number;
}

// Dapatkan daftar gapoktan untuk dropdown (berdasarkan wilayah penyuluh)
export async function getGapoktanList(penyuluhId: string) {
  const { data: penyuluh, error: penyuluhError } = await supabase
    .from('users')
    .select('wilayah')
    .eq('id', penyuluhId)
    .single();

  if (penyuluhError) throw new Error(penyuluhError.message);
  if (!penyuluh || !penyuluh.wilayah) return [];

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, wilayah')
    .eq('role', 'gapoktan')
    .eq('wilayah', penyuluh.wilayah)
    .order('name');

  if (error) throw new Error(error.message);
  return data;
}

// Buat tugas baru (oleh penyuluh)
export async function createTugas(tugasData: TugasData, penyuluhId: string) {
  const tugas = {
    ...tugasData,
    penyuluh_id: penyuluhId,
    tanggal_dibuat: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    status: 'Belum Dikerjakan'
  };

  const { data, error } = await supabase
    .from('tugas')
    .insert([tugas])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Dapatkan semua tugas untuk penyuluh (yang dibuatnya)
export async function getTugasByPenyuluh(penyuluhId: string) {
  const { data, error } = await supabase
    .from('tugas')
    .select(`
      *,
      penyuluh:users!penyuluh_id(id, name, email),
      gapoktan:users!gapoktan_id(id, name, email, wilayah)
    `)
    .eq('penyuluh_id', penyuluhId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  
  // Transform data untuk format yang diinginkan
  return data.map(tugas => ({
    id: tugas.id,
    judul: tugas.judul,
    deskripsi: tugas.deskripsi,
    penyuluh_id: tugas.penyuluh_id,
    penyuluh_nama: tugas.penyuluh.name,
    gapoktan_id: tugas.gapoktan_id,
    gapoktan_nama: tugas.gapoktan.name,
    gapoktan_wilayah: tugas.gapoktan.wilayah,
    tanggal_dibuat: tugas.tanggal_dibuat,
    tanggal_mulai: tugas.tanggal_mulai,
    deadline: tugas.deadline,
    status: tugas.status,
    lampiran_url: tugas.lampiran_url,
    created_at: tugas.created_at,
    updated_at: tugas.updated_at,
    jenis: tugas.jenis
  }));
}

// Dapatkan semua tugas untuk gapoktan (yang ditugaskan padanya)
export async function getTugasByGapoktan(gapoktanId: string) {
  const { data, error } = await supabase
    .from('tugas')
    .select(`
      *,
      penyuluh:users!penyuluh_id(id, name, email),
      gapoktan:users!gapoktan_id(id, name, email, wilayah)
    `)
    .eq('gapoktan_id', gapoktanId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  
  // Transform data untuk format yang diinginkan
  return data.map(tugas => ({
    id: tugas.id,
    judul: tugas.judul,
    deskripsi: tugas.deskripsi,
    penyuluh_id: tugas.penyuluh_id,
    penyuluh_nama: tugas.penyuluh.name,
    gapoktan_id: tugas.gapoktan_id,
    gapoktan_nama: tugas.gapoktan.name,
    gapoktan_wilayah: tugas.gapoktan.wilayah,
    tanggal_dibuat: tugas.tanggal_dibuat,
    tanggal_mulai: tugas.tanggal_mulai,
    deadline: tugas.deadline,
    status: tugas.status,
    lampiran_url: tugas.lampiran_url,
    created_at: tugas.created_at,
    updated_at: tugas.updated_at,
    jenis: tugas.jenis
  }));
}

// Dapatkan detail tugas berdasarkan ID
export async function getTugasById(tugasId: string) {
  const { data, error } = await supabase
    .from('tugas')
    .select(`
      *,
      penyuluh:users!penyuluh_id(id, name, email),
      gapoktan:users!gapoktan_id(id, name, email, wilayah)
    `)
    .eq('id', tugasId)
    .single();

  if (error) throw new Error(error.message);
  
  return {
    id: data.id,
    judul: data.judul,
    deskripsi: data.deskripsi,
    penyuluh_id: data.penyuluh_id,
    penyuluh_nama: data.penyuluh.name,
    gapoktan_id: data.gapoktan_id,
    gapoktan_nama: data.gapoktan.name,
    gapoktan_wilayah: data.gapoktan.wilayah,
    tanggal_dibuat: data.tanggal_dibuat,
    tanggal_mulai: data.tanggal_mulai,
    deadline: data.deadline,
    status: data.status,
    lampiran_url: data.lampiran_url,
    created_at: data.created_at,
    updated_at: data.updated_at,
    jenis: data.jenis
  };
}

// Update tugas (oleh penyuluh yang membuatnya)
export async function updateTugas(tugasId: string, updateData: Partial<TugasData>, penyuluhId: string) {
  // Verifikasi bahwa penyuluh adalah pembuat tugas
  const { data: existingTugas, error: checkError } = await supabase
    .from('tugas')
    .select('penyuluh_id')
    .eq('id', tugasId)
    .single();

  if (checkError) throw new Error('Tugas tidak ditemukan');
  if (existingTugas.penyuluh_id !== penyuluhId) {
    throw new Error('Anda tidak memiliki izin untuk mengedit tugas ini');
  }

  const { data, error } = await supabase
    .from('tugas')
    .update(updateData)
    .eq('id', tugasId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Update status tugas (oleh gapoktan)
export async function updateTugasStatus(tugasId: string, status: string, gapoktanId: string) {
  // Verifikasi bahwa gapoktan adalah penerima tugas
  const { data: existingTugas, error: checkError } = await supabase
    .from('tugas')
    .select('gapoktan_id')
    .eq('id', tugasId)
    .single();

  if (checkError) throw new Error('Tugas tidak ditemukan');
  if (existingTugas.gapoktan_id !== gapoktanId) {
    throw new Error('Anda tidak memiliki izin untuk mengupdate status tugas ini');
  }

  const { data, error } = await supabase
    .from('tugas')
    .update({ status })
    .eq('id', tugasId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Hapus tugas (oleh penyuluh yang membuatnya)
export async function deleteTugas(tugasId: string, penyuluhId: string) {
  // Verifikasi bahwa penyuluh adalah pembuat tugas
  const { data: existingTugas, error: checkError } = await supabase
    .from('tugas')
    .select('penyuluh_id')
    .eq('id', tugasId)
    .single();

  if (checkError) throw new Error('Tugas tidak ditemukan');
  if (existingTugas.penyuluh_id !== penyuluhId) {
    throw new Error('Anda tidak memiliki izin untuk menghapus tugas ini');
  }

  const { error } = await supabase
    .from('tugas')
    .delete()
    .eq('id', tugasId);

  if (error) throw new Error(error.message);
  return { message: 'Tugas berhasil dihapus' };
}

// Dapatkan riwayat tugas
export async function getTugasRiwayat(tugasId: string) {
  const { data, error } = await supabase
    .from('tugas_riwayat')
    .select('*')
    .eq('tugas_id', tugasId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// Dapatkan komentar tugas
export async function getTugasKomentar(tugasId: string) {
  const { data, error } = await supabase
    .from('tugas_komentar')
    .select(`
      *,
      user:users(id, name, email)
    `)
    .eq('tugas_id', tugasId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

// Tambah komentar tugas
export async function addTugasKomentar(tugasId: string, komentar: string, userId: string) {
  const { data, error } = await supabase
    .from('tugas_komentar')
    .insert([{
      tugas_id: tugasId,
      user_id: userId,
      komentar
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
} 