<p align="center">
  <img src="web/public/favicon.svg" alt="" width="72" />
</p>

<h1 align="center">FoculessYT</h1>

<p align="center">
  <b>English</b> · <a href="README.pt-BR.md">Português (Brasil)</a>
</p>

<p align="center">
  YouTube downloads with no ads, no telemetry and no sign-up: paste the link, get the MP4 or the MP3.
</p>

<p align="center">
  <img alt="NestJS 12" src="https://img.shields.io/badge/NestJS-12-e0234e?logo=nestjs&logoColor=white" />
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" />
  <img alt="Node.js 22.13+" src="https://img.shields.io/badge/Node.js-22.13%2B-5fa04e?logo=nodedotjs&logoColor=white" />
  <img alt="yt-dlp" src="https://img.shields.io/badge/engine-yt--dlp-ff0000" />
  <img alt="Swagger" src="https://img.shields.io/badge/docs-Swagger-85ea2d?logo=swagger&logoColor=black" />
</p>

> [!NOTE]
> **Videos are never kept.** Each download goes to its own temporary folder on the server, is streamed to you and deleted as soon as the response ends (or as soon as you close the page). The site uses no analytics, no tracking cookies and no third-party fonts or scripts.

> [!IMPORTANT]
> Only download videos you have the right to: your own, Creative Commons or with the author's permission. YouTube's terms of service forbid downloading other content.

## Features

- **MP4 video** up to 1080p, 720p, 480p or 360p, preferring H.264/AAC so every player opens it, or the **best available** quality (up to 4K, VP9/AV1).
- **MP3 audio** at the best quality.
- File named after the video title, accents and emoji included.
- Links from `youtube.com`, `youtu.be`, `m.youtube.com` and `music.youtube.com`, including Shorts. Playlists download only the video in the link.
- **Website** in English and Portuguese, with pastel **light and dark modes** and transfer progress.
- **Documented API** with Swagger at `/docs`.

## Getting started

