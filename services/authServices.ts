import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function registerUser(name: string, email: string, password: string, role: string, wilayah?: string) {
  const password_hash = await bcrypt.hash(password, 10);
  const { data: authUser, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) throw new Error(authError.message);
  if (!authUser.user) throw new Error('Registrasi gagal: user tidak tersedia');
  
  const userId = authUser.user.id;
  
  // Jika role adalah konsultan_tani dan wilayah tidak disediakan, set default
  const userWilayah = role === 'konsultan_tani' ? (wilayah || 'Belum Ditentukan') : null;
  
  const { error: userError } = await supabase
    .from('users')
    .insert([{ 
      id: userId, 
      name, 
      email, 
      password_hash, 
      role,
      wilayah: userWilayah
    }]);
    
  if (userError) throw new Error(userError.message);
  return { 
    message: 'Registrasi berhasil', 
    user: { id: userId, email, name, role, wilayah: userWilayah } 
  };
}

export async function getAllUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw new Error(error.message);
  return data;
}

export async function getUserById(id: string) {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateUser(id: string, update: any) {
  if (update.password) {
    update.password_hash = await bcrypt.hash(update.password, 10);
    delete update.password;
  }
  const { data, error } = await supabase.from('users').update(update).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteUser(id: string) {
  const { data, error } = await supabase.from('users').delete().eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return { message: 'User deleted', user: data };
}

export async function loginUser(email: string, password: string) {
  // Login ke Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error('Email atau password salah');
  // Ambil data user dari tabel users
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();
  if (userError || !user) throw new Error('User tidak ditemukan di database');
  const { password_hash, ...userData } = user;
  return { user: userData, access_token: data.session.access_token };
}