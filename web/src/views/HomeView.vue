<script setup lang="ts">
import { Download, EyeOff, LoaderCircle, MegaphoneOff, UserX } from '@lucide/vue'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ApiError, type DownloadRequest, downloadVideo, formats, qualities } from '@/lib/api'
import { saveFile } from '@/lib/download'

const { t } = useI18n()

const promises = [
  { icon: MegaphoneOff, key: 'home.noAds' },
  { icon: EyeOff, key: 'home.noTelemetry' },
  { icon: UserX, key: 'home.noSignup' },
]

const form = reactive<DownloadRequest>({ url: '', format: 'mp4', quality: '1080' })
/** Null when idle, 0 while the server fetches from YouTube, then the transfer percentage. */
const progress = ref<number | null>(null)

async function submit() {
  if (progress.value !== null || !form.url.trim()) return
  progress.value = 0
  try {
    const result = await downloadVideo({ ...form, url: form.url.trim() }, (percent) => {
      progress.value = percent
    })
    saveFile(result)
    toast.success(t('form.done', { filename: result.filename }))
  } catch (error) {
    const messages = error instanceof ApiError ? error.messages : [t('api.unexpected')]
    toast.error(t('form.failed'), { description: messages.join('\n') })
  } finally {
    progress.value = null
  }
}
</script>

<template>
  <section class="mx-auto max-w-2xl py-10 text-center">
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ t('home.title') }}</h1>
    <p class="mt-3 text-muted-foreground">{{ t('home.subtitle') }}</p>
    <ul class="mt-6 flex flex-wrap justify-center gap-2">
      <li
        v-for="promise in promises"
        :key="promise.key"
        class="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
      >
        <component :is="promise.icon" class="size-4" aria-hidden="true" />
        {{ t(promise.key) }}
      </li>
    </ul>
  </section>

  <Card class="mx-auto max-w-2xl">
    <CardContent>
      <form class="flex flex-col gap-5" @submit.prevent="submit">
        <div class="flex flex-col gap-2">
          <Label for="url">{{ t('form.url') }}</Label>
          <Input
            id="url"
            v-model="form.url"
            type="url"
            required
            autocomplete="off"
            :placeholder="t('form.urlPlaceholder')"
            :disabled="progress !== null"
          />
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="flex flex-col gap-2">
            <Label for="format">{{ t('form.format') }}</Label>
            <Select v-model="form.format" :disabled="progress !== null">
              <SelectTrigger id="format" class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="format in formats" :key="format" :value="format">
                  {{ t(`form.formats.${format}`) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-2">
            <Label for="quality">{{ t('form.quality') }}</Label>
            <Select v-model="form.quality" :disabled="progress !== null || form.format === 'mp3'">
              <SelectTrigger id="quality" class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="quality in qualities" :key="quality" :value="quality">
                  {{ t(`form.qualities.${quality}`) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <Button type="submit" size="lg" :disabled="progress !== null || !form.url.trim()">
            <LoaderCircle v-if="progress !== null" class="animate-spin" aria-hidden="true" />
            <Download v-else aria-hidden="true" />
            {{
              progress === null
                ? t('form.submit')
                : progress === 0
                  ? t('form.fetching')
                  : t('form.receiving', { percent: progress })
            }}
          </Button>
          <Progress
            v-if="progress"
            :model-value="progress"
            :aria-label="t('form.progress')"
          />
        </div>
      </form>
    </CardContent>
  </Card>
</template>
