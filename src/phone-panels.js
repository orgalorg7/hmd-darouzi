import {isLite} from './performance.js';
// Move the actual controls into native dialogs, preserving one source of state.
export function createPhonePanels(phone){
 const room=document.querySelector('#room-workspace'),tray=document.querySelector('#tray-dialog');
 const state=new Map();let returnToTray=false,resumeTrayFocus=null;
 const syncLock=()=>document.body.classList.toggle('no-scroll',!!document.querySelector('dialog[open]'));
 function open(dialog,nodes,container,focus){
  if(dialog.open||!phone.matches)return;
  const entry={focus:focus||document.activeElement,scroll:window.scrollY,moved:[]};
  for(const node of nodes){
   const rect=node.getBoundingClientRect(),style=getComputedStyle(node),placeholder=document.createElement('div');
   placeholder.setAttribute('aria-hidden','true');placeholder.className='phone-panel-placeholder';
   Object.assign(placeholder.style,{height:`${rect.height}px`,width:`${rect.width}px`,order:style.order,margin:style.margin,flexShrink:'0'});
   node.replaceWith(placeholder);container.append(node);entry.moved.push({node,placeholder});
  }
  state.set(dialog,entry);dialog.showModal();dialog.scrollTop=0;syncLock();
 }
 function close(dialog,restoreFocus=true){
  const entry=state.get(dialog);if(!entry)return;
  state.delete(dialog);
  for(const {node,placeholder} of entry.moved)placeholder.replaceWith(node);
  const status=dialog.querySelector('#tray-status');if(status)document.body.append(status);
  dialog.close();syncLock();window.scrollTo({top:entry.scroll,behavior:'instant'});
  if(restoreFocus&&entry.focus?.isConnected)entry.focus.focus({preventScroll:true});
 }
 function openTray(focus){
  open(tray,[document.querySelector('#parts-tray')],document.querySelector('#tray-drawer-content'),focus);
  document.querySelector('#tray-status').replaceChildren();
  if(tray.open)document.querySelector('#tray-dialog-title').focus({preventScroll:true});
 }
 document.querySelector('#room-expand').addEventListener('click',()=>{
  open(room,[document.querySelector('#room-stage'),document.querySelector('.view-switch'),document.querySelector('.climate-control')],room.querySelector('.room-workspace-body'));
 });
 document.querySelector('#workspace-configure').addEventListener('click',()=>{close(room,false);document.querySelector('.hero-actions a[href="#room-builder"]').click();});
 document.querySelector('#tray-keep-browsing').addEventListener('click',()=>close(tray));
 for(const dialog of [room,tray]){
  dialog.querySelector('[data-phone-close]').addEventListener('click',()=>close(dialog));
  dialog.addEventListener('cancel',event=>{event.preventDefault();close(dialog);});
  dialog.addEventListener('close',()=>{if(!dialog.open){close(dialog);syncLock();}});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close(dialog);});
 }
 room.addEventListener('click',event=>{if(event.target.closest('a[href="#products"]'))close(room,false);});
 // Capture tray links before the dock's normal section-navigation handler.
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href="#parts-tray"], [data-open-tray]');
  if(!link||!phone.matches)return;
  event.preventDefault();event.stopPropagation();
  let focus=link;
  if(link.dataset.returnPart)focus=document.querySelector(`[data-add-part="${link.dataset.returnPart}"]`)||link;
  if(link.closest('#mobile-menu')){document.querySelector('#mobile-menu').hidden=true;focus=document.querySelector('.menu-toggle');focus.setAttribute('aria-expanded','false');}
  openTray(focus);
 },true);
 phone.addEventListener('change',()=>{if(!phone.matches){returnToTray=false;close(room);close(tray);}});
 // Horizontal swipes switch pre-rendered views. Vertical gestures remain page scrolling.
 const host=document.querySelector('#scene-host');let swipe=null;
 host.addEventListener('pointerdown',event=>{if(phone.matches&&isLite()&&event.pointerType==='touch')swipe={x:event.clientX,y:event.clientY,id:event.pointerId};});
 host.addEventListener('pointerup',event=>{
  if(!swipe||event.pointerId!==swipe.id)return;
  const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;swipe=null;
  if(Math.abs(dx)<45||Math.abs(dx)<Math.abs(dy)*1.5)return;
  const modes=['cutaway','exterior','exploded'];const current=document.querySelector('.view-switch [aria-pressed=true]').dataset.view;
  const direction=(dx<0?1:-1)*(document.documentElement.dir==='rtl'?-1:1);
  const button=document.querySelector(`[data-view="${modes[(modes.indexOf(current)+direction+3)%3]}"]`);
  button.click();
 });
 host.addEventListener('pointercancel',()=>{swipe=null;});
 // Swiping down on the drawer's grip dismisses it; the list keeps native scrolling.
 let gripStart=null;const grip=tray.querySelector('.sheet-grip');
 grip.addEventListener('pointerdown',event=>{gripStart={x:event.clientX,y:event.clientY,id:event.pointerId};grip.setPointerCapture(event.pointerId);});
 grip.addEventListener('pointerup',event=>{if(gripStart&&event.pointerId===gripStart.id&&event.clientY-gripStart.y>55&&Math.abs(event.clientX-gripStart.x)<50)close(tray);gripStart=null;});
 grip.addEventListener('pointercancel',()=>{gripStart=null;});
 return {
  beforeQuote(){returnToTray=tray.open;resumeTrayFocus=state.get(tray)?.focus;close(tray,false);close(room,false);},
  afterQuote(){if(returnToTray&&phone.matches){returnToTray=false;openTray(resumeTrayFocus);document.querySelector('#tray-submit').focus({preventScroll:true});return true;}returnToTray=false;return false;}
 };
}
