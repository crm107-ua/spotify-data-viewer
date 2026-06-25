import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  ensureGenreCache,
  formatGenreLabel,
  getPrimaryGenre,
  hasSpotifyCredentials,
} from "./enrich-genres.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const OUTPUT = path.join(__dirname, "..", "public", "stats.json");

const MIN_YEAR = 2010;
const MAX_YEAR = 2030;
const MIN_TS = Date.UTC(MIN_YEAR, 0, 1) / 1000;
const MAX_TS = Date.UTC(MAX_YEAR + 1, 0, 1) / 1000;

function inc(map, key, amount = 1) {
  if (!key) return;
  map[key] = (map[key] || 0) + amount;
}

function topN(map, n = 50) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

function topNMs(map, n = 50) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, ms]) => ({
      name,
      ms,
      hours: Math.round((ms / 3600000) * 10) / 10,
    }));
}

function normalizePlatform(p) {
  if (!p) return "Desconocido";
  const lower = p.toLowerCase();
  if (lower.includes("ios") || lower.includes("iphone") || lower.includes("ipad")) return "iOS";
  if (lower.includes("android")) return "Android";
  if (lower.includes("osx") || lower.includes("mac")) return "macOS";
  if (lower.includes("windows")) return "Windows";
  if (lower.includes("linux")) return "Linux";
  if (lower.includes("web") || lower.includes("browser")) return "Web";
  if (lower.includes("chromecast") || lower.includes("cast")) return "Chromecast";
  if (lower.includes("watch")) return "Watch";
  if (lower.includes("tv")) return "TV";
  return p.split(" ")[0].slice(0, 24);
}

function getContentType(row, isVideo) {
  if (isVideo) return "video";
  if (row.audiobook_title) return "audiobook";
  if (row.episode_name || row.spotify_episode_uri) return "podcast";
  return "music";
}

/** Usa ts como fuente principal; offline_timestamp solo si es plausible (2010–2030). */
function getTimestamp(row) {
  const fromTs = row.ts ? new Date(row.ts) : null;
  const tsValid = fromTs && !isNaN(fromTs.getTime());

  if (
    row.offline === true &&
    row.offline_timestamp &&
    row.offline_timestamp >= MIN_TS &&
    row.offline_timestamp <= MAX_TS
  ) {
    return new Date(row.offline_timestamp * 1000);
  }

  if (tsValid) return fromTs;
  return null;
}

function isValidYear(year) {
  const y = parseInt(year, 10);
  return y >= MIN_YEAR && y <= MAX_YEAR;
}

function monthKey(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function yearKey(d) {
  return String(d.getUTCFullYear());
}

console.log("Procesando historial de Spotify...");

const genresEnabled = hasSpotifyCredentials();
const genreCache = genresEnabled ? await ensureGenreCache() : { enabled: false, artists: {} };
const yearGenreCounts = {};
const yearGenreMs = {};
const globalGenreCounts = {};

if (!genresEnabled) {
  console.log("ℹ Sin credenciales Spotify en .env — sección de géneros omitida");
}

const files = fs
  .readdirSync(DATA_DIR)
  .filter((f) => f.endsWith(".json") && f.startsWith("Streaming_"))
  .sort();

const audioFiles = files.filter((f) => f.includes("Audio"));
const videoFiles = files.filter((f) => f.includes("Video"));

const stats = {
  generatedAt: new Date().toISOString(),
  fileCount: files.length,
  totals: {
    streams: 0,
    msPlayed: 0,
    uniqueArtists: 0,
    uniqueTracks: 0,
    uniqueAlbums: 0,
    uniquePodcasts: 0,
    firstStream: null,
    lastStream: null,
  },
  byYear: {},
  msByYear: {},
  byMonth: {},
  msByMonth: {},
  byContentType: { music: 0, podcast: 0, audiobook: 0, video: 0 },
  msByContentType: { music: 0, podcast: 0, audiobook: 0, video: 0 },
  yearlyByContentType: {},
  byPlatform: {},
  msByPlatform: {},
  byCountry: {},
  byReasonStart: {},
  byReasonEnd: {},
  habits: {
    skipped: 0,
    notSkipped: 0,
    shuffle: 0,
    noShuffle: 0,
    offline: 0,
    online: 0,
    privateSession: 0,
    publicSession: 0,
  },
  hourOfDay: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0, ms: 0 })),
  dayOfWeek: Array.from({ length: 7 }, (_, i) => ({
    day: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][i],
    count: 0,
    ms: 0,
  })),
  artists: {},
  msArtists: {},
  tracks: {},
  msTracks: {},
  albums: {},
  msAlbums: {},
  podcasts: {},
  msPodcasts: {},
  skipRateByYear: {},
  avgMsByYear: {},
  fileBreakdown: [],
  skippedRows: 0,
};

