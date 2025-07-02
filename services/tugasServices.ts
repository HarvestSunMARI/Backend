import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// Interface untuk data tugas
export interface TugasData {
  judul: string;
  deskripsi?: string;
  jenis: string;
  konsultan_id: string;
  tanggal_mulai?: string;
  deadline: string;
  lampiran_url?: string;
  jenis: string;
}

export interface TugasWithDetails {
  id: string;
  judul: string;
  deskripsi?: string;
  penyuluh_id: string;
  penyuluh_nama: string;
  konsultan_id: string;
  konsultan_nama: string;
  konsultan_wilayah?: string;
  tanggal_dibuat: string;
  tanggal_mulai?: string;
  deadline: string;
  status: string;
  lampiran_url?: string;
  created_at: string;
  updated_at: string;
  jenis: string;
}

// Dapatkan daftar konsultan untuk dropdown (berdasarkan wilayah penyuluh)
export async function getKonsultanList(penyuluhId: string) {
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
    .eq('role', 'konsultan_tani')
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
      konsultan:users!konsultan_id(id, name, email, wilayah)
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
    konsultan_id: tugas.konsultan_id,
    konsultan_nama: tugas.konsultan.name,
    konsultan_wilayah: tugas.konsultan.wilayah,
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

// Dapatkan semua tugas untuk konsultan (yang ditugaskan padanya)
export async function getTugasByKonsultan(konsultanId: string) {
  const { data, error } = await supabase
    .from('tugas')
    .select(`
      *,
      penyuluh:users!penyuluh_id(id, name, email),
      konsultan:users!konsultan_id(id, name, email, wilayah)
    `)
    .eq('konsultan_id', konsultanId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  
  // Transform data untuk format yang diinginkan
  return data.map(tugas => ({
    id: tugas.id,
    judul: tugas.judul,
    deskripsi: tugas.deskripsi,
    penyuluh_id: tugas.penyuluh_id,
    penyuluh_nama: tugas.penyuluh.name,
    konsultan_id: tugas.konsultan_id,
    konsultan_nama: tugas.konsultan.name,
    konsultan_wilayah: tugas.konsultan.wilayah,
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
      konsultan:users!konsultan_id(id, name, email, wilayah)
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
    konsultan_id: data.konsultan_id,
    konsultan_nama: data.konsultan.name,
    konsultan_wilayah: data.konsultan.wilayah,
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

// Update status tugas (oleh konsultan yang ditugaskan)
export async function updateTugasStatus(tugasId: string, status: string, konsultanId: string) {
  // Verifikasi bahwa konsultan adalah yang ditugaskan
  const { data: existingTugas, error: checkError } = await supabase
    .from('tugas')
    .select('konsultan_id, status')
    .eq('id', tugasId)
    .single();

  if (checkError) throw new Error('Tugas tidak ditemukan');
  if (existingTugas.konsultan_id !== konsultanId) {
    throw new Error('Anda tidak memiliki izin untuk mengubah status tugas ini');
  }

  // Gunakan function untuk update status dan catat riwayat
  const { data, error } = await supabase.rpc('update_tugas_status', {
    p_tugas_id: tugasId,
    p_status: status,
    p_user_id: konsultanId
  });

  if (error) throw new Error(error.message);
  return { success: true, message: 'Status tugas berhasil diupdate' };
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
  return { success: true, message: 'Tugas berhasil dihapus' };
}

// Dapatkan riwayat tugas
export async function getTugasRiwayat(tugasId: string) {
  const { data, error } = await supabase
    .from('tugas_riwayat')
    .select(`
      *,
      user:users(id, name, role)
    `)
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
      user:users(id, name, role)
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