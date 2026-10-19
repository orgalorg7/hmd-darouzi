import {isLite,constrainedHardware} from './performance.js';

const section=document.querySelector('#contact');
const field=section.querySelector('.contact-field');
const project=section.querySelector('.contact-project');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
const choices=[...section.querySelectorAll('[data-inquiry]')];
let selected=0;

// A selection is actual quote context, not a decorative tab.
section.querySelector('.contact-topics').addEventListener('click',event=>{
 const button=event.target.closest('[data-inquiry]');if(!button)return;
 selected=choices.indexOf(button);
 for(const choice of choices)choice.setAttribute('aria-pressed',String(choice===button));
 project.dataset.selection=button.dataset.inquiry;
 const label=button.querySelector('[data-i]');
 const topic=section.querySelector('#contact-project-topic');
 topic.dataset.i=label.dataset.i;topic.textContent=label.textContent;
 rebuildRoute();
 energize(.8);
});

let canvas,ctx,route,width=0,height=0,visible=false,frame=0,lastPaint=0,lastInput=0;
let pointer={x:.3,y:.35},current={x:.3,y:.35},energy=0,targetEnergy=0;
let pendingPointer=null,bounds,rtl=document.documentElement.dir==='rtl';
const allowed=()=>!isLite()&&!constrainedHardware()&&!reduced.matches;
const active=()=>allowed()&&visible&&!document.hidden;
function measure(){
 const rect=field.getBoundingClientRect();
 bounds={left:rect.left+scrollX,top:rect.top+scrollY};
 width=rect.width;height=rect.height;
}
function rebuildRoute(){
 if(!ctx||!width)return;
 const sx=width/1440,sy=height/650,offset=selected*5;
 route=new Path2D();
 for(let i=0;i<15;i++){
  const y=(58+i*18)*sy,turn=(450+i*18+offset)*sx;
  route.moveTo(-80,y);route.lineTo((270+i*18+offset)*sx,y);
  route.quadraticCurveTo(turn,y,turn,(238+i*18)*sy);route.lineTo(turn,height);
 }
}
// Native-size or smaller: a maximum of 450k pixels, allocated only on interaction.
function resize(){
 measure();if(!canvas||!width||!height)return;
 const ratio=Math.min(1,Math.sqrt(450000/(width*height)));
 const nextWidth=Math.floor(width*ratio),nextHeight=Math.floor(height*ratio);
 if(canvas.width!==nextWidth||canvas.height!==nextHeight){canvas.width=nextWidth;canvas.height=nextHeight;}
 ctx.setTransform(ratio,0,0,ratio,0,0);rebuildRoute();draw();
}
function prepare(){
 if(!active())return false;
 if(!canvas){
  canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
  ctx=canvas.getContext('2d');if(!ctx){canvas=null;return false;}
  field.append(canvas);resize();field.classList.add('has-canvas');
 }
 return true;
}
function draw(){
 if(!ctx||!route)return;
 ctx.clearRect(0,0,width,height);ctx.save();
 if(rtl){ctx.translate(width,0);ctx.scale(-1,1);}
 const px=(rtl?1-current.x:current.x)*width,py=current.y*height;
 ctx.translate((current.x-.5)*90*energy,0);
 ctx.lineWidth=1;ctx.lineCap='round';ctx.strokeStyle=`rgba(30,92,206,${.32+energy*.12})`;
 ctx.stroke(route);
 if(energy>.02){
  // One cached path and one highlight stroke replace fifteen separate clips and paths.
  const radius=100+energy*50;
  const highlight=ctx.createRadialGradient(px,py,0,px,py,radius);
  highlight.addColorStop(0,`rgba(23,78,232,${energy*.8})`);highlight.addColorStop(1,'rgba(23,78,232,0)');
  ctx.strokeStyle=highlight;ctx.lineWidth=2;ctx.stroke(route);
 }
 ctx.restore();
}
function tick(now){
 frame=0;if(!active()||!ctx)return;
 const elapsed=Math.min(50,now-lastPaint||16);lastPaint=now;
 if(pendingPointer){
  pointer.x=Math.max(0,Math.min(1,(pendingPointer.x+scrollX-bounds.left)/width));
  pointer.y=Math.max(0,Math.min(1,(pendingPointer.y+scrollY-bounds.top)/height));pendingPointer=null;
 }
 if(now-lastInput>150)targetEnergy=0;
 // Time-based easing gives the same response at 60, 90 and 120 Hz.
 const ease=1-Math.exp(-elapsed/100);
 current.x+=(pointer.x-current.x)*ease;current.y+=(pointer.y-current.y)*ease;
 energy+=(targetEnergy-energy)*ease;
 const moving=Math.abs(targetEnergy-energy)>.008||Math.abs(pointer.x-current.x)>.001||Math.abs(pointer.y-current.y)>.001;
 if(!moving)energy=targetEnergy;
 draw();if(moving)frame=requestAnimationFrame(tick);
}
function energize(amount=1){
 if(!prepare())return;
 lastInput=performance.now();targetEnergy=amount;
 if(!frame){lastPaint=lastInput;frame=requestAnimationFrame(tick);}
}
function stop(release=false){
 cancelAnimationFrame(frame);frame=0;energy=targetEnergy=0;pendingPointer=null;
 if(release){if(canvas){canvas.width=canvas.height=0;canvas.remove();}canvas=ctx=route=null;field.classList.remove('has-canvas');}
 else if(ctx&&visible&&!document.hidden)draw();
}
function sync(){
 if(!active()){stop(true);return;}
 measure();
}
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(field);
let resizeFrame=0;
new ResizeObserver(()=>{
 if(!visible||resizeFrame)return;
 resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;if(canvas)resize();else measure();});
}).observe(field);
section.addEventListener('pointerenter',()=>{if(visible)measure();});
section.addEventListener('pointermove',event=>{
 if(!finePointer.matches||!active())return;
 // Keep the newest coordinates; do no layout work in high-frequency pointer events.
 pendingPointer={x:event.clientX,y:event.clientY};energize();
},{passive:true});
section.addEventListener('pointerleave',()=>{targetEnergy=0;if(active()&&ctx&&!frame)frame=requestAnimationFrame(tick);});
section.addEventListener('focusin',event=>{
 if(!active())return;
 const target=event.target.getBoundingClientRect();measure();
 pendingPointer={x:target.left+target.width/2,y:target.top};energize(.7);
});
window.addEventListener('darouzi:quality',sync);reduced.addEventListener('change',sync);
// Release the buffer while hidden/offscreen; return to the vector preview until another interaction.
 document.addEventListener('visibilitychange',sync);
new MutationObserver(()=>{rtl=document.documentElement.dir==='rtl';if(visible){measure();if(ctx)draw();}}).observe(document.documentElement,{attributes:true,attributeFilter:['dir']});
