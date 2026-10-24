import { spawn } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import ffmpegPath from 'ffmpeg-static';
import { env } from '../../config/env';
import { type DownloadDto, DownloadFormat, VideoQuality } from './dto/download.dto';

export interface DownloadedFile {
  path: string;
  filename: string;
  size: number;
}

export function ytDlpArgs({ url, format, quality }: DownloadDto, dir: string): string[] {
  const media =
    format === DownloadFormat.Mp3
      ? ['-f', 'bestaudio/best', '-x', '--audio-format', 'mp3', '--audio-quality', '0']
      : [
          // Prefers H.264/AAC in MP4, which every player opens, over VP9/AV1 at the same height.
          '-S',
          quality === VideoQuality.Best ? 'ext:mp4:m4a' : `res:${quality},ext:mp4:m4a`,
          '--merge-output-format',
          'mp4',
        ];

  return [
    '--ignore-config',
    '--no-playlist',
    '--no-progress',
    '--quiet',
    // Live streams never end, so they would hold the request open forever.
    '--match-filter',
    '!is_live',
    '--max-filesize',
    `${env.maxFileSizeMb}M`,
    '--concurrent-fragments',
    '4',
    // YouTube needs a JS runtime to solve its player challenges; this one is already running.
    '--js-runtimes',
    `node:${process.execPath}`,
    ...(ffmpegPath ? ['--ffmpeg-location', ffmpegPath] : []),
    ...media,
    '-P',
    dir,
    '-o',
    '%(title).150B.%(ext)s',
    '--',
    url,
  ];
}

/** "ERROR: [youtube] abc: Video unavailable" → "Video unavailable". */
export function ytDlpError(stderr: string): string {
  const line = stderr
    .split('\n')
    .reverse()
    .find((text) => text.startsWith('ERROR:'));
  if (!line) return 'Could not download this video';
  return line.replace(/^ERROR:\s*(\[[^\]]+\]\s*[\w-]+:\s*)?/, '').trim();
}

@Injectable()
export class DownloadService {
  /** Downloads the video into dir (which the caller deletes) and returns the resulting file. */
  async download(dto: DownloadDto, dir: string, signal: AbortSignal): Promise<DownloadedFile> {
    await run(env.ytDlpPath, ytDlpArgs(dto, dir), signal);

    // Skipped videos (live, or over --max-filesize) exit with 0 and leave no file.
    const [filename] = (await readdir(dir)).filter((name) => !name.endsWith('.part'));
    if (!filename) {
      throw new UnprocessableEntityException(
        `Live streams and videos over ${env.maxFileSizeMb} MB can't be downloaded`,
      );
    }
    const path = join(dir, filename);
    return { path, filename, size: (await stat(path)).size };
  }
}

/** Runs yt-dlp; a failing exit becomes a 422 with its error message. */
function run(command: string, args: string[], signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { signal, windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new UnprocessableEntityException(ytDlpError(stderr)));
    });
  });
}
