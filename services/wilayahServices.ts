import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// Interface untuk data wilayah penyuluh
export interface WilayahPenyuluhData {
  penyuluh_id: string;
  wilayah: string;
}

// Dapatkan wilayah yang dibawahi penyuluh
export async function getWilayahPenyuluh(penyuluhId: string) {
  const { data, error } = await supabase
    .from('wilayah_penyuluh')
    .select('id, wilayah, created_at')
    .eq('penyuluh_id', penyuluhId)
    .order('wilayah');

  if (error) throw new Error(error.message);
  return data;
}

// Tambah wilayah untuk penyuluh
export async function addWilayahPenyuluh(wilayahData: WilayahPenyuluhData) {
  const { data, error } = await supabase
    .from('wilayah_penyuluh')
    .insert([wilayahData])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Hapus wilayah dari penyuluh
export async function removeWilayahPenyuluh(penyuluhId: string, wilayah: string) {
  const { error } = await supabase
    .from('wilayah_penyuluh')
    .delete()
    .eq('penyuluh_id', penyuluhId)
    .eq('wilayah', wilayah);

  if (error) throw new Error(error.message);
  return { message: 'Wilayah berhasil dihapus' };
}

// Dapatkan konsultan berdasarkan wilayah
export async function getKonsultanByWilayah(wilayah: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, wilayah')
    .eq('role', 'konsultan_tani')
    .eq('wilayah', wilayah)
    .order('name');

  if (error) throw new Error(error.message);
  return data;
}

// Dapatkan penyuluh berdasarkan wilayah
export async function getPenyuluhByWilayah(wilayah: string) {
  const { data, error } = await supabase
    .from('wilayah_penyuluh')
    .select(`
      penyuluh_id,
      penyuluh:users!penyuluh_id(id, name, email)
    `)
    .eq('wilayah', wilayah);

  if (error) throw new Error(error.message);
  return data.map(item => ({
    penyuluh_id: item.penyuluh_id,
    penyuluh: item.penyuluh
  }));
} 