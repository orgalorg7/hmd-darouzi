import {isLite} from './performance.js';
// Our work: each case card switches its own photographs; one viewer browses all eleven in page order.
const root=document.querySelector('#projects'),viewer=document.querySelector('#project-viewer');
const cases=[...root.querySelectorAll('.case')],photos=[...root.querySelectorAll('[data-photo]')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const still=()=>reduced.matches||isLite();
const src=name=>`/assets/projects/${name}.webp`;
// Captions come from the translated text already in the page, so they follow language changes.
const caption=el=>(el.querySelector('.screen-reader')||el).textContent;
const pad=n=>String(n).padStart(2,'0');
const items=card=>[...card.querySelectorAll('[data-photo]')];
const activeIndex=card=>Number(card.dataset.active||0);
const switches=new WeakMap();
let current=0,opener=null,swipe=null;

function paint(card){
 const list=items(card),index=activeIndex(card),text=caption(list[index]);
 card.querySelector('.case-caption-text').textContent=text;card.querySelector('.case-image').alt=text;
 const count=card.querySelector('.case-index');if(count)count.textContent=String(index+1);
 list.forEach((item,i)=>{if(item.matches('button'))item.setAttribute('aria-pressed',String(i===index));});
}
async function select(card,index){
 if(index===activeIndex(card))return;
 card.dataset.active=index;paint(card);
 const token=(switches.get(card)||0)+1,next=new Image();switches.set(card,token);next.src=src(items(card)[index].dataset.photo);
 if(!still())card.classList.add('is-changing');
 // Swap only after decoding, so the card never flashes an empty frame.
 try{await next.decode();}catch{}
 if(switches.get(card)!==token)return;
 const image=card.querySelector('.case-image');image.removeAttribute('srcset');image.src=next.src;card.classList.remove('is-changing');
}
function render(){
 const photo=photos[current],text=caption(photo),image=viewer.querySelector('#viewer-image');
 image.src=src(photo.dataset.photo);image.alt=text;
 viewer.querySelector('#viewer-caption').textContent=text;viewer.querySelector('#viewer-index').textContent=pad(current+1);
}
const warm=index=>{new Image().src=src(photos[(index+photos.length)%photos.length].dataset.photo);};
function open(index){
 current=index;opener=document.activeElement;render();
 viewer.querySelector('#viewer-total').textContent=pad(photos.length);
 viewer.showModal();document.body.classList.add('no-scroll');
 // Warm the neighbours only once someone is browsing.
 warm(index+1);warm(index-1);
}
function step(direction){current=(current+direction+photos.length)%photos.length;render();warm(current+direction);}
const rtl=()=>document.documentElement.dir==='rtl';
root.addEventListener('click',event=>{
 const card=event.target.closest('.case');if(!card)return;
 const thumb=event.target.closest('.case-thumb');if(thumb){select(card,items(card).indexOf(thumb));return;}
 if(event.target.closest('.case-open'))open(photos.indexOf(items(card)[activeIndex(card)]));
});
viewer.querySelector('.viewer-close').addEventListener('click',()=>viewer.close());
viewer.querySelector('.viewer-prev').addEventListener('click',()=>step(-1));
viewer.querySelector('.viewer-next').addEventListener('click',()=>step(1));
viewer.addEventListener('keydown',event=>{
 if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
 event.preventDefault();step((event.key==='ArrowRight'?1:-1)*(rtl()?-1:1));
});
viewer.addEventListener('click',event=>{if(event.target!==viewer)return;const r=viewer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)viewer.close();});
viewer.addEventListener('close',()=>{document.body.classList.toggle('no-scroll',!!document.querySelector('dialog[open]'));opener?.focus({preventScroll:true});});
// Horizontal swipes browse; vertical gestures are left alone.
const image=viewer.querySelector('#viewer-image');
image.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse')swipe={x:event.clientX,y:event.clientY,id:event.pointerId};});
image.addEventListener('pointerup',event=>{
 if(!swipe||event.pointerId!==swipe.id)return;const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;swipe=null;
 if(Math.abs(dx)>=50&&Math.abs(dx)>Math.abs(dy)*1.5)step((dx<0?1:-1)*(rtl()?-1:1));
});
image.addEventListener('pointercancel',()=>{swipe=null;});
cases.forEach(paint);
new MutationObserver(()=>{cases.forEach(paint);if(viewer.open)render();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
