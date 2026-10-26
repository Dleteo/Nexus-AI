import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import "./style.css";
import { avatarPose, pointerToGaze, smooth, AVATAR_STATES } from "./behavior.mjs";
import { createSilverProfessor } from "./silver-professor.js";

const canvas = document.querySelector("#world");
const modelInput = document.querySelector("#model");
const notice = document.querySelector("#notice");
const state = document.querySelector("#state");
const rights = document.querySelector("#rights");
const greet = document.querySelector("#greet");
const wave = document.querySelector("#wave");
const blink = document.querySelector("#blink");
const voice = document.querySelector("#voice");
const language = document.querySelector("#language");
const behaviorSelect = document.querySelector("#behavior");
const behaviorStatus = document.querySelector("#behavior-status");
const prototypeButton = document.querySelector("#prototype");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071522);
const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
camera.position.set(0, 1.45, 4.4);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.45;
scene.add(new THREE.HemisphereLight(0x9fdbff, 0x28264e, 2.1));
const key = new THREE.DirectionalLight(0xe1f5ff, 3.0); key.position.set(-2, 4, 5); scene.add(key);
const rim = new THREE.DirectionalLight(0xb889ff, 2.4); rim.position.set(3, 3, -2); scene.add(rim);
const floor = new THREE.GridHelper(12, 24, 0x2988b7, 0x164765);
floor.position.y = -0.02;
scene.add(floor);
const rings = new THREE.Group();
for (const radius of [1.04,1.18]) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .006, 6, 120), new THREE.MeshBasicMaterial({ color: radius<1.1?0x24d3ff:0xc373ff, transparent:true, opacity:.32 }));
  ring.position.set(0, 1.1, -.85); rings.add(ring);
}
scene.add(rings);
let vrm = null, modelRoot = null, talk = false, waveUntil = 0, blinkUntil = 0, look = {x:0,y:0}, nextBlink=0;
let mode = "idle", gaze = {x:0,y:0}, prototype = null;
function setMode(value) {
  mode = AVATAR_STATES.includes(value) ? value : "idle";
  behaviorSelect.value = mode;
  behaviorStatus.textContent = "Estado: " + mode;
}
behaviorSelect.addEventListener("change", () => setMode(behaviorSelect.value));
window.addEventListener("nexus:avatar-state", event => setMode(event.detail?.state));
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const loader = new GLTFLoader();
loader.register(parser => new VRMLoaderPlugin(parser));
const clock = new THREE.Clock();
function status(text) { state.textContent = text; }
function animateExpression(name, value) { if (vrm?.expressionManager) vrm.expressionManager.setValue(name, value); }
function bone(name) { return vrm?.humanoid?.getNormalizedBoneNode(name) ?? null; }
function resetState(){
  if ("speechSynthesis" in window) window.speechSynthesis.cancel(); talk=false;
  if(modelRoot){scene.remove(modelRoot); VRMUtils.deepDispose(modelRoot);modelRoot=null;}
  if(prototype){scene.remove(prototype.root);prototype.dispose();prototype=null;}
  vrm=null;for(const button of [greet,wave,blink,voice])button.disabled=true;
}
function normalizeVrm(gltf) {
  if (!gltf.userData?.vrm) throw new Error("El archivo no contiene un avatar VRM válido con esqueleto y expresiones.");
  const avatar = gltf.userData.vrm;
  if (!avatar.humanoid || !avatar.expressionManager) throw new Error("El VRM necesita un esqueleto humanoide y expresiones.");
  return avatar;
}
prototypeButton.addEventListener("click", () => {
 resetState();
 prototype=createSilverProfessor(THREE);
 scene.add(prototype.root);
 camera.position.set(0,1.28,4.45);
 camera.lookAt(0,1.07,0);
 for(const button of [greet,wave,blink,voice])button.disabled=false;
 status("Prototipo geométrico interactivo: profesor plateado (NO es el VRM final).");
 notice.textContent="Modelo 3D procedural original y simplificado: puedes girarlo visualmente con el mouse, probar estados, parpadeo y voz. No es una réplica del render.";
});
modelInput.addEventListener("change", async () => {
 const file = modelInput.files?.[0];
 if(!file)return;
 if(!rights.checked){status("Confirma primero que tienes los derechos comerciales del modelo.");modelInput.value="";return;}
 if(file.size>40*1024*1024){status("Archivo superior a 40 MB: optimiza el modelo antes de cargarlo.");return;}
 resetState();status("Leyendo y comprobando avatar…");
 try {
   const data=await file.arrayBuffer();
   const gltf=await new Promise((resolve,reject)=>loader.parse(data,"",resolve,reject));
   const avatar=normalizeVrm(gltf);
   VRMUtils.rotateVRM0(avatar);
   vrm=avatar;modelRoot=avatar.scene;scene.add(modelRoot);
   modelRoot.rotation.y = 0;
   const box=new THREE.Box3().setFromObject(modelRoot), size=new THREE.Vector3(),center=new THREE.Vector3();
   box.getSize(size);box.getCenter(center);
   modelRoot.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));
   const targetHeight=Math.max(1.45,Math.min(2.3,size.y));
   camera.position.set(0,Math.max(.9,targetHeight*.70),Math.max(3.0,size.y*2.0));
   camera.lookAt(0,targetHeight*.62,0);
   for(const button of [greet,wave,blink,voice])button.disabled=false;
   status("VRM cargado: " + file.name + " · prueba mirada, expresiones y voz.");
   notice.textContent="Las expresiones disponibles y la calidad visual dependen del VRM cargado. La sincronización de labios es aproximada.";
 } catch(error){resetState();status("No se pudo cargar: "+(error?.message||String(error))); }
});
window.addEventListener("pointermove", event => {
 if (event.pointerType === "touch") return;
 look = pointerToGaze(event.clientX, event.clientY, innerWidth, innerHeight);
}, { passive: true });
window.addEventListener("blur",()=>{look={x:0,y:0};});
blink.addEventListener("click",()=>{blinkUntil=performance.now()+150;});
wave.addEventListener("click",()=>{waveUntil=performance.now()+1800;});
voice.addEventListener("click",()=>{const voices=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith(language.value.slice(0,2)));status(voices.length?"Voces disponibles: "+voices.map(v=>v.name).slice(0,3).join(", "):"Sin voces locales: usaremos voz predeterminada.");});
greet.addEventListener("click",()=>{
 if((!vrm&&!prototype)||!("speechSynthesis" in window))return;
 speechSynthesis.cancel();
 const speech = new SpeechSynthesisUtterance(language.value==="es-ES"?"Hola. Soy Nexus. ¿Qué te gustaría aprender hoy?":"Hello. I'm Nexus. What would you like to learn today?");
 speech.lang=language.value;speech.rate=.93;speech.pitch=1;
 const voices=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase()===language.value.toLowerCase());
 voices.sort((a,b)=>Number(/natural|neural|enhanced/i.test(b.name))-Number(/natural|neural|enhanced/i.test(a.name)));
 if(voices[0]) speech.voice=voices[0];
 speech.onstart=()=>{talk=true;setMode("explaining");waveUntil=performance.now()+1500;};
 speech.onend=speech.onerror=()=>{talk=false;setMode("idle");};
 speechSynthesis.speak(speech);
});
function size(){const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
const observer=new ResizeObserver(size);observer.observe(canvas);size();
let animationFrame;
function render(){
 animationFrame=requestAnimationFrame(render);
 const dt=Math.min(.04,clock.getDelta()),t=clock.elapsedTime,now=performance.now();
 const animate=!reducedMotion.matches;
 rings.rotation.y+=dt*.08;floor.material.opacity=.7;
 const pose=avatarPose(mode,{speaking:talk,reducedMotion:!animate});
 gaze.x=smooth(gaze.x,animate?look.x:0,dt,4);
 gaze.y=smooth(gaze.y,animate?look.y:0,dt,4);
 if(prototype) prototype.update({pose,gaze,dt,t,now,talk,blink:animate&&now<blinkUntil,wave:animate&&now<waveUntil,reduced:!animate});
 if(vrm){
   const head=bone("head");
   if(head){
     head.rotation.y=THREE.MathUtils.damp(head.rotation.y,gaze.x*.20,4,dt);
     head.rotation.x=THREE.MathUtils.damp(head.rotation.x,-gaze.y*.11+pose.headX,4,dt);
     head.rotation.z=THREE.MathUtils.damp(head.rotation.z,pose.headZ,4,dt);
   }
   const chest=bone("chest");
   if(chest&&animate)chest.rotation.x=Math.sin(t*1.6)*.012;
   const right=bone("rightUpperArm");
   if(right)right.rotation.z=THREE.MathUtils.damp(right.rotation.z,animate&&now<waveUntil?-1.0:pose.armRight,5,dt);
   const left=bone("leftUpperArm");
   if(left)left.rotation.z=THREE.MathUtils.damp(left.rotation.z,animate&&now<waveUntil ? .26 : pose.armLeft,5,dt);
   animateExpression("blink",animate&&now<blinkUntil?1:0);
   animateExpression("happy",pose.happy);
   animateExpression("aa",talk ? pose.mouth*(.72+.28*Math.abs(Math.sin(t*8))) : 0);
   vrm.update(dt);
 }
 if(animate && now>nextBlink){blinkUntil=now+115;nextBlink=now+2600+Math.random()*2800;}
 renderer.render(scene,camera);
}
render();
window.addEventListener("pagehide",()=>{cancelAnimationFrame(animationFrame);observer.disconnect();resetState();renderer.dispose();});
