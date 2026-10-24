import { createReadStream } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Body, Controller, HttpCode, HttpStatus, Post, Res, StreamableFile } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { DownloadService } from './download.service';
import { DownloadDto, DownloadFormat } from './dto/download.dto';

/** ASCII fallback plus the UTF-8 name, so titles with accents or emoji survive. */
export function contentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7e]|["\\]/g, '_');
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

@ApiTags('Download')
@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download a YouTube video as MP4 or its audio as MP3' })
  @ApiProduces('video/mp4', 'audio/mpeg')
  @ApiOkResponse({ schema: { type: 'string', format: 'binary' } })
  @ApiBadRequestResponse({ description: 'Not a YouTube link or invalid parameters' })
  @ApiUnprocessableEntityResponse({ description: 'Video unavailable, live or too big' })
  async download(
    @Body() dto: DownloadDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    // The file only lives here until the response ends; a client that gives up stops yt-dlp.
    const dir = await mkdtemp(join(tmpdir(), 'foculess-yt-'));
    const abort = new AbortController();
    res.on('close', () => {
      abort.abort();
      void rm(dir, { recursive: true, force: true, maxRetries: 3 });
    });

    const file = await this.downloadService.download(dto, dir, abort.signal);
    return new StreamableFile(createReadStream(file.path), {
      type: dto.format === DownloadFormat.Mp3 ? 'audio/mpeg' : 'video/mp4',
      disposition: contentDisposition(file.filename),
      length: file.size,
    });
  }
}
