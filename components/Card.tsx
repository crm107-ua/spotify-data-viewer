"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Card({ title, subtitle, children, className, action }: CardProps) {
  return (
    <section className={cn("card", className)}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
