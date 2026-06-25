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
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value mt-2">{value}</p>
          {sub && <p className="mt-2 text-xs text-zinc-500">{sub}</p>}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl bg-white/5",
            accent
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
