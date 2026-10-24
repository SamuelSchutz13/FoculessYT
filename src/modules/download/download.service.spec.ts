import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { contentDisposition } from './download.controller';
import { ytDlpArgs, ytDlpError } from './download.service';
import { DownloadDto, DownloadFormat, VideoQuality } from './dto/download.dto';

const dto = (body: object) => plainToInstance(DownloadDto, body);
const url = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';

describe('DownloadDto', () => {
  it.each([
    url,
    'https://youtu.be/jNQXAC9IVRw',
    'https://m.youtube.com/shorts/abc123',
    'https://music.youtube.com/watch?v=abc',
  ])('accepts %s', (link) => {
    expect(validateSync(dto({ url: link }))).toEqual([]);
  });

  it.each([
    'https://vimeo.com/123',
    'https://youtube.com.evil.com/watch?v=abc',
    'file:///etc/passwd',
    '--exec=calc youtube.com',
    'youtube.com/watch?v=abc',
  ])('rejects %s', (link) => {
    expect(validateSync(dto({ url: link }))).not.toEqual([]);
  });

  it('defaults to a 1080p MP4', () => {
    expect(dto({ url })).toMatchObject({ format: DownloadFormat.Mp4, quality: VideoQuality.P1080 });
  });
});

describe('ytDlpArgs', () => {
  it('caps the height and merges into MP4', () => {
    const args = ytDlpArgs(dto({ url, quality: '720' }), '/tmp/x');
    expect(args).toEqual(expect.arrayContaining(['-S', 'res:720,ext:mp4:m4a']));
    expect(args).toEqual(expect.arrayContaining(['--merge-output-format', 'mp4']));
  });

  it('extracts MP3 audio', () => {
    const args = ytDlpArgs(dto({ url, format: 'mp3' }), '/tmp/x');
    expect(args).toEqual(expect.arrayContaining(['-x', '--audio-format', 'mp3']));
    expect(args).not.toContain('--merge-output-format');
  });

  it('ends with the URL after "--", so it is never read as an option', () => {
    expect(ytDlpArgs(dto({ url }), '/tmp/x').slice(-2)).toEqual(['--', url]);
  });
});

describe('ytDlpError', () => {
  it('keeps only the reason from the last ERROR line', () => {
    const stderr = 'WARNING: something\nERROR: [youtube] jNQXAC9IVRw: Video unavailable\n';
    expect(ytDlpError(stderr)).toBe('Video unavailable');
  });

  it('falls back to a generic message', () => {
    expect(ytDlpError('')).toBe('Could not download this video');
  });
});

describe('contentDisposition', () => {
  it('sends an ASCII name and the UTF-8 name', () => {
    expect(contentDisposition('Canção "ao vivo" 🎵.mp3')).toBe(
      `attachment; filename="Can__o _ao vivo_ __.mp3"; filename*=UTF-8''Can%C3%A7%C3%A3o%20%22ao%20vivo%22%20%F0%9F%8E%B5.mp3`,
    );
  });
});
