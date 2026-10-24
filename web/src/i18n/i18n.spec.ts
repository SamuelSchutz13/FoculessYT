import { describe, expect, it } from 'vitest'
import { formats, qualities } from '@/lib/api'
import { i18n, locales } from '.'

// en.ts is typed against pt-BR.ts, so both have the same keys; this checks that every
// option the form offers (from lib/api.ts) has its text in those messages.
describe.each(locales)('%s messages', (locale) => {
  const has = (key: string) => i18n.global.te(key, locale)

  it.each(formats)('cover the "%s" format', (format) => {
    expect(has(`form.formats.${format}`)).toBe(true)
  })

  it.each(qualities)('cover the "%s" quality', (quality) => {
    expect(has(`form.qualities.${quality}`)).toBe(true)
  })
})
