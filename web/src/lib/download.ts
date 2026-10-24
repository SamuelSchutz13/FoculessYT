import type { DownloadResult } from './api'

export function saveFile({ blob, filename }: DownloadResult): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  // Revoke on the next tick: some browsers still read the URL right after click().
  setTimeout(() => URL.revokeObjectURL(url))
}
