"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AnimatedIcon from "@/components/ui/AnimatedIcon";
import { Modulo } from "../constants";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  modulo: Modulo;
  isLoading?: boolean;
}

export function ModuleCard({ modulo, isLoading = false }: ModuleCardProps) {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const handleClick = () => {
    setNavigating(true);
    router.push(modulo.ruta as any);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm h-[88px] animate-pulse">
        <div className="w-14 h-14 rounded-xl bg-muted/60 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted/60 rounded-md w-2/3" />
          <div className="h-3 bg-muted/40 rounded-md w-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-2xl border border-border/40",
        "bg-card/40 hover:bg-card/70 backdrop-blur-sm shadow-sm hover:shadow-md",
        "transition-colors duration-200 cursor-pointer overflow-hidden",
        navigating && "opacity-70 pointer-events-none"
      )}
    >
      {/* Ícono animado */}
      <div className="w-14 h-14 rounded-xl bg-muted/30 flex items-center justify-center shrink-0 group-hover:bg-muted/50 transition-colors">
        <AnimatedIcon
          iconKey={modulo.iconKey}
          className="w-10 h-10"
          primaryColor={modulo.color?.primaryColor}
          secondaryColor={modulo.color?.secondaryColor}
        />
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-foreground leading-tight truncate">
          {modulo.titulo}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
          {modulo.descripcion}
        </p>
      </div>

      {/* Botón de acceso — aparece en hover */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        whileHover={{}}
        className="flex items-center justify-center"
      >
        <div
          className={cn(
            "flex items-center gap-1 overflow-hidden",
            "max-w-0 opacity-0 group-hover:max-w-[80px] group-hover:opacity-100",
            "transition-all duration-200 ease-out text-primary text-xs font-medium whitespace-nowrap"
          )}
        >
          <span>Abrir</span>
          <ArrowRight size={12} />
        </div>
      </motion.div>
    </motion.div>
  );
}
