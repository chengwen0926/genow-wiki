"use client";
import {useEffect,useState} from 'react';
import {CanvasEditor} from '@/components/canvas/editor/CanvasEditor';
import {useAuthStore} from '@/store/auth/useAuthStore';
import {demoUser} from '../demo-data';
export default function Page(){const[ready,setReady]=useState(false);useEffect(()=>{useAuthStore.getState().setUser(demoUser);setReady(true)},[]);return <><header className="capture-header"><span className="capture-brand">Genow</span><span className="capture-note">文档演示 · 本地示例模板 · 不执行生成</span></header><div style={{height:'calc(100vh - 64px)',position:'relative'}}>{ready&&<CanvasEditor projectId="docs-workflow" onBack={()=>{}}/>}</div></>}
