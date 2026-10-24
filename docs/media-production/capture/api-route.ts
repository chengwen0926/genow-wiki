const content = '主体：一朵透明玻璃鸢尾花，花瓣边缘清晰，保留细微折射。\n\n场景：深蓝色夜幕中的浅水庭院，水面平静，只有一圈轻微涟漪。\n\n视觉：月光从侧后方勾勒花瓣，留出大面积暗部，克制的电影感构图。\n\n限制：不增加文字、水印或无关物体。';
const templates = ['system','personal'].map((scope,index)=>({id:`docs-template-${index}`,scope,name:index?'月光玻璃花园':'静物摄影基础',description:null,content,sections:[{id:'docs-section',type:'section',content}],is_active:true,created_at:'2026-10-24T00:00:00Z',updated_at:'2026-10-24T00:00:00Z'}));
export async function GET(request:Request){
const path = new URL(request.url).pathname;
if(path.endsWith('/models/events'))return new Response(null,{status:204});
if(path.endsWith('/models/available'))return Response.json({version:'docs-2026-10-24',models:[{id:'seedream_v4_5',kind:'image',supports_edit:true},{id:'seedance_v2_0',kind:'video'}]});
if(path.endsWith('/prompt-templates'))return Response.json({items:templates,total:templates.length,default_template_id:null});
if(path.includes('/prompt-templates/'))return Response.json(templates.find(item=>path.endsWith(item.id))??templates[0]);
if(path.endsWith('/material-shares/recipients'))return Response.json({items:[{id:'docs-reviewer',name:'演示审核员',username:'demo_reviewer'}]});
if(new URL(request.url).pathname.endsWith('/reference-materials'))return Response.json({items:[{id:'docs-cup',name:'白色咖啡杯正面',url:'http://localhost:3116/cup.svg',objectKey:'docs/cup.svg'}],total:1});return Response.json({items:[],elements:[],subjects:[],total:0,has_more:false})}export async function POST(){return Response.json({detail:'演示环境不提交生成任务'},{status:405})}
export async function PATCH(request:Request){return Response.json(await request.json())}
