// Rectangular extraction only. Keep screenshots at their captured pixel resolution.
import sharp from '../../frontend/node_modules/sharp/lib/index.js';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const base=path.dirname(fileURLToPath(import.meta.url));
if(!process.argv[2])throw Error('Usage: node docs/media-production/crop-collaboration-screenshots.mjs /path/to/full-screenshots');
const source=path.resolve(process.argv[2]);
const {crops,sourceSize}=JSON.parse(await readFile(path.join(base,'capture/crops-2026-10-24-collaboration.json'),'utf8'));
for(const[name,rect]of Object.entries(crops)){
 const file=path.join(source,`${name}-full.jpg`);const meta=await sharp(file).metadata();
 if(meta.width!==sourceSize[0]||meta.height!==sourceSize[1])throw Error(`Recheck crop geometry for ${name}: ${meta.width}x${meta.height}`);
 await sharp(file).extract(rect).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toFile(path.join(base,'../../assets/tutorials',`${name}.jpg`));
}