const artistSet = new Set();
const trackSet = new Set();
const albumSet = new Set();
const podcastSet = new Set();

for (const file of files) {
  const isVideo = file.includes("Video");
  const rows = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
  let fileStreams = 0;
  let fileMs = 0;

  for (const row of rows) {
    const ms = row.ms_played || 0;
    const date = getTimestamp(row);
    if (!date || isNaN(date.getTime())) {
      stats.skippedRows++;
      continue;
    }

    const y = yearKey(date);
    const m = monthKey(date);
    const contentType = getContentType(row, isVideo);
    const platform = normalizePlatform(row.platform);
    const country = row.conn_country || "??";
    const hour = date.getUTCHours();
    const dow = date.getUTCDay();

    stats.totals.streams++;
    stats.totals.msPlayed += ms;
    fileStreams++;
    fileMs += ms;

    const iso = date.toISOString();
    if (!stats.totals.firstStream || iso < stats.totals.firstStream) {
      stats.totals.firstStream = iso;
    }
    if (!stats.totals.lastStream || iso > stats.totals.lastStream) {
      stats.totals.lastStream = iso;
    }

    inc(stats.byYear, y, 1);
    stats.msByYear[y] = (stats.msByYear[y] || 0) + ms;

    inc(stats.byMonth, m, 1);
    stats.msByMonth[m] = (stats.msByMonth[m] || 0) + ms;

    inc(stats.byContentType, contentType, 1);
    stats.msByContentType[contentType] = (stats.msByContentType[contentType] || 0) + ms;

    if (!stats.yearlyByContentType[y]) {
      stats.yearlyByContentType[y] = { music: 0, podcast: 0, audiobook: 0, video: 0 };
    }
    stats.yearlyByContentType[y][contentType]++;

    inc(stats.byPlatform, platform, 1);
    stats.msByPlatform[platform] = (stats.msByPlatform[platform] || 0) + ms;

    inc(stats.byCountry, country, 1);

    if (row.reason_start) inc(stats.byReasonStart, row.reason_start, 1);
    if (row.reason_end) inc(stats.byReasonEnd, row.reason_end, 1);

    if (row.skipped === true) stats.habits.skipped++;
    else stats.habits.notSkipped++;

    if (row.shuffle === true) stats.habits.shuffle++;
    else stats.habits.noShuffle++;

    if (row.offline === true) stats.habits.offline++;
    else stats.habits.online++;

    if (row.incognito_mode === true) stats.habits.privateSession++;
    else stats.habits.publicSession++;

    stats.hourOfDay[hour].count++;
    stats.hourOfDay[hour].ms += ms;
    stats.dayOfWeek[dow].count++;
    stats.dayOfWeek[dow].ms += ms;

    const artist = row.master_metadata_album_artist_name;
    const track = row.master_metadata_track_name;
    const album = row.master_metadata_album_album_name;

    if (artist) {
      artistSet.add(artist);
      inc(stats.artists, artist, 1);
      stats.msArtists[artist] = (stats.msArtists[artist] || 0) + ms;
    }
    if (track && artist) {
      const trackKey = `${track} — ${artist}`;
      trackSet.add(trackKey);
      inc(stats.tracks, trackKey, 1);
      stats.msTracks[trackKey] = (stats.msTracks[trackKey] || 0) + ms;
    }
    if (album && artist) {
      const albumKey = `${album} — ${artist}`;
      albumSet.add(albumKey);
      inc(stats.albums, albumKey, 1);
      stats.msAlbums[albumKey] = (stats.msAlbums[albumKey] || 0) + ms;
    }
    if (contentType === "podcast" && row.episode_show_name) {
      podcastSet.add(row.episode_show_name);
      inc(stats.podcasts, row.episode_show_name, 1);
      stats.msPodcasts[row.episode_show_name] =
        (stats.msPodcasts[row.episode_show_name] || 0) + ms;
    }

    if (genresEnabled && isValidYear(y)) {
      let genre;
      if (contentType === "podcast") genre = "Podcast";
      else if (contentType === "audiobook") genre = "Audiolibro";
      else if (contentType === "video") genre = "Vídeo";
      else genre = formatGenreLabel(getPrimaryGenre(artist, genreCache));

      if (!yearGenreCounts[y]) yearGenreCounts[y] = {};
      if (!yearGenreMs[y]) yearGenreMs[y] = {};
      inc(yearGenreCounts[y], genre, 1);
      yearGenreMs[y][genre] = (yearGenreMs[y][genre] || 0) + ms;
      inc(globalGenreCounts, genre, 1);
    }

    if (!stats.skipRateByYear[y]) stats.skipRateByYear[y] = { skipped: 0, total: 0 };
    stats.skipRateByYear[y].total++;
    if (row.skipped === true) stats.skipRateByYear[y].skipped++;

    stats.avgMsByYear[y] = (stats.avgMsByYear[y] || 0) + ms;
  }

  stats.fileBreakdown.push({
    file,
    type: isVideo ? "video" : "audio",
    records: rows.length,
    processed: fileStreams,
    hours: Math.round((fileMs / 3600000) * 10) / 10,
  });
}

