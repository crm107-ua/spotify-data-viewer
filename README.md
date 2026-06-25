# Spotify Data Viewer

![Vista previa del dashboard](./public/images/principal.png)

Dashboard local y privado para explorar tu **historial extendido de streaming de Spotify**. Procesa tus archivos JSON, genera estadísticas y las muestra en una interfaz visual — sin subir tus datos a ningún servidor.

---

## ¿Qué puedes ver?

| Sección | Descripción |
|---------|-------------|
| **Resumen** | Reproducciones totales, horas escuchadas, artistas, álbumes y podcasts |
| **Evolución anual** | Reproducciones y horas por año (2015 → hoy) |
| **Tendencia mensual** | Actividad mes a mes |
| **Rankings** | Top 50 artistas, canciones y álbumes (por plays y por tiempo) |
| **Plataformas y países** | iOS, Android, macOS, código de país de conexión |
| **Hábitos** | Skip rate, shuffle, offline, sesión privada |
| **Patrones** | Hora del día y día de la semana |
| **Géneros** *(opcional)* | Tendencia por género a lo largo de los años — requiere API de Spotify |

> Tus datos **nunca salen de tu ordenador**. Todo se procesa en local.

---

## Requisitos

- [Node.js](https://nodejs.org/) **18 o superior**
- Tu exportación de **Extended Streaming History** de Spotify

---

## Inicio rápido

### 1. Clona o descarga el proyecto

```bash
git clone <url-del-repositorio>
cd spotify-data-viewer
```

### 2. Instala dependencias

```bash
npm install
```

### 3. Importa tus datos

1. Solicita tu historial en [Spotify → Privacidad de la cuenta](https://www.spotify.com/account/privacy/) → **Extended streaming history**.
2. Cuando llegue el correo, descarga el ZIP y descomprímelo.
3. Copia **todos los archivos JSON** dentro de la carpeta `data/` del proyecto:

```
spotify-data-viewer/
└── data/
    ├── Streaming_History_Audio_2015.json
    ├── Streaming_History_Audio_2016.json
    ├── Streaming_History_Audio_2016_1.json
    ├── Streaming_History_Video_2024.json
    ├── ReadMeFirst_ExtendedStreamingHistory.pdf   ← opcional
    └── ...
```

**Importante:**
- Solo hacen falta archivos que empiecen por `Streaming_History_`.
- Puedes tener muchos archivos (Spotify divide el historial en trozos de ~12 MB).
- No renombres los archivos; el script los detecta automáticamente.

### 4. Arranca el dashboard

```bash
npm run dev
```

Abre **http://localhost:3000** en el navegador.

La primera vez procesará todos los JSON y generará `public/stats.json`. Si añades datos nuevos, vuelve a ejecutar `npm run aggregate` o reinicia con `npm run dev`.

---

## Géneros (opcional)

El export de Spotify **no incluye géneros musicales**. Para ver la sección *"Tendencia de géneros a lo largo de los años"*:

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
2. Crea una app en el [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
3. Añade tus credenciales al `.env`:
   ```env
   SPOTIFY_CLIENT_ID=tu_client_id
   SPOTIFY_CLIENT_SECRET=tu_client_secret
   ```
4. Ejecuta de nuevo:
   ```bash
   npm run aggregate
   npm run dev
   ```

La primera consulta a la API puede tardar varios minutos (se cachean los géneros en `data/genre-cache.json`). Las siguientes ejecuciones serán rápidas.

**Sin `.env` o sin credenciales Spotify → la sección de géneros no aparece.** El resto del dashboard funciona igual.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Procesa datos + inicia servidor de desarrollo |
| `npm run build` | Procesa datos + genera build de producción |
| `npm start` | Sirve el build (ejecutar `build` antes) |
| `npm run aggregate` | Solo procesa los JSON y actualiza estadísticas |
| `npm run enrich-genres` | Solo actualiza la caché de géneros (requiere `.env`) |

---

## Cómo funciona

```
data/*.json  →  scripts/aggregate-data.mjs  →  public/stats.json  →  Dashboard Next.js
                      ↑
              data/genre-cache.json (opcional, vía API Spotify)
```

1. **Lectura** — Recorre todos los `Streaming_History_*.json` en `data/`.
2. **Agregación** — Calcula totales, rankings, tendencias anuales/mensuales, hábitos, etc.
3. **Géneros** *(si hay credenciales)* — Consulta la API de Spotify por artista y guarda caché local.
4. **Visualización** — Next.js lee `public/stats.json` y renderiza el dashboard.

---

## Campos del historial que se analizan

Basado en el [Extended Streaming History](https://support.spotify.com/account/privacy/) de Spotify:

`ts` · `ms_played` · `platform` · `conn_country` · metadatos de track/álbum/artista · podcasts · audiolibros · `reason_start` / `reason_end` · `shuffle` · `skipped` · `offline` · `incognito_mode`

---

## Privacidad

- Los archivos de `data/` y `.env` están en `.gitignore` — no los subas a Git.
- El procesamiento es 100 % local.
- La API de Spotify solo se usa para obtener géneros de artistas (opcional); no se envía tu historial completo.

---

## Producción

```bash
npm run build
npm start
```

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| Pantalla vacía o error al cargar | Ejecuta `npm run aggregate` y comprueba que hay JSON en `data/` |
| No aparecen géneros | Crea `.env` con `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET` |
| Datos desactualizados | Añade los JSON nuevos a `data/` y ejecuta `npm run aggregate` |
| La primera vez con géneros tarda mucho | Es normal; consulta ~11k artistas. La caché acelera las siguientes veces |

---

## Licencia

Proyecto de uso personal. Los datos de streaming son tuyos; este tool solo los visualiza localmente.
