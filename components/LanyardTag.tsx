"use client";
import { Canvas, extend, useFrame, type ThreeElement, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint, type RapierRigidBody } from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./LanyardTag.module.css";
import * as THREE from "three";
import type { PosterProject } from "./LongPoster";
import type { ProjectReadingDetails } from "@/data/projects";
import { ProjectTextPreview } from "./ProjectTextPreview";
import { isCardTextRegion } from "./cardTextRegion";
extend({MeshLineGeometry,MeshLineMaterial});
declare module "@react-three/fiber" {
 interface ThreeElements {
  meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
  meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
 }
}
type TagProject=PosterProject&ProjectReadingDetails&{chinese:string;sticker:string;copy:string};
const hintStorageKey = "yan-lanyard-hint-seen";
let hintSeenThisSession = false;
type HintState = { initialized: boolean; enabled: boolean; elapsed: number; dismissed: boolean };
function Band({project,onEnter,dismissHint,updateHint,onTextHover,onDragStart}:{project:TagProject;onEnter:()=>void;dismissHint:()=>void;updateHint:(delta:number)=>void;onTextHover:(active:boolean)=>void;onDragStart:()=>void}){
 const visual = useRef<THREE.Group>(null);
 const surface = useRef<THREE.MeshPhysicalMaterial>(null);
 const frontSurface = useRef<THREE.MeshBasicMaterial>(null);
 const hovered = useRef(false);
 const hoverAmount = useRef(0);
 const band=useRef<THREE.Mesh>(null!),fixed=useRef<RapierRigidBody>(null!),j1=useRef<RapierRigidBody>(null!),j2=useRef<RapierRigidBody>(null!),j3=useRef<RapierRigidBody>(null!),card=useRef<RapierRigidBody>(null!);
 const [dragged,drag]=useState<THREE.Vector3|false>(false),start=useRef({x:0,y:0});const vec=new THREE.Vector3(),dir=new THREE.Vector3(),ang=new THREE.Vector3(),rot=new THREE.Vector3();
 const textPointer = (face: "front" | "back", event: ThreeEvent<PointerEvent>) => {
  onTextHover(!dragged && event.buttons === 0 && isCardTextRegion(face, event.uv));
 };
 const{nodes}=useGLTF("/assets/lanyard/card.glb") as unknown as {nodes:Record<string,THREE.Mesh>};const front=useTexture(`/assets/lanyard/cards/${project.id}-front.svg`),back=useTexture(`/assets/lanyard/cards/${project.id}-back.svg`),strap=useTexture("/assets/space/lanyard-strip.png");
 const frontMap=useMemo(()=>{const t=front.clone();t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;t.needsUpdate=true;return t},[front]);
 const backMap=useMemo(()=>{const t=back.clone();t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;t.needsUpdate=true;return t},[back]);
 const strapMap=useMemo(()=>{const t=strap.clone();t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.needsUpdate=true;return t},[strap]);
 useEffect(()=>()=>{frontMap.dispose();backMap.dispose();strapMap.dispose()},[frontMap,backMap,strapMap]);
 const curve=useMemo(()=>new THREE.CatmullRomCurve3([new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()]),[]);const segment={type:"dynamic" as const,canSleep:true,colliders:false as const,angularDamping:5,linearDamping:5};
 useRopeJoint(fixed,j1,[[0,0,0],[0,0,0],.48]);useRopeJoint(j1,j2,[[0,0,0],[0,0,0],.48]);useRopeJoint(j2,j3,[[0,0,0],[0,0,0],.48]);useSphericalJoint(j3,card,[[0,0,0],[0,1.24,0]]);
 useFrame((_, delta) => {
  const amount = THREE.MathUtils.damp(hoverAmount.current, hovered.current && !dragged ? 1 : 0, 9, delta);
  hoverAmount.current = amount;
  if (visual.current) {
   visual.current.rotation.x = -0.02 * amount;
   visual.current.rotation.y = 0.035 * amount;
  }
  if (surface.current) {
   surface.current.clearcoat = 0.1 + 0.15 * amount;
   surface.current.roughness = 0.62 - 0.08 * amount;
   surface.current.emissiveIntensity = 0.08 + 0.025 * amount;
  }
  if (frontSurface.current) frontSurface.current.color.setRGB(1, 1 - amount * 0.008, 1 - amount * 0.02);
  updateHint(delta);
 });
 useFrame(state=>{if(dragged&&card.current){vec.set(state.pointer.x,state.pointer.y,.5).unproject(state.camera);dir.copy(vec).sub(state.camera.position).normalize();vec.add(dir.multiplyScalar(state.camera.position.length()));[card,j1,j2,j3].forEach(r=>r.current?.wakeUp());card.current.setNextKinematicTranslation({x:THREE.MathUtils.clamp(vec.x-dragged.x,-2.5,2.5),y:THREE.MathUtils.clamp(vec.y-dragged.y,-2.7,1.3),z:THREE.MathUtils.clamp(vec.z-dragged.z,-1.1,1.1)})}if(!fixed.current||!j1.current||!j2.current||!j3.current||!card.current)return;curve.points[0].copy(j3.current.translation());curve.points[1].copy(j2.current.translation());curve.points[2].copy(j1.current.translation());curve.points[3].copy(fixed.current.translation());(band.current.geometry as MeshLineGeometry).setPoints(curve.getPoints(24));ang.copy(card.current.angvel());rot.copy(card.current.rotation());card.current.setAngvel({x:ang.x*.98,y:ang.y-rot.y*.28,z:ang.z*.98},true)});
 return <><group position={[0,2.5,0]}><RigidBody ref={fixed} type="fixed"/><RigidBody ref={j1} position={[0,-.48,0]} {...segment}><BallCollider args={[.07]}/></RigidBody><RigidBody ref={j2} position={[0,-.96,0]} {...segment}><BallCollider args={[.07]}/></RigidBody><RigidBody ref={j3} position={[0,-1.44,0]} {...segment}><BallCollider args={[.07]}/></RigidBody><RigidBody ref={card} position={[0,-2.75,0]} {...segment} type={dragged?"kinematicPosition":"dynamic"}><CuboidCollider args={[.8,1.125,.05]}/><group ref={visual} onPointerMove={e=>{if(dragged&&Math.hypot(e.clientX-start.current.x,e.clientY-start.current.y)>=6)dismissHint()}} onPointerDown={e=>{e.stopPropagation();onDragStart();const target=e.nativeEvent.currentTarget as HTMLCanvasElement|null;target?.setPointerCapture(e.pointerId);start.current={x:e.clientX,y:e.clientY};drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current!.translation())));document.body.style.cursor="grabbing"}} onPointerUp={e=>{e.stopPropagation();const target=e.nativeEvent.currentTarget as HTMLCanvasElement|null;target?.releasePointerCapture(e.pointerId);const moved=Math.hypot(e.clientX-start.current.x,e.clientY-start.current.y);drag(false);document.body.style.cursor="grab";if(moved<6){dismissHint();onEnter()}else dismissHint()}} onPointerOver={()=>{hovered.current=true;document.body.style.cursor="grab"}} onPointerOut={()=>{hovered.current=false;if(!dragged)document.body.style.cursor="auto"}}>
 <mesh geometry={nodes.card.geometry}><meshPhysicalMaterial ref={surface} color="#ffffff" roughness={.62} metalness={0} clearcoat={.1} emissive="#ffffff" emissiveIntensity={.08}/></mesh><mesh position={[0,0,.043]} onPointerOver={e=>textPointer("front",e)} onPointerMove={e=>textPointer("front",e)} onPointerOut={()=>onTextHover(false)}><planeGeometry args={[1.52,2.17]}/><meshBasicMaterial ref={frontSurface} map={frontMap} toneMapped={false}/></mesh><mesh position={[0,0,-.043]} rotation={[0,Math.PI,0]} onPointerOver={e=>textPointer("back",e)} onPointerMove={e=>textPointer("back",e)} onPointerOut={()=>onTextHover(false)}><planeGeometry args={[1.52,2.17]}/><meshBasicMaterial map={backMap} toneMapped={false}/></mesh><mesh geometry={nodes.clip.geometry} position={nodes.clip.position}><meshStandardMaterial color="#aaa7a3" metalness={.7} roughness={.3}/></mesh><mesh geometry={nodes.clamp.geometry} position={nodes.clamp.position} rotation={nodes.clamp.rotation}><meshStandardMaterial color="#999793" metalness={.75} roughness={.28}/></mesh>
 </group></RigidBody></group><mesh ref={band}><meshLineGeometry/><meshLineMaterial args={[{resolution:new THREE.Vector2(1,1)}]} color="white" depthTest={false} transparent useMap={1} map={strapMap} repeat={[-2.4,1]} lineWidth={.42}/></mesh></>
}
useGLTF.preload("/assets/lanyard/card.glb");
export function LanyardTag({project,onClose,onEnter}:{project:TagProject;onClose:()=>void;onEnter:()=>void}){
 const hint = useRef<HTMLParagraphElement>(null);
 const [previewOpen, setPreviewOpen] = useState(false);
 const textHovered = useRef(false);
 const panelHovered = useRef(false);
 const previewPinned = useRef(false);
 const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
 const hintState = useRef<HintState>({initialized:false,enabled:false,elapsed:0,dismissed:false});
 const dismissHint = useCallback(() => {
  hintState.current.dismissed = true;
  if (hint.current) hint.current.style.opacity = "0";
 }, []);
 const cancelHide = useCallback(() => {
  if (hideTimer.current !== null) clearTimeout(hideTimer.current);
  hideTimer.current = null;
 }, []);
 const showPreview = useCallback(() => {
  cancelHide();
  dismissHint();
  setPreviewOpen(true);
 }, [cancelHide, dismissHint]);
 const scheduleHide = useCallback(() => {
  cancelHide();
  if (previewPinned.current) return;
  // Allow crossing the small gap from the moving card to the reading panel.
  hideTimer.current = setTimeout(() => {
   if (!textHovered.current && !panelHovered.current && !previewPinned.current) setPreviewOpen(false);
   hideTimer.current = null;
  }, 220);
 }, [cancelHide]);
 const onTextHover = useCallback((active: boolean) => {
  if (textHovered.current === active) return;
  textHovered.current = active;
  if (active) showPreview(); else scheduleHide();
 }, [showPreview, scheduleHide]);
 const closePreview = useCallback(() => {
  cancelHide();
  textHovered.current = false;
  panelHovered.current = false;
  previewPinned.current = false;
  setPreviewOpen(false);
 }, [cancelHide]);
 useEffect(() => cancelHide, [cancelHide]);
 const updateHint = useCallback((delta: number) => {
  const state = hintState.current;
  if (!hint.current || !state.enabled || state.dismissed) return;
  state.elapsed += delta;
  const enter = THREE.MathUtils.smoothstep(state.elapsed, 0, 0.4);
  const leave = THREE.MathUtils.smoothstep(state.elapsed, 2.9, 3.3);
  hint.current.style.opacity = String(enter * (1 - leave));
  hint.current.style.transform = `translateY(${(1 - enter) * 10}px)`;
  if (state.elapsed >= 3.3) state.enabled = false;
 }, []);
 useEffect(() => {
  if (hintState.current.initialized) return;
  hintState.current.initialized = true;
  let seen = hintSeenThisSession;
  try { seen = seen || localStorage.getItem(hintStorageKey) === "1"; } catch { /* Session memory remains available. */ }
  hintState.current.enabled = !seen;
  hintSeenThisSession = true;
  try { localStorage.setItem(hintStorageKey, "1"); } catch { /* Session memory prevents repeated hints. */ }
 }, []);
 useEffect(()=>{document.body.classList.add("lanyard-active");const key=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};addEventListener("keydown",key);return()=>{document.body.classList.remove("lanyard-active");document.body.style.cursor="auto";removeEventListener("keydown",key)}},[onClose]);
 return <div className="lanyard-overlay" role="dialog" aria-label={`${project.title} project card`}><button className="lanyard-close" onClick={onClose}>×</button><Canvas camera={{position:[0,0,8],fov:25}} dpr={[1,1.45]} gl={{alpha:true,antialias:true}}><ambientLight intensity={Math.PI}/><Physics gravity={[0,-27,0]} timeStep="vary"><Band project={project} onEnter={onEnter} dismissHint={dismissHint} updateHint={updateHint} onTextHover={onTextHover} onDragStart={closePreview}/></Physics><Environment blur={.75}><Lightformer intensity={3} color="white" position={[-2,1,4]} scale={[20,2,1]}/><Lightformer intensity={2} color="#dbe6e6" position={[3,-1,3]} scale={[15,2,1]}/></Environment></Canvas><p ref={hint} className={styles.hint}><span>拖动 · 点击</span><span lang="en">DRAG · CLICK</span></p><button className={styles.readButton} type="button" aria-expanded={previewOpen} aria-controls="project-text-preview" onClick={()=>{if(previewOpen){closePreview()}else{previewPinned.current=true;showPreview()}}}>阅读卡片 <span>READ CARD</span></button><ProjectTextPreview project={project} open={previewOpen} onKeepOpen={()=>{panelHovered.current=true;showPreview()}} onLeave={()=>{panelHovered.current=false;scheduleHide()}} onClose={closePreview}/></div>;
}