stats.totals.uniqueArtists = artistSet.size;
stats.totals.uniqueTracks = trackSet.size;
stats.totals.uniqueAlbums = albumSet.size;
stats.totals.uniquePodcasts = podcastSet.size;

for (const y of Object.keys(stats.avgMsByYear)) {
  const count = stats.byYear[y];
  stats.avgMsByYear[y] = count ? Math.round(stats.avgMsByYear[y] / count) : 0;
}

const validYears = Object.keys(stats.byYear)
  .filter(isValidYear)
  .sort();

const yearlySeries = validYears.map((year) => ({
  year,
  streams: stats.byYear[year],
  hours: Math.round(((stats.msByYear[year] || 0) / 3600000) * 10) / 10,
  skipRate: stats.skipRateByYear[year]
    ? Math.round((stats.skipRateByYear[year].skipped / stats.skipRateByYear[year].total) * 1000) / 10
    : 0,
  avgMinutes: Math.round((stats.avgMsByYear[year] || 0) / 60000 * 10) / 10,
  music: stats.yearlyByContentType[year]?.music || 0,
  podcast: stats.yearlyByContentType[year]?.podcast || 0,
  audiobook: stats.yearlyByContentType[year]?.audiobook || 0,
  video: stats.yearlyByContentType[year]?.video || 0,
}));

const monthlySeries = Object.keys(stats.byMonth)
  .filter((m) => isValidYear(m.split("-")[0]))
  .sort()
  .map((month) => ({
    month,
    streams: stats.byMonth[month],
    hours: Math.round(((stats.msByMonth[month] || 0) / 3600000) * 10) / 10,
  }));

const firstYear = validYears[0] ? parseInt(validYears[0], 10) : 0;
const lastYear = validYears[validYears.length - 1] ? parseInt(validYears[validYears.length - 1], 10) : 0;

const TOP_GENRES = 10;
const topGenreNames = Object.entries(globalGenreCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, TOP_GENRES)
  .map(([name]) => name);

function buildYearlyGenreSeries(countsByYear) {
  return validYears.map((year) => {
    const yearData = countsByYear[year] || {};
    const total = Object.values(yearData).reduce((s, v) => s + v, 0) || 1;
    const row = { year, total };
    let others = 0;

    for (const [genre, count] of Object.entries(yearData)) {
      if (topGenreNames.includes(genre)) {
        row[genre] = count;
        row[`${genre}_pct`] = Math.round((count / total) * 1000) / 10;
      } else {
        others += count;
      }
    }
    row.Otros = others;
    row.Otros_pct = Math.round((others / total) * 1000) / 10;
    return row;
  });
}

const genreTrend = buildYearlyGenreSeries(yearGenreCounts);
const genreTrendByTime = buildYearlyGenreSeries(
  Object.fromEntries(
    Object.entries(yearGenreMs).map(([y, genres]) => [
      y,
      Object.fromEntries(
        Object.entries(genres).map(([g, ms]) => [g, Math.round(ms / 60000)])
      ),
    ])
  )
);

const topGenres = genresEnabled
  ? Object.entries(globalGenreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([name, count]) => ({
        name,
        label: name,
        count,
        pct: Math.round((count / stats.totals.streams) * 1000) / 10,
      }))
  : [];

const output = {
  generatedAt: stats.generatedAt,
  fileCount: stats.fileCount,
  coverage: {
    totalFiles: files.length,
    audioFiles: audioFiles.length,
    videoFiles: videoFiles.length,
    totalRecordsInFiles: stats.fileBreakdown.reduce((s, f) => s + f.records, 0),
    processedStreams: stats.totals.streams,
    skippedInvalidTimestamps: stats.skippedRows,
    audioStreams: stats.byContentType.music + stats.byContentType.podcast + stats.byContentType.audiobook,
    videoStreams: stats.byContentType.video,
    files: stats.fileBreakdown,
  },
  totals: {
    ...stats.totals,
    hoursListened: Math.round((stats.totals.msPlayed / 3600000) * 10) / 10,
    daysListened: Math.round((stats.totals.msPlayed / 86400000) * 10) / 10,
    yearsSpan: lastYear && firstYear ? lastYear - firstYear + 1 : 0,
    firstYear,
    lastYear,
  },
  yearly: yearlySeries,
  monthly: monthlySeries,
  ...(genresEnabled && topGenreNames.length > 0
    ? {
        genres: {
          topGenres,
          trend: genreTrend,
          trendByTime: genreTrendByTime,
          series: [...topGenreNames, "Otros"],
          artistsWithGenre: Object.values(genreCache.artists).filter((a) => a.genres?.length > 0).length,
          artistsTotal: Object.keys(genreCache.artists).length,
        },
      }
    : {}),
  contentTypes: Object.entries(stats.byContentType).map(([type, count]) => ({
    type,
    count,
    hours: Math.round(((stats.msByContentType[type] || 0) / 3600000) * 10) / 10,
    pct: Math.round((count / stats.totals.streams) * 1000) / 10,
  })),
  platforms: topN(stats.byPlatform, 15).map(({ name, count }) => ({
    name,
    count,
    hours: Math.round(((stats.msByPlatform[name] || 0) / 3600000) * 10) / 10,
    pct: Math.round((count / stats.totals.streams) * 1000) / 10,
  })),
  countries: topN(stats.byCountry, 20).map(({ name, count }) => ({
    code: name,
    count,
    pct: Math.round((count / stats.totals.streams) * 1000) / 10,
  })),
  reasonStart: topN(stats.byReasonStart, 15),
  reasonEnd: topN(stats.byReasonEnd, 15),
  habits: {
    ...stats.habits,
    skipRate: Math.round((stats.habits.skipped / stats.totals.streams) * 1000) / 10,
    shuffleRate: Math.round((stats.habits.shuffle / stats.totals.streams) * 1000) / 10,
    offlineRate: Math.round((stats.habits.offline / stats.totals.streams) * 1000) / 10,
    privateRate: Math.round((stats.habits.privateSession / stats.totals.streams) * 1000) / 10,
  },
  hourOfDay: stats.hourOfDay,
  dayOfWeek: stats.dayOfWeek,
  topArtists: topN(stats.artists, 50),
  topArtistsByTime: topNMs(stats.msArtists, 50),
  topTracks: topN(stats.tracks, 50),
  topTracksByTime: topNMs(stats.msTracks, 50),
  topAlbums: topN(stats.albums, 50),
  topAlbumsByTime: topNMs(stats.msAlbums, 50),
  topPodcasts: topN(stats.podcasts, 25),
  topPodcastsByTime: topNMs(stats.msPodcasts, 25),
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));

console.log(`✓ ${stats.totals.streams.toLocaleString()} streams procesados (${stats.skippedRows} timestamps inválidos descartados)`);
console.log(`✓ ${audioFiles.length} archivos audio + ${videoFiles.length} archivos vídeo`);
console.log(`✓ ${output.totals.hoursListened.toLocaleString()} horas · ${firstYear}–${lastYear}`);
if (genresEnabled && topGenreNames.length > 0) {
  console.log(`✓ Géneros: ${topGenres.length} principales · tendencia ${validYears.length} años`);
}
console.log(`✓ Guardado en public/stats.json`);
