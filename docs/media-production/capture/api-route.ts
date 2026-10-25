import {completeGet,completeWrite} from '../../../complete-api';
import {teamProject,members,candidates,folders,materials,pin} from '../../../collaboration-data';
import {demoUser,templateId,project,graph,assetItems,videoTask} from '../../../demo-data';
const content = '主体：一朵透明玻璃鸢尾花，花瓣边缘清晰，保留细微折射。\n\n场景：深蓝色夜幕中的浅水庭院，水面平静，只有一圈轻微涟漪。\n\n视觉：月光从侧后方勾勒花瓣，留出大面积暗部，克制的电影感构图。\n\n限制：不增加文字、水印或无关物体。';
const templates = ['system','personal'].map((scope,index)=>({id:`docs-template-${index}`,scope,name:index?'月光玻璃花园':'静物摄影基础',description:null,content,sections:[{id:'docs-section',type:'section',content}],is_active:true,created_at:'2026-10-24T00:00:00Z',updated_at:'2026-10-24T00:00:00Z'}));
export async function GET(request:Request){
const extra=await completeGet(request);if(extra)return extra;
const path = new URL(request.url).pathname;
if(path.endsWith('/events'))return new Response(null,{status:204});
if(path.endsWith('/generation/assets')){const params=new URL(request.url).searchParams;const items=assetItems.filter(i=>(params.get('sources')||'').split(',').includes(i.sourceKind)&&(params.get('types')||'').split(',').includes(i.type)&&(!(params.get('favorited')==='true')||i.favoritedAt));return Response.json({items,total:items.length,tasks:{'docs-still':{...videoTask,id:'docs-still',mode:'image',model:'seedream_v4_5'},'docs-clip':videoTask}})}
if(path.endsWith('/workflow-templates'))return Response.json({items:[{id:templateId,title:graph.title,description:graph.description,node_count:2,cover_url:'/cup.svg',removed:false,updated_at:'2026-10-24'}],total:1});
if(path.endsWith('/workflow-templates/'+templateId))return Response.json({id:templateId,graph,content_hash:'docs-only',media_urls:{},removed:false,updated_at:'2026-10-24'});
if(path.endsWith('/canvas-projects/docs-workflow/snapshot'))return Response.json({project,items:[],connections:[]});
if(path.endsWith('/canvas-projects/docs-team/snapshot'))return Response.json({project:teamProject,items:[],connections:[]});
if(path.endsWith('/canvas-projects/docs-team/members'))return Response.json({members,can_invite:true});
if(path.endsWith('/canvas-projects/docs-team/invite-candidates')){const q=new URL(request.url).searchParams.get('q')||'';const users=candidates.filter(u=>(u.nickname+u.username).includes(q));return Response.json({users,total:users.length,page:1,size:20});}
if(path.endsWith('/canvas-projects/docs-team/material-folders'))return Response.json({items:folders});
if(path.endsWith('/canvas-projects/docs-team/materials')){const params=new URL(request.url).searchParams,q=params.get('q')||'',folder=params.get('folder_id');const items=materials.filter(m=>q?m.name.includes(q):m.folderId===folder);return Response.json({items,total:items.length});}
if(path.endsWith('/console/generation-pins'))return Response.json({items:[pin],next_cursor:null});
if(path.endsWith('/console/generation-pins/docs-pin'))return Response.json(pin);
if(path.endsWith('/members'))return Response.json({members:[],invitations:[]});
if(path.endsWith('/models/available'))return Response.json({version:'docs-2026-10-24',models:[{id:'seedream_v4_5',kind:'image',supports_edit:true},{id:'seedance_v2_0',kind:'video'}]});
if(path.endsWith('/prompt-templates'))return Response.json({items:templates,total:templates.length,default_template_id:null});
if(path.includes('/prompt-templates/'))return Response.json(templates.find(item=>path.endsWith(item.id))??templates[0]);
if(path.endsWith('/material-shares/recipients'))return Response.json({items:[{id:'docs-reviewer',name:'演示审核员',username:'demo_reviewer'}]});
if(new URL(request.url).pathname.endsWith('/reference-materials'))return Response.json({items:[{id:'docs-cup',name:'白色咖啡杯正面',url:'http://localhost:3116/cup.svg',objectKey:'docs/cup.svg'}],total:1});return Response.json({items:[],elements:[],subjects:[],total:0,has_more:false})}export async function POST(request:Request){
const extra=await completeWrite(request);if(extra)return extra;
if(new URL(request.url).pathname.endsWith('/canvas-projects/docs-workflow/template-imports')){const data=await request.json();if(data.template_id!==templateId)return Response.json({detail:'仅支持文档示例模板'},{status:400});return Response.json({items:graph.items.map(n=>({...n,project_id:project.id,position_x:n.position_x+Number(data.x),position_y:n.position_y+Number(data.y),last_output:{},last_run_status:'idle'})),connections:graph.connections.map(e=>({...e,project_id:project.id})),undo_token:'docs-only'});}
return Response.json({detail:'演示环境不提交生成任务'},{status:405})}
export async function PATCH(request:Request){const extra=await completeWrite(request);if(extra)return extra;const data=await request.json();if(new URL(request.url).pathname.endsWith('/auth/me/console-panels'))return Response.json({...demoUser,preferences:{console_panels:{...demoUser.preferences.console_panels,...data}}});return Response.json(data)}
