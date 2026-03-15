import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import GestorPlanificador from "@/components/(administracion)/planificador/GestorPlanificador";

export default async function PlanificadorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Solo verificar que tenga sesión activa — el módulo es para todos los roles
  if (!user) {
    redirect('/kore');
  }

  return (
    <div className="w-full">
      <Suspense fallback={<div className="p-10 text-center text-gray-500">Cargando comisiones...</div>}>
        <GestorPlanificador tipoVista="mis_actividades" modulo="todas"/>
      </Suspense>
    </div>
  );
}