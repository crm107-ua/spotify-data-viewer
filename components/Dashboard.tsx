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
          className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/5"
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              i < 3 ? "bg-spotify-green text-black" : "bg-white/10 text-zinc-400"
            }`}
          >
            {i + 1}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">{item.name}</span>
          <span className="shrink-0 text-sm font-medium text-zinc-400">
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
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
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
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-green">
              <Music2 className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white sm:text-xl">Spotify Data Viewer</h1>
              <p className="text-xs text-zinc-500">
                {formatDate(stats.totals.firstStream)} — {formatDate(stats.totals.lastStream)}
              </p>
            </div>
          </div>
          <div className="hidden text-right text-xs text-zinc-500 sm:block">
            <p>{stats.fileCount} archivos procesados</p>
            <p>Actualizado: {new Date(stats.generatedAt).toLocaleString("es-ES")}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        {/* Cobertura de datos */}
        {stats.coverage && (
          <section className="card border-spotify-green/20 bg-gradient-to-br from-spotify-green/5 to-transparent">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-spotify-green/20 text-spotify-green">
                <Database className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">Cobertura completa de datos</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Se procesaron los{" "}
                  <strong className="text-white">{stats.coverage.totalFiles} archivos JSON</strong> de{" "}
                  <code className="text-spotify-green">data/</code>:{" "}
                  {stats.coverage.audioFiles} de audio y {stats.coverage.videoFiles} de vídeo.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-black/30 px-4 py-3">
                    <p className="text-xs text-zinc-500">Registros en archivos</p>
                    <p className="text-lg font-bold text-white">
                      {formatNumber(stats.coverage.totalRecordsInFiles)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/30 px-4 py-3">
                    <p className="text-xs text-zinc-500">Streams procesados</p>
                    <p className="text-lg font-bold text-spotify-green">
                      {formatNumber(stats.coverage.processedStreams)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/30 px-4 py-3">
                    <p className="text-xs text-zinc-500">Audio / Vídeo</p>
                    <p className="text-lg font-bold text-white">
                      {formatNumber(stats.coverage.audioStreams)} / {formatNumber(stats.coverage.videoStreams)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/30 px-4 py-3">
                    <p className="text-xs text-zinc-500">Timestamps inválidos</p>
                    <p className="text-lg font-bold text-zinc-400">
                      {stats.coverage.skippedInvalidTimestamps}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Play}
            label="Total reproducciones"
            value={formatNumber(stats.totals.streams)}
            sub={`${stats.totals.yearsSpan} años de historial`}
          />
          <StatCard
            icon={Clock}
            label="Tiempo escuchado"
            value={`${formatNumber(stats.totals.hoursListened)} h`}
            sub={`≈ ${stats.totals.daysListened} días`}
            accent="text-blue-400"
          />
          <StatCard
            icon={Users}
            label="Artistas únicos"
            value={formatNumber(stats.totals.uniqueArtists)}
            sub={`${formatNumber(stats.totals.uniqueTracks)} canciones`}
            accent="text-purple-400"
          />
          <StatCard
            icon={Disc3}
            label="Álbumes únicos"
            value={formatNumber(stats.totals.uniqueAlbums)}
            sub={`${formatNumber(stats.totals.uniquePodcasts)} podcasts`}
            accent="text-orange-400"
          />
        </section>

        {/* Yearly overview */}
        <Card
          title="Evolución anual"
          subtitle="Barras = reproducciones (eje izquierdo) · Línea azul = horas escuchadas (eje derecho)"
        >
          <YearlyChart data={stats.yearly} />
        </Card>

        {/* Géneros por año */}
        {stats.genres && stats.genres.series.length > 0 && (
          <Card
            title="Tendencia de géneros a lo largo de los años"
            subtitle={`Géneros obtenidos de la API de Spotify · ${stats.genres.artistsWithGenre.toLocaleString("es-ES")} artistas clasificados`}
            action={
              <div className="flex rounded-lg border border-white/10 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setGenreMode("count")}
                  className={`rounded-md px-3 py-1.5 transition-colors ${
                    genreMode === "count" ? "bg-spotify-green text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Reproducciones
                </button>
                <button
                  type="button"
                  onClick={() => setGenreMode("time")}
                  className={`rounded-md px-3 py-1.5 transition-colors ${
                    genreMode === "time" ? "bg-spotify-green text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Tiempo
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
                Evolución de los 6 géneros principales (% por año)
              </p>
              <GenreLineTrendChart data={stats.genres.trend} series={stats.genres.series} />
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-medium text-zinc-400">Top géneros (histórico)</p>
                <RankedList
                  items={stats.genres.topGenres}
                  valueKey="count"
                  formatValue={(v) => formatNumber(v)}
                />
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-zinc-400">Participación global</p>
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
        <div className="grid gap-6 lg:grid-cols-3">
          <Card
            className="lg:col-span-2"
            title="Tendencia mensual"
            subtitle="Reproducciones (barras) y horas (línea) mes a mes"
          >
            <MonthlyTrendChart data={stats.monthly} />
          </Card>
          <Card title="Tipo de contenido" subtitle="Distribución por categoría">
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
          <Card title="Top artistas" subtitle="Top 50 por reproducciones">
            <RankedList items={stats.topArtists} valueKey="count" formatValue={(v) => formatNumber(v)} />
          </Card>
          <Card title="Top artistas por tiempo" subtitle="Top 50 por horas escuchadas">
            <RankedList
              items={stats.topArtistsByTime}
              valueKey="hours"
              formatValue={(v) => `${v} h`}
            />
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Top canciones" subtitle="Top 50 más reproducidas">
            <RankedList items={stats.topTracks} valueKey="count" formatValue={(v) => formatNumber(v)} />
          </Card>
          <Card title="Top álbumes" subtitle="Top 50 por reproducciones">
            <RankedList items={stats.topAlbums} valueKey="count" formatValue={(v) => formatNumber(v)} />
          </Card>
        </div>

        {/* Podcasts if any */}
        {stats.topPodcasts.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Top podcasts" subtitle="Por episodios escuchados">
              <RankedList items={stats.topPodcasts} valueKey="count" formatValue={(v) => formatNumber(v)} />
            </Card>
            <Card title="Podcasts por tiempo">
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
          <Card title="Plataformas" subtitle="Dónde escuchas música">
            <HorizontalBarChart data={platformChartData} />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {stats.platforms.slice(0, 6).map((p) => (
                <div key={p.name} className="rounded-lg bg-white/5 px-3 py-2 text-xs">
                  <span className="text-zinc-400">{p.name}</span>
                  <span className="float-right font-medium text-white">{p.pct}%</span>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Países" subtitle="Ubicación de las reproducciones (conn_country)">
            <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
              <Globe className="h-4 w-4" />
              Código ISO del país de conexión
            </div>
            <HorizontalBarChart
              data={stats.countries.map((c) => ({ name: c.code, count: c.count }))}
              color="#509bf5"
            />
          </Card>
        </div>

        {/* Listening patterns */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Hora del día (UTC)" subtitle="Cuándo escuchas más música">
            <HourHeatmap data={stats.hourOfDay} />
          </Card>
          <Card title="Día de la semana" subtitle="Patrones semanales">
            <DayOfWeekChart data={stats.dayOfWeek} />
          </Card>
        </div>

        {/* Habits */}
        <Card title="Hábitos de escucha" subtitle="Comportamiento según los campos del historial extendido">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <HabitBar label="Canciones saltadas (skipped)" value={stats.habits.skipped} total={stats.totals.streams} color="#e91429" />
              <HabitBar label="Modo aleatorio (shuffle)" value={stats.habits.shuffle} total={stats.totals.streams} color="#8d67ab" />
              <HabitBar label="Modo offline" value={stats.habits.offline} total={stats.totals.streams} color="#f59b23" />
              <HabitBar label="Sesión privada (incognito)" value={stats.habits.privateSession} total={stats.totals.streams} color="#509bf5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <SkipForward className="mx-auto mb-2 h-6 w-6 text-red-400" />
                <p className="text-2xl font-bold">{stats.habits.skipRate}%</p>
                <p className="text-xs text-zinc-500">Tasa de skip</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <Shuffle className="mx-auto mb-2 h-6 w-6 text-purple-400" />
                <p className="text-2xl font-bold">{stats.habits.shuffleRate}%</p>
                <p className="text-xs text-zinc-500">Con shuffle</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <WifiOff className="mx-auto mb-2 h-6 w-6 text-orange-400" />
                <p className="text-2xl font-bold">{stats.habits.offlineRate}%</p>
                <p className="text-xs text-zinc-500">Offline</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <Wifi className="mx-auto mb-2 h-6 w-6 text-blue-400" />
                <p className="text-2xl font-bold">{(100 - stats.habits.offlineRate).toFixed(1)}%</p>
                <p className="text-xs text-zinc-500">Online</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Skip rate evolution */}
        <Card title="Evolución del comportamiento" subtitle="Tasa de skip y duración media por año">
          <SkipRateChart data={stats.yearly} />
        </Card>

        {/* Reason start/end */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Motivo de inicio (reason_start)" subtitle="Cómo empiezan tus reproducciones">
            <HorizontalBarChart data={stats.reasonStart} color="#1DB954" />
          </Card>
          <Card title="Motivo de fin (reason_end)" subtitle="Cómo terminan tus reproducciones">
            <HorizontalBarChart data={stats.reasonEnd} color="#e91429" />
          </Card>
        </div>

        {/* Archivos procesados */}
        {stats.coverage?.files && (
          <Card title="Archivos procesados" subtitle="Detalle de cada JSON en data/">
            <div className="max-h-80 overflow-y-auto rounded-xl border border-white/5">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-[#141414]">
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-4 py-3 font-medium">Archivo</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium text-right">Registros</th>
                    <th className="px-4 py-3 font-medium text-right">Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.coverage.files.map((f) => (
                    <tr key={f.file} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="px-4 py-2 font-mono text-xs text-zinc-300">{f.file}</td>
                      <td className="px-4 py-2 text-zinc-400">{f.type}</td>
                      <td className="px-4 py-2 text-right text-zinc-300">
                        {f.processed.toLocaleString("es-ES")}
                      </td>
                      <td className="px-4 py-2 text-right text-blue-400">{f.hours} h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Footer info */}
        <footer className="border-t border-white/5 pt-8 pb-12 text-center text-sm text-zinc-600">
          <p className="flex items-center justify-center gap-2">
            <Headphones className="h-4 w-4" />
            Datos del historial extendido de Spotify (Extended Streaming History)
          </p>
          <p className="mt-2">
            Campos analizados: ts, ms_played, plataforma, país, metadatos, podcasts, audiolibros,
            reason_start/end, shuffle, skipped, offline, incognito_mode
          </p>
          <p className="mt-1 flex items-center justify-center gap-2 text-xs">
            <Calendar className="h-3 w-3" />
            <Mic2 className="h-3 w-3" />
            Procesado localmente — tus datos no salen de tu máquina
          </p>
        </footer>
      </main>
    </div>
  );
}
