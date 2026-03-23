'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { checkIsJefe } from './core';

// Helper local para instanciar el cliente con privilegios
function getAdminClient() {
  return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function crearAlabanza(data: {
  nombre: string;
  tipo: string;
  tonalidad?: string;
  bpm?: number;
  compas?: string;
  observaciones?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const supabaseAdmin = getAdminClient();

  const { error } = await supabaseAdmin
    .from('act_banco_alabanzas')
    .insert({
      nombre: data.nombre.trim(),
      tipo: data.tipo,
      tonalidad: data.tonalidad || null, // Se cambia a minúsculas
      bpm: data.bpm || null,
      compas: data.compas || null,
      observaciones: data.observaciones?.trim() || null
    });

  if (error) {
    console.error("Error al crear alabanza:", error);
    throw new Error(error.message);
  }
  
  revalidatePath('/kore/planificador');
}

export async function actualizarAlabanza(id: string, data: Partial<{
  nombre: string;
  tipo: string;
  tonalidad?: string;
  bpm?: number;
  compas?: string;
  observaciones?: string;
}>) {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin
    .from('act_banco_alabanzas')
    .update({
      nombre: data.nombre?.trim(),
      tipo: data.tipo,
      tonalidad: data.tonalidad || null,
      bpm: data.bpm || null,
      compas: data.compas || null,
      observaciones: data.observaciones?.trim() || null
    })
    .eq('id', id);

  if (error) {
    console.error("Error al actualizar:", error);
    throw new Error(error.message);
  }

  revalidatePath('/kore/planificador');
}

export async function eliminarAlabanza(id: string) {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin
    .from('act_banco_alabanzas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error al eliminar:", error);
    throw new Error(error.message);
  }

  revalidatePath('/kore/planificador');
}

export async function obtenerBancoAlabanzas() {
  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin
    .from('act_banco_alabanzas')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error fetching banco alabanzas:', error);
    return [];
  }

  return data;
}

// ============================================================================
// GESTIÓN DE ALABANZAS EN ACTIVIDADES
// ============================================================================

export async function sincronizarRepertorioActividad(actividad_id: string, alabanzas_ids: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const isJefe = await checkIsJefe(supabase, user.id);
  
  const { data: actividad } = await supabase
    .from('act_actividades')
    .select('created_by')
    .eq('id', actividad_id)
    .single();

  if (!actividad) throw new Error('Actividad no encontrada');
  
  if (!isJefe && actividad.created_by !== user.id) {
    throw new Error('No tienes permisos suficientes para modificar el repertorio.');
  }

  // 1. Eliminar todo el repertorio anterior de esta actividad
  const { error: deleteError } = await supabase
    .from('act_actividades_alabanzas')
    .delete()
    .eq('actividad_id', actividad_id);

  if (deleteError) throw new Error(deleteError.message);

  // 2. Insertar el nuevo repertorio (si hay)
  if (alabanzas_ids.length > 0) {
    const payload = alabanzas_ids.map(id => ({
      actividad_id,
      alabanza_id: id
    }));
    
    const { error: insertError } = await supabase
      .from('act_actividades_alabanzas')
      .insert(payload);

    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath('/kore/planificador');
}

export async function asignarDirectorCanto(actividad_id: string, alabanza_id: string, director_id: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const payload = director_id ? { id_director: director_id } : { id_director: null };

  const { error } = await supabase
    .from('act_actividades_alabanzas')
    .update(payload)
    .eq('actividad_id', actividad_id)
    .eq('alabanza_id', alabanza_id);

  if (error) {
    console.error("Error asignando director:", error);
    throw new Error(error.message);
  }

  revalidatePath('/kore/planificador');
}
