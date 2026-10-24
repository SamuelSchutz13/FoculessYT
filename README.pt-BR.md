<p align="center">
  <img src="web/public/favicon.svg" alt="" width="72" />
</p>

<h1 align="center">FoculessYT</h1>

<p align="center">
  <a href="README.md">English</a> · <b>Português (Brasil)</b>
</p>

<p align="center">
  Downloads do YouTube sem anúncios, sem telemetria e sem cadastro: cole o link e receba o MP4 ou o MP3.
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
> **Nenhum vídeo fica guardado.** Cada download vai para uma pasta temporária própria no servidor, é enviado para você e apagado assim que a resposta termina (ou assim que você fecha a página). O site não usa analytics, cookies de rastreamento nem fontes ou scripts de terceiros.

> [!IMPORTANT]
> Baixe só vídeos que você tem direito de baixar: seus, Creative Commons ou com permissão do autor. Os termos de uso do YouTube proíbem baixar outros conteúdos.

## Funcionalidades

- **Vídeo MP4** até 1080p, 720p, 480p ou 360p, preferindo H.264/AAC para abrir em qualquer player, ou a **melhor qualidade disponível** (até 4K, VP9/AV1).
- **Áudio MP3** na melhor qualidade.
- Arquivo com o título do vídeo, com acentos e emoji.
- Links de `youtube.com`, `youtu.be`, `m.youtube.com` e `music.youtube.com`, inclusive Shorts. Em playlists, baixa só o vídeo do link.
- **Site** em português e inglês, com **modos claro e escuro** em tons pastel e progresso da transferência.
- **API documentada** com Swagger em `/docs`.

## Começando

