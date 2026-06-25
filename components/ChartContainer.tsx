"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ChartContainer({
  children,
  height,
  className,
}: {
  children: ReactNode;
  height: number | string;
  className?: string;
}) {
  return (
    <div className={cn("chart-container w-full min-w-0", className)} style={{ height }}>
      {children}
    </div>
  );
}

export function ScrollTable({ children, minWidth = 520 }: { children: ReactNode; minWidth?: number }) {
  return (
    <div className="table-scroll relative -mx-1 sm:mx-0">
      <div className="overflow-x-auto overscroll-x-contain scroll-smooth pb-1">
        <div style={{ minWidth }}>{children}</div>
      </div>
    </div>
  );
}
