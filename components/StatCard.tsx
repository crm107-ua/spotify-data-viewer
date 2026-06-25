import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent?: string;
}

export function StatCard({ label, value, sub, icon: Icon, accent = "text-spotify-green" }: StatCardProps) {
  return (
    <div className="card group transition-colors hover:border-white/10 hover:bg-[#1a1a1a]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="stat-label">{label}</p>
          <p className="stat-value mt-1.5 sm:mt-2">{value}</p>
          {sub && <p className="mt-1.5 text-[11px] text-zinc-500 sm:mt-2 sm:text-xs">{sub}</p>}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 sm:h-11 sm:w-11",
            accent
          )}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </div>
  );
}
