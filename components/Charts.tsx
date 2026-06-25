"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ScrollTable } from "@/components/ChartContainer";
import { CHART_COLORS } from "@/lib/types";
import { useIsMobile } from "@/lib/useMediaQuery";

const tooltipStyle = {
  backgroundColor: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: "12px",
  color: "#fff",
};

function formatAxisNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

function formatHoursAxis(value: number): string {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k h`;
  return `${value} h`;
}

export function YearlyChart({
  data,
}: {
  data: {
    year: string;
    streams: number;
    hours: number;
    skipRate?: number;
    avgMinutes?: number;
  }[];
}) {
  const isMobile = useIsMobile();
  const maxStreams = Math.max(...data.map((d) => d.streams), 1);
  const maxHours = Math.max(...data.map((d) => d.hours), 1);
  const chartHeight = isMobile ? 260 : 360;
  const margin = isMobile
    ? { top: 8, right: 4, left: -12, bottom: 4 }
    : { top: 12, right: 56, left: 8, bottom: 8 };

  return (
    <div className="space-y-4">
      <ChartContainer height={chartHeight}>
        <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={margin} barGap={isMobile ? 2 : 4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a2a" />
          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#a3a3a3", fontSize: isMobile ? 10 : 12 }}
            interval={isMobile ? 1 : 0}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 48 : 30}
          />
          <YAxis
            yAxisId="streams"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatAxisNumber}
            domain={[0, Math.ceil(maxStreams * 1.1)]}
            tick={{ fill: "#1DB954", fontSize: isMobile ? 9 : 11 }}
            width={isMobile ? 36 : 48}
            label={
              isMobile
                ? undefined
                : {
                    value: "Reproducciones",
                    angle: -90,
                    position: "insideLeft",
                    offset: 12,
                    fill: "#1DB954",
                    fontSize: 11,
                  }
            }
          />
          <YAxis
            yAxisId="hours"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatHoursAxis}
            domain={[0, Math.ceil(maxHours * 1.15)]}
            tick={{ fill: "#509bf5", fontSize: isMobile ? 9 : 11 }}
            width={isMobile ? 36 : 48}
            label={
              isMobile
                ? undefined
                : {
                    value: "Horas",
                    angle: 90,
                    position: "insideRight",
                    offset: 12,
                    fill: "#509bf5",
                    fontSize: 11,
                  }
            }
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number, name: string) => {
              if (name === "Reproducciones") return [value.toLocaleString("es-ES"), name];
              if (name === "Horas") return [`${value.toLocaleString("es-ES")} h`, name];
              return [value, name];
            }}
            labelFormatter={(label) => `Año ${label}`}
          />
          <Legend
            wrapperStyle={{ paddingTop: isMobile ? 8 : 16, fontSize: isMobile ? 11 : 12 }}
            formatter={(value) => <span style={{ color: "#d4d4d4" }}>{value}</span>}
          />
          <Bar
            yAxisId="streams"
            dataKey="streams"
            name="Reproducciones"
            fill="#1DB954"
            radius={[4, 4, 0, 0]}
            maxBarSize={isMobile ? 24 : 48}
          />
          <Line
            yAxisId="hours"
            type="monotone"
            dataKey="hours"
            name="Horas"
            stroke="#509bf5"
            strokeWidth={isMobile ? 2 : 2.5}
            dot={isMobile ? false : { r: 4, fill: "#509bf5", strokeWidth: 0 }}
            activeDot={{ r: isMobile ? 4 : 6 }}
          />
        </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ScrollTable minWidth={isMobile ? 480 : 640}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[10px] uppercase tracking-wide text-zinc-500 sm:text-xs">
              <th className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">Año</th>
              <th className="px-3 py-2.5 font-medium text-right sm:px-4 sm:py-3">Repro.</th>
              <th className="px-3 py-2.5 font-medium text-right sm:px-4 sm:py-3">Horas</th>
              <th className="hidden px-3 py-2.5 font-medium text-right sm:table-cell sm:px-4 sm:py-3">Media</th>
              <th className="px-3 py-2.5 font-medium text-right sm:px-4 sm:py-3">Skip</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.year} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                <td className="px-3 py-2 font-medium text-white sm:px-4 sm:py-2.5">{row.year}</td>
                <td className="px-3 py-2 text-right text-zinc-300 sm:px-4 sm:py-2.5">
                  {row.streams.toLocaleString("es-ES")}
                </td>
                <td className="px-3 py-2 text-right text-blue-400 sm:px-4 sm:py-2.5">
                  {row.hours.toLocaleString("es-ES")} h
                </td>
                <td className="hidden px-3 py-2 text-right text-zinc-400 sm:table-cell sm:px-4 sm:py-2.5">
                  {row.avgMinutes ?? "—"} min
                </td>
                <td className="px-3 py-2 text-right text-zinc-400 sm:px-4 sm:py-2.5">
                  {row.skipRate ?? 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollTable>
    </div>
  );
}

export function MonthlyTrendChart({
  data,
}: {
  data: { month: string; streams: number; hours?: number }[];
}) {
  const isMobile = useIsMobile();
  const height = isMobile ? 240 : 300;
  const margin = isMobile
    ? { top: 4, right: 4, left: -8, bottom: 0 }
    : { top: 8, right: 48, left: 8, bottom: 0 };

  return (
    <ChartContainer height={height}>
      <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a2a" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => {
            const [, m] = String(v).split("-");
            const months = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
            return months[parseInt(m, 10) - 1] || m;
          }}
          interval="preserveStartEnd"
          minTickGap={isMobile ? 20 : 28}
          tick={{ fill: "#a3a3a3", fontSize: isMobile ? 9 : 10 }}
        />
        <YAxis
          yAxisId="streams"
          tickLine={false}
          axisLine={false}
          tickFormatter={formatAxisNumber}
          tick={{ fill: "#1DB954", fontSize: isMobile ? 9 : 11 }}
          width={isMobile ? 32 : 48}
        />
        <YAxis
          yAxisId="hours"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickFormatter={formatHoursAxis}
          tick={{ fill: "#509bf5", fontSize: isMobile ? 9 : 11 }}
          width={isMobile ? 32 : 48}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(l) => {
            const [y, m] = String(l).split("-");
            const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            return `${months[parseInt(m, 10) - 1]} ${y}`;
          }}
          formatter={(value: number, name: string) => [
            name === "Horas" ? `${value.toLocaleString("es-ES")} h` : value.toLocaleString("es-ES"),
            name,
          ]}
        />
        <Legend />
        <Bar
          yAxisId="streams"
          dataKey="streams"
          name="Reproducciones"
          fill="#1DB954"
          radius={[2, 2, 0, 0]}
          maxBarSize={isMobile ? 6 : 12}
          opacity={0.85}
        />
        <Line
          yAxisId="hours"
          type="monotone"
          dataKey="hours"
          name="Horas"
          stroke="#509bf5"
          strokeWidth={isMobile ? 1.5 : 2}
          dot={false}
          activeDot={{ r: 3 }}
        />
      </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function DonutChart({
  data,
  nameKey,
  valueKey,
}: {
  data: { [key: string]: string | number }[];
  nameKey: string;
  valueKey: string;
}) {
  const isMobile = useIsMobile();
  const height = isMobile ? 220 : 280;
  const innerR = isMobile ? 48 : 70;
  const outerR = isMobile ? 78 : 110;

  return (
    <ChartContainer height={height}>
      <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={innerR}
          outerRadius={outerR}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 12 }} />
      </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function HorizontalBarChart({
  data,
  dataKey = "count",
  nameKey = "name",
  color = "#1DB954",
}: {
  data: { [key: string]: string | number }[];
  dataKey?: string;
  nameKey?: string;
  color?: string;
}) {
  const isMobile = useIsMobile();
  const barHeight = isMobile ? 28 : 32;
  const chartHeight = Math.max(isMobile ? 220 : 280, data.length * barHeight);
  const labelWidth = isMobile ? 88 : 160;

  return (
    <ChartContainer height={chartHeight}>
      <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: isMobile ? 9 : 11 }} />
        <YAxis
          type="category"
          dataKey={nameKey}
          tickLine={false}
          axisLine={false}
          width={labelWidth}
          tick={{ fontSize: isMobile ? 9 : 11 }}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={dataKey} fill={color} radius={[0, 6, 6, 0]} />
      </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function HourHeatmap({
  data,
}: {
  data: { hour: number; count: number }[];
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12 sm:gap-2 md:grid-cols-24">
      {data.map((d) => {
        const intensity = d.count / max;
        return (
          <div key={d.hour} className="flex flex-col items-center gap-0.5 sm:gap-1">
            <div
              className="h-8 w-full rounded-sm transition-transform active:scale-105 sm:h-10 sm:rounded-md"
              style={{
                backgroundColor: `rgba(29, 185, 84, ${0.15 + intensity * 0.85})`,
              }}
              title={`${d.hour}:00 — ${d.count.toLocaleString("es-ES")} streams`}
            />
            <span className="text-[8px] text-zinc-500 sm:text-[10px]">{d.hour}</span>
          </div>
        );
      })}
    </div>
  );
}

export function DayOfWeekChart({
  data,
}: {
  data: { day: string; count: number; ms: number }[];
}) {
  const isMobile = useIsMobile();
  const height = isMobile ? 200 : 240;

  return (
    <ChartContainer height={height}>
      <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: isMobile ? 10 : 12 }} />
        <YAxis tickLine={false} axisLine={false} width={isMobile ? 28 : 40} tick={{ fontSize: isMobile ? 9 : 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" name="Reproducciones" fill="#8d67ab" radius={[4, 4, 0, 0]} maxBarSize={isMobile ? 28 : 40} />
      </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function SkipRateChart({
  data,
}: {
  data: { year: string; skipRate: number; avgMinutes: number }[];
}) {
  const isMobile = useIsMobile();
  const height = isMobile ? 220 : 260;

  return (
    <ChartContainer height={height}>
      <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: isMobile ? 10 : 12 }} interval={isMobile ? 1 : 0} />
        <YAxis tickLine={false} axisLine={false} unit="%" width={isMobile ? 32 : 48} tick={{ fontSize: isMobile ? 9 : 11 }} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number, name: string) => [
            name === "skipRate" ? `${value}%` : `${value} min`,
            name === "skipRate" ? "Tasa de skip" : "Duración media",
          ]}
        />
        <Legend />
        <Line type="monotone" dataKey="skipRate" name="Tasa de skip" stroke="#e91429" strokeWidth={2} dot={isMobile ? false : { r: 3 }} />
        <Line type="monotone" dataKey="avgMinutes" name="Duración media" stroke="#f59b23" strokeWidth={2} dot={isMobile ? false : { r: 3 }} />
      </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

const GENRE_COLORS: Record<string, string> = {
  Otros: "#555555",
  Podcast: "#8d67ab",
  Audiolibro: "#f59b23",
  Vídeo: "#e91429",
  "Sin clasificar": "#666666",
};

function genreColor(name: string, index: number): string {
  return GENRE_COLORS[name] || CHART_COLORS[index % CHART_COLORS.length];
}

export function YearlyGenreChart({
  data,
  series,
  mode = "count",
}: {
  data: Record<string, string | number>[];
  series: string[];
  mode?: "count" | "time";
}) {
  const isMobile = useIsMobile();
  const unit = mode === "time" ? "min" : "reproducciones";
  const height = isMobile ? 280 : 380;

  return (
    <div className="space-y-4">
      <ChartContainer height={height}>
        <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 4 }} stackOffset="expand">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a2a" />
          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#a3a3a3", fontSize: isMobile ? 10 : 12 }}
            interval={isMobile ? 1 : 0}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${Math.round(v * 100)}%`}
            tick={{ fill: "#a3a3a3", fontSize: isMobile ? 9 : 11 }}
            width={isMobile ? 32 : 40}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(label) => `Año ${label}`}
            formatter={(value: number, name: string, props) => {
              const row = props.payload as Record<string, number>;
              const pctKey = `${name}_pct`;
              const pct = row[pctKey];
              const display =
                mode === "time"
                  ? `${Math.round(value as number).toLocaleString("es-ES")} min`
                  : (value as number).toLocaleString("es-ES");
              return [`${display}${pct != null ? ` (${pct}%)` : ""}`, name];
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: 8, fontSize: isMobile ? 10 : 12 }}
            formatter={(value) => <span style={{ color: "#d4d4d4", fontSize: isMobile ? 10 : 12 }}>{value}</span>}
          />
          {series.map((name, i) => (
            <Area
              key={name}
              type="monotone"
              dataKey={name}
              name={name}
              stackId="1"
              stroke={genreColor(name, i)}
              fill={genreColor(name, i)}
              fillOpacity={0.75}
            />
          ))}
        </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
      <p className="text-center text-[11px] text-zinc-500 sm:text-xs">
        Distribución porcentual por año · datos por {unit} (género principal del artista vía Spotify API)
      </p>
    </div>
  );
}

export function GenreLineTrendChart({
  data,
  series,
}: {
  data: Record<string, string | number>[];
  series: string[];
}) {
  const isMobile = useIsMobile();
  const height = isMobile ? 260 : 320;

  return (
    <ChartContainer height={height}>
      <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a2a" />
        <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: "#a3a3a3", fontSize: isMobile ? 10 : 12 }} interval={isMobile ? 1 : 0} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, "auto"]}
          tick={{ fill: "#a3a3a3", fontSize: isMobile ? 9 : 11 }}
          width={isMobile ? 32 : 40}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(label) => `Año ${label}`}
          formatter={(value: number, name: string) => [`${value}%`, name]}
        />
        <Legend wrapperStyle={{ paddingTop: 8, fontSize: isMobile ? 10 : 12 }} />
        {series.slice(0, isMobile ? 4 : 6).map((name, i) => (
          <Line
            key={name}
            type="monotone"
            dataKey={`${name}_pct`}
            name={name}
            stroke={genreColor(name, i)}
            strokeWidth={isMobile ? 1.5 : 2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
