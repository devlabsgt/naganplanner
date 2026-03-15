"use client";

import { useMemo } from "react";
import { TODOS_LOS_MODULOS, Rol, Modulo } from "../constants";
import { ModuleCard } from "./ModuleCard";

interface ModulesViewProps {
  rol?: Rol | null; // Opcional: filtrar por rol en el futuro
}

function agruparPorCategoria(modulos: Modulo[]) {
  return modulos.reduce(
    (acc, mod) => {
      const cat = mod.categoria;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(mod);
      return acc;
    },
    {} as Record<string, Modulo[]>
  );
}

export function ModulesView({ rol }: ModulesViewProps) {
  const modulosVisibles = useMemo(() => {
    return TODOS_LOS_MODULOS.filter((mod) => {
      if (mod.rolesPermitidos === "TODOS") return true;
      if (!rol) return false;
      return mod.rolesPermitidos.includes(rol);
    });
  }, [rol]);

  const grupos = useMemo(
    () => agruparPorCategoria(modulosVisibles),
    [modulosVisibles]
  );

  if (modulosVisibles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-sm">
          No tienes módulos disponibles para tu rol.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {Object.entries(grupos).map(([categoria, mods]) => (
        <section key={categoria}>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
            {categoria}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mods.map((mod) => (
              <ModuleCard key={mod.id} modulo={mod} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
