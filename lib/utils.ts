import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(n: number): string {
  return n.toLocaleString("es-ES");
}

export function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)} min`;
  return `${h.toLocaleString("es-ES", { maximumFractionDigits: 1 })} h`;
}
