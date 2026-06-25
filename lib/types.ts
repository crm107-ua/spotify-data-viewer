export interface DashboardStats {
  generatedAt: string;
  fileCount: number;
  coverage: {
    totalFiles: number;
    audioFiles: number;
    videoFiles: number;
    totalRecordsInFiles: number;
    processedStreams: number;
    skippedInvalidTimestamps: number;
    audioStreams: number;
    videoStreams: number;
    files: {
      file: string;
      type: string;
      records: number;
      processed: number;
      hours: number;
    }[];
  };
  totals: {
    streams: number;
    msPlayed: number;
    hoursListened: number;
    daysListened: number;
    uniqueArtists: number;
    uniqueTracks: number;
    uniqueAlbums: number;
    uniquePodcasts: number;
    firstStream: string | null;
    lastStream: string | null;
    yearsSpan: number;
    firstYear: number;
    lastYear: number;
  };
  yearly: {
    year: string;
    streams: number;
    hours: number;
    skipRate: number;
    avgMinutes: number;
    music?: number;
    podcast?: number;
    audiobook?: number;
    video?: number;
  }[];
  monthly: { month: string; streams: number; hours: number }[];
  contentTypes: { type: string; count: number; hours: number; pct: number }[];
  platforms: { name: string; count: number; hours: number; pct: number }[];
  countries: { code: string; count: number; pct: number }[];
  reasonStart: { name: string; count: number }[];
  reasonEnd: { name: string; count: number }[];
  habits: {
    skipped: number;
    notSkipped: number;
    shuffle: number;
    noShuffle: number;
    offline: number;
    online: number;
    privateSession: number;
    publicSession: number;
    skipRate: number;
    shuffleRate: number;
    offlineRate: number;
    privateRate: number;
  };
  hourOfDay: { hour: number; count: number; ms: number }[];
  dayOfWeek: { day: string; count: number; ms: number }[];
  topArtists: { name: string; count: number }[];
  topArtistsByTime: { name: string; ms: number; hours: number }[];
  topTracks: { name: string; count: number }[];
  topTracksByTime: { name: string; ms: number; hours: number }[];
  topAlbums: { name: string; count: number }[];
  topAlbumsByTime: { name: string; ms: number; hours: number }[];
  topPodcasts: { name: string; count: number }[];
  topPodcastsByTime: { name: string; ms: number; hours: number }[];
  genres?: {
    topGenres: { name: string; label: string; count: number; pct: number }[];
    trend: Record<string, string | number>[];
    trendByTime: Record<string, string | number>[];
    series: string[];
    artistsWithGenre: number;
    artistsTotal: number;
  };
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime()) || d.getFullYear() > 2030 || d.getFullYear() < 2010) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const CONTENT_LABELS: Record<string, string> = {
  music: "Music",
  podcast: "Podcasts",
  audiobook: "Audiobooks",
  video: "Video",
};

export const CHART_COLORS = [
  "#1DB954",
  "#1ed760",
  "#509bf5",
  "#e91429",
  "#f59b23",
  "#8d67ab",
  "#e8115b",
  "#148a08",
  "#b49bc8",
  "#477d95",
];
