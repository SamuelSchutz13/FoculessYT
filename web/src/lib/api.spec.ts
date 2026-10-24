import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { beforeAll, describe, expect, it } from 'vitest'
import { i18n } from '@/i18n'
import { errorMessages, filenameFrom } from './api'

const responseWith = (status: number, data: unknown) =>
  ({ status, data, headers: {}, statusText: '', config: { headers: new AxiosHeaders() } }) as AxiosResponse

const axiosError = (response?: AxiosResponse) =>
  new AxiosError('failed', 'ERR', undefined, undefined, response)

describe('filenameFrom', () => {
  it('prefers the UTF-8 filename', () => {
    expect(
      filenameFrom(`attachment; filename="Can__o.mp3"; filename*=UTF-8''Can%C3%A7%C3%A3o%20%F0%9F%8E%B5.mp3`),
    ).toBe('Canção 🎵.mp3')
  })

  it('falls back to the plain filename', () => {
    expect(filenameFrom('attachment; filename="video.mp4"')).toBe('video.mp4')
  })

  it('returns undefined when the header is missing', () => {
    expect(filenameFrom(undefined)).toBeUndefined()
  })
})

describe('errorMessages', () => {
  beforeAll(() => {
    i18n.global.locale.value = 'pt-BR'
  })

  it('reads the API message list from a Blob body', async () => {
    const body = new Blob([JSON.stringify({ statusCode: 422, message: ['This video is unavailable'] })])
    expect(await errorMessages(axiosError(responseWith(422, body)))).toEqual([
      'This video is unavailable',
    ])
  })

  it('falls back to the status when the body is not the API format', async () => {
    expect(await errorMessages(axiosError(responseWith(502, new Blob(['<html>']))))).toEqual([
      'Erro 502 ao baixar o vídeo.',
    ])
  })

  it('explains when the API is unreachable', async () => {
    expect(await errorMessages(axiosError())).toEqual([
      'Não foi possível conectar à API. Ela está rodando?',
    ])
  })
})
