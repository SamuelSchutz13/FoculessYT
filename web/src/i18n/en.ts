import type ptBR from './pt-BR'

// Typed against the Portuguese messages so a missing or misspelled key fails the type-check.
const en: typeof ptBR = {
  app: {
    footer: 'The video only passes through the server while downloading and is deleted right after. Nothing is stored.',
    homeTitle: 'Download YouTube videos',
    github: 'Source code on GitHub',
  },
  theme: {
    toDark: 'Switch to dark mode',
    toLight: 'Switch to light mode',
  },
  home: {
    title: 'YouTube videos, without the distractions',
    subtitle: 'Paste the link, pick the format and you are done. No ads, no trackers, no sign-up.',
    noAds: 'No ads',
    noTelemetry: 'No telemetry',
    noSignup: 'No sign-up',
  },
  form: {
    url: 'Video link',
    urlPlaceholder: 'https://www.youtube.com/watch?v=…',
    format: 'Format',
    formats: {
      mp4: 'MP4 (video)',
      mp3: 'MP3 (audio only)',
    },
    quality: 'Maximum quality',
    qualities: {
      '1080': '1080p (Full HD)',
      '720': '720p (HD)',
      '480': '480p',
      '360': '360p (smaller file)',
      best: 'Best available (up to 4K, large file)',
    },
    submit: 'Download',
    fetching: 'Downloading from YouTube…',
    receiving: 'Receiving… {percent}%',
    progress: 'Download progress',
    done: 'Done! {filename} was downloaded.',
    failed: 'Could not download the video',
  },
  api: {
    unreachable: 'Could not reach the API. Is it running?',
    unexpected: 'Unexpected error. Please try again.',
    status: 'Error {status} while downloading the video.',
  },
}

export default en
