"use client";

import React, { memo } from "react";

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
  variant?: "default" | "gold" | "silver";
}

const VARIANTS = {
  default: ["#FF0080", "#7928CA", "#0070F3", "#38bdf8"],
  gold: ["#ffd700", "#d6a738", "#ffcc33", "#b8860b"],
  silver: ["#ffffff", "#e5e7eb", "#9ca3af", "#f3f4f6"],
};

export const AuroraText = memo(
  ({
    children,
    className = "",
    colors,
    speed = 1,
    variant = "default",
  }: AuroraTextProps) => {
    const finalColors = colors || VARIANTS[variant];

    const gradientStyle = {
      backgroundImage: `linear-gradient(135deg, ${finalColors.join(", ")}, ${
        finalColors[0]
      })`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      animationDuration: `${10 / speed}s`,
    };

    return (
      <span className={`relative inline-block ${className}`}>
        <span className="sr-only">{children}</span>
        <span
          className="animate-aurora relative bg-size-[200%_auto] bg-clip-text text-transparent"
          style={gradientStyle}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    );
  },
);

AuroraText.displayName = "AuroraText";
