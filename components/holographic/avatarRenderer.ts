/**
 * Nexus experimental procedural avatar. Real WebGL geometry, no external service.
 * The approved 2D Command Center image stays untouched; this is a separate scene.
 * NOT the final sculpted, rigged, lip-synchronized character.
 */
export type AvatarGesture = "idle" | "cognition" | "knowledge" | "experience" | "creative" | "assistance" | "future";
export type AvatarState = { speaking: boolean; gesture: AvatarGesture; pointerX?: number; pointerY?: number };

export function mountAvatar(canvas: HTMLCanvasElement, state: () => AvatarState): (() => void) | null {
  const context = canvas.getContext("webgl", { alpha: true, antialias: true, powerPreference: "low-power" });
  if (!context) return null;
  const gl: WebGLRenderingContext = context;
  const sourceVertex = [
    "attribute vec3 pos; attribute vec3 norm;",
    "uniform mat4 model, projection;",
    "varying vec3 n;",
    "void main(){n=normalize(mat3(model)*norm);gl_Position=projection*model*vec4(pos,1.0);}"
  ].join("\n");
  const sourceFragment = [
    "precision mediump float; varying vec3 n; uniform vec3 tint;",
    "void main(){vec3 N=normalize(n);float d=0.28+0.65*max(dot(N,normalize(vec3(-0.5,0.8,0.65))),0.0);",
    "float rim=pow(1.0-max(dot(N,vec3(0.,0.,1.)),0.),2.5);",
    "gl_FragColor=vec4(tint*d+vec3(0.04,0.20,0.28)*rim,1.0);}"
  ].join("\n");
  function shader(type: number, source: string): WebGLShader {
    const item = gl.createShader(type);
    if (!item) throw new Error("WebGL shader unavailable");
    gl.shaderSource(item, source); gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(item);
      gl.deleteShader(item); throw new Error(error ?? "Shader compilation error");
    }
    return item;
  }
  let program: WebGLProgram | null = null;
  let vs: WebGLShader | null = null;
  let fs: WebGLShader | null = null;
  let vertices: WebGLBuffer | null = null;
  let triangles: WebGLBuffer | null = null;
  try {
    vs = shader(gl.VERTEX_SHADER, sourceVertex);
    fs = shader(gl.FRAGMENT_SHADER, sourceFragment);
    program = gl.createProgram();
    if (!program) throw new Error("WebGL unavailable");
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "Shader link failed");
    const verts: number[] = []; const faces: number[] = [];
    const latitude = 20, longitude = 24;
    for (let i=0;i<=latitude;i++) for (let j=0;j<=longitude;j++) {
      const theta=i*Math.PI/latitude, phi=j*2*Math.PI/longitude;
      const xyz=[Math.sin(theta)*Math.cos(phi),Math.cos(theta),Math.sin(theta)*Math.sin(phi)];
      verts.push(...xyz,...xyz);
    }
    for (let i=0;i<latitude;i++) for (let j=0;j<longitude;j++) {
      const a=i*(longitude+1)+j, b=a+longitude+1;
      faces.push(a,b,a+1,b,b+1,a+1);
    }
    vertices=gl.createBuffer(); triangles=gl.createBuffer();
    if (!vertices || !triangles) throw new Error("WebGL buffers unavailable");
    gl.bindBuffer(gl.ARRAY_BUFFER,vertices); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangles); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(faces),gl.STATIC_DRAW);
  } catch {
    if (vertices) gl.deleteBuffer(vertices);
    if (triangles) gl.deleteBuffer(triangles);
    if (program) gl.deleteProgram(program);
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }
  const mesh=program; const vertexBuffer=vertices; const indexBuffer=triangles;
  gl.useProgram(mesh); gl.enable(gl.DEPTH_TEST);
  gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
  const p=gl.getAttribLocation(mesh,"pos"), n=gl.getAttribLocation(mesh,"norm");
  gl.vertexAttribPointer(p,3,gl.FLOAT,false,24,0); gl.enableVertexAttribArray(p);
  gl.vertexAttribPointer(n,3,gl.FLOAT,false,24,12); gl.enableVertexAttribArray(n);
  const modelLoc=gl.getUniformLocation(mesh,"model");
  const projectionLoc=gl.getUniformLocation(mesh,"projection");
  const tintLoc=gl.getUniformLocation(mesh,"tint");
  const ARMOR:[number,number,number]=[0.06,0.22,0.32];
  const EDGE:[number,number,number]=[0.17,0.54,0.67];
  const FACE:[number,number,number]=[0.59,0.49,0.37];
  const BLACK:[number,number,number]=[0.02,0.08,0.11];
  const CYAN:[number,number,number]=[0.58,0.96,1.00];
  const VIOLET:[number,number,number]=[0.48,0.20,0.76];
  const PLASMA:[number,number,number]=[0.86,0.44,1.00];
  const SILVER:[number,number,number]=[0.33,0.34,0.48];
  let raf=0, disposed=false;
  const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
  function ellipsoid(x:number,y:number,z:number,sx:number,sy:number,sz:number,col:number[],angle=0) {
    const c=Math.cos(angle),s=Math.sin(angle);
    gl.uniformMatrix4fv(modelLoc,false,new Float32Array([
      c*sx,s*sx,0,0, -s*sy,c*sy,0,0, 0,0,sz,0, x,y,z,1
    ]));
    gl.uniform3fv(tintLoc,col);
    gl.drawElements(gl.TRIANGLES,20*24*6,gl.UNSIGNED_SHORT,0);
  }
  function limb(a:[number,number],b:[number,number],z:number,width:number,color:number[]) {
    const dx=b[0]-a[0],dy=b[1]-a[1];
    ellipsoid((a[0]+b[0])/2,(a[1]+b[1])/2,z,width,Math.hypot(dx,dy)/2+width/3,width,color,-Math.atan2(dx,dy));
  }
  function frame(time:number) {
    raf=0;
    if(disposed || document.hidden) return;
    const ratio=Math.min(1.7,window.devicePixelRatio||1);
    const w=Math.max(1,Math.floor(canvas.clientWidth*ratio)), h=Math.max(1,Math.floor(canvas.clientHeight*ratio));
    if(canvas.width!==w || canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
    const f=1/Math.tan(Math.PI/5.2),near=.1,far=50;
    gl.uniformMatrix4fv(projectionLoc,false,new Float32Array([
      f/(w/h),0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0
    ]));
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const t=time/1000, { speaking,gesture,pointerX=0,pointerY=0 }=state();
    const gazeX=Math.max(-1,Math.min(1,pointerX));
    const gazeY=Math.max(-1,Math.min(1,pointerY));
    const breath=Math.sin(t*1.6)*.025;
    const mouth=speaking ? .065+.085*Math.abs(Math.sin(t*12)) : .012;
    ellipsoid(-.55,-1.12+breath,-7.4,.55,1.17,.52,ARMOR);
    ellipsoid(.55,-1.12+breath,-7.4,.55,1.17,.52,VIOLET);
    ellipsoid(0,-.53+breath,-6.91,.53,.16,.08,EDGE);
    ellipsoid(0,-.18+breath,-7.4,.25,.38,.25,FACE);
    ellipsoid(gazeX*.075,.73+breath+gazeY*.035,-7.4,.54,.69,.47,SILVER,Math.sin(t*.6)*.025+gazeX*.10);
    ellipsoid(gazeX*.06,1.18+breath+gazeY*.03,-7.4,.45,.31,.42,SILVER);
    ellipsoid(gazeX*.07,.49+breath+gazeY*.03,-6.95,.13,.19,.14,SILVER);
    ellipsoid(gazeX*.07,.32+breath+gazeY*.03,-6.929,.20,mouth,.060,BLACK);
    for(const s of [-1,1]){
      ellipsoid(s*.22+gazeX*.065,.80+breath+gazeY*.03,-6.951,.13,.07,.06,BLACK);
      ellipsoid(s*.22+gazeX*.095,.8+breath+gazeY*.055,-6.904,.05,.04,.032,s<0?CYAN:PLASMA);
      ellipsoid(s*.20+gazeX*.06,.96+breath,-6.96,.20,.028,.06,SILVER,s*.13);
      ellipsoid(s*.68,-.60+breath,-7.4,.40,.41,.42,s<0?ARMOR:VIOLET);
      ellipsoid(s*.65,-.56+breath,-7.04,.29,.075,.11,s<0?EDGE:PLASMA);
      const point=(s<0?["cognition","knowledge","experience"]:["creative","assistance","future"]).includes(gesture);
      const activated=s<0?gazeX<-.45:gazeX>.45;
      const wave=speaking ? Math.sin(t*4+s)*.17 : 0;
      const a:[number,number]=[s*.94,-.64+breath];
      const b:[number,number]=(point||activated)?[s*1.40,-.30+wave]:[s*1.34,-1.25+wave];
      const c:[number,number]=(point||activated)?[s*1.93,.22+wave]:[s*1.2,speaking?-1.52+wave:-2.07+wave];
      limb(a,b,-7.44,.265,s<0?ARMOR:VIOLET);
      ellipsoid(b[0],b[1],-7.42,.27,.27,.27,s<0?EDGE:PLASMA);
      limb(b,c,-7.20,.22,s<0?ARMOR:VIOLET);
      ellipsoid(c[0],c[1],-7.13,.16,.22,.15,SILVER);
      for(let finger=-1;finger<=1;finger++) ellipsoid(c[0]+finger*.09,c[1]+((point||activated)?.16:-.19),-7.07,.046,.11,.05,SILVER);
    }
    ellipsoid(0,-1.12+breath,-6.84,.25,.24,.09,BLACK);
    ellipsoid(0,-1.12+breath,-6.744,.16,.16,.075,CYAN);
    for(let i=0;i<12;i++){
      const a=2*Math.PI*i/12+t*.16;
      ellipsoid(Math.cos(a)*.41,-1.12+Math.sin(a)*.39,-6.77,.048,.048,.05,EDGE);
    }
    if(!motion.matches) raf=window.requestAnimationFrame(frame);
  }
  function redraw(){if(!disposed&&!document.hidden&&!raf)raf=window.requestAnimationFrame(frame);}
  function visibility(){if(document.hidden){window.cancelAnimationFrame(raf);raf=0;}else redraw();}
  document.addEventListener("visibilitychange",visibility);
  canvas.addEventListener("nexus:avatar-redraw",redraw);
  motion.addEventListener("change",redraw);
  redraw();
  return () => {
    disposed=true;window.cancelAnimationFrame(raf);
    document.removeEventListener("visibilitychange",visibility);
    canvas.removeEventListener("nexus:avatar-redraw",redraw);
    motion.removeEventListener("change",redraw);
    gl.deleteBuffer(vertexBuffer);gl.deleteBuffer(indexBuffer);
    gl.deleteProgram(mesh);gl.deleteShader(vs);gl.deleteShader(fs);
  };
}
