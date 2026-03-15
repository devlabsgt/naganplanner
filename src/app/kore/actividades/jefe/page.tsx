import { Suspense } from "react";
import GestorActividades from "@/components/(administracion)/actividades/GestorActividades";

export default function EquipoPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="p-10 text-center text-gray-500">Cargando actividades del equipo...</div>}>
        {/* Aquí pasamos 'mi_equipo' para activar la lógica de jefatura */}
        <GestorActividades tipoVista="mi_equipo" />
      </Suspense>
    </div>
  );
}