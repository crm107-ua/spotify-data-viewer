import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const CACHE_PATH = path.join(DATA_DIR, "genre-cache.json");

const BATCH = 50;
const DELAY_MS = 120;

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

function uriToId(uri) {
  if (!uri) return null;
  const parts = uri.split(":");
  return parts[parts.length - 1] || null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getAccessToken(clientId, clientSecret) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Spotify auth error: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function spotifyGet(token, url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 429) {
    const retry = parseInt(res.headers.get("Retry-After") || "2", 10);
    await sleep(retry * 1000);
    return spotifyGet(token, url);
  }
  if (!res.ok) throw new Error(`Spotify API ${res.status}: ${url}`);
  return res.json();
}

function collectArtistsFromData() {
  const artistToTrack = new Map();
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.includes("Audio") && f.endsWith(".json"));

  for (const file of files) {
    const rows = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
    for (const row of rows) {
      if (row.episode_name || row.spotify_episode_uri || row.audiobook_title) continue;
      const artist = row.master_metadata_album_artist_name;
      const uri = row.spotify_track_uri;
      if (artist && uri && !artistToTrack.has(artist)) {
        artistToTrack.set(artist, uri);
      }
    }
  }
  return artistToTrack;
}

function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) {
    return { version: 1, fetchedAt: null, artists: {} };
  }
  return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
}

function saveCache(cache) {
  cache.fetchedAt = new Date().toISOString();
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

export function hasSpotifyCredentials() {
  const env = loadEnv();
  return !!(env.SPOTIFY_CLIENT_ID?.trim() && env.SPOTIFY_CLIENT_SECRET?.trim());
}

export async function ensureGenreCache({ force = false } = {}) {
  if (!hasSpotifyCredentials()) {
    return { enabled: false, artists: {} };
  }

  const cache = loadCache();
  const artistToTrack = collectArtistsFromData();
  const pending = [...artistToTrack.keys()].filter(
    (a) => force || !cache.artists[a] || cache.artists[a].genres === undefined
  );

  if (pending.length === 0) {
    return { ...cache, enabled: true };
  }

  const env = loadEnv();
  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;

  console.log(`Fetching Spotify genres for ${pending.length.toLocaleString()} artists...`);
  const token = await getAccessToken(clientId, clientSecret);

  const artistToId = new Map();

  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH);
    const ids = batch.map((a) => uriToId(artistToTrack.get(a))).filter(Boolean);
    if (ids.length === 0) continue;

    const data = await spotifyGet(token, `https://api.spotify.com/v1/tracks?ids=${ids.join(",")}`);
    for (const artistName of batch) {
      const trackId = uriToId(artistToTrack.get(artistName));
      const track = (data.tracks || []).find((t) => t?.id === trackId);
      if (track?.artists?.[0]) {
        artistToId.set(artistName, track.artists[0].id);
      }
    }
    process.stdout.write(`\r  Tracks: ${Math.min(i + BATCH, pending.length)}/${pending.length}`);
    await sleep(DELAY_MS);
  }
  console.log();

  const uniqueArtistIds = [...new Set(artistToId.values())];
  const idToGenres = new Map();

  for (let i = 0; i < uniqueArtistIds.length; i += BATCH) {
    const batch = uniqueArtistIds.slice(i, i + BATCH);
    const data = await spotifyGet(token, `https://api.spotify.com/v1/artists?ids=${batch.join(",")}`);
    for (const artist of data.artists || []) {
      if (artist) idToGenres.set(artist.id, artist.genres || []);
    }
    process.stdout.write(`\r  Artistas: ${Math.min(i + BATCH, uniqueArtistIds.length)}/${uniqueArtistIds.length}`);
    await sleep(DELAY_MS);
  }
  console.log();

  for (const name of pending) {
    const id = artistToId.get(name);
    cache.artists[name] = {
      id: id || null,
      genres: id ? idToGenres.get(id) || [] : [],
    };
  }

  saveCache(cache);
  const withGenres = Object.values(cache.artists).filter((a) => a.genres?.length > 0).length;
  console.log(`✓ Genre cache: ${withGenres.toLocaleString()} artists with genre`);
  return { ...cache, enabled: true };
}

export function getPrimaryGenre(artistName, cache) {
  const entry = cache.artists[artistName];
  if (!entry?.genres?.length) return "Unclassified";
  return entry.genres[0];
}

export function formatGenreLabel(genre) {
  const map = {
    unclassified: "Unclassified",
    podcast: "Podcast",
    audiobook: "Audiobook",
    video: "Video",
    "latin pop": "Latin pop",
    "urbano latino": "Urbano latino",
    reggaeton: "Reggaetón",
    "pop urbano": "Pop urbano",
    "música mexicana": "Mexican music",
    "música urbana latina": "Latin urban music",
    "dance pop": "Dance pop",
    "electro house": "Electro house",
    "edm pop": "EDM pop",
    "indie pop": "Indie pop",
    "modern rock": "Modern rock",
    "classic rock": "Classic rock",
    "hip hop": "Hip hop",
    "r&b": "R&B",
    "nu metal": "Nu metal",
    "alternative metal": "Alternative metal",
  };
  const key = genre.toLowerCase();
  if (map[key]) return map[key];
  return genre
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ensureGenreCache({ force: process.argv.includes("--force") }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
