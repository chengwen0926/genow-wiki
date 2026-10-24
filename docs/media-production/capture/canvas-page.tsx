"use client";
import {useState,useEffect} from 'react';
import {ReactFlow,Background,useNodesState,useEdgesState,addEdge,type Connection} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {ImageNode} from '@/components/canvas/nodes/ImageNode';
import {VideoNode} from '@/components/canvas/nodes/VideoNode';
import {FloatingNodePanel} from '@/components/canvas/panels/FloatingNodePanel';
import {useCanvasStore} from '@/store/canvas/useCanvasStore';
import type {CanvasNode} from '@/types/canvas';
const types={image:ImageNode,video:VideoNode};
const initial:CanvasNode[]=[{id:'cup',project_id:'docs',item_type:'image',title:'咖啡杯参考图',position_x:190,position_y:230,width:240,height:240,z_index:0,content:{},generation_config:{model:'seedream_v4_5',prompt:'白色咖啡杯，柔和自然光'},last_output:{image_url:'http://localhost:3116/cup.svg'}},{id:'clip',project_id:'docs',item_type:'video',title:'咖啡杯短视频',position_x:680,position_y:230,width:300,height:200,z_index:1,content:{},generation_config:{model:'seedance_v2_0',prompt:'镜头缓慢推近，杯口热气轻轻上升',videoMode:'first_last_frame'},last_output:{}}];
export default function Page(){
 const [items,setItems]=useState(initial);
 const [nodes,setNodes,onNodesChange]=useNodesState(initial.map(i=>({id:i.id,type:i.item_type,position:{x:i.position_x,y:i.position_y},style:{width:i.width,height:i.height},data:{...i}})));
 const [edges,setEdges,onEdgesChange]=useEdgesState<any>([]);
 useEffect(()=>{useCanvasStore.getState().setProject({id:'docs',user_id:'docs',title:'咖啡杯产品短片',project_type:'personal',current_role:'owner',initialized:true,created_at:'2026-10-23',updated_at:'2026-10-23'});return()=>useCanvasStore.getState().closePanel()},[]);
 const connect=(c:Connection)=>setEdges(es=>addEdge({...c,id:'cup-to-video',style:{stroke:'#a78bfa',strokeWidth:2}},es));
 const connections=edges.map(e=>({id:e.id,project_id:'docs',source_item_id:e.source,target_item_id:e.target,source_handle:'out',target_handle:'in',created_at:'2026-10-23'}));
 return <><header className="capture-header"><span className="capture-brand">Genow <span style={{fontSize:13,fontWeight:400,marginLeft:20}}>咖啡杯产品短片</span></span><span className="capture-note">文档演示 · 仅保留两个相关节点</span></header><div style={{height:'calc(100vh - 64px)'}}><ReactFlow nodes={nodes} edges={edges} nodeTypes={types} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={connect} minZoom={.4} maxZoom={1.5} defaultViewport={{x:0,y:0,zoom:1}}><Background color="#444" gap={24}/><FloatingNodePanel items={items} connections={connections as never} projectId="docs" onItemUpdate={(id,patch)=>setItems(all=>all.map(i=>i.id===id?{...i,...patch}:i))}/></ReactFlow></div></>
}
