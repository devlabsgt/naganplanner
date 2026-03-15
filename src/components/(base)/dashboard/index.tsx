"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AnimatedIcon from "@/components/ui/AnimatedIcon";
import { TODOS_LOS_MODULOS, Rol } from "./constants";
import { useUser } from "@/components/(base)/providers/UserProvider";
import { useMemo } from "react";

import { BrandLogo } from "@/components/ui/BrandLogo";

interface DashboardProps {
  isJefe?: boolean;
}

export function Dashboard({ isJefe = false }: DashboardProps) {
  const router = useRouter();
  const user = useUser();

  // Rol del usuario desde Supabase user_metadata (guardado en minúscula: 'admin', 'super', 'rrhh', 'user')
  const rol = (user?.user_metadata?.rol as Rol) ?? null;

  // Filtrar módulos según el rol del usuario y estatus de jefe
  const modulosVisibles = useMemo(() => {
    return TODOS_LOS_MODULOS.filter((mod) => {
      // 1. Verificar si el módulo pide ser jefe
      if (mod.soloJefe && !isJefe) return false;

      // 2. Verificar roles permitidos
      if (mod.rolesPermitidos === 'TODOS') return true;
      if (!rol) return false;
      return mod.rolesPermitidos.includes(rol);
    });
  }, [rol, isJefe]);


  return (
    <div className="space-y-12 px-6 max-w-7xl mx-auto py-10 relative">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* ── Módulos que el rol del usuario puede ver ─── */}
        {modulosVisibles.map((mod) => (
          <motion.div
            key={mod.id}
            onClick={() => router.push(mod.ruta as any)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="group relative h-32 rounded-xl border-2 bg-card/40 backdrop-blur-sm shadow-sm hover:bg-card/70 hover:shadow-md transition-colors cursor-pointer overflow-hidden flex flex-row items-center gap-4 px-5"
            style={{ borderColor: mod.color?.primaryColor ? `${mod.color.primaryColor}88` : 'rgba(255,255,255,0.1)' }} 
          >
            {/* Ícono animado grande a la izquierda */}
            <div className="shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
              <AnimatedIcon
                iconKey={mod.iconKey}
                className="w-14 h-14"
              />
            </div>

            {/* Texto a la derecha */}
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {mod.categoria}
              </p>
              <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                {mod.titulo}
              </h3>
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                {mod.descripcion}
              </p>
            </div>

            {/* Botón "Abrir" en hover */}
            <div className="absolute bottom-3 right-4 flex items-center gap-1 text-primary text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
              Abrir <ArrowRight size={11} />
            </div>
          </motion.div>
        ))}

      </div>
    </div>
  );
}
