import * as d from './complete-data';
import {readFileSync} from 'node:fs';
let nodes:any[]=[structuredClone(d.initialNode)];let edges:any[]=[];let painted:Uint8Array|null=null;let moved=false;
const json=(value:unknown)=>Response.json(value);
export async function completeGet(request:Request){const u=new URL(request.url),p=u.pathname,q=u.searchParams;
if(p.endsWith('/canvas/download')){if((q.get('key')||'').includes('painted')&&painted)return new Response(painted,{headers:{'Content-Type':'image/png'}});return new Response(readFileSync('public/cup.svg'),{headers:{'Content-Type':'image/svg+xml'}})}
if(p.endsWith('/docs-painted.png')&&painted)return new Response(painted,{headers:{'Content-Type':'image/png'}});
if(p.endsWith('/auth/me/stats')||p.endsWith('/admin/dashboard/platform'))return json(d.stats);
if(p.endsWith('/me/storage')||p.endsWith('/storage-limit'))return json(d.storage);
if(p.endsWith('/me/provider-credentials'))return json([{provider:'volcengine',provider_active:true,configured:false,is_active:false},{provider:'vidu',provider_active:true,configured:true,is_active:true},{provider:'kling',provider_active:true,configured:true,is_active:false}]);
if(p.includes('/admin/prompt-templates')){const content='主体：白瓷咖啡杯，保留杯口与杯柄。\n场景：暖灰色石台，背景留白。\n光线：柔和侧光，细腻阴影。\n限制：不增加文字、水印或无关物体。';const t={id:'docs-system',scope:'system',name:'产品摄影基础描述',description:null,content,sections:[{id:'docs-section',type:'section',content}],is_active:true,created_at:d.date,updated_at:d.date};return json(p.endsWith('/admin/prompt-templates')?{items:[t],total:1,default_template_id:null}:t);}
if(p.endsWith('/admin/users'))return json({items:[d.user],total:1,page:1,page_size:20});
if(p.endsWith('/admin/dashboard/users'))return json({active_users_today:1,org_distribution:[{org:'文档演示组',user_count:1,task_count:6}],credit_ranking:[{user_id:d.user.id,username:d.user.username,nickname:d.user.nickname,organization:d.user.organization,used_this_week:0,total_used:0,task_count_today:6,image_count:4,video_count:2}]});
if(p.endsWith('/admin/models'))return json(d.modelCatalog);
if(p.endsWith('/admin/dashboard/video-usage'))return json({rows:[{user_id:d.user.id,username:d.user.username,nickname:d.user.nickname,organization:'文档演示组',model:'seedance_v2_0',resolution:'720p',duration_sec:5,count:2,total_duration_sec:10}]});
if(p.endsWith('/admin/assets/status'))return json(d.assetStatus);
if(p.endsWith('/admin/assets/storage'))return json(d.storageStats);
if(p.endsWith('/generation-errors'))return json({items:d.errors,total:1,page:1,size:20});
if(p.endsWith('/admin/notifications'))return json([d.announcement,{...d.announcement,id:'docs-published',title:'示例公告 · 已发布',status:'published',publish_at:d.date}]);
if(p.includes('/admin/notifications/docs-'))return json({...d.announcement,...(p.endsWith('docs-published')?{id:'docs-published',title:'示例公告 · 已发布',status:'published',publish_at:d.date}:{})});
if(p.endsWith('/notifications/summary'))return json({ui_enabled:true,unread_count:2,pending_count:1,by_category:{messages:0,shares:1,invitations:1,system:0},as_of:d.date});
if(p.endsWith('/notifications/inbox')||p.endsWith('/notifications/sent'))return json({items:q.get('category')==='shares'?[p.endsWith('/sent')?{...d.shareNotice,read_at:d.date,allowed_actions:['view_share']}:d.shareNotice]:d.inbox,next_cursor:null,has_more:false});
if(p.endsWith('/notifications/material-shares/docs-share'))return json(d.share);
if(p.endsWith('/playground/posts'))return json({items:[d.post],next_cursor:null});
if(p.endsWith('/playground/posts/docs-post'))return json(d.post);
if(p.endsWith('/canvas-projects/docs-copy/snapshot'))return json({project:{...d.paintedProject,id:'docs-copy'},items:[{...d.initialNode,project_id:'docs-copy'},{...d.initialNode,id:'docs-copy-empty',project_id:'docs-copy',title:'图像',position_x:400,content:{},last_output:{},generation_config:{},last_run_status:'idle'}],connections:[]});
if(p.endsWith('/canvas-projects/docs-paint/snapshot')){nodes=[structuredClone(d.initialNode)];edges=[];return json({project:d.paintedProject,items:nodes,connections:edges})}
if(p.includes('/canvas-projects/docs-paint/items/')&&p.endsWith('/generations'))return json({items:[],has_more:false});
if(p.endsWith('/canvas-projects/docs-team/materials')&&q.get('q')==='move-demo'){moved=false;return json({items:[],total:0})}
if(p.endsWith('/canvas-projects/docs-team/materials')&&q.get('q')===''){
 const folder=q.get('folder_id');const show=moved?folder==='docs-folder-0':folder===null;
 return json({items:show?[{id:'docs-shared-cup',name:'白瓷咖啡杯 · 正面示意',category:'image',url:'/cup.svg',objectKey:'docs/cup.svg',assetId:'docs-still',folderId:moved?'docs-folder-0':null,projectId:'docs-team',addedBy:'docs-demo',canManage:true}]:[],total:show?1:0});
}
return null;}
export async function completeWrite(request:Request){const p=new URL(request.url).pathname;
if(request.method==='POST'&&p.endsWith('/canvas-projects/docs-team/materials/docs-shared-cup/move')){const body=await request.json();if(body.folder_id!=='docs-folder-0')return json({detail:'Only local demo target supported'});moved=true;return json({ok:true});}
if(p.includes('/canvas-projects/docs-paint/')){
 if(request.method==='POST'&&p.endsWith('/painted-reference')){const form=await request.formData();painted=new Uint8Array(await (form.get('file') as File).arrayBuffer());const url='/api/v1/docs-painted.png';const n={...structuredClone(d.initialNode),id:'docs-painted',title:'产品原图 · 涂抹标记',position_x:368,content:{image_url:url,image_urls:[url],image_key:'docs/painted.png',image_keys:['docs/painted.png']},last_output:{image_url:url,image_urls:[url],image_key:'docs/painted.png',image_keys:['docs/painted.png']}};nodes.push(n);return json(n);}
 const data=await request.json();
 if(request.method==='POST'&&p.endsWith('/batch-positions')){for(const u of data.updates||[]){const n=nodes.find(n=>n.id===u.item_id);if(n)Object.assign(n,u)}return json({ok:true})}
 if(request.method==='POST'&&p.endsWith('/items')){const n={...d.initialNode,...data,title:data.title||'图像',id:'docs-new-'+nodes.length,content:data.generation_contents_json||{},last_output:data.last_output_json||{},generation_config:data.params_json||{},last_run_status:'idle'};nodes.push(n);return json(n);}
 if(request.method==='POST'&&p.endsWith('/connections')){const e={...data,id:'docs-edge-'+edges.length,project_id:'docs-paint',created_at:d.date};edges.push(e);return json(e);}
 if(request.method==='PATCH'&&p.includes('/items/')){const id=p.split('/').pop();const n=nodes.find(n=>n.id===id);if(n){Object.assign(n,data);if(data.params_json)n.generation_config=data.params_json;if(data.generation_contents_json)n.content=data.generation_contents_json;return json(n)}}
}
return null;}
