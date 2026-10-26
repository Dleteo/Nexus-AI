import * as THREE from "three";

/**
 * Silver Professor: locally authored procedural 3D blockout based on the
 * supplied silver-haired character reference. No downloaded/third-party mesh.
 * It is deliberately NOT a finished sculpt, rigged VRM, or accurate recreation.
 */
export function createSilverProfessor() {
  const root = new THREE.Group();
  root.name = "Nexus Silver Professor - procedural 3D blockout";

  const M = {
    white: mat(0xf4f4ff, .31, .18), shade: mat(0xd7d9ef, .55, .10),
    blue: mat(0x153b93, .34, .23), blueLight: mat(0x1d70de, .28, .25),
    black: mat(0x101222, .67, .07), fabric: mat(0x171a2a, .82, .01),
    gold: mat(0xcfa860, .2, .76), goldBright: mat(0xffdf8c, .17, .8),
    silver: mat(0xdbdfe9, .48, .23), hairShade: mat(0x9fa9c2, .65, .15),
    skin: mat(0xffe3d8, .85, .03), skinShadow: mat(0xe1b8ae, .9, .01),
    iris: mat(0x63bbf3, .23, .24), pupil: mat(0x122c60, .22, .05),
    whiteEye: mat(0xfcfbff, .32, .04), shoe: mat(0x0b0d1b, .16, .52)
  };
  function mat(color, roughness, metalness) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness, side: THREE.DoubleSide });
  }
  function mesh(parent, geo, material, name, x = 0, y = 0, z = 0) {
    const object = new THREE.Mesh(geo, material);
    object.name = name; object.position.set(x, y, z);
    parent.add(object);
    return object;
  }
  function oval(parent, name, m, pos, scale) {
    const o=mesh(parent,new THREE.SphereGeometry(1,20,14),m,name,...pos);
    o.scale.set(...scale);
    return o;
  }
  function cube(parent, name, m, pos, size) {
    return mesh(parent,new THREE.BoxGeometry(...size),m,name,...pos);
  }
  function segment(parent, name, material, a, b, radius = .01) {
    const curve = new THREE.LineCurve3(new THREE.Vector3(...a), new THREE.Vector3(...b));
    return mesh(parent,new THREE.TubeGeometry(curve,1,radius,5,false),material,name);
  }
  function contour(parent, name, material, points, radius = .007) {
    for(let i=0;i<points.length-1;i++) segment(parent,name+"-"+i,material,points[i],points[i+1],radius);
  }
  function polygon(parent,name,material,pts,z) {
    const s=new THREE.Shape();
    s.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i++) s.lineTo(pts[i][0],pts[i][1]);
    s.closePath();
    return mesh(parent,new THREE.ShapeGeometry(s),material,name,0,0,z);
  }
  // Shoes, feet and long black tailored trousers.
  const hip = new THREE.Group(); hip.name="Hips"; root.add(hip);
  hip.position.y=1.05;
  oval(hip,"Tailored waist",M.fabric,[0,-.08,0],[.28,.22,.19]);
  for(const sign of [-1,1]) {
    const x=sign*.153;
    const leg=new THREE.Group();leg.position.set(x,-.10,0);hip.add(leg);
    oval(leg,"Trouser upper",M.fabric,[0,-.23,0],[.147,.4,.155]);
    oval(leg,"Trouser hem",M.fabric,[0,-.73,0],[.118,.30,.13]);
    const crease = segment(leg,"Trouser crease",M.black,[0,-.18,.148],[0,-.91,.12],.003);
    crease.material=M.black;
    const foot=oval(root,"Black polished shoe",M.shoe,[x,.10,.115],[.151,.105,.315]);
    cube(root,"Shoe gold buckle",M.gold,[x,.185,.31],[.12,.012,.023]);
  }
  cube(root,"Belt",M.black,[0,1.09,.20],[.54,.084,.07]);
  cube(root,"Belt buckle",M.gold,[0,1.09,.245],[.115,.068,.022]);
  cube(root,"Belt dark inset",M.black,[0,1.09,.259],[.078,.038,.007]);

  const body = new THREE.Group();body.position.y=1.1;body.name="Chest + coat";root.add(body);
  const torso=oval(body,"Fitted black vest",M.black,[0,.40,0],[.37,.47,.22]);
  oval(body,"White shoulder line",M.white,[0,.70,-.08],[.51,.14,.22]);
  oval(body,"Black high collar",M.black,[0,.84,.02],[.18,.16,.15]);
  const lapelLeft=polygon(body,"Left lapel",M.white,[[-.36,.74],[-.19,.83],[-.08,.33],[-.29,.43]],.225);
  const lapelRight=polygon(body,"Right lapel",M.white,[[.36,.74],[.19,.83],[.08,.33],[.29,.43]],.225);
  contour(body,"Gold lapel border",M.gold,[[-.36,.74,.243],[-.19,.83,.243],[-.08,.33,.243]],.007);
  contour(body,"Gold lapel border",M.gold,[[.36,.74,.243],[.19,.83,.243],[.08,.33,.243]],.007);
  // Tie and double-breasted buttons.
  polygon(body,"Royal blue tie",M.blue,[[0,.84],[-.067,.73],[-.040,.23],[0,.16],[.040,.23],[.067,.73]],.268);
  for(let i=0;i<5;i++) segment(body,"Tie gold lines",M.gold,[-.041,.64-i*.087,.278],[.046,.68-i*.087,.278],.003);
  for(const sign of [-1,1]) for(let i=0;i<3;i++)
    oval(body,"Gold uniform button",M.goldBright,[sign*.13,.52-i*.135,.232],[.018,.018,.012]);

  // Back skirt gives the coat its signature flowing white silhouette.
  const back=new THREE.Group();back.name="Back coat";back.position.y=.53;body.add(back);
  polygon(back,"Long back coat",M.white,[[-.36,.19],[.36,.19],[.62,-1.50],[-.62,-1.50]],-.23);
  polygon(back,"Blue inner coat",M.blue,[[-.23,-.1],[.23,-.1],[.46,-1.38],[-.46,-1.38]],-.222);
  for(const sign of [-1,1]) contour(back,"Tail gold piping",M.gold,[[sign*.36,.18,-.21],[sign*.60,-1.45,-.21]],.008);

  const tails=[];
  for(const sign of [-1,1]){
    const tail=new THREE.Group();tail.position.set(sign*.16,.36,.21);body.add(tail);
    const p=[[0,.29],[sign*.23,.29],[sign*.44,-1.20],[sign*.51,-1.43],[sign*.07,-1.32]];
    polygon(tail,"White coat front tail",M.white,p,0);
    polygon(tail,"Blue coat lining",M.blue,[[sign*.13,-.13],[sign*.25,-.16],[sign*.42,-1.24],[sign*.39,-1.29]],.006);
    contour(tail,"Gold trim",M.gold,[[sign*.23,.28,.016],[sign*.43,-1.17,.016],[sign*.51,-1.42,.016]],.009);
    oval(tail,"Blue gem near hem",M.blueLight,[sign*.32,-1.12,.022],[.027,.055,.012]);
    tails.push(tail);
  }
  // Gold chains and diamond-shaped blue enamel emblems.
  contour(body,"Formal chest chain",M.goldBright,[[-.26,.54,.30],[-.12,.47,.31],[.17,.34,.29],[.27,.39,.275]],.005);
  for(const sign of [-1,1]){
    polygon(body,"Blue insignia",M.blueLight,[[sign*.31,.72],[sign*.34,.65],[sign*.31,.58],[sign*.28,.65]],.282);
    contour(body,"Insignia gold diamond",M.gold,[[sign*.31,.73,.29],[sign*.35,.65,.29],[sign*.31,.57,.29],[sign*.27,.65,.29],[sign*.31,.73,.29]],.004);
  }
  // Arms pivot at shoulders; sleeve collars are attached to the arm groups.
  const arms=[];
  for(const sign of [-1,1]){
    const shoulder=new THREE.Group();shoulder.name=sign<0?"Left shoulder":"Right shoulder";
    shoulder.position.set(sign*.43,.70,-.005);body.add(shoulder);
    oval(shoulder,"White upper sleeve",M.white,[sign*.055,-.20,0],[.16,.32,.175]);
    oval(shoulder,"White lower sleeve",M.shade,[sign*.11,-.53,.025],[.143,.28,.16]);
    oval(shoulder,"Cuff dark fabric",M.black,[sign*.11,-.73,.04],[.142,.074,.154]);
    oval(shoulder,"Visible hand",M.skin,[sign*.11,-.83,.08],[.096,.108,.086]);
    oval(shoulder,"Gold shoulder epaulette",M.gold,[0,.045,.02],[.195,.055,.18]);
    polygon(shoulder,"Shoulder blue accent",M.blue,[[sign*-.13,.10],[sign*.14,.10],[sign*.19,-.10],[sign*.03,-.04]],.182);
    arms.push(shoulder);
  }
  // Neck and expressive face pivot.
  oval(body,"Neck",M.skin,[0,.99,.035],[.13,.19,.122]);
  const head=new THREE.Group();head.position.set(0,1.25,.017);body.add(head);
  head.name="Head and face pivot";
  oval(head,"Anime face",M.skin,[0,.045,.015],[.252,.331,.211]);
  oval(head,"Chin taper",M.skin,[0,-.179,.095],[.151,.12,.16]);
  oval(head,"Subtle nose",M.skin,[0,-.002,.228],[.031,.061,.039]);
  const eyes=[];
  for(const sign of [-1,1]){
    const eye=new THREE.Group();eye.position.set(sign*.105,.076,.210);head.add(eye);
    oval(eye,"Sclera",M.whiteEye,[0,0,0],[.079,.039,.012]);
    const iris=oval(eye,"Blue iris",M.iris,[0,0,.015],[.029,.033,.009]);
    oval(eye,"Pupil",M.pupil,[0,0,.025],[.015,.027,.009]);
    oval(eye,"Eye sparkle",M.whiteEye,[-.012,.012,.034],[.007,.009,.005]);
    contour(head,"Upper eyelid",M.black,[[sign*.037,.102,.229],[sign*.112,.116,.235],[sign*.18,.103,.217]],.007);
    segment(head,"Silver eyebrow",M.hairShade,[sign*.053,.151,.205],[sign*.175,.158,.195],.009);
    eyes.push(eye);
  }
  // Wireframe rectangular spectacles.
  for(const s of [-1,1]) {
    contour(head,"Glasses rectangular rim",M.gold,[
      [s*.025,.12,.256],[s*.191,.12,.236],[s*.189,.03,.231],
      [s*.036,.03,.255],[s*.025,.12,.256]
    ],.004);
    segment(head,"Glasses temple",M.gold,[s*.190,.10,.231],[s*.26,.09,.13],.004);
  }
  segment(head,"Glasses bridge",M.gold,[-.025,.10,.260],[.025,.10,.260],.004);
  const mouth=oval(head,"Animated speaking mouth",M.skinShadow,[0,-.133,.223],[.049,.007,.008]);
  // Silver layered head of hair with asymmetrical bangs and long back strands.
  oval(head,"Silvery hair volume",M.silver,[0,.255,-.025],[.29,.215,.22]);
  for(let i=0;i<17;i++){
    const angle=i*Math.PI*2/17;
    const x=Math.sin(angle)*.23, z=Math.cos(angle)*.145-.025;
    const length=.18+.11*(i%4)/3;
    const strand=mesh(head,new THREE.ConeGeometry(.064,length,5),i%3?M.silver:M.hairShade,
      "Silver hair layered strand",x,.285,z);
    strand.rotation.z=Math.sin(angle)*.36;
    strand.rotation.x=-Math.cos(angle)*.42;
    strand.position.y=.25;
  }
  for(let i=0;i<9;i++){
    const x=-.20+i*.047;
    const strand=mesh(head,new THREE.ConeGeometry(.043,.25+(i%3)*.018,5),
      i%4?M.silver:M.hairShade,"Long silver anime fringe",x,.21,.181);
    strand.rotation.z=(i-4)*-.065;
    strand.rotation.x=.35;
  }
  for(const sign of [-1,1]) for(let i=0;i<5;i++) {
    const lock=oval(head,"Neck length silver hair",i%2?M.hairShade:M.silver,
      [sign*(.22+i*.008),-.12-i*.065,-.10],[.07,.16,.083]);
    lock.rotation.z=sign*(.23+i*.04);
  }
  // Collar brooch over blue centerline.
  oval(body,"Sapphire brooch",M.blueLight,[.24,.60,.30],[.043,.065,.022]);
  oval(body,"Golden brooch setting",M.gold,[.24,.60,.281],[.054,.076,.012]);

  const eyeBases=eyes.map(x=>x.position.clone());
  function update({ gaze, mode, speaking, blink, wave, reducedMotion, pose }, time, delta){
    const damp=THREE.MathUtils.damp;
    const motion=reducedMotion?0:1;
    const tx=gaze.x*motion,ty=gaze.y*motion;
    body.rotation.z=damp(body.rotation.z,motion*Math.sin(time*.62)*.007,3,delta);
    body.position.y=damp(body.position.y,1.1+motion*Math.sin(time*1.5)*.009,3,delta);
    head.rotation.y=damp(head.rotation.y,tx*.22,5,delta);
    head.rotation.x=damp(head.rotation.x,-ty*.12+(pose?.headX??0)*motion,5,delta);
    head.rotation.z=damp(head.rotation.z,(pose?.headZ??0)*motion,4,delta);
    for(let i=0;i<eyes.length;i++){
      eyes[i].position.x=damp(eyes[i].position.x,eyeBases[i].x+tx*.012,7,delta);
      eyes[i].position.y=damp(eyes[i].position.y,eyeBases[i].y+ty*.011,7,delta);
      eyes[i].scale.y=damp(eyes[i].scale.y,blink&&motion?.08:1,22,delta);
    }
    mouth.scale.y=damp(mouth.scale.y,speaking?(.7+.36*Math.abs(Math.sin(time*9))):.13,9,delta);
    mouth.scale.x=damp(mouth.scale.x,speaking?.75:1,7,delta);
    const explain=mode==="explaining"?1:mode==="thinking"?.2:0;
    const rightZ=wave&&motion?1.18:explain*.63;
    arms[1].rotation.z=damp(arms[1].rotation.z,rightZ*motion,5,delta);
    arms[0].rotation.z=damp(arms[0].rotation.z,-explain*.13*motion,5,delta);
    for(let i=0;i<tails.length;i++) tails[i].rotation.z=motion*Math.sin(time*1.12+i)*.01;
  }
  function dispose() {
    const geos=new Set(), mats=new Set();
    root.traverse(o=>{if(o.isMesh){geos.add(o.geometry);mats.add(o.material);}});
    geos.forEach(x=>x.dispose());mats.forEach(x=>x.dispose());
  }
  return {group:root,update,dispose};
}
