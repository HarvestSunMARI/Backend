import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function registerUser(name: string, email: string, password: string, role: string, wilayah?: string) {
  const password_hash = await bcrypt.hash(password, 10);
  const { data: authUser, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) throw new Error(authError.message);
  if (!authUser.user) throw new Error('Registrasi gagal: user tidak tersedia');
  
  const userId = authUser.user.id;
  
  // Jika role adalah gapoktan dan wilayah tidak disediakan, set default
  const userWilayah = role === 'gapoktan' ? (wilayah || 'Belum Ditentukan') : null;
  
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

export async function getUserById(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return user;
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
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (userError) throw new Error('Email atau password salah');
  if (!user) throw new Error('Email atau password salah');

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) throw new Error('Email atau password salah');

  return {
    message: 'Login berhasil',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      wilayah: user.wilayah
    }
  };
}