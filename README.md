# Spotify Data Viewer

![Dashboard preview](./public/images/principal.png)

> **About:** Local dashboard that visualizes your Spotify extended streaming history: plays, hours, artists, and trends over the years.

A local, private dashboard to explore your **Spotify Extended Streaming History**. It processes your JSON files, generates statistics, and displays them in a visual interface — without uploading your data to any server.

---

## What you can see

| Section | Description |
|---------|-------------|
| **Overview** | Total plays, hours listened, artists, albums, and podcasts |
| **Yearly evolution** | Plays and hours per year (2015 → today) |
| **Monthly trend** | Activity month by month |
| **Rankings** | Top 50 artists, tracks, and albums (by plays and by listening time) |
| **Platforms & countries** | iOS, Android, macOS, connection country code |
| **Habits** | Skip rate, shuffle, offline, private session |
| **Patterns** | Time of day and day of the week |
| **Genres** *(optional)* | Genre trends over the years — requires Spotify API |

> Your data **never leaves your computer**. Everything is processed locally.

---

## Requirements

- [Node.js](https://nodejs.org/) **18 or higher**
- Your **Extended Streaming History** export from Spotify (required before using the app)

---

## Step 0 — Request your data from Spotify (required)

**Without this step the app has nothing to show.** Spotify does not share your history automatically — you must request it from their privacy page.

### What is that page?

At [spotify.com/account/privacy/](https://www.spotify.com/account/privacy/) (Account Privacy), Spotify lets you **download a copy of your personal data**, as required by GDPR. You will see several data packages; the one you need is called **Extended streaming history**.

That package includes **every play** on your account (songs, podcasts, video, etc.) with date, duration, platform, country, and more metadata in JSON files.

### How to request it (step by step)

1. Go to **[Spotify Account Privacy](https://www.spotify.com/account/privacy/)** and sign in.
2. Scroll to **Download your data**.
3. Check **Extended streaming history**.
   - Do not confuse it with *Account data* or basic *Streaming history* — you need the **extended** export.
4. Click **Request data**.
5. Spotify will prepare the package. **It can take from a few days up to 30 days**; they will notify you by email.
6. When the email arrives, open the download link and save the **ZIP file** on your computer.

### What the ZIP contains

When you unzip it, you will see a folder with files like:

```
MyData/
├── Streaming_History_Audio_2015.json
├── Streaming_History_Audio_2016.json
├── Streaming_History_Audio_2016_1.json
├── Streaming_History_Video_2024.json
├── ReadMeFirst_ExtendedStreamingHistory.pdf
└── ...
```

Each JSON file is a list of plays. Spotify splits the history into multiple files (~12 MB each) if you have a lot of listening data.

---

## Quick start

### 1. Clone or download the project

```bash
git clone https://github.com/crm107-ua/spotify-data-viewer.git
cd spotify-data-viewer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Import your data into the app

Once you have downloaded the Spotify ZIP:

1. **Unzip** the archive to any folder.
2. **Copy all** `Streaming_History_*.json` files into this project's `data/` folder.
3. The structure should look like this:

```
spotify-data-viewer/
└── data/
    ├── Streaming_History_Audio_2015.json
    ├── Streaming_History_Audio_2016.json
    ├── Streaming_History_Audio_2016_1.json
    ├── Streaming_History_Video_2024.json
    ├── ReadMeFirst_ExtendedStreamingHistory.pdf   ← optional (field documentation)
    └── ...
```

**Important when importing:**

| Rule | Detail |
|------|--------|
| File names | Do not rename them; they must start with `Streaming_History_` |
| File count | Many files is normal (audio + video, several per year) |
| PDF | `ReadMeFirst_*.pdf` is optional; the app only reads JSON files |
| Updating data | Request a new export from Spotify, copy the new JSON files, and run `npm run aggregate` |
| Privacy | The `data/` folder is in `.gitignore` — your data is not pushed to Git |

### 4. Start the dashboard

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

The first run will process all JSON files and generate `public/stats.json`. If you add new data, run `npm run aggregate` again or restart with `npm run dev`.

---

## Genres (optional)

The Spotify export **does not include music genres**. To see the *"Genre trends over the years"* section:

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
3. Add your credentials to `.env`:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```
4. Run again:
   ```bash
   npm run aggregate
   npm run dev
   ```

The first API run can take several minutes (genres are cached in `data/genre-cache.json`). Later runs are fast.

**Without `.env` or Spotify credentials → the genres section is hidden.** The rest of the dashboard works the same.

---

## Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Process data + start development server |
| `npm run build` | Process data + create production build |
| `npm start` | Serve the build (run `build` first) |
| `npm run aggregate` | Process JSON files and update statistics only |
| `npm run enrich-genres` | Update genre cache only (requires `.env`) |

---

## How it works

```
data/*.json  →  scripts/aggregate-data.mjs  →  public/stats.json  →  Next.js Dashboard
                      ↑
              data/genre-cache.json (optional, via Spotify API)
```

1. **Read** — Scans all `Streaming_History_*.json` files in `data/`.
2. **Aggregate** — Computes totals, rankings, yearly/monthly trends, habits, etc.
3. **Genres** *(if credentials are set)* — Queries the Spotify API per artist and caches locally.
4. **Display** — Next.js reads `public/stats.json` and renders the dashboard.

---

## History fields analyzed

Based on Spotify's [Extended Streaming History](https://support.spotify.com/account/privacy/):

`ts` · `ms_played` · `platform` · `conn_country` · track/album/artist metadata · podcasts · audiobooks · `reason_start` / `reason_end` · `shuffle` · `skipped` · `offline` · `incognito_mode`

---

## Privacy

- `data/` and `.env` are in `.gitignore` — do not commit them.
- Processing is 100% local.
- The Spotify API is only used to fetch artist genres (optional); your full history is not sent.

---

## Production

```bash
npm run build
npm start
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No data / empty dashboard | Request **Extended streaming history** at [Spotify Privacy](https://www.spotify.com/account/privacy/) and wait for the email |
| Blank screen or load error | Run `npm run aggregate` and check that JSON files exist in `data/` |
| Genres not showing | Create `.env` with `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` |
| Outdated data | Add new JSON files to `data/` and run `npm run aggregate` |
| First genre fetch is slow | Normal; it queries thousands of artists. The cache speeds up later runs |

---

## License

Personal use project. Your streaming data belongs to you; this tool only visualizes it locally.
