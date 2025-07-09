import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

function getSupabaseWithToken(token: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  // Untuk supabase-js v2, gunakan session pada setiap request
  return supabase;
}

export async function createTugas(data: any, token: string) {
  const supabase = getSupabaseWithToken(token);
  const { data: result, error } = await supabase
    .from('tugas')
    .insert([data], {  
      // @ts-ignore
      headers: { Authorization: `Bearer ${token}` }
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return result;
}

export async function getAllTugas(token: string) {
  const supabase = getSupabaseWithToken(token);
  const { data, error } = await supabase
    .from('tugas')
    .select('*', {  
      // @ts-ignore
      headers: { Authorization: `Bearer ${token}` }
    });
  if (error) throw new Error(error.message);
  return data;
}

export async function getTugasById(id: string, token: string) {
  const supabase = getSupabaseWithToken(token);
  const { data, error } = await supabase
    .from('tugas')
    .select('*', {  
      // @ts-ignore
      headers: { Authorization: `Bearer ${token}` }
    })
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateTugas(id: string, update: any, token: string) {
  const supabase = getSupabaseWithToken(token);
  const { data, error } = await supabase
    .from('tugas')
    .update(update, {  
      // @ts-ignore
      headers: { Authorization: `Bearer ${token}` }
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTugas(id: string, token: string) {
  const supabase = getSupabaseWithToken(token);
  const { data, error } = await supabase
    .from('tugas')
    .delete({  
      // @ts-ignore
      headers: { Authorization: `Bearer ${token}` }
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return { message: 'Tugas deleted', tugas: data };
} 