import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import GestorDeparta from "@/components/(administracion)/gestion/departamento/GestorDeparta";

// Solo ADMIN y SUPER pueden acceder al organigrama
const ROLES_PERMITIDOS = ['admin', 'super'];

export default async function DepartamentoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const rol = user?.user_metadata?.rol as string | undefined;

  if (!user || !rol || !ROLES_PERMITIDOS.includes(rol)) {
    redirect('/kore');
  }

  return (
    <div className="w-full">
      <Suspense fallback={<div className="p-10 text-center">Cargando gestión...</div>}>
        <GestorDeparta />
      </Suspense>
    </div>
  );
}