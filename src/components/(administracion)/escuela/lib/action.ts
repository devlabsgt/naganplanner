'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { aulaFormSchema, AulaForm } from './zod';

// --- MÓDULO ESCUELA: ACCIONES DEL SERVIDOR ---

/**
 * Obtiene todas las aulas registradas (o filtradas por catedrático si no es admin)
 */
export async function obtenerDatosEscuela() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Obtener Perfiles para los SELECTS y para mapeo
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nombre, avatar_url, activo, rol');

  const perfilesMap = new Map((profiles || []).map((p: any) => [p.id, p]));

  // 2. Obtener Aulas
  let query = supabase
    .from('esc_aulas')
    .select('*')
    .order('created_at', { ascending: false });

  // NOTA: Si quisieras filtrar para que el catedrático solo vea lo suyo:
  // query = query.eq('catedratico_id', user.id);

  const { data: rawAulas, error } = await query;

  if (error) {
    console.error('Error fetching aulas:', error);
    return { aulas: [], usuarios: profiles || [] };
  }

  // 3. Mapear datos para incluir información del catedrático
  const aulas = (rawAulas || []).map((aula: any) => {
    const perfil = perfilesMap.get(aula.catedratico_id);
    return {
      ...aula,
      perfil_catedratico: {
        nombre: perfil?.nombre || 'Desconocido',
        avatar_url: perfil?.avatar_url
      }
    };
  });

  return {
    aulas,
    usuarios: profiles || []
  };
}

/**
 * Guarda o actualiza un aula
 */
export async function guardarAula(data: AulaForm, idEdicion?: string) {
  const parsed = aulaFormSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const payload = {
    nombre: parsed.data.nombre,
    descripcion: parsed.data.descripcion,
    catedratico_id: parsed.data.catedratico_id,
    horario: parsed.data.horario,
    status: parsed.data.status,
    created_by: user.id
  };

  if (idEdicion) {
    const { error } = await supabase
      .from('esc_aulas')
      .update(payload)
      .eq('id', idEdicion);

    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('esc_aulas')
      .insert(payload);

    if (error) throw new Error(error.message);
  }

  revalidatePath('/admin/escuela'); // Ajusta a la ruta real de tu módulo
}

/**
 * Elimina un aula
 */
export async function eliminarAula(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('esc_aulas')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/escuela');
}
