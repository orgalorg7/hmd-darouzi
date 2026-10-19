import {createPhonePanels} from './phone-panels.js';
// Phone navigation observes section boundaries. No scroll handler or animation loop.
export function initMobileExperience(){
 const dock=document.querySelector('#mobile-dock');
 const phone=matchMedia('(max-width:640px)');
 const panels=createPhonePanels(phone);
 let pastHero=false;
 function sync(){dock.hidden=!phone.matches||!pastHero;}
 new IntersectionObserver(([entry])=>{pastHero=!entry.isIntersecting&&entry.boundingClientRect.bottom<=70;sync();},{rootMargin:'-70px 0px 0px 0px',threshold:0}).observe(document.querySelector('.lab-hero'));
 phone.addEventListener('change',sync);
 const entries=new Map();
 const ids=['solutions','installation','insulation-lab','products','parts-tray','about','contact'];
 // Keep a single observer for all destinations, including the nested tray.
 const sectionObserver=new IntersectionObserver(changes=>{
  for(const entry of changes)entries.set(entry.target.id,entry);
  const visible=[...entries.values()].filter(entry=>entry.isIntersecting);
  const active=visible.some(e=>e.target.id==='parts-tray')?'tray':visible.some(e=>e.target.id==='products')?'products':visible.some(e=>['solutions','installation','insulation-lab'].includes(e.target.id))?'solutions':null;
  dock.querySelectorAll('[data-mobile-destination]').forEach(link=>{if(link.dataset.mobileDestination===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
 },{rootMargin:'-15% 0px -45% 0px',threshold:0});
 ids.forEach(id=>sectionObserver.observe(document.getElementById(id)));
 dock.querySelectorAll('a').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();
  const target=document.querySelector(link.hash),heading=target?.querySelector('h2,h3');
  if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
  if(location.hash!==link.hash)history.pushState(null,'',link.hash);
  target?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
 }));
 // A soft keyboard should never compete with fixed navigation.
 document.addEventListener('focusin',event=>{if(event.target.matches('input,textarea,select'))document.body.classList.add('mobile-editing');});
 document.addEventListener('focusout',()=>{queueMicrotask(()=>{if(!document.activeElement?.matches('input,textarea,select'))document.body.classList.remove('mobile-editing');});});
 sync();
 return panels;
}
