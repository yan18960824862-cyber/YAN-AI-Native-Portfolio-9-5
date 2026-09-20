/* eslint-disable react-hooks/immutability */
"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, PerspectiveCamera } from "@react-three/drei";
import { CylinderCollider, CuboidCollider, Physics, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { heroFont } from "@/app/hero-font";
import { HeroInk } from "./HeroInk";
import { useHeroInk, type HeroFrame } from "./useHeroInk";

type Phase = "input" | "thinking" | "release" | "falling" | "landing" | "complete";
type Seed = { id:number; color:string; position:[number,number,number]; rotation:[number,number,number]; noise:number };
const PROMPT="帮我制作一个 AI-Native 设计师的作品集。",COLORS=["#FB5FD0","#2AEBEC","#9174F5"],WORLD="#FFFFFF",FLOOR=-12.4;
const seeded=(n:number)=>{const x=Math.sin(n*91.731)*43758.5453;return x-Math.floor(x)};
const tokenCount=(text:string)=>(text.match(/[a-zA-Z0-9]+/g)||[]).length+(text.match(/[\u4e00-\u9fa5]/g)||[]).length;

class IntroBoundary extends Component<{children:ReactNode;onFail:()=>void},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}componentDidCatch(error:unknown){console.error("Intro scene fallback",error);this.props.onFail()}render(){return this.state.failed?<div className="intro-safe"><span/><span/><span/></div>:this.props.children}}

function LiquidSurface(){
 const geometry=useRef<THREE.PlaneGeometry>(null!),base=useRef<Float32Array|null>(null);
 useFrame(({clock})=>{const geo=geometry.current;if(!geo)return;const positions=geo.attributes.position as THREE.BufferAttribute;if(!base.current)base.current=new Float32Array(positions.array as Float32Array);const source=base.current,time=clock.elapsedTime;for(let index=0;index<positions.count;index++){const x=source[index*3],y=source[index*3+1],nx=x/6,ny=y/4,angle=Math.atan2(ny,nx);let radius=Math.sqrt(nx*nx*1.06+ny*ny*.94);radius+=Math.sin(angle*3.0+time*.21)*.014+Math.sin(angle*5.0-time*.17)*.009;let z=0;const speeds=[.135,.17,.112],widths=[.055,.072,.045],offsets=[0,.48,.91],amplitudes=[.045,.032,.024];for(let wave=0;wave<3;wave++){const travel=(time*speeds[wave]+offsets[wave])%1.36,q=(radius-travel)/widths[wave],decay=Math.exp(-travel*1.45);z+=q*Math.exp(-q*q)*amplitudes[wave]*decay}positions.setZ(index,z)}positions.needsUpdate=true;geo.computeVertexNormals()});
 return <mesh position={[0,0,1.12]} renderOrder={3}><planeGeometry ref={geometry} args={[12,8,64,42]}/><MeshTransmissionMaterial transmission={1} transmissionSampler thickness={.1} roughness={.015} ior={1.12} chromaticAberration={0} anisotropicBlur={.02} distortion={0} temporalDistortion={0} samples={4} resolution={512} toneMapped={false}/></mesh>
}

