// Geometric interactive prototype, not the final commissioned rigged 3D asset.
export function createSilverProfessor(T) {
  const root = new T.Group();
  const white=new T.MeshStandardMaterial({color:0xe5e8f1,roughness:.35,metalness:.15});
  const silver=new T.MeshStandardMaterial({color:0xc7cbd9,roughness:.58});
  const black=new T.MeshStandardMaterial({color:0x111523,roughness:.55});
  const navy=new T.MeshStandardMaterial({color:0x183365,roughness:.42});
  const gold=new T.MeshStandardMaterial({color:0xd4ae68,metalness:.72,roughness:.26});
  const blue=new T.MeshStandardMaterial({color:0x3789ff,metalness:.45,roughness:.22});
  const skin=new T.MeshStandardMaterial({color:0xf1d6c9,roughness:.65});
  const eyes=new T.MeshStandardMaterial({color:0x74baf3,roughness:.2});
  const dark=new T.MeshStandardMaterial({color:0x141824,roughness:.3});
  const eyesPivot=[], lids=[];
  function mesh(parent,geo,mat,x,y,z,sx=1,sy=1,sz=1){
    const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;
  }
  const sphere=new T.SphereGeometry(1,18,12), cylinder=new T.CylinderGeometry(1,1,1,12);
  function orb(p,mat,x,y,z,sx,sy,sz){return mesh(p,sphere,mat,x,y,z,sx,sy,sz);}
  function rod(p,mat,x,y,z,sx,sy,sz){return mesh(p,cylinder,mat,x,y,z,sx,sy,sz);}
  // Full body at a natural ~2.1 meter scale.
  for (const s of [-1,1]) {
    rod(root,black,s*.16,.51,0,.13,.44,.135);
    orb(root,black,s*.16,.94,0,.14,.16,.14);
    orb(root,dark,s*.16,.095,.14,.17,.09,.29);
    orb(root,gold,s*.16,.12,.35,.16,.015,.014);
  }
  orb(root,black,0,1.39,0,.35,.45,.19);
  orb(root,white,0,1.45,-.13,.40,.48,.20);
  orb(root,black,0,1.47,.12,.29,.39,.15);
  rod(root,black,0,1.13,.13,.32,.08,.19);
  rod(root,gold,0,1.14,.295,.33,.015,.02);
  const tie=orb(root,navy,0,1.68,.285,.065,.22,.023);
  orb(root,blue,0,1.79,.30,.07,.05,.035);
  for(let i=0;i<4;i++) orb(root,gold,i%2?-.105:.105,1.25+i*.12,.276,.018,.018,.012);
  // Separate coat tails and wide lapels.
  for(const s of [-1,1]){
    const tail=orb(root,white,s*.25,.81,-.11,.24,.80,.18);
    tail.rotation.z=s*.07;
    const lining=orb(root,navy,s*.31,.76,.015,.105,.7,.045);
    lining.rotation.z=s*.08;
    const lapel=orb(root,white,s*.20,1.61,.24,.13,.36,.07);
    lapel.rotation.z=s*.35;
    const edge=orb(root,gold,s*.28,1.61,.30,.012,.34,.018);edge.rotation.z=s*.32;
    orb(root,blue,s*.25,1.72,.345,.035,.060,.020);
  }
  const arms={};
  for(const s of [-1,1]){
    const arm=new T.Group();arm.position.set(s*.38,1.74,0);root.add(arm);
    const sleeve=orb(arm,white,s*.11,-.28,0,.20,.38,.21);sleeve.rotation.z=s*-.22;
    orb(arm,gold,s*.16,-.58,.016,.20,.018,.20);
    orb(arm,black,s*.17,-.66,.045,.12,.12,.12);
    orb(arm,skin,s*.17,-.77,.05,.085,.095,.08);
    orb(root,navy,s*.40,1.77,.01,.16,.13,.22);
    arms[s]=arm;
  }
  rod(root,skin,0,1.87,.0,.115,.15,.105);
  const head=new T.Group();head.position.set(0,2.01,.02);root.add(head);
  orb(head,skin,0,.08,.055,.28,.34,.25);
  orb(head,silver,0,.32,-.055,.33,.23,.31);
  for(let i=0;i<19;i++){
    const angle=i*2.39996;
    const x=Math.sin(angle)*(.14+.12*(i%3)/2), z=Math.cos(angle)*(.14+.10*(i%3)/2);
    const tuft=orb(head,silver,x,.35+Math.cos(i*2)*.09,z,.09,.23,.12);
    tuft.rotation.z=Math.sin(i*1.6)*.40;
  }
  // Rectangular spectacles and blue eyes.
  for(const s of [-1,1]){
    const eyeGroup=new T.Group();eyeGroup.position.set(s*.125,.11,.289);head.add(eyeGroup);
    orb(eyeGroup,white,0,0,0,.094,.066,.018);
    orb(eyeGroup,eyes,0,0,.022,.035,.052,.015);
    orb(eyeGroup,dark,0,0,.04,.016,.036,.012);
    eyesPivot.push(eyeGroup);
    // metallic frame: horizontal glass rim, short upper and lower edges
    orb(head,gold,s*.125,.179,.32,.11,.009,.011);
    orb(head,gold,s*.125,.045,.32,.11,.009,.011);
    rod(head,gold,s*.245,.111,.318,.008,.14,.012);
    rod(head,gold,s*.008,.112,.325,.008,.11,.008);
    lids.push(orb(head,skin,s*.125,.168,.337,.09,.008,.018));
    orb(head,silver,s*.30,.23,.03,.09,.18,.13);
  }
  orb(head,skin,0,.045,.335,.049,.075,.07);
  const mouth=orb(head,dark,0,-.10,.281,.061,.009,.014);
  orb(head,silver,0,.45,.10,.19,.12,.14);
  function update({pose,gaze,dt,t,now,talk,blink,wave,reduced}){
    const damp=(v,target)=>T.MathUtils.damp(v,target,5,dt);
    head.rotation.y=damp(head.rotation.y,reduced?0:gaze.x*.22);
    head.rotation.x=damp(head.rotation.x,reduced?0:-gaze.y*.10+pose.headX);
    head.rotation.z=damp(head.rotation.z,reduced?0:pose.headZ);
    for(const e of eyesPivot){e.position.x += (Math.sign(e.position.x)*.125 + (reduced?0:gaze.x*.013)-e.position.x)*Math.min(1,dt*6);}
    // These eyelids are tiny spheres. Scale in scene units, never to 1 or 55:
    // those values stretched them into giant vertical columns over the face.
    for (const lid of lids) {
      lid.scale.y=T.MathUtils.damp(lid.scale.y,blink?.071:.008,20,dt);
      lid.position.y=T.MathUtils.damp(lid.position.y,blink?.114:.168,20,dt);
    }
    arms[-1].rotation.z=damp(arms[-1].rotation.z,wave?.65:-pose.armLeft);
    arms[1].rotation.z=damp(arms[1].rotation.z,wave?-1:pose.armRight);
    mouth.scale.y=damp(mouth.scale.y,talk?Math.max(2,9*Math.abs(Math.sin(t*10))):1);
    root.position.y=damp(root.position.y,reduced?0:Math.sin(t*1.5)*.008);
  }
  const dispose=()=>root.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
  return {root,update,dispose};
}