Você só precisa do [Node.js](https://nodejs.org) **22.13 ou mais novo**. O `npm install` baixa o binário do [yt-dlp](https://github.com/yt-dlp/yt-dlp) (conferindo o SHA-256) em `bin/` e o ffmpeg vem do [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static). Sem Python e sem instalar nada à mão.

```sh
git clone https://github.com/SamuelSchutz13/FoculessYT.git
cd FoculessYT

# terminal 1: API (http://localhost:3000, docs em /docs)
npm install
npm run start:dev

# terminal 2: site (http://localhost:5173)
cd web
npm install
npm run dev
```

Abra **http://localhost:5173**.

> [!TIP]
> O YouTube muda com frequência e versões antigas do yt-dlp param de funcionar. Quando os downloads começarem a falhar, rode `npm run yt-dlp:update`.

### Configuração

Toda variável tem um padrão. Para mudar, copie `.env.example` para `.env`, na raiz para a API ou em `web/` para o site.

| Onde | Variável                | Padrão                         | Descrição                                       |
| ---- | ----------------------- | ------------------------------ | ----------------------------------------------- |
| API  | `PORT`                  | `3000`                         | Porta da API                                    |
| API  | `CORS_ORIGINS`          | `http://localhost:5173`        | Origens do site permitidas, separadas por vírgula |
| API  | `MAX_FILE_SIZE_MB`      | `1024`                         | Maior vídeo que o yt-dlp pode baixar            |
| API  | `RATE_LIMIT_PER_MINUTE` | `10`                           | Downloads por minuto, por IP                    |
| API  | `YTDLP_PATH`            | `bin/yt-dlp`                   | Outro binário do yt-dlp (ex.: o do sistema)     |
| Site | `VITE_API_URL`          | `http://localhost:3000/api/v1` | Endereço da API                                 |

Um valor inválido (ex.: `PORT=abc`) impede a API de iniciar, com uma mensagem dizendo qual variável está errada.

### Scripts

| Pasta | Comando                 | O que faz                                      |
| ----- | ----------------------- | ---------------------------------------------- |
| raiz  | `npm run start:dev`     | API com hot reload                             |
| raiz  | `npm run build`         | Compila a API em `dist/`                       |
| raiz  | `npm run start:prod`    | Roda a API compilada                           |
| raiz  | `npm run yt-dlp:update` | Baixa o yt-dlp mais recente                    |
| raiz  | `npm test`              | Testes unitários da API                        |
| raiz  | `npm run test:e2e`      | Testes ponta a ponta (HTTP) da API             |
| raiz  | `npm run lint`          | Biome: lint, formatação e ordem dos imports    |
| `web` | `npm run dev`           | Site em modo de desenvolvimento                |
| `web` | `npm test`              | Testes do cliente da API e das traduções       |
| `web` | `npm run build`         | Checagem de tipos e build de produção em `web/dist` |

## Como funciona

```
web/   Vue 3 + Vite + shadcn-vue   →  JSON  →   API NestJS (/api/v1)   →  yt-dlp + ffmpeg  →  pasta temporária  →  stream
```

- **Por que yt-dlp**: é o mais rápido e o único que acompanha as mudanças do YouTube; bibliotecas em JavaScript puro (ytdl-core e forks) quebram a cada poucas semanas. Os downloads usam 4 fragmentos em paralelo, e os desafios do player do YouTube são resolvidos pelo próprio Node.js que roda a API (`--js-runtimes node`), sem precisar de Deno.
- **Segurança**: só links do YouTube chegam ao yt-dlp (ele aceita ~1800 sites, o que transformaria a API num downloader genérico). O yt-dlp roda sem shell, com `--ignore-config` e a URL depois de `--`. Lives e vídeos acima de `MAX_FILE_SIZE_MB` são recusados.
- **Erros**: toda resposta de erro tem o mesmo formato, com `message` sempre em lista.

  ```json
  { "statusCode": 422, "error": "Unprocessable Entity", "message": ["This video is unavailable"] }
  ```

- **Proteção da API**: limite de requisições por IP (`429` com `Retry-After`), cabeçalhos de segurança com helmet e CORS restrito às origens configuradas.

### Endpoints (`/api/v1`)

| Método | Rota        | Entrada (JSON)                                                       | Saída     |
| ------ | ----------- | -------------------------------------------------------------------- | --------- |
| GET    | `/health`   | —                                                                    | JSON      |
| POST   | `/download` | `url`, `format?` (`mp4`, `mp3`), `quality?` (`1080`, `720`, `480`, `360`, `best`) | MP4 / MP3 |

```sh
curl -OJ -H 'content-type: application/json' \
  -d '{"url":"https://youtu.be/jNQXAC9IVRw","format":"mp3"}' \
  http://localhost:3000/api/v1/download
```

### Estrutura do projeto

```
src/                          API (NestJS)
  main.ts, app.module.ts      inicialização e registro dos módulos
  app.setup.ts                prefixo, versionamento, validação, CORS, helmet, Swagger (também usado no e2e)
  config/env.ts               leitura e validação do .env
  common/filters/             formato único de erro (+ testes)
  modules/download/           controller, service (argumentos e erros do yt-dlp, + testes) e DTO
scripts/install-yt-dlp.mjs    baixa e confere o binário do yt-dlp
test/app.e2e-spec.ts          testes HTTP ponta a ponta
web/                          site (Vue) — detalhes em web/README.md
```

## Limitações conhecidas

- O site recebe o arquivo inteiro antes de salvar, então vídeos muito longos em alta qualidade ocupam no navegador tanta memória quanto o tamanho do arquivo.
- Não há progresso enquanto o servidor baixa do YouTube, só durante a transferência para o navegador.
- Vídeos com restrição de idade, privados ou só para membros exigem login e não são suportados.
- Downloads simultâneos não têm limite além do rate limit; num servidor público, mantenha `RATE_LIMIT_PER_MINUTE` baixo.
- O rate limit fica na memória do processo. Atrás de um proxy é preciso ativar `trust proxy`; com mais de uma instância da API, leve os limites para o Redis.
- No Windows, filtros de rede como o AdGuard interceptam `localhost` e fazem os testes e2e falharem de vez em quando com `ECONNRESET`. Adicione o `node.exe` às exceções.

## Créditos

- Downloads: [yt-dlp](https://github.com/yt-dlp/yt-dlp) (Unlicense) e [FFmpeg](https://ffmpeg.org) via [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static) (GPL).
- API: [NestJS](https://nestjs.com). Site: [Vue](https://vuejs.org), [Vite](https://vite.dev) e [Tailwind CSS](https://tailwindcss.com).
- Componentes: [shadcn-vue](https://www.shadcn-vue.com) e [Reka UI](https://reka-ui.com). Ícones: [Lucide](https://lucide.dev) e o logo do GitHub do [Octicons](https://github.com/primer/octicons) (MIT).
- Fonte: [Geist](https://vercel.com/font), da Vercel (SIL Open Font License), servida pelo próprio site.
- Mesma estrutura do [FoculessPDF](https://github.com/SamuelSchutz13/FoculessPDF).
