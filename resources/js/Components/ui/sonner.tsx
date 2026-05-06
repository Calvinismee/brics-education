"use client";

import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "#FFFDF4",
          "--normal-text": "#111827",
          "--normal-border": "#D8D7BE",
          "--success-bg": "#F0FDF4",
          "--success-text": "#166534",
          "--error-bg": "#FEF2F2",
          "--error-text": "#991B1B",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
