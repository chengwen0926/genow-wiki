"use client";
import {useEffect,useState} from 'react';
import {MediaLightbox} from '@/components/shared/display/MediaLightbox';
import {useAuthStore} from '@/store/auth/useAuthStore';
import {demoUser,videoTask} from '../demo-data';
export default function Page(){const[ready,setReady]=useState(false);useEffect(()=>{useAuthStore.getState().setUser(demoUser);setReady(true)},[]);return <><header className="capture-header"><span className="capture-brand">Genow</span><span className="capture-note">文档演示 · 发布前检查 · 不提交发布</span></header>{ready&&<MediaLightbox task={{...videoTask,id:'docs-still',mode:'image',duration:undefined,model:'seedream_v4_5',prompt:'白瓷咖啡杯示意素材，仅演示发布操作，不代表模型生成效果。'}} items={[{type:'image',url:'/cup.svg',assetId:'docs-still',width:600,height:600}]} index={0} onClose={()=>{}} onPrev={()=>{}} onNext={()=>{}} />}</>}
