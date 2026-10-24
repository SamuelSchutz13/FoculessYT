export default {
  app: {
    footer: 'O vídeo passa pelo servidor só durante o download e é apagado logo em seguida. Nada fica salvo.',
    homeTitle: 'Baixar vídeos do YouTube',
    github: 'Código-fonte no GitHub',
  },
  theme: {
    toDark: 'Ativar modo escuro',
    toLight: 'Ativar modo claro',
  },
  home: {
    title: 'Vídeos do YouTube, sem distração',
    subtitle: 'Cole o link, escolha o formato e pronto. Nada de anúncios, rastreadores ou cadastro.',
    noAds: 'Sem anúncios',
    noTelemetry: 'Sem telemetria',
    noSignup: 'Sem cadastro',
  },
  form: {
    url: 'Link do vídeo',
    urlPlaceholder: 'https://www.youtube.com/watch?v=…',
    format: 'Formato',
    formats: {
      mp4: 'MP4 (vídeo)',
      mp3: 'MP3 (só o áudio)',
    },
    quality: 'Qualidade máxima',
    qualities: {
      '1080': '1080p (Full HD)',
      '720': '720p (HD)',
      '480': '480p',
      '360': '360p (arquivo menor)',
      best: 'A melhor disponível (até 4K, arquivo grande)',
    },
    submit: 'Baixar',
    fetching: 'Baixando do YouTube…',
    receiving: 'Recebendo… {percent}%',
    progress: 'Progresso do download',
    done: 'Pronto! {filename} foi baixado.',
    failed: 'Não foi possível baixar o vídeo',
  },
  api: {
    unreachable: 'Não foi possível conectar à API. Ela está rodando?',
    unexpected: 'Erro inesperado. Tente novamente.',
    status: 'Erro {status} ao baixar o vídeo.',
  },
}
