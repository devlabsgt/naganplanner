import { Suspense } from "react";
import GestorActividades from "@/components/(administracion)/actividades/GestorActividades";

export default function DepartamentoPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="p-10 text-center text-gray-500">Cargando actividades...</div>}>
        <GestorActividades tipoVista="todas" />
      </Suspense>
    </div>
  );
}