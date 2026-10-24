"use client";
import {useState} from 'react';
import {MaterialShareDialog} from '@/components/shared/display/MaterialShareDialog';
export default function SharePage(){
 const [open,setOpen]=useState(true);
 return <><header className="capture-header"><span className="capture-brand">Genow <span style={{fontSize:13,fontWeight:400,marginLeft:20,color:'var(--text-muted)'}}>素材分享</span></span><span className="capture-note">文档演示 · 虚构接收人 · 不发送消息</span></header><div className="stage"><div className="empty-copy"><strong>确认接收人，再分享结果</strong>本场景仅展示分享弹窗，不连接真实账号</div><button style={{position:'absolute',top:220,left:'45%'}} onClick={()=>setOpen(true)}>打开分享弹窗</button></div>{open&&<MaterialShareDialog source={{asset_id:'docs-demo-asset'}} onClose={()=>setOpen(false)}/>}</>;
}
