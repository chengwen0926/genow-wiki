// Extract observed UI regions from full Chrome screenshots, without retouching.
import sharp from '../../frontend/node_modules/sharp/lib/index.js';
import {readFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const base=path.dirname(fileURLToPath(import.meta.url));
if(!process.argv[2])throw Error('Usage: node docs/media-production/crop-screenshots.mjs /path/to/full-screenshots');
const source=path.resolve(process.argv[2]);
const {crops,sourceSizes}=JSON.parse(await readFile(path.join(base,'capture/crops-2026-10-24-next.json'),'utf8'));
for(const[name,rect]of Object.entries(crops)){
 const file=path.join(source,`${name}-full.jpg`);const meta=await sharp(file).metadata();
 const expected=sourceSizes[name];if(meta.width!==expected[0]||meta.height!==expected[1])throw Error(`Recheck crop geometry for ${name}: ${meta.width}x${meta.height}`);
 await sharp(file).extract(rect).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toFile(path.join(base,'../../assets/tutorials',`${name}.jpg`));
}
await copyFile(path.join(base,'../../assets/tutorials/workflow-imported.jpg'),path.join(base,'workflow-video/assets/workflow-imported.jpg'));
for(const[name,rect]of Object.entries({'workflow-library':{left:80,top:140,width:520,height:470},'workflow-config':{left:500,top:740,width:700,height:350}}))await sharp(path.join(source,`${name}-full.jpg`)).extract(rect).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toFile(path.join(base,'workflow-video/assets',`${name}.jpg`));