function Token({seed,phase,bodies}:{seed:Seed;phase:Phase;bodies:React.MutableRefObject<Map<number,RapierRigidBody>>}){
 const body=useRef<RapierRigidBody>(null),mesh=useRef<THREE.Mesh>(null!),released=useRef(false),life=useRef(0);
 useEffect(()=>{const map=bodies.current;if(body.current)map.set(seed.id,body.current);return()=>{map.delete(seed.id)}},[bodies,seed.id]);
 useFrame(({clock,pointer,viewport},delta)=>{const rigid=body.current;if(!rigid)return;life.current+=delta;const age=life.current,birth=1-Math.exp(-age*10);mesh.current.scale.setScalar(birth*(1+Math.sin(age*10)*Math.exp(-age*5)*.1));if(phase==="input"||phase==="thinking"){const p=rigid.translation(),compression=phase==="thinking"?1.5:.76,force=new THREE.Vector3(-p.x,-p.y*.82,-p.z).multiplyScalar(compression*delta*.24);bodies.current.forEach((other,id)=>{if(id===seed.id)return;const q=other.translation(),d=new THREE.Vector3(p.x-q.x,p.y-q.y,p.z-q.z),len=d.length();if(len>.001&&len<.48)force.add(d.normalize().multiplyScalar((.48-len)*delta*.72))});const mouse=new THREE.Vector3(pointer.x*viewport.width*.5,pointer.y*viewport.height*.5,0),away=new THREE.Vector3(p.x-mouse.x,p.y-mouse.y,p.z*.3),mouseDistance=away.length();if(mouseDistance>.001&&mouseDistance<1.05)force.add(away.normalize().multiplyScalar((1-mouseDistance/1.05)*delta*.13));const t=clock.elapsedTime*.82+seed.noise*9;force.add(new THREE.Vector3(Math.sin(t*1.17),Math.cos(t*.91),Math.sin(t*.71)).multiplyScalar(delta*.018));rigid.applyImpulse(force,true);rigid.setLinearDamping(phase==="thinking"?3.1:3.8)}if(phase==="release"&&!released.current){released.current=true;const p=rigid.translation(),radial=new THREE.Vector3(p.x,p.y*.35,p.z).normalize(),strength=.2+seeded(seed.id+23)*.22;rigid.applyImpulse({x:radial.x*strength+(seeded(seed.id+31)-.5)* .12,y:radial.y*strength+.08+seeded(seed.id+44)*.08,z:radial.z*strength+(seeded(seed.id+57)-.5)*.1},true);rigid.applyTorqueImpulse({x:(seeded(seed.id+8)-.5)*.28,y:(seeded(seed.id+9)-.5)*.24,z:(seeded(seed.id+10)-.5)*.28},true)}});
 const falling=phase==="falling"||phase==="landing"||phase==="complete";
 return <RigidBody ref={body} position={seed.position} rotation={seed.rotation} colliders={false} gravityScale={falling?1:0} ccd friction={.84} restitution={.16} linearDamping={falling?.1:3.7} angularDamping={.72}><CylinderCollider args={[.18,.18]}/><mesh ref={mesh} castShadow scale={0}><cylinderGeometry args={[.18,.18,.36,32]}/><meshPhysicalMaterial color={seed.color} roughness={.34} metalness={0} clearcoat={.3} clearcoatRoughness={.28}/></mesh></RigidBody>
}

function CameraRig({bodies,phase,ui,onHeroFrame}:{bodies:React.MutableRefObject<Map<number,RapierRigidBody>>;phase:Phase;ui:React.RefObject<HTMLDivElement|null>;onHeroFrame:HeroFrame}){
 const{camera,gl}=useThree(),center=useRef(new THREE.Vector3());
 useFrame(({clock},delta)=>{const avg=new THREE.Vector3();bodies.current.forEach(b=>{const p=b.translation();avg.add(new THREE.Vector3(p.x,p.y,p.z))});if(bodies.current.size)avg.multiplyScalar(1/bodies.current.size);center.current.lerp(avg,1-Math.exp(-4.1*delta));const landed=phase==="landing"||phase==="complete",tracking=phase==="release"||phase==="falling"||landed,targetY=tracking?center.current.y+.15:.2,dest=new THREE.Vector3(center.current.x+(landed?.75:0),targetY+(landed?1.45:0),center.current.z+5.25+(landed?.55:0));camera.position.lerp(dest,1-Math.exp(-(tracking?3.6:2.7)*delta));camera.lookAt(center.current.x,center.current.y-(landed?.58:0),center.current.z);if(ui.current){const progress=THREE.MathUtils.clamp(-center.current.y/Math.abs(FLOOR),0,1);ui.current.style.transform=`translate3d(0,${-progress*118}vh,0)`}onHeroFrame(bodies.current,camera,gl.domElement,clock.elapsedTime)});return null
}

function Scene({tokens,phase,ui,onHeroFrame}:{tokens:Seed[];phase:Phase;ui:React.RefObject<HTMLDivElement|null>;onHeroFrame:HeroFrame}){
 const bodies=useRef(new Map<number,RapierRigidBody>());
 return <><fog attach="fog" args={[WORLD,8,44]}/><PerspectiveCamera makeDefault position={[0,.2,5.25]} fov={38}/><hemisphereLight args={["#ffffff","#eeeae5",2.2]}/><directionalLight castShadow position={[-5,7,5]} intensity={2.4} shadow-mapSize={[1024,1024]}/><Physics gravity={[0,-18,0]} timeStep="vary">{tokens.map(seed=><Token key={seed.id} seed={seed} phase={phase} bodies={bodies}/>)}<RigidBody type="fixed" position={[0,FLOOR-.14,0]} colliders={false}><CuboidCollider args={[30,.14,30]} friction={.86} restitution={.08}/></RigidBody></Physics><LiquidSurface/><CameraRig bodies={bodies} phase={phase} ui={ui} onHeroFrame={onHeroFrame}/></>
}

