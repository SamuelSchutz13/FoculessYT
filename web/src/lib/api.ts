import axios, { AxiosError } from 'axios'
import { i18n } from '@/i18n'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
})

const { t } = i18n.global

export const formats = ['mp4', 'mp3'] as const
export const qualities = ['1080', '720', '480', '360', 'best'] as const

export interface DownloadRequest {
  url: string
  format: (typeof formats)[number]
  quality: (typeof qualities)[number]
}

export interface DownloadResult {
  blob: Blob
  filename: string
}

/** Error with the API's message list, ready to show to the user. */
export class ApiError extends Error {
  readonly messages: string[]

  constructor(messages: string[]) {
    super(messages.join('\n'))
    this.messages = messages
  }
}

/**
 * Asks the API for the video. The server first downloads it from YouTube (no progress),
 * then sends it, which is when onProgress reports the percentage.
 */
export async function downloadVideo(
  body: DownloadRequest,
  onProgress?: (percent: number) => void,
): Promise<DownloadResult> {
  try {
    const response = await api.post<Blob>('/download', body, {
      responseType: 'blob',
      onDownloadProgress: ({ loaded, total }) => {
        if (total) onProgress?.(Math.round((loaded / total) * 100))
      },
    })
    return {
      blob: response.data,
      filename: filenameFrom(response.headers['content-disposition']) ?? `video.${body.format}`,
    }
  } catch (error) {
    throw new ApiError(await errorMessages(error))
  }
}

/** Prefers the UTF-8 name (filename*), which keeps accents and emoji from the video title. */
export function filenameFrom(contentDisposition?: string): string | undefined {
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition ?? '')?.[1]
  if (utf8) return decodeURIComponent(utf8)
  return /filename="([^"]+)"/.exec(contentDisposition ?? '')?.[1]
}

export async function errorMessages(error: unknown): Promise<string[]> {
  if (!(error instanceof AxiosError)) return [t('api.unexpected')]
  if (!error.response) return [t('api.unreachable')]

  // With responseType "blob", error bodies arrive as a Blob too, so the JSON is read back.
  const data: unknown = error.response.data
  try {
    const body = JSON.parse(data instanceof Blob ? await data.text() : JSON.stringify(data))
    if (Array.isArray(body?.message)) return body.message
  } catch {
    // Not JSON (e.g. a proxy error page): fall through to the generic message.
  }
  return [t('api.status', { status: error.response.status })]
}
