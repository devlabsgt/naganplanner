"use server";

import { createClient } from "@/utils/supabase/server";
import { puestoSchema, PuestoFormValues } from "./schemas";
import { revalidatePath } from "next/cache";

// --- CREAR ---
export async function createPuesto(values: PuestoFormValues) {
  const result = puestoSchema.safeParse(values);
  if (!result.success) return { error: "Datos inválidos" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("puesto")
    .insert(result.data)
    .select()
    .single();

  if (error) return { error: error.message };
  
  revalidatePath("/administracion/gestion/departamento");
  return { success: true, data };
}

export async function deletePuesto(id: string) {
  const supabase = await createClient();
  
  const { data: puesto, error: fetchError } = await supabase
    .from("puesto")
    .select("departamento_id, es_jefatura, usuario_id")
    .eq("id", id)
    .single();

  if (fetchError) return { error: "Error al buscar el puesto" };

  if (puesto?.usuario_id) {
    return { error: "No puedes eliminar un puesto ocupado. Desvincula al usuario primero." };
  }

  const { error } = await supabase.from("puesto").delete().eq("id", id);
  if (error) return { error: error.message };

  if (puesto?.es_jefatura) {
    await supabase
      .from("departamento")
      .update({ jefe_id: null })
      .eq("id", puesto.departamento_id);
  }

  revalidatePath("/administracion/gestion/departamento");
  return { success: true };
}

// --- ACTUALIZAR ---
export async function updatePuesto(id: string, values: PuestoFormValues) {
  const result = puestoSchema.safeParse(values);
  if (!result.success) return { error: "Datos inválidos" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("puesto")
    .update(result.data)
    .eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/administracion/gestion/departamento");
  return { success: true };
}

// --- LISTAR DISPONIBLES ---
export async function getUsuariosDisponibles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nombre, rol, email, avatar_url")
    .eq("activo", true)
    .order("nombre", { ascending: true });

  if (error) return { error: error.message };
  return { success: true, data };
}

// --- ASIGNAR USUARIO (¡SINCRONIZACIÓN AUTOMÁTICA!) ---
export async function asignarUsuarioPuesto(userId: string, puestoId: string) {
  const supabase = await createClient();

  // 1. Obtenemos info del puesto para saber si es jefatura
  const { data: puesto } = await supabase
    .from("puesto")
    .select("departamento_id, es_jefatura")
    .eq("id", puestoId)
    .single();

  // 2. Actualizamos el puesto
  const { error } = await supabase
    .from("puesto")
    .update({ usuario_id: userId })
    .eq("id", puestoId);

  if (error) return { error: error.message };

  // 3. SI EL PUESTO TIENE CORONA (es_jefatura), actualizamos el jefe del departamento
  if (puesto?.es_jefatura) {
    await supabase
      .from("departamento")
      .update({ jefe_id: userId })
      .eq("id", puesto.departamento_id);
  }

  revalidatePath("/administracion/gestion/departamento");
  return { success: true };
}

// --- DESVINCULAR USUARIO (¡SINCRONIZACIÓN AUTOMÁTICA!) ---
export async function desvincularUsuarioPuesto(puestoId: string) {
  const supabase = await createClient();

  // 1. Obtenemos info del puesto antes de limpiar
  const { data: puesto } = await supabase
    .from("puesto")
    .select("departamento_id, es_jefatura")
    .eq("id", puestoId)
    .single();

  // 2. Limpiamos el usuario del puesto
  const { error } = await supabase
    .from("puesto")
    .update({ usuario_id: null })
    .eq("id", puestoId);

  if (error) return { error: error.message };

  // 3. Si era el jefe, dejamos al departamento sin jefe oficial
  if (puesto?.es_jefatura) {
    await supabase
      .from("departamento")
      .update({ jefe_id: null })
      .eq("id", puesto.departamento_id);
  }

  revalidatePath("/administracion/gestion/departamento");
  return { success: true };
}