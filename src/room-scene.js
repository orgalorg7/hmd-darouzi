import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clampDoor, doorWidth, separateDoor } from './doors.js';

// An interactive schematic, not a production engineering drawing.
export function createColdRoom(host, options = {}) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({antialias:!options.constrained,alpha:true,powerPreference:'low-power'});
  renderer.setClearColor(0x000000,0);
  const gl=renderer.getContext();const debug=gl.getExtension('WEBGL_debug_renderer_info');const software=debug&&/swiftshader|llvmpipe|software/i.test(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL));
  let lowPower=Boolean(software||options.constrained||navigator.connection?.saveData);
  let frameInterval=lowPower?32:15;
  const makeMaterial=settings=>lowPower?new THREE.MeshLambertMaterial({color:settings.color}):new THREE.MeshStandardMaterial(settings);
  renderer.shadowMap.enabled=!lowPower;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;
  renderer.domElement.setAttribute('aria-hidden','true');
  host.append(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(33,1,.1,80);camera.position.set(9,7.4,11.5);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(.45,1.2,0);controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=true;controls.dampingFactor=.07;controls.minPolarAngle=.55;controls.maxPolarAngle=1.4;controls.minAzimuthAngle=-.7;controls.maxAzimuthAngle=1.5;controls.rotateSpeed=.55;renderer.domElement.style.touchAction='pan-y';
  const hemi=new THREE.HemisphereLight(0xffffff,0x91a9af,3.1);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffffff,4.3);sun.position.set(2,9,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.normalBias=.03;scene.add(sun);
  const rim=new THREE.DirectionalLight(0x6bb9ff,3.2);rim.position.set(-4,3,-4);scene.add(rim);
  const room=new THREE.Group();scene.add(room);
  const white=makeMaterial({color:0xe5edf0,roughness:.34,metalness:.22});
  const edge=makeMaterial({color:0xb8c9cf,roughness:.4,metalness:.72});
  const blue=makeMaterial({color:0x165ec9,roughness:.24,metalness:.3});
  const dark=makeMaterial({color:0x233440,roughness:.65,metalness:.55});
  const silver=makeMaterial({color:0x8dabb8,roughness:.26,metalness:.8});
  const insulation=makeMaterial({color:0xe6d7a2,roughness:.9});
  const floorMat=makeMaterial({color:0xc4d7dd,roughness:.38,metalness:.4});
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
  let insulationAnchor;
  for(let i=0;i<8;i++){const z=-1.75+i*.5;const wallPanel=panel(.13,2.8,.49,-2.55,1.62,z,[-1.2,0,0]);if(i===4)insulationAnchor=wallPanel;}
  box(5.2,.07,.18,edge,0,3.04,-2);box(.18,.07,4.1,edge,-2.55,3.04,0);
  const rightWall=panel(.13,1.12,4,2.55,.79,0,[1.4,0,0]);
  box(.16,.06,4.04,edge,2.55,1.38,0,rightWall.parent);
  const roof=panel(5.2,.04,4,0,3.1,0,[0,1.5,0]);roof.visible=false;
  const roofCore=box(5.12,.11,3.92,insulation,0,-.08,0,roof);const roofInner=box(5.2,.025,4,white,0,-.16,0,roof);
  const front=new THREE.Group();room.add(front);front.visible=false;
  box(5.2,2.8,.13,white,0,1.62,2,front);
  // Insulated doors live outside the scaled room so they keep their real size; each one slides along a wall.
  const insetBlue=makeMaterial({color:0x144994,roughness:.28,metalness:.32});
  const logoTexture=new THREE.TextureLoader().load('/assets/logo.webp',()=>wake());logoTexture.colorSpace=THREE.SRGBColorSpace;
  const markMaterial=new THREE.MeshBasicMaterial({map:logoTexture,transparent:true,depthWrite:false}),markGeometry=new THREE.PlaneGeometry(.4,.2);
  const doorHeight=2.2,doorsGroup=new THREE.Group();scene.add(doorsGroup);
  // Symmetric leaf: it reads correctly from inside (cutaway) and outside (exterior) on any wall.
  function makeDoor(){
    const door=new THREE.Group();doorsGroup.add(door);
    box(doorWidth,doorHeight,.2,blue,0,doorHeight/2,0,door);box(doorWidth-.2,doorHeight-.27,.21,insetBlue,0,doorHeight/2+.04,0,door);
    box(doorWidth-.2,.2,.215,silver,0,.17,0,door);box(doorWidth+.08,.05,.22,edge,0,doorHeight+.02,0,door);
    for(const x of [-1,1])box(.05,doorHeight,.22,edge,x*(doorWidth/2+.02),doorHeight/2,0,door);
    box(.045,.42,.27,silver,doorWidth/2-.17,1.05,0,door);
    for(const y of [.45,1.75])box(.1,.18,.24,silver,-doorWidth/2+.04,y,0,door);
    for(const side of [1,-1]){const mark=new THREE.Mesh(markGeometry,markMaterial);mark.position.set(-.08,1.78,side*.108);if(side<0)mark.rotation.y=Math.PI;door.add(mark);}
    return door;
  }
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
  // Coil fins, mounting brackets and a drain, grouped into a few draw calls below.
  for(let i=0;i<25;i++)box(.014,.46,.015,edge,-1.15+i*.096,-.015,-.3,unit);
  for(const x of [-1,1]){box(.08,.12,.19,silver,x,.37,-.13,unit);box(.12,.018,.23,dark,x,.43,-.13,unit);}
  pipe([[-1.2,2.05,-1.5],[-1.5,2.02,-1.5],[-1.7,1.9,-1.7],[-1.7,.3,-1.7]],.02);
  const ledMaterial=new THREE.MeshBasicMaterial({color:0xddf6ff});
  box(4.7,.025,.055,ledMaterial,0,2.93,-1.88);
  // Low-cost brushed steel texture: repeated narrow highlights on the floor only.
  const brushCanvas=document.createElement('canvas');brushCanvas.width=128;brushCanvas.height=128;
  const brush=brushCanvas.getContext('2d');brush.fillStyle='#cedae0';brush.fillRect(0,0,128,128);
  for(let i=0;i<128;i++){brush.fillStyle=`rgba(65,94,111,${.025+(i*17%11)/150})`;brush.fillRect(0,i,128,1);}
  const brushTexture=new THREE.CanvasTexture(brushCanvas);brushTexture.wrapS=brushTexture.wrapT=THREE.RepeatWrapping;brushTexture.repeat.set(3,3);brushTexture.colorSpace=THREE.SRGBColorSpace;floorMat.map=brushTexture;
  pipe([[1.08,2.55,-1.6],[1.8,2.55,-1.6],[2.75,2.55,-1.6],[2.95,2.55,-1.5],[2.95,.9,-1.3]],.035);
  pipe([[1.08,2.4,-1.6],[1.9,2.4,-1.6],[2.85,2.4,-1.6],[3.08,2.4,-1.4],[3.08,.85,-1.3]],.025);
  // Pallets and storage crates provide honest scale references within the conceptual room.
  const crateMat=makeMaterial({color:0xadc7d2,roughness:.9});
  for(let i=0;i<2;i++){
    const x=-1.5+i*1.45;box(1.1,.1,.85,silver,x,.28,-.8,contents);
    for(let level=0;level<2;level++){
      box(1,.43,.78,crateMat,x,.56+level*.46,-.8,contents);
      for(let j=0;j<5;j++)box(.105,.22,.015,dark,x-.36+j*.18,.56+level*.46,-.399,contents);
    }
  }
  const condenser=new THREE.Group();condenser.position.set(3.45,.65,-.4);scene.add(condenser);
  // Twin-fan condensing unit: it grows outward from the room, so its wall-side edge stays put.
  box(2.1,1.1,1.2,white,.4,0,0,condenser);box(2.2,.08,1.3,blue,.4,-.6,0,condenser);
  for(const x of [-.12,.92])fan(x,.05,.62,.4,condenser);
  box(.03,.9,.02,edge,.4,.05,.62,condenser);
  for(let i=0;i<12;i++)box(.015,.9,.017,dark,1.46,-.38+i*.068,.0,condenser).rotation.x=Math.PI/2;
  for(const x of [-.48,1.28])for(const z of [-.45,.45])box(.14,.22,.14,dark,x,-.7,z,condenser);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.13}));ground.rotation.x=-Math.PI/2;ground.position.y=-.08;ground.receiveShadow=true;scene.add(ground);
  const pad=new THREE.Mesh(new THREE.CylinderGeometry(5.4,5.4,.03,80),makeMaterial({color:0xe5ecef,roughness:1}));pad.position.set(.5,-.06,0);scene.add(pad);
  const padEdge=new THREE.Mesh(new THREE.CylinderGeometry(5.41,5.41,.07,80,1,true),edge);padEdge.position.copy(pad.position).y-=.04;scene.add(padEdge);
  // A baked contact shadow preserves depth on devices without hardware shadows.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
  const shadowContext=shadowCanvas.getContext('2d');const gradient=shadowContext.createRadialGradient(64,64,10,64,64,64);gradient.addColorStop(0,'rgba(28,59,80,.38)');gradient.addColorStop(.6,'rgba(28,59,80,.15)');gradient.addColorStop(1,'rgba(28,59,80,0)');shadowContext.fillStyle=gradient;shadowContext.fillRect(0,0,128,128);
  const contactTexture=new THREE.CanvasTexture(shadowCanvas);const contact=new THREE.Mesh(new THREE.PlaneGeometry(9,7.5),new THREE.MeshBasicMaterial({map:contactTexture,transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.set(.3,-.038,.4);scene.add(contact);
  const tickPositions=[];for(let i=0;i<72;i++){const a=i*Math.PI/36;for(const radius of [5.12,i%6===0?4.85:5.02])tickPositions.push(.5+Math.cos(a)*radius,-.038,Math.sin(a)*radius);}
  const tickGeometry=new THREE.BufferGeometry();tickGeometry.setAttribute('position',new THREE.Float32BufferAttribute(tickPositions,3));scene.add(new THREE.LineSegments(tickGeometry,new THREE.LineBasicMaterial({color:0x9fb5c1,transparent:true,opacity:.65})));
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
  const state={mode:'cutaway',temperature:-18,explode:0,width:5,length:4,height:2.8,visible:true};
  // Each door: the wall it sits on and its centre along that wall, in metres from the wall's midpoint.
  let doors=[];const doorObjects=[];
  const explodeOffsets={front:[0,0],back:[0,-1.3],left:[-1.2,0],right:[1.4,0]};
  // Doors follow the animated room size and height, and travel with their wall in the exploded view.
  function placeDoors(){
    const sx=room.scale.x,sy=room.scale.y,sz=room.scale.z;
    doors.forEach((d,i)=>{
      const door=doorObjects[i],side=d.wall==='left'||d.wall==='right',[ex,ez]=explodeOffsets[d.wall];
      door.rotation.y=side?Math.PI/2:0;door.scale.z=Math.max(1,(.13*(side?sx:sz)+.04)/.2);
      const x=side?(d.wall==='left'?-2.55:2.55)*sx:d.offset,z=side?d.offset:(d.wall==='back'?-2:2)*sz;
      door.position.set(x+ex*sx*state.explode,.22*sy,z+ez*sz*state.explode);
    });
  }
  // Dragging a door moves it to the wall nearest the pointer and slides it along that wall.
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),dragPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-1.1),dragPoint=new THREE.Vector3();
  let dragging=null;
  function aim(event){const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);}
  function pick(event){aim(event);const found=raycaster.intersectObjects(doorObjects,true)[0];if(!found)return -1;let object=found.object;while(object.parent!==doorsGroup)object=object.parent;return doorObjects.indexOf(object);}
  function moveDoor(index,event){
    aim(event);if(!raycaster.ray.intersectPlane(dragPlane,dragPoint))return;
    const hx=2.55*room.scale.x,hz=2*room.scale.z,gaps={front:Math.abs(dragPoint.z-hz),back:Math.abs(dragPoint.z+hz),left:Math.abs(dragPoint.x+hx),right:Math.abs(dragPoint.x-hx)};
    const wall=Object.keys(gaps).reduce((a,b)=>gaps[a]<=gaps[b]?a:b);
    doors[index]=clampDoor({wall,offset:wall==='left'||wall==='right'?dragPoint.z:dragPoint.x},state.width,state.length);doors[index]=separateDoor(doors,index,state.width,state.length);
    placeDoors();renderer.shadowMap.needsUpdate=true;wake();
  }
  const onDoorDown=event=>{if(event.button>0)return;const index=pick(event);if(index<0)return;dragging={index,id:event.pointerId};controls.enabled=false;renderer.domElement.setPointerCapture(event.pointerId);renderer.domElement.style.cursor='grabbing';event.preventDefault();};
  const onDoorMove=event=>{if(dragging){if(event.pointerId===dragging.id)moveDoor(dragging.index,event);}else if(event.pointerType==='mouse')renderer.domElement.style.cursor=pick(event)>=0?'grab':'';};
  const onDoorUp=event=>{if(!dragging||event.pointerId!==dragging.id)return;dragging=null;controls.enabled=true;renderer.domElement.style.cursor='';options.onDoorsChange?.(doors.map(d=>({...d})));};
  // Capture phase: runs before OrbitControls, so grabbing a door never also rotates the room.
  renderer.domElement.addEventListener('pointerdown',onDoorDown,{capture:true});renderer.domElement.addEventListener('pointermove',onDoorMove);
  renderer.domElement.addEventListener('pointerup',onDoorUp);renderer.domElement.addEventListener('pointercancel',onDoorUp);
  // Panels sharing an explosion direction are one assembly, not 18 animated draw calls.
  const wallAssemblies=new Map();
  for(const part of moving){const key=part.offset.toArray().join(',');const list=wallAssemblies.get(key)||[];list.push(part);wallAssemblies.set(key,list);}
  for(const parts of wallAssemblies.values()){
    if(parts.length<2)continue;
    const assembly=new THREE.Group();room.add(assembly);
    for(const part of parts){part.object.updateMatrix();for(const mesh of [...part.object.children]){mesh.applyMatrix4(part.object.matrix);assembly.add(mesh);}assembly.add(part.object);moving.splice(moving.indexOf(part),1);}
    moving.push({object:assembly,base:new THREE.Vector3(),offset:parts[0].offset});
  }
  // Batch stationary geometry by parent and material. Moving assemblies remain independent.
  const unbatched=new Set([roofCore,roofInner]);
  function batch(group){
    for(const child of [...group.children])if(child.isGroup)batch(child);
    const buckets=new Map();
    for(const child of group.children){if(!child.isMesh||unbatched.has(child)||Array.isArray(child.material))continue;const key=child.material.uuid;const bucket=buckets.get(key)||[];bucket.push(child);buckets.set(key,bucket);}
    for(const meshes of buckets.values()){if(meshes.length<2)continue;const geometries=meshes.map(mesh=>{mesh.updateMatrix();return mesh.geometry.clone().applyMatrix4(mesh.matrix);});const geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!geometry)continue;const merged=new THREE.Mesh(geometry,meshes[0].material);merged.castShadow=true;merged.receiveShadow=true;group.add(merged);for(const mesh of meshes){group.remove(mesh);mesh.geometry.dispose();}}
  }
  batch(room);batch(condenser);
  const hotspots=[{key:'cooling',anchor:unit,point:new THREE.Vector3(0,.42,.32)},{key:'panels',anchor:insulationAnchor,point:new THREE.Vector3(.1,.08,0)},{key:'door',anchor:null,point:new THREE.Vector3(0,1.4,.12)}];
  let frame=0,last=0,disposed=false,rendering=false,idleUntil=0,settleInitial=true,viewWidth=0,viewHeight=0,slowFrames=0;
  const projectedPoint=new THREE.Vector3();
  for(const hotspot of hotspots)hotspot.element=host.parentElement.querySelector(`[data-hotspot="${hotspot.key}"]`);
  function resize(){
    const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;
    viewWidth=width;viewHeight=height;
    const ratio=Math.min(devicePixelRatio,lowPower?1:1.5,Math.sqrt((lowPower?400000:1000000)/(width*height)));
    renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);
    host.dataset.quality=lowPower?'economy':'full';
    camera.aspect=width/height;camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(33)/2)*Math.max(1,(936/735)/(width/height))));camera.updateProjectionMatrix();wake();
  }
  const ro=new ResizeObserver(resize);ro.observe(host);resize();
  function stopFrame(){cancelAnimationFrame(frame);frame=0;}
  const io=new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;if(state.visible)wake();else stopFrame();},{threshold:0});io.observe(host);
  function tick(now){
    frame=0;if(disposed||!state.visible||document.hidden)return;
    if(!reduced.matches&&now-last<frameInterval){frame=requestAnimationFrame(tick);return;}
    const elapsed=now-last;const dt=Math.min(elapsed/1000||.016,.05);last=now;rendering=true;
    if(!lowPower&&elapsed>42&&elapsed<250){slowFrames++;if(slowFrames>=12){lowPower=true;frameInterval=32;renderer.shadowMap.enabled=false;particles.visible=false;streams.visible=false;resize();}}else slowFrames=Math.max(0,slowFrames-1);
    const speed=(reduced.matches||settleInitial)?1:Math.min(dt*6,1);
    const target=state.mode==='exploded'?1:0;if(Math.abs((state.mode==='exterior'?2.5:1)-rightWall.scale.y)>.001||Math.abs(target-state.explode)>.001||Math.abs(state.height/2.8-room.scale.y)>.001||Math.abs(state.width/5-room.scale.x)>.001||Math.abs(state.length/4-room.scale.z)>.001)renderer.shadowMap.needsUpdate=true;state.explode+=(target-state.explode)*speed;
    for(const m of moving)m.object.position.copy(m.base).addScaledVector(m.offset,state.explode);
    roof.visible=state.mode==='exterior'||state.explode>.02;front.visible=state.mode==='exterior';roofCore.position.y=-.08-state.explode*.25;roofInner.position.y=-.16-state.explode*.5;
    rightWall.scale.y+=((state.mode==='exterior'?2.5:1)-rightWall.scale.y)*speed;rightWall.position.y=.79+(rightWall.scale.y-1)*.55;condenser.position.x=3.45*room.scale.x;
    room.scale.x+=(state.width/5-room.scale.x)*speed;room.scale.z+=(state.length/4-room.scale.z)*speed;room.scale.y+=(state.height/2.8-room.scale.y)*speed;
    // Height stretches the walls only: the evaporator and crates keep their size, and the crates stay on the floor.
    unit.scale.y=contents.scale.y=1/room.scale.y;contents.position.y=.22*(room.scale.y-1)/room.scale.y;placeDoors();
    if(!reduced.matches&&!lowPower){fans.forEach(f=>f.rotation.z-=dt*(state.temperature<0?5:2));const p=particleGeo.attributes.position;for(let i=0;i<particleCount;i++){p.array[i*3+1]-=dt*(.1+seeds[i]*.15);p.array[i*3+2]+=dt*.1;if(p.array[i*3+1]<.25){p.array[i*3+1]=2.8;p.array[i*3+2]=-1.4;}}p.needsUpdate=true;}
    const targetZoom=(state.mode==='exploded'?.9:1)/Math.max(1,(state.width/5+state.length/4)/2,state.height/2.8);if(Math.abs(targetZoom-camera.zoom)>.0001){camera.zoom+=(targetZoom-camera.zoom)*speed;camera.updateProjectionMatrix();}controls.update();renderer.render(scene,camera);
    for(const hotspot of hotspots){
      if(!hotspot.element||!hotspot.anchor)continue;
      hotspot.anchor.localToWorld(projectedPoint.copy(hotspot.point)).project(camera);
      const x=Math.round((projectedPoint.x*.5+.5)*viewWidth),y=Math.round((-projectedPoint.y*.5+.5)*viewHeight);
      if(x!==hotspot.x){hotspot.element.style.left=`${x}px`;hotspot.x=x;}
      if(y!==hotspot.y){hotspot.element.style.top=`${y}px`;hotspot.y=y;}
    }
    settleInitial=false;rendering=false;if(!reduced.matches&&now<idleUntil)frame=requestAnimationFrame(tick);
  }
  function wake(){if(rendering)return;idleUntil=performance.now()+(lowPower?1100:1500);if(!disposed&&state.visible&&!frame)frame=requestAnimationFrame(tick);}
  function setTemperature(value){state.temperature=value;const cold=Math.max(0,Math.min(1,(15-value)/55));floorMat.color.setHSL(.57,.12+cold*.3,.85-cold*.16);particleMat.opacity=.08+cold*.6;particleMat.size=.018+cold*.035;streamMat.opacity=.12+cold*.32;rim.intensity=1+cold*4;white.color.setHSL(.56,cold*.18,.94-cold*.09);host.parentElement.style.setProperty('--cold',cold);wake();}
  const resume=()=>{if(document.hidden)stopFrame();else if(state.visible)wake();};
  const contextLost=event=>{event.preventDefault();stopFrame();options.onUnavailable?.();};
  renderer.domElement.addEventListener('webglcontextlost',contextLost);
  if(lowPower){particles.visible=false;streams.visible=false;}document.addEventListener('visibilitychange',resume);controls.addEventListener('change',wake);
  host.dataset.scene='ready';setTemperature(-18);wake();
  return {
    capture(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');},
    stats(){return {...renderer.info.render,pixelRatio:renderer.getPixelRatio(),width:renderer.domElement.width,height:renderer.domElement.height,scheduled:Boolean(frame),quality:lowPower?'economy':'full'};},
    finishSetup(){idleUntil=0;settleInitial=true;},
    setMode(mode){state.mode=mode;host.dataset.mode=mode;renderer.shadowMap.needsUpdate=true;wake();},
    setTemperature,
    setDimensions(width,length,height=state.height){state.width=width;state.length=length;state.height=height;wake();},
    setDoors(list){
      while(doorObjects.length<list.length)doorObjects.push(makeDoor());
      while(doorObjects.length>list.length){const door=doorObjects.pop();doorsGroup.remove(door);door.traverse(object=>{if(object.isMesh&&object.geometry!==markGeometry)object.geometry.dispose();});}
      doors=list.map(d=>clampDoor(d,state.width,state.length));hotspots[2].anchor=doorObjects[0]||null;placeDoors();renderer.shadowMap.needsUpdate=true;wake();
    },
    rotate(direction){controls.rotateLeft(direction*.25);controls.update();wake();},
    reset(){controls.enableDamping=false;controls.update();camera.position.set(9,7.4,11.5);controls.target.set(.45,1.2,0);controls.update();controls.enableDamping=true;wake();},
    dispose(){
      disposed=true;stopFrame();ro.disconnect();io.disconnect();controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost',contextLost);for(const [type,handler] of [['pointermove',onDoorMove],['pointerup',onDoorUp],['pointercancel',onDoorUp]])renderer.domElement.removeEventListener(type,handler);renderer.domElement.removeEventListener('pointerdown',onDoorDown,{capture:true});document.removeEventListener('visibilitychange',resume);
      const geometries=new Set(),materials=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);});
      geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());logoTexture.dispose();brushTexture.dispose();contactTexture.dispose();
      renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    }
  };
}
