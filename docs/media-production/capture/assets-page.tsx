"use client";
import {useEffect,useState} from 'react';
import HistoryPage from '@/app/(main)/history/page';
import {useAuthStore} from '@/store/auth/useAuthStore';
import {demoUser} from '../demo-data';
export default function Page(){const[ready,setReady]=useState(false);useEffect(()=>{useAuthStore.getState().setUser(demoUser);setReady(true)},[]);return <div style={{height:'100vh',display:'flex',flexDirection:'column'}}><header className="capture-header" style={{flexShrink:0}}><span className="capture-brand">Genow <span style={{fontSize:13,marginLeft:20}}>生成资产</span></span><span className="capture-note">文档演示 · 仅两项相关示意素材</span></header>{ready&&<HistoryPage/>}</div>}
