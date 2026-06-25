import fs from "fs";
import path from "path";
import { Dashboard } from "@/components/Dashboard";
import type { DashboardStats } from "@/lib/types";

function loadStats(): DashboardStats {
  const statsPath = path.join(process.cwd(), "public", "stats.json");
  if (!fs.existsSync(statsPath)) {
    throw new Error(
      "public/stats.json not found. Run: npm run aggregate"
    );
  }
  return JSON.parse(fs.readFileSync(statsPath, "utf8")) as DashboardStats;
}

export default function HomePage() {
  const stats = loadStats();
  return <Dashboard stats={stats} />;
}
