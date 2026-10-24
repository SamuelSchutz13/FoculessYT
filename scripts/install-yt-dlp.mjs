// Downloads the standalone yt-dlp binary (no Python needed) into bin/, checking its SHA-256
// against the release's checksum list. Runs on `npm install`; `--force` updates it.
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { chmod, mkdir, writeFile } from 'node:fs/promises';
import { arch, platform } from 'node:process';

const ASSETS = {
  win32: 'yt-dlp.exe',
  darwin: 'yt-dlp_macos',
  linux: arch === 'arm64' ? 'yt-dlp_linux_aarch64' : 'yt-dlp_linux',
};
const RELEASE = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download';

const asset = ASSETS[platform];
const target = `bin/${platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'}`;

if (process.env.YTDLP_PATH) {
  console.log(`yt-dlp: using YTDLP_PATH=${process.env.YTDLP_PATH}`);
} else if (!asset) {
  console.warn(`yt-dlp: no binary for ${platform}; install it and set YTDLP_PATH`);
} else if (existsSync(target) && !process.argv.includes('--force')) {
  console.log(`yt-dlp: ${target} already installed (npm run yt-dlp:update to update)`);
} else {
  const download = async (name) => {
    const response = await fetch(`${RELEASE}/${name}`);
    if (!response.ok) throw new Error(`yt-dlp: downloading ${name} failed (${response.status})`);
    return Buffer.from(await response.arrayBuffer());
  };

  const [binary, sums] = await Promise.all([download(asset), download('SHA2-256SUMS')]);
  const expected = sums
    .toString()
    .split('\n')
    .find((line) => line.trim().endsWith(` ${asset}`))
    ?.split(' ')[0];
  const actual = createHash('sha256').update(binary).digest('hex');
  if (actual !== expected) throw new Error(`yt-dlp: checksum mismatch for ${asset}`);

  await mkdir('bin', { recursive: true });
  await writeFile(target, binary);
  await chmod(target, 0o755);
  console.log(`yt-dlp: installed ${target}`);
}
