// Only extract rectangles; never redraw, upscale or retouch the product UI.
import sharp from '../../frontend/node_modules/sharp/lib/index.js';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const base=path.dirname(fileURLToPath(import.meta.url));
if(!process.argv[2])throw Error('Usage: node docs/media-production/crop-complete-screenshots.mjs /path/to/full-screenshots');
const source=path.resolve(process.argv[2]);
const crops=JSON.parse(await readFile(path.join(base,'capture/crops-complete.json'),'utf8'));
const records=[];
for(const[name,rect]of Object.entries(crops)){
 const raw=await readFile(path.join(source,name+'-full.jpg'));const meta=await sharp(raw).metadata();
 const out=path.join(base,'../../assets/tutorials',name+'.jpg');
 await sharp(raw).extract(rect).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toFile(out);
 records.push({file:name+'.jpg',sourcePixels:[meta.width,meta.height],crop:rect,sourceSha256:createHash('sha256').update(raw).digest('hex'),outputSha256:createHash('sha256').update(await readFile(out)).digest('hex')});
}
await writeFile(path.join(base,'provenance-complete.json'),JSON.stringify({capturedAt:'2026-10-25',source:'genow-v2 real React components, isolated demo API, Chrome',businessCommit:execFileSync('git',['-C',path.join(base,'../../../genow-v2'),'rev-parse','HEAD'],{encoding:'utf8'}).trim(),notes:['Mixed native viewport sizes; extracted without resizing.','Demo coffee image is illustrative, not an AI output.','Copy scene uses the verified empty-copy structure with separated positions.','No production API, credentials, invites, messages, publication or deletions were submitted.'],records},null,2)+'\n');
console.log('Extracted',records.length,'screenshots');
