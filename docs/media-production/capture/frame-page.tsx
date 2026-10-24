"use client";
import {MediaLightbox} from '@/components/shared/display/MediaLightbox';
import {videoTask} from '../demo-data';
export default function Page(){return <><header className="capture-header"><span className="capture-brand">Genow</span><span className="capture-note">文档演示 · 截取当前帧</span></header><MediaLightbox task={videoTask} items={[{type:'video',url:'/sample-clip.mp4',thumbnailUrl:'/cup.svg',width:600,height:600}]} index={0} onClose={()=>{}} onPrev={()=>{}} onNext={()=>{}} /></>}
