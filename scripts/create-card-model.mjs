import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { writeFile } from 'node:fs/promises';
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(v=>{this.result=v;this.onloadend?.()})}readAsDataURL(blob){blob.arrayBuffer().then(v=>{this.result=`data:${blob.type};base64,${Buffer.from(v).toString('base64')}`;this.onloadend?.()})}};
const root=new THREE.Group();root.name='YAN_Project_Card';
const card=new THREE.Mesh(new THREE.BoxGeometry(1.6,2.25,.08),new THREE.MeshStandardMaterial({color:0xfffefa,roughness:.72}));card.name='card';root.add(card);
const clip=new THREE.Mesh(new THREE.BoxGeometry(.38,.22,.12),new THREE.MeshStandardMaterial({color:0xa9a7a3,metalness:.7,roughness:.3}));clip.name='clip';clip.position.set(0,1.19,.02);root.add(clip);
const clamp=new THREE.Mesh(new THREE.TorusGeometry(.14,.035,12,28,Math.PI),new THREE.MeshStandardMaterial({color:0x9d9b98,metalness:.78,roughness:.28}));clamp.name='clamp';clamp.position.set(0,1.35,.02);clamp.rotation.z=Math.PI;root.add(clamp);
const exporter=new GLTFExporter();exporter.parse(root,async result=>{await writeFile(new URL('../public/assets/lanyard/card.glb',import.meta.url),Buffer.from(result))},error=>{throw error},{binary:true});
