import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../../assets/tutorials/', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
const names = new Set();
for (const video of manifest.videos) {
  assert.ok(!names.has(video.file), `Duplicate tutorial: ${video.file}`);
  names.add(video.file);
  for (const name of [video.file, video.poster, video.captions]) {
    assert.equal(path.basename(name), name, 'Tutorial paths must be plain filenames');
    assert.ok((await stat(path.join(root, name))).size > 0, `Empty tutorial asset: ${name}`);
  }
  const image = await sharp(path.join(root, video.poster)).metadata();
  assert.equal(image.width, video.width);
  assert.equal(image.height, video.height);
  const vtt = await readFile(path.join(root, video.captions), 'utf8');
  assert.ok(vtt.startsWith('WEBVTT\n'), `Invalid captions: ${video.captions}`);
  const timing = [...vtt.matchAll(/(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})/g)];
  assert.ok(timing.length > 0, 'No subtitle cues');
  let previousEnd = 0;
  for (const cue of timing) {
    const time = offset => Number(cue[offset])*3600 + Number(cue[offset+1])*60 + Number(cue[offset+2]) + Number(cue[offset+3])/1000;
    const start = time(1), end = time(5);
    assert.ok(start >= previousEnd && end > start && end <= video.duration, `Invalid cue bounds: ${video.captions}`);
    previousEnd = end;
  }
  if (process.argv.includes('--probe')) {
    const data = JSON.parse(execFileSync('ffprobe', ['-v','error','-show_streams','-show_format','-of','json',path.join(root,video.file)], {encoding:'utf8'}));
    const stream = data.streams.find(s=>s.codec_type==='video');
    assert.equal(stream.codec_name,'h264');
    assert.equal(stream.width,video.width); assert.equal(stream.height,video.height);
    assert.ok(Math.abs(Number(data.format.duration)-video.duration)<0.1,'Unexpected video duration');
  }
  console.log(`Verified tutorial: ${video.file} (${video.duration}s), poster and ${timing.length} subtitle cues`);
}
