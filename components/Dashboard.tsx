"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Database,
  Disc3,
  Globe,
  Headphones,
  Mic2,
  Music2,
  Play,
  SkipForward,
  Shuffle,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card } from "@/components/Card";
import { ScrollTable } from "@/components/ChartContainer";
import { StatCard } from "@/components/StatCard";
import {
  DayOfWeekChart,
  DonutChart,
  HorizontalBarChart,
  HourHeatmap,
  MonthlyTrendChart,
  SkipRateChart,
  YearlyChart,
  YearlyGenreChart,
  GenreLineTrendChart,
} from "@/components/Charts";
import type { DashboardStats } from "@/lib/types";
import { CONTENT_LABELS } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/types";

interface DashboardProps {
  stats: DashboardStats;
}

function RankedList({
  items,
  valueKey,
  formatValue,
}: {
  items: { name: string; [key: string]: string | number }[];
  valueKey: string;
  formatValue: (v: number) => string;
}) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li
          key={`${item.name}-${i}`}
          className="flex items-start gap-2.5 rounded-lg px-1.5 py-2 transition-colors active:bg-white/5 sm:items-center sm:gap-3 sm:px-2"
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold sm:h-7 sm:w-7 sm:text-xs ${
              i < 3 ? "bg-spotify-green text-black" : "bg-white/10 text-zinc-400"
            }`}
          >
            {i + 1}
          </span>
          <span className="min-w-0 flex-1 text-xs leading-snug text-zinc-200 sm:truncate sm:text-sm line-clamp-2 sm:line-clamp-none">
            {item.name}
          </span>
          <span className="shrink-0 pt-0.5 text-xs font-medium text-zinc-400 sm:pt-0 sm:text-sm">
            {formatValue(item[valueKey] as number)}
          </span>
        </li>
      ))}
    </ol>
  );
}

function HabitBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between gap-2 text-xs sm:text-sm">
        <span className="min-w-0 text-zinc-400 leading-snug">{label}</span>
        <span className="font-medium text-white">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function Dashboard({ stats }: DashboardProps) {
  const [genreMode, setGenreMode] = useState<"count" | "time">("count");

  const contentChartData = stats.contentTypes.map((c) => ({
    type: CONTENT_LABELS[c.type] || c.type,
    count: c.count,
  }));

  const platformChartData = stats.platforms.slice(0, 8).map((p) => ({
    name: p.name,
    count: p.count,
  }));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0a0a]/80">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-spotify-green sm:h-10 sm:w-10">
                <Music2 className="h-4 w-4 text-black sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold text-white sm:text-lg md:text-xl">
                  Spotify Data Viewer
                </h1>
                <p className="truncate text-[10px] text-zinc-500 sm:text-xs">
                  {formatDate(stats.totals.firstStream)} — {formatDate(stats.totals.lastStream)}
                </p>
              </div>
            </div>
            <div className="hidden shrink-0 text-right text-xs text-zinc-500 md:block">
              <p>{stats.fileCount} files processed</p>
              <p>Updated: {new Date(stats.generatedAt).toLocaleString("en-US")}</p>
            </div>
          </div>
          <p className="mt-2 border-t border-white/5 pt-2 text-[10px] text-zinc-500 md:hidden">
            {stats.fileCount} files · {new Date(stats.generatedAt).toLocaleDateString("en-US")}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-3 py-5 sm:space-y-8 sm:px-6 sm:py-8">
        {/* Data coverage */}
        {stats.coverage && (
          <section className="card border-spotify-green/20 bg-gradient-to-br from-spotify-green/5 to-transparent">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-spotify-green/20 text-spotify-green sm:h-11 sm:w-11">
                <Database className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-white sm:text-lg">Full data coverage</h2>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400 sm:text-sm">
                  Processed all{" "}
                  <strong className="text-white">{stats.coverage.totalFiles} JSON files</strong> from{" "}
                  <code className="text-spotify-green">data/</code>:{" "}
                  {stats.coverage.audioFiles} audio and {stats.coverage.videoFiles} video.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3 lg:grid-cols-4">
                  <div className="rounded-lg bg-black/30 px-3 py-2.5 sm:px-4 sm:py-3">
                    <p className="text-[10px] text-zinc-500 sm:text-xs">Records in files</p>
                    <p className="text-base font-bold text-white sm:text-lg">
                      {formatNumber(stats.coverage.totalRecordsInFiles)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/30 px-3 py-2.5 sm:px-4 sm:py-3">
                    <p className="text-[10px] text-zinc-500 sm:text-xs">Processed streams</p>
                    <p className="text-base font-bold text-spotify-green sm:text-lg">
                      {formatNumber(stats.coverage.processedStreams)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/30 px-3 py-2.5 sm:px-4 sm:py-3">
                    <p className="text-[10px] text-zinc-500 sm:text-xs">Audio / Video</p>
                    <p className="text-sm font-bold text-white sm:text-lg">
                      {formatNumber(stats.coverage.audioStreams)} / {formatNumber(stats.coverage.videoStreams)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/30 px-3 py-2.5 sm:px-4 sm:py-3">
                    <p className="text-[10px] text-zinc-500 sm:text-xs">Invalid timestamps</p>
                    <p className="text-base font-bold text-zinc-400 sm:text-lg">
                      {stats.coverage.skippedInvalidTimestamps}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* KPIs */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            icon={Play}
            label="Total plays"
            value={formatNumber(stats.totals.streams)}
            sub={`${stats.totals.yearsSpan} years of history`}
          />
          <StatCard
            icon={Clock}
            label="Listening time"
            value={`${formatNumber(stats.totals.hoursListened)} h`}
            sub={`≈ ${stats.totals.daysListened} days`}
            accent="text-blue-400"
          />
          <StatCard
            icon={Users}
            label="Unique artists"
            value={formatNumber(stats.totals.uniqueArtists)}
            sub={`${formatNumber(stats.totals.uniqueTracks)} tracks`}
            accent="text-purple-400"
          />
          <StatCard
            icon={Disc3}
            label="Unique albums"
            value={formatNumber(stats.totals.uniqueAlbums)}
            sub={`${formatNumber(stats.totals.uniquePodcasts)} podcasts`}
            accent="text-orange-400"
          />
        </section>

        {/* Yearly overview */}
        <Card
          title="Yearly overview"
          subtitle="Bars = plays (left axis) · Blue line = hours listened (right axis)"
        >
          <YearlyChart data={stats.yearly} />
        </Card>

        {/* Genres by year */}
        {stats.genres && stats.genres.series.length > 0 && (
          <Card
            title="Genre trends over the years"
            subtitle={`Genres from the Spotify API · ${stats.genres.artistsWithGenre.toLocaleString("en-US")} artists classified`}
            action={
              <div className="flex w-full rounded-lg border border-white/10 p-0.5 text-xs sm:w-auto">
                <button
                  type="button"
                  onClick={() => setGenreMode("count")}
                  className={`min-h-10 flex-1 rounded-md px-3 py-2 transition-colors sm:min-h-0 sm:flex-none sm:py-1.5 ${
                    genreMode === "count" ? "bg-spotify-green text-black" : "text-zinc-400 active:text-white"
                  }`}
                >
                  Plays
                </button>
                <button
                  type="button"
                  onClick={() => setGenreMode("time")}
                  className={`min-h-10 flex-1 rounded-md px-3 py-2 transition-colors sm:min-h-0 sm:flex-none sm:py-1.5 ${
                    genreMode === "time" ? "bg-spotify-green text-black" : "text-zinc-400 active:text-white"
                  }`}
                >
                  Time
                </button>
              </div>
            }
          >
            <YearlyGenreChart
              data={genreMode === "count" ? stats.genres.trend : stats.genres.trendByTime}
              series={stats.genres.series}
              mode={genreMode}
            />
            <div className="mt-8">
              <p className="mb-4 text-sm font-medium text-zinc-400">
                Top 6 genres evolution (% per year)
              </p>
              <GenreLineTrendChart data={stats.genres.trend} series={stats.genres.series} />
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-medium text-zinc-400">Top genres (all-time)</p>
                <RankedList
                  items={stats.genres.topGenres}
                  valueKey="count"
                  formatValue={(v) => formatNumber(v)}
                />
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-zinc-400">Global share</p>
                <div className="space-y-2">
                  {stats.genres.topGenres.slice(0, 12).map((g) => (
                    <div key={g.name}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-zinc-300">{g.label}</span>
                        <span className="text-zinc-500">{g.pct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-spotify-green"
                          style={{ width: `${Math.min(g.pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Monthly + content type */}
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
          <Card
            className="lg:col-span-2"
            title="Monthly trend"
            subtitle="Plays (bars) and hours (line) month by month"
          >
            <MonthlyTrendChart data={stats.monthly} />
          </Card>
          <Card title="Content type" subtitle="Distribution by category">
            <DonutChart data={contentChartData} nameKey="type" valueKey="count" />
            <div className="mt-4 space-y-2">
              {stats.contentTypes.map((c) => (
                <div key={c.type} className="flex justify-between text-sm">
                  <span className="text-zinc-400">{CONTENT_LABELS[c.type]}</span>
                  <span className="text-zinc-300">
                    {c.pct}% · {c.hours} h
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top artists & tracks */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Top artists" subtitle="Top 50 by plays">
            <RankedList items={stats.topArtists} valueKey="count" formatValue={(v) => formatNumber(v)} />
          </Card>
          <Card title="Top artists by time" subtitle="Top 50 by hours listened">
            <RankedList
              items={stats.topArtistsByTime}
              valueKey="hours"
              formatValue={(v) => `${v} h`}
            />
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Top tracks" subtitle="Top 50 most played">
            <RankedList items={stats.topTracks} valueKey="count" formatValue={(v) => formatNumber(v)} />
          </Card>
          <Card title="Top albums" subtitle="Top 50 by plays">
            <RankedList items={stats.topAlbums} valueKey="count" formatValue={(v) => formatNumber(v)} />
          </Card>
        </div>

        {/* Podcasts if any */}
        {stats.topPodcasts.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Top podcasts" subtitle="By episodes listened">
              <RankedList items={stats.topPodcasts} valueKey="count" formatValue={(v) => formatNumber(v)} />
            </Card>
            <Card title="Podcasts by time">
              <RankedList
                items={stats.topPodcastsByTime}
                valueKey="hours"
                formatValue={(v) => `${v} h`}
              />
            </Card>
          </div>
        )}

        {/* Platform & country */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Platforms" subtitle="Where you listen to music">
            <HorizontalBarChart data={platformChartData} />
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {stats.platforms.slice(0, 6).map((p) => (
                <div key={p.name} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
                  <span className="truncate text-zinc-400">{p.name}</span>
                  <span className="ml-2 shrink-0 font-medium text-white">{p.pct}%</span>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Countries" subtitle="Play location (conn_country)">
            <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
              <Globe className="h-4 w-4" />
              ISO country code of the connection
            </div>
            <HorizontalBarChart
              data={stats.countries.map((c) => ({ name: c.code, count: c.count }))}
              color="#509bf5"
            />
          </Card>
        </div>

        {/* Listening patterns */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Time of day (UTC)" subtitle="When you listen the most">
            <HourHeatmap data={stats.hourOfDay} />
          </Card>
          <Card title="Day of week" subtitle="Weekly patterns">
            <DayOfWeekChart data={stats.dayOfWeek} />
          </Card>
        </div>

        {/* Habits */}
        <Card title="Listening habits" subtitle="Behavior from extended history fields">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <HabitBar label="Skipped tracks" value={stats.habits.skipped} total={stats.totals.streams} color="#e91429" />
              <HabitBar label="Shuffle mode" value={stats.habits.shuffle} total={stats.totals.streams} color="#8d67ab" />
              <HabitBar label="Offline mode" value={stats.habits.offline} total={stats.totals.streams} color="#f59b23" />
              <HabitBar label="Private session (incognito)" value={stats.habits.privateSession} total={stats.totals.streams} color="#509bf5" />
            </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-4">
              <div className="rounded-xl bg-white/5 p-3 text-center sm:p-4">
                <SkipForward className="mx-auto mb-1.5 h-5 w-5 text-red-400 sm:mb-2 sm:h-6 sm:w-6" />
                <p className="text-xl font-bold sm:text-2xl">{stats.habits.skipRate}%</p>
                <p className="text-xs text-zinc-500">Skip rate</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center sm:p-4">
                <Shuffle className="mx-auto mb-1.5 h-5 w-5 text-purple-400 sm:mb-2 sm:h-6 sm:w-6" />
                <p className="text-xl font-bold sm:text-2xl">{stats.habits.shuffleRate}%</p>
                <p className="text-xs text-zinc-500">With shuffle</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center sm:p-4">
                <WifiOff className="mx-auto mb-1.5 h-5 w-5 text-orange-400 sm:mb-2 sm:h-6 sm:w-6" />
                <p className="text-xl font-bold sm:text-2xl">{stats.habits.offlineRate}%</p>
                <p className="text-xs text-zinc-500">Offline</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center sm:p-4">
                <Wifi className="mx-auto mb-1.5 h-5 w-5 text-blue-400 sm:mb-2 sm:h-6 sm:w-6" />
                <p className="text-xl font-bold sm:text-2xl">{(100 - stats.habits.offlineRate).toFixed(1)}%</p>
                <p className="text-xs text-zinc-500">Online</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Skip rate evolution */}
        <Card title="Behavior over time" subtitle="Skip rate and average duration per year">
          <SkipRateChart data={stats.yearly} />
        </Card>

        {/* Reason start/end */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Start reason (reason_start)" subtitle="How your plays begin">
            <HorizontalBarChart data={stats.reasonStart} color="#1DB954" />
          </Card>
          <Card title="End reason (reason_end)" subtitle="How your plays end">
            <HorizontalBarChart data={stats.reasonEnd} color="#e91429" />
          </Card>
        </div>

        {/* Processed files */}
        {stats.coverage?.files && (
          <Card title="Processed files" subtitle="Details for each JSON in data/">
            <ScrollTable minWidth={560}>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-white/5 sm:max-h-80">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-[#141414]">
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-wide text-zinc-500 sm:text-xs">
                    <th className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">File</th>
                    <th className="px-2 py-2.5 font-medium sm:px-4 sm:py-3">Type</th>
                    <th className="px-2 py-2.5 font-medium text-right sm:px-4 sm:py-3">Rec.</th>
                    <th className="px-2 py-2.5 font-medium text-right sm:px-4 sm:py-3">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.coverage.files.map((f) => (
                    <tr key={f.file} className="border-b border-white/5 last:border-0 active:bg-white/5">
                      <td className="max-w-[140px] truncate px-3 py-2 font-mono text-[10px] text-zinc-300 sm:max-w-none sm:px-4 sm:text-xs">
                        {f.file}
                      </td>
                      <td className="px-2 py-2 text-xs text-zinc-400 sm:px-4">{f.type}</td>
                      <td className="px-2 py-2 text-right text-xs text-zinc-300 sm:px-4 sm:text-sm">
                        {f.processed.toLocaleString("en-US")}
                      </td>
                      <td className="px-2 py-2 text-right text-xs text-blue-400 sm:px-4 sm:text-sm">{f.hours} h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </ScrollTable>
          </Card>
        )}

        {/* Footer info */}
        <footer className="border-t border-white/5 px-1 pt-6 pb-10 text-center text-xs text-zinc-600 sm:pt-8 sm:pb-12 sm:text-sm">
          <p className="flex flex-wrap items-center justify-center gap-2">
            <Headphones className="h-4 w-4" />
            Spotify Extended Streaming History data
          </p>
          <p className="mt-2 px-2 leading-relaxed">
            Fields analyzed: ts, ms_played, platform, country, metadata, podcasts, audiobooks,
            reason_start/end, shuffle, skipped, offline, incognito_mode
          </p>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs">
            <Calendar className="h-3 w-3" />
            <Mic2 className="h-3 w-3" />
            Processed locally — your data never leaves your machine
          </p>
        </footer>
      </main>
    </div>
  );
}