All you need is [Node.js](https://nodejs.org) **22.13 or newer**. `npm install` downloads the [yt-dlp](https://github.com/yt-dlp/yt-dlp) binary (checking its SHA-256) into `bin/` and ffmpeg comes from [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static). No Python and nothing to install by hand.

```sh
git clone https://github.com/SamuelSchutz13/FoculessYT.git
cd FoculessYT

# terminal 1: API (http://localhost:3000, docs at /docs)
npm install
npm run start:dev

# terminal 2: website (http://localhost:5173)
cd web
npm install
npm run dev
```

Open **http://localhost:5173**.

> [!TIP]
> YouTube changes often and old yt-dlp versions stop working. When downloads start failing, run `npm run yt-dlp:update`.

### Configuration

Every variable has a default. To change one, copy `.env.example` to `.env`, at the root for the API or in `web/` for the website.

| Where   | Variable                | Default                        | Description                                   |
| ------- | ----------------------- | ------------------------------ | --------------------------------------------- |
| API     | `PORT`                  | `3000`                         | API port                                      |
| API     | `CORS_ORIGINS`          | `http://localhost:5173`        | Allowed website origins, comma-separated      |
| API     | `MAX_FILE_SIZE_MB`      | `1024`                         | Largest video yt-dlp may download             |
| API     | `RATE_LIMIT_PER_MINUTE` | `10`                           | Downloads per minute, per IP                  |
| API     | `YTDLP_PATH`            | `bin/yt-dlp`                   | Another yt-dlp binary (e.g. a system install) |
| Website | `VITE_API_URL`          | `http://localhost:3000/api/v1` | API address                                   |

An invalid value (e.g. `PORT=abc`) stops the API from starting, with a message naming the variable.

### Scripts

| Folder | Command                 | What it does                                       |
| ------ | ----------------------- | -------------------------------------------------- |
| root   | `npm run start:dev`     | API with hot reload                                |
| root   | `npm run build`         | Builds the API into `dist/`                        |
| root   | `npm run start:prod`    | Runs the API build                                 |
| root   | `npm run yt-dlp:update` | Downloads the latest yt-dlp                        |
| root   | `npm test`              | API unit tests                                     |
| root   | `npm run test:e2e`      | API end-to-end (HTTP) tests                        |
| root   | `npm run lint`          | Biome: lint, formatting and import sorting         |
| `web`  | `npm run dev`           | Website in development mode                        |
| `web`  | `npm test`              | Tests for the API client and the translations      |
| `web`  | `npm run build`         | Type checking and production build into `web/dist` |

## How it works

```
web/   Vue 3 + Vite + shadcn-vue   →  JSON  →   NestJS API (/api/v1)   →  yt-dlp + ffmpeg  →  temp folder  →  stream
```

- **Why yt-dlp**: it is the fastest and the only tool that keeps up with YouTube's changes; pure JavaScript libraries (ytdl-core and forks) break every few weeks. Downloads use 4 parallel fragments, and YouTube's player challenges are solved by the Node.js that already runs the API (`--js-runtimes node`), so Deno is not needed.
- **Safety**: only YouTube links reach yt-dlp (it supports ~1800 sites, which would turn the API into a generic downloader). yt-dlp runs without a shell, with `--ignore-config` and the URL after `--`. Live streams and videos over `MAX_FILE_SIZE_MB` are refused.
- **Errors**: every error response has the same shape, with `message` always a list.

  ```json
  { "statusCode": 422, "error": "Unprocessable Entity", "message": ["This video is unavailable"] }
  ```

- **API protection**: rate limiting per IP (`429` with `Retry-After`), security headers with helmet, and CORS restricted to the configured origins.

### Endpoints (`/api/v1`)

| Method | Route       | Input (JSON)                                                         | Output    |
| ------ | ----------- | -------------------------------------------------------------------- | --------- |
| GET    | `/health`   | —                                                                    | JSON      |
| POST   | `/download` | `url`, `format?` (`mp4`, `mp3`), `quality?` (`1080`, `720`, `480`, `360`, `best`) | MP4 / MP3 |

```sh
curl -OJ -H 'content-type: application/json' \
  -d '{"url":"https://youtu.be/jNQXAC9IVRw","format":"mp3"}' \
  http://localhost:3000/api/v1/download
```

### Project structure

```
src/                          API (NestJS)
  main.ts, app.module.ts      bootstrap and module registration
  app.setup.ts                prefix, versioning, validation, CORS, helmet, Swagger (also used by e2e)
  config/env.ts               reading and validating .env
  common/filters/             single error shape (+ tests)
  modules/download/           controller, service (yt-dlp arguments and errors, + tests) and DTO
scripts/install-yt-dlp.mjs    downloads and verifies the yt-dlp binary
test/app.e2e-spec.ts          end-to-end HTTP tests
web/                          website (Vue) — details in web/README.md
```

## Known limitations

- The website receives the whole file before saving it, so very long videos in high quality use as much memory in the browser as the file's size.
- No progress is shown while the server is fetching from YouTube, only during the transfer to the browser.
- Age-restricted, private and members-only videos need a signed-in account and are not supported.
- Downloads that run at the same time are not limited beyond the rate limit; on a public server, keep `RATE_LIMIT_PER_MINUTE` low.
- Rate limiting lives in the process memory. Behind a proxy you need to enable `trust proxy`; with more than one API instance, move the limits to Redis.
- On Windows, network filters such as AdGuard intercept `localhost` and make the e2e tests fail now and then with `ECONNRESET`. Add `node.exe` to its exceptions.

## Credits

- Downloads: [yt-dlp](https://github.com/yt-dlp/yt-dlp) (Unlicense) and [FFmpeg](https://ffmpeg.org) via [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static) (GPL).
- API: [NestJS](https://nestjs.com). Website: [Vue](https://vuejs.org), [Vite](https://vite.dev) and [Tailwind CSS](https://tailwindcss.com).
- UI components: [shadcn-vue](https://www.shadcn-vue.com) and [Reka UI](https://reka-ui.com). Icons: [Lucide](https://lucide.dev) and the GitHub mark from [Octicons](https://github.com/primer/octicons) (MIT).
- Font: [Geist](https://vercel.com/font) by Vercel (SIL Open Font License), served by the website itself.
- Same structure as [FoculessPDF](https://github.com/SamuelSchutz13/FoculessPDF).
