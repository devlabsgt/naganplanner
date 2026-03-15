'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { checkIsJefe } from './core';

export async function responderInvitacionComision(actividad_id: string, aceptada: boolean, motivo?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('act_integrantes')
    .update({ 
      invitación: aceptada, 
      justificación: motivo || null 
    })
    .eq('actividad_id', actividad_id)
    .eq('usuario_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/planificador');
}

export async function removerMiembroComision(actividad_id: string, usuario_id_a_remover: string, motivo: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const isJefe = await checkIsJefe(supabase, user.id);
  const { data: actividad } = await supabase.from('act_actividades').select('created_by').eq('id', actividad_id).single();

  const esAutoGestion = user.id === usuario_id_a_remover;

  if (!isJefe && actividad?.created_by !== user.id && !esAutoGestion) {
    throw new Error('No tienes permisos para dar de baja a otros integrantes.');
  }

  const { error } = await supabase
    .from('act_integrantes')
    .update({ 
      invitación: false, 
      justificación: esAutoGestion ? `Auto-baja: ${motivo}` : motivo 
    })
    .eq('actividad_id', actividad_id)
    .eq('usuario_id', usuario_id_a_remover);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/planificador');
}

export async function sustituirMiembroComision(
  actividad_id: string, 
  usuario_id_actual: string, 
  nuevo_usuario_id: string,
  justificacion: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const isJefe = await checkIsJefe(supabase, user.id);
  const { data: actividad } = await supabase.from('act_actividades').select('created_by').eq('id', actividad_id).single();

  const esAutoGestion = user.id === usuario_id_actual;

  if (!isJefe && actividad?.created_by !== user.id && !esAutoGestion) {
    throw new Error('No tienes permisos para editar esta comisión.');
  }

  const autoAsignacion = user.id === nuevo_usuario_id;

  const { error } = await supabase
    .from('act_integrantes')
    .update({ 
      usuario_id: nuevo_usuario_id,
      invitación: autoAsignacion ? true : null, 
      justificación: null 
    })
    .eq('actividad_id', actividad_id)
    .eq('usuario_id', usuario_id_actual);

  if (error) throw new Error(error.message);

  // --- REGISTRO DE SUSTITUCIÓN ---
  if (justificacion) {
    const { error: errorLog } = await supabase
      .from('act_sustituciones')
      .insert({
        actividad_id,
        usuario_saliente_id: usuario_id_actual,
        usuario_entrante_id: nuevo_usuario_id,
        justificacion,
        creado_por: user.id
      });
      
    if (errorLog) console.error('Error al registrar sustitución:', errorLog);
  }

  revalidatePath('/admin/planificador');
}

export async function actualizarChecklistPlanificador(id: string, items: any[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('act_actividades')
    .update({ checklist: items })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/planificador');
}

export async function obtenerRolesExistentes() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('act_integrantes')
    .select('rol')
    .not('rol', 'is', null)
    .neq('rol', '');

  if (error) {
    console.error('Error al obtener roles:', error);
    return [];
  }

  const rolesUnicos = Array.from(new Set(data.map(item => item.rol).filter(Boolean)));
  
  return rolesUnicos.sort((a, b) => a.localeCompare(b));
}
