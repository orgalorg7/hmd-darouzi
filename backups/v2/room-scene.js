import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// An interactive schematic, not a production engineering drawing.
export function createColdRoom(host) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.setClearColor(0x000000,0);
  const gl=renderer.getContext();const debug=gl.getExtension('WEBGL_debug_renderer_info');const software=debug&&/swiftshader|llvmpipe|software/i.test(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL));
  renderer.shadowMap.enabled=!software;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;
  renderer.domElement.setAttribute('aria-hidden','true');
  host.append(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(33,1,.1,80);camera.position.set(9,7.4,11.5);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(.45,1.2,0);controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=true;controls.dampingFactor=.07;controls.minPolarAngle=.55;controls.maxPolarAngle=1.4;controls.minAzimuthAngle=-.7;controls.maxAzimuthAngle=1.5;controls.rotateSpeed=.55;renderer.domElement.style.touchAction='pan-y';
  const hemi=new THREE.HemisphereLight(0xffffff,0x91a9af,3.1);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffffff,4.3);sun.position.set(2,9,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.normalBias=.03;scene.add(sun);
  const rim=new THREE.DirectionalLight(0x6bb9ff,3.2);rim.position.set(-4,3,-4);scene.add(rim);
  const room=new THREE.Group();scene.add(room);
  const white=new THREE.MeshStandardMaterial({color:0xe5edf0,roughness:.34,metalness:.22});
  const edge=new THREE.MeshStandardMaterial({color:0xb8c9cf,roughness:.4,metalness:.72});
  const blue=new THREE.MeshStandardMaterial({color:0x165ec9,roughness:.24,metalness:.3});
  const dark=new THREE.MeshStandardMaterial({color:0x233440,roughness:.65,metalness:.55});
  const silver=new THREE.MeshStandardMaterial({color:0x8dabb8,roughness:.26,metalness:.8});
  const insulation=new THREE.MeshStandardMaterial({color:0xe6d7a2,roughness:.9});
  const floorMat=new THREE.MeshStandardMaterial({color:0xc4d7dd,roughness:.38,metalness:.4});
  const thermalMat=new THREE.MeshStandardMaterial({color:0x6dbbdf,roughness:.4,metalness:.1});
  const contents=new THREE.Group();room.add(contents);
  const moving=[];const fans=[];
  function box(w,h,d,material,x=0,y=0,z=0,parent=room){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function cylinder(r,h,material,x,y,z,parent=room){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),material);mesh.position.set(x,y,z);parent.add(mesh);mesh.castShadow=true;return mesh;}
  function pipe(points,r=.025,material=silver,parent=room){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,24,r,6,false),material);parent.add(mesh);return mesh;}
  function panel(w,h,d,x,y,z,offset){const group=new THREE.Group();group.position.set(x,y,z);room.add(group);box(w,h,d,white,0,0,0,group);moving.push({object:group,base:group.position.clone(),offset:new THREE.Vector3(...offset)});return group;}
  const base=box(5.6,.16,4.4,silver,0,.04,0);box(5.2,.09,4,floorMat,0,.17,0);
  // Shallow seams in the floor and wall panels keep the geometry legible at a distance.
  for(let x=-2.3;x<=2.3;x+=.48)box(.009,.006,3.95,edge,x,.218,0);
  for(let i=0;i<10;i++){
    const x=-2.25+i*.5;panel(.49,2.8,.13,x,1.62,-2,[0,0,-1.3]);
    box(.015,2.8,.015,edge,x-.245,1.62,-1.925);
  }
  for(let i=0;i<8;i++){const z=-1.75+i*.5;panel(.13,2.8,.49,-2.55,1.62,z,[-1.2,0,0]);}
  box(5.2,.07,.18,edge,0,3.04,-2);box(.18,.07,4.1,edge,-2.55,3.04,0);
  const rightWall=panel(.13,1.12,4,2.55,.79,0,[1.4,0,0]);
  box(.16,.06,4.04,edge,2.55,1.38,0,rightWall.parent);
  const roof=panel(5.2,.04,4,0,3.1,0,[0,1.5,0]);roof.visible=false;
  const roofCore=box(5.12,.11,3.92,insulation,0,-.08,0,roof);const roofInner=box(5.2,.025,4,white,0,-.16,0,roof);
  const front=new THREE.Group();room.add(front);front.visible=false;
  box(1.1,2.8,.13,white,-2,1.62,2,front);box(2.35,2.8,.13,white,1.38,1.62,2,front);box(1.55,.35,.13,white,-.7,2.845,2,front);
  // Hinged insulated door, visible in both exterior and cutaway views.
  const doorPivot=new THREE.Group();doorPivot.position.set(-1.45,.22,2.07);room.add(doorPivot);
  box(1.5,2.47,.14,blue,.75,1.235,0,doorPivot);box(.12,2.4,.16,edge,1.39,1.235,.07,doorPivot);
  box(.045,.48,.1,silver,1.25,1.22,.16,doorPivot);box(.035,.12,.19,silver,1.25,1.44,.12,doorPivot);box(.035,.12,.19,silver,1.25,1,.12,doorPivot);
  for(const y of [.5,1.9])box(.14,.2,.22,silver,.04,y,0,doorPivot);
  // Back-wall evaporator, fan housings, grilles and rotating fan rotors.
  const unit=new THREE.Group();unit.position.set(-.2,2.38,-1.62);room.add(unit);
  box(2.5,.63,.58,white,0,0,0,unit);box(2.6,.07,.68,edge,0,-.34,0,unit);
  function fan(x,y,z,r,parent){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.025,8,40),dark);ring.position.set(x,y,z);parent.add(ring);
    const disk=new THREE.Mesh(new THREE.CircleGeometry(r*.92,40),dark);disk.position.set(x,y,z-.018);parent.add(disk);
    const rotor=new THREE.Group();rotor.position.set(x,y,z+.005);parent.add(rotor);fans.push(rotor);
    for(let i=0;i<5;i++){const blade=new THREE.Mesh(new THREE.SphereGeometry(1,10,6),silver);blade.scale.set(r*.18,r*.63,.018);blade.position.set(Math.sin(i*Math.PI*2/5)*r*.4,Math.cos(i*Math.PI*2/5)*r*.4,0);blade.rotation.z=-i*Math.PI*2/5+.4;rotor.add(blade);}
    const hub=new THREE.Mesh(new THREE.CircleGeometry(r*.18,20),edge);hub.position.z=.035;rotor.add(hub);
    for(let i=1;i<4;i++){const grille=new THREE.Mesh(new THREE.TorusGeometry(r*i/4,.006,4,36),edge);grille.position.set(x,y,z+.04);parent.add(grille);}
    for(let i=0;i<4;i++){const bar=box(r*2,.009,.009,edge,x,y,z+.05,parent);bar.rotation.z=i*Math.PI/4;}
  }
  for(let i=-1;i<=1;i++)fan(i*.79,0,.31,.24,unit);
  pipe([[1.08,2.55,-1.6],[1.8,2.55,-1.6],[2.75,2.55,-1.6],[2.95,2.55,-1.5],[2.95,.9,-1.3]],.035);
  pipe([[1.08,2.4,-1.6],[1.9,2.4,-1.6],[2.85,2.4,-1.6],[3.08,2.4,-1.4],[3.08,.85,-1.3]],.025);
  // Pallets and storage crates provide honest scale references within the conceptual room.
  const crateMat=new THREE.MeshStandardMaterial({color:0xadc7d2,roughness:.9});
  for(let i=0;i<2;i++){
    const x=-1.5+i*1.45;box(1.1,.1,.85,silver,x,.28,-.8,contents);
    for(let level=0;level<2;level++){
      box(1,.43,.78,crateMat,x,.56+level*.46,-.8,contents);
      for(let j=0;j<5;j++)box(.105,.22,.015,dark,x-.36+j*.18,.56+level*.46,-.399,contents);
    }
  }
  const condenser=new THREE.Group();condenser.position.set(3.45,.65,-.4);scene.add(condenser);
  box(1.3,1.1,1.2,white,0,0,0,condenser);box(1.4,.08,1.3,blue,0,-.6,0,condenser);
  fan(0,.05,.62,.43,condenser);
  for(let i=0;i<12;i++)box(.015,.9,.017,dark,.66,-.38+i*.068,.0,condenser).rotation.x=Math.PI/2;
  box(.14,.22,.14,dark,-.48,-.7,-.45,condenser);box(.14,.22,.14,dark,.48,-.7,.45,condenser);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.13}));ground.rotation.x=-Math.PI/2;ground.position.y=-.08;ground.receiveShadow=true;scene.add(ground);
  const pad=new THREE.Mesh(new THREE.CylinderGeometry(5.4,5.4,.03,80),new THREE.MeshStandardMaterial({color:0xe5ecef,roughness:1}));pad.position.set(.5,-.06,0);scene.add(pad);
  const particleCount=110;const positions=new Float32Array(particleCount*3);const seeds=[];
  for(let i=0;i<particleCount;i++){seeds.push(Math.random());positions[i*3]=(Math.random()-.5)*4.5;positions[i*3+1]=Math.random()*2.8+.25;positions[i*3+2]=(Math.random()-.5)*3.5;}
  const particleGeo=new THREE.BufferGeometry();particleGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const particleMat=new THREE.PointsMaterial({color:0x377ecd,size:.032,transparent:true,opacity:.25,depthWrite:false});
  const particles=new THREE.Points(particleGeo,particleMat);room.add(particles);
  const streamMat=new THREE.LineBasicMaterial({color:0x3386e3,transparent:true,opacity:.24});
  const streams=new THREE.Group();room.add(streams);
  for(let i=0;i<8;i++){
    const x=-1.1+i*.32;const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x,2.15,-1.35),new THREE.Vector3(x,1.7,-.8),new THREE.Vector3(x,.8,.5),new THREE.Vector3(x,.38,1.6)]);
    streams.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(30)),streamMat));
  }
  const state={mode:'cutaway',temperature:-18,door:true,explode:0,doorAngle:-1.85,width:5,length:4,visible:true};
  const hotspots=[{key:'cooling',point:new THREE.Vector3(-.2,2.8,-1.3)},{key:'panels',point:new THREE.Vector3(-2.55,1.7,.4)},{key:'door',point:new THREE.Vector3(-.6,1.5,2.15)}];
  let frame=0,last=0,disposed=false,rendering=false,idleUntil=0,settleInitial=true;
  const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<600?43:33;camera.updateProjectionMatrix();wake();};
  const ro=new ResizeObserver(resize);ro.observe(host);resize();
  const io=new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;if(state.visible&&!frame)frame=requestAnimationFrame(tick);},{rootMargin:'150px'});io.observe(host);
  function tick(now){
    frame=0;if(disposed||!state.visible||document.hidden)return;
    if(!reduced.matches&&now-last<32){frame=requestAnimationFrame(tick);return;}
    const dt=Math.min((now-last)/1000||.016,.05);last=now;rendering=true;
    const speed=(reduced.matches||settleInitial)?1:Math.min(dt*6,1);
    const target=state.mode==='exploded'?1:0;if(Math.abs((state.mode==='exterior'?2.5:1)-rightWall.scale.y)>.001||Math.abs(target-state.explode)>.001||Math.abs((state.door?-1.85:0)-state.doorAngle)>.001||Math.abs(state.width/5-room.scale.x)>.001||Math.abs(state.length/4-room.scale.z)>.001)renderer.shadowMap.needsUpdate=true;state.explode+=(target-state.explode)*speed;
    for(const m of moving)m.object.position.copy(m.base).addScaledVector(m.offset,state.explode);
    roof.visible=state.mode==='exterior'||state.explode>.02;front.visible=state.mode==='exterior';roofCore.position.y=-.08-state.explode*.25;roofInner.position.y=-.16-state.explode*.5;
    rightWall.scale.y+=((state.mode==='exterior'?2.5:1)-rightWall.scale.y)*speed;rightWall.position.y=.79+(rightWall.scale.y-1)*.55;condenser.position.x=3.45*room.scale.x;
    state.doorAngle+=((state.door?-1.85:0)-state.doorAngle)*speed;doorPivot.rotation.y=state.doorAngle;
    room.scale.x+=(state.width/5-room.scale.x)*speed;room.scale.z+=(state.length/4-room.scale.z)*speed;
    if(!reduced.matches){fans.forEach(f=>f.rotation.z-=dt*(state.temperature<0?5:2));const p=particleGeo.attributes.position;for(let i=0;i<particleCount;i++){p.array[i*3+1]-=dt*(.1+seeds[i]*.15);p.array[i*3+2]+=dt*.1;if(p.array[i*3+1]<.25){p.array[i*3+1]=2.8;p.array[i*3+2]=-1.4;}}p.needsUpdate=true;}
    camera.zoom+=((state.mode==='exploded'?.9:1)/Math.max(1,(state.width/5+state.length/4)/2)-camera.zoom)*speed;camera.updateProjectionMatrix();controls.update();renderer.render(scene,camera);
    for(const h of hotspots){const p=h.point.clone();p.x*=room.scale.x;p.z*=room.scale.z;p.project(camera);const element=host.parentElement.querySelector(`[data-hotspot="${h.key}"]`);if(element){element.style.left=`${Math.round((p.x*.5+.5)*host.clientWidth)}px`;element.style.top=`${Math.round((-p.y*.5+.5)*host.clientHeight)}px`;}}
    settleInitial=false;rendering=false;if(!reduced.matches&&now<idleUntil)frame=requestAnimationFrame(tick);
  }
  function wake(){if(rendering)return;idleUntil=performance.now()+2500;if(!disposed&&state.visible&&!frame)frame=requestAnimationFrame(tick);}
  function setTemperature(value){state.temperature=value;const cold=Math.max(0,Math.min(1,(15-value)/55));floorMat.color.setHSL(.57,.12+cold*.3,.85-cold*.16);particleMat.opacity=.08+cold*.6;particleMat.size=.018+cold*.035;streamMat.opacity=.12+cold*.32;rim.intensity=1+cold*4;white.color.setHSL(.56,cold*.18,.94-cold*.09);host.parentElement.style.setProperty('--cold',cold);wake();}
  const resume=()=>{if(!document.hidden&&state.visible)wake();};document.addEventListener('visibilitychange',resume);controls.addEventListener('change',wake);
  host.dataset.scene='ready';setTemperature(-18);wake();
  return {
    capture(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');},
    finishSetup(){idleUntil=0;settleInitial=true;},
    setMode(mode){state.mode=mode;host.dataset.mode=mode;renderer.shadowMap.needsUpdate=true;wake();},
    setTemperature,
    setDimensions(width,length){state.width=width;state.length=length;wake();},
    setDoor(open){state.door=open;wake();},
    rotate(direction){controls.rotateLeft(direction*.25);controls.update();wake();},
    reset(){controls.enableDamping=false;controls.update();camera.position.set(9,7.4,11.5);controls.target.set(.45,1.2,0);controls.update();controls.enableDamping=true;wake();},
    dispose(){disposed=true;cancelAnimationFrame(frame);ro.disconnect();io.disconnect();controls.dispose();renderer.dispose();document.removeEventListener('visibilitychange',resume);scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});renderer.domElement.remove();}
  };
}
