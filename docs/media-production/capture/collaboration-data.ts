// Synthetic documentation data; no real accounts, invitations or publications.
import {project} from './demo-data';
export const teamProject={...project,id:'docs-team',title:'晨光咖啡宣传 · 演示',project_type:'team'};
export const members=[
 {user_id:'docs-demo',username:'docs_demo',nickname:'文档演示',avatar_url:null,role:'owner'},
 {user_id:'docs-designer',username:'demo_designer',nickname:'演示设计师',avatar_url:null,role:'editor'},
 {user_id:'docs-reviewer',username:'demo_reviewer',nickname:'演示审核员',avatar_url:null,role:'viewer'},
];
export const candidates=[
 {user_id:'docs-video',username:'demo_video',nickname:'演示视频创作者',avatar_url:null,is_member:false,invitation_status:null,invitation_id:null},
 {user_id:'docs-art',username:'demo_art',nickname:'演示美术指导',avatar_url:null,is_member:false,invitation_status:'pending',invitation_id:'docs-pending'},
];
export const folders=['产品原图','场景参考','最终成品'].map((name,i)=>({id:`docs-folder-${i}`,parentId:null,name,canManage:true}));
export const materials=[{id:'docs-shared-cup',name:'白瓷咖啡杯 · 正面示意',category:'image',url:'/cup.svg',objectKey:'docs/cup.svg',assetId:'docs-still',folderId:'docs-folder-0',projectId:'docs-team',addedBy:'docs-demo',addedByName:'文档演示',createdAt:'2026-10-24T00:00:00Z',canManage:true}];
export const pin={id:'docs-pin',source_generation_id:'docs-still',pinned_at:'2026-10-24T00:00:00Z',snapshot_version:1,params:{mode:'image',model:'seedream_v4_5',prompt:'白瓷咖啡杯置于暖灰色石台，清晨侧光穿过薄纱，淡淡蒸汽，安静而克制的静物摄影。保留参考杯子的形状，不添加文字。',aspectRatio:'1:1',resolution:'2K',count:1,imageUrls:['http://localhost:3116/cup.svg']},references:[{object_key:'docs/cup.svg',asset_id:'docs-still',media_type:'image',role:'reference',field:'imageUrls',position:0,name:'白瓷咖啡杯',url:'/cup.svg'}],warnings:[]};
