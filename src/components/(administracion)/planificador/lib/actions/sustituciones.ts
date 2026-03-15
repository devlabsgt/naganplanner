'use server'

import { createClient } from '@/utils/supabase/server';

// ============================================================================
// MÓDULO SUSTITUCIONES
// ============================================================================

export async function obtenerRegistroSustituciones() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Traer los registros base
  const { data: sustituciones, error } = await supabase
    .from('act_sustituciones')
    .select(`
      id,
      actividad_id,
      usuario_saliente_id,
      usuario_entrante_id,
      justificacion,
      creado_por,
      created_at,
      act_actividades ( title )
    `)
    .order('created_at', { ascending: false });

  if (error || !sustituciones) {
    console.error('Error cargando sustituciones:', error);
    return [];
  }

  // Extraer todos los IDs únicos de usuarios involucrados
  const usersIds = new Set<string>();
  sustituciones.forEach((s: any) => {
    if (s.usuario_saliente_id) usersIds.add(s.usuario_saliente_id);
    if (s.usuario_entrante_id) usersIds.add(s.usuario_entrante_id);
    if (s.creado_por) usersIds.add(s.creado_por);
  });

  // Obtener perfiles de esos usuarios para mappear nombres
  const { data: perfiles } = await supabase
    .from('profiles')
    .select('id, nombre, avatar_url')
    .in('id', Array.from(usersIds));

  const perfilesMap = new Map((perfiles || []).map((p: any) => [p.id, p]));

  // Formatear la data de retorno
  return sustituciones.map((s: any) => ({
    id: s.id,
    actividad_id: s.actividad_id,
    actividad_titulo: s.act_actividades?.title || 'Actividad Desconocida o Eliminada',
    justificacion: s.justificacion,
    created_at: s.created_at,
    saliente: perfilesMap.get(s.usuario_saliente_id) || { nombre: 'Desconocido' },
    entrante: perfilesMap.get(s.usuario_entrante_id) || { nombre: 'Desconocido' },
    autor: perfilesMap.get(s.creado_por) || { nombre: 'Desconocido' },
  }));
}
