import { createClient } from "@/utils/supabase/server";
import { Dashboard } from "@/components/(base)/dashboard";

async function getUserIsJefe(userId: string): Promise<boolean> {
  const supabase = await createClient();

  // Verifica si tiene un puesto de jefatura
  const { data: puestosJefatura } = await supabase
    .from('puesto')
    .select('id')
    .eq('usuario_id', userId)
    .eq('es_jefatura', true);

  // Verifica si es ADMIN, SUPER o RRHH (también cuentan como jefes)
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', userId)
    .single();

  const esJefeOperativo = puestosJefatura && puestosJefatura.length > 0;
  const esSuperAdmin = ['admin', 'super', 'rrhh'].includes(profile?.rol?.toLowerCase() ?? '');

  return esJefeOperativo || esSuperAdmin;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isJefe = user ? await getUserIsJefe(user.id) : false;

  return <Dashboard isJefe={isJefe} />;
}