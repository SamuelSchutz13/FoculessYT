import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUrl } from 'class-validator';

export enum DownloadFormat {
  Mp4 = 'mp4',
  Mp3 = 'mp3',
}

/** Maximum video height; "best" has no limit. Ignored for MP3. */
export enum VideoQuality {
  Best = 'best',
  P1080 = '1080',
  P720 = '720',
  P480 = '480',
  P360 = '360',
}

/** Only YouTube links reach yt-dlp, which would otherwise fetch from ~1800 other sites. */
export const YOUTUBE_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
];

export class DownloadDto {
  @ApiProperty({ example: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true, host_whitelist: YOUTUBE_HOSTS },
    { message: 'url must be a YouTube link' },
  )
  url: string;

  @ApiProperty({ enum: DownloadFormat, default: DownloadFormat.Mp4, required: false })
  @IsOptional()
  @IsEnum(DownloadFormat)
  format: DownloadFormat = DownloadFormat.Mp4;

  @ApiProperty({ enum: VideoQuality, default: VideoQuality.P1080, required: false })
  @IsOptional()
  @IsEnum(VideoQuality)
  quality: VideoQuality = VideoQuality.P1080;
}
