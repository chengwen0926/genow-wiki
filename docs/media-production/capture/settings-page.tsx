"use client";
import {useEffect,useState} from 'react';
import {SettingsPanel} from '@/components/layout/SettingsPanel';
import {useAuthStore} from '@/store/auth/useAuthStore';
import {demoUser} from '../demo-data';
export default function Page(){const[ready,setReady]=useState(false);useEffect(()=>{useAuthStore.getState().setUser(demoUser);setReady(true)},[]);return <><header className="capture-header"><span className="capture-brand">Genow</span><span className="capture-note">文档演示 · 个人设置</span></header>{ready&&<SettingsPanel open onClose={()=>{}} onLogout={()=>{}}/>}</>}
