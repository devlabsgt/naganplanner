"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <div className={cn("flex flex-col select-none", className)}>
      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center leading-none">
        <span className="text-[#d6a738] drop-shadow-md">Nagan</span>
        <span className="ml-1.5 text-foreground/90 dark:text-white/90 font-bold">Planner</span>
      </h1>

    </div>
  );
}
