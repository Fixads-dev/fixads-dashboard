"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          classNames: {
            toast: "group toast",
            title: "text-sm font-semibold",
            description: "text-sm text-muted-foreground",
          },
        }}
      />
    </>
  );
}