export function TokenIntro({onComplete}:{onComplete?:()=>void}){
 const[input,setInput]=useState(""),[tokens,setTokens]=useState<Seed[]>([]),[phase,setPhase]=useState<Phase>("input"),[failed,setFailed]=useState(false),next=useRef(0),ui=useRef<HTMLDivElement>(null),timers=useRef<number[]>([]);
 const onHeroFrame = useHeroInk(ui);
 const [editing, setEditing] = useState(false);
 const composing = useRef(false);
 const enter=useCallback(()=>{timers.current.forEach(clearTimeout);setPhase("complete");document.documentElement.classList.remove("intro-locked");document.body.classList.remove("intro-locked");onComplete?.()},[onComplete]);
 useEffect(()=>{document.documentElement.classList.add("intro-locked");document.body.classList.add("intro-locked");const safety=window.setTimeout(()=>{document.documentElement.classList.remove("intro-locked");document.body.classList.remove("intro-locked")},13000);return()=>{clearTimeout(safety);document.documentElement.classList.remove("intro-locked");document.body.classList.remove("intro-locked")}},[]);
 useEffect(()=>{if(editing||composing.current||phase!=="input"||input.length>=PROMPT.length)return;const timer=window.setTimeout(()=>{if(!composing.current)setInput(PROMPT.slice(0,input.length+1))},72);return()=>clearTimeout(timer)},[input,phase,editing]);
 useEffect(()=>{if(phase!=="input")return;const target=Math.min(36,tokenCount(input));setTokens(current=>{if(target<=current.length)return current.slice(0,target);return [...current,...Array.from({length:target-current.length},()=>{const id=next.current++;return{id,color:COLORS[id%COLORS.length],position:[(seeded(id)-.5)*1.45,.18+(seeded(id+4)-.5)*1.1,(seeded(id+8)-.5)*.72] as [number,number,number],rotation:[seeded(id+1)*Math.PI,seeded(id+2)*Math.PI,seeded(id+3)*Math.PI] as [number,number,number],noise:seeded(id+14)}})]})},[input,phase]);
 const send=()=>{if(!tokens.length||phase!=="input")return;setPhase("thinking");timers.current.push(window.setTimeout(()=>setPhase("release"),1250));timers.current.push(window.setTimeout(()=>setPhase("falling"),1620));timers.current.push(window.setTimeout(()=>setPhase("landing"),3850));timers.current.push(window.setTimeout(enter,4750))};
 const status=failed?"3D scene unavailable — continue to portfolio.":phase==="input"?"TOKEN 制作的作品集":phase==="thinking"?"SOLVING RELATIONSHIPS":phase==="release"?"RELEASING CONSTRAINTS":"DESCENDING INTO THE ARCHIVE";
 return <section id="top" className={`${heroFont.variable} token-intro token-${phase} ${failed?"is-safe-mode":""}`}><div className="token-stage"><IntroBoundary onFail={()=>setFailed(true)}><Canvas className="token-canvas" shadows dpr={[1,1.35]} gl={{antialias:true,alpha:false,powerPreference:"high-performance"}}><color attach="background" args={[WORLD]}/><Scene tokens={tokens} phase={phase} ui={ui} onHeroFrame={onHeroFrame}/></Canvas></IntroBoundary><div ref={ui} className="token-ui-flow"><div className="token-status"><span className="hero-copy">YAN / AI-NATIVE DESIGNER<HeroInk text="YAN / AI-NATIVE DESIGNER"/></span><p className="hero-copy">{status}<HeroInk text={status}/></p></div><div className="prompt-device"><span className="hero-input"><input value={input} disabled={phase!=="input"} onFocus={()=>setEditing(true)} onCompositionStart={()=>{composing.current=true;setEditing(true)}} onCompositionEnd={e=>{composing.current=false;setInput(e.currentTarget.value)}} onChange={e=>{setEditing(true);setInput(e.target.value)}} aria-label="Portfolio prompt"/><HeroInk text={input}/></span><button className="send-orb" onClick={failed?enter:send} disabled={!failed&&(!tokens.length||phase!=="input")} aria-label="Manifest"><span className="send-ripple"/><svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg></button></div></div><button className="skip-intro-v14" onClick={enter}>SKIP INTRO ↘</button></div></section>
}
