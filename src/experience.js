import {createBlueprint} from './blueprint.js';
import {icon} from './icons.js';
import {isLite,setQuality,constrainedHardware} from './performance.js';
import {clampDoor,maxDoors,nextDoor,separateDoor,wallNames,walls} from './doors.js';
import previewPoints from './room-previews.json';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let scene,doors=[{wall:'front',offset:-.7}],mode='cutaway',zoom=1,activeProduct=null;
let loadingPromise,loadVersion=0;
let previewKey="cutaway-closed",requestedPreview=previewKey;
const language=()=>document.documentElement.lang;
const words={ar:{chill:'تبريد',freeze:'تجميد',deep:'تجميد عميق',doorName:'باب',removeDoor:'احذف',doorWall:'جدار',cooling:['AIRFLOW','قلب الغرفة.','توزّع المبخرات الهواء البارد داخل الغرفة. يختار الفريق سعتها وتوزيعها بحسب المنتج والمساحة.'],panels:['INSULATION','البرودة تبدأ من العزل.','ألواح ساندويش بانل تساعد على الحد من انتقال الحرارة. تحدد السماكة والمواد حسب متطلبات المشروع.'],door:['ACCESS','كل تفصيل يحفظ البرودة.','تتوفر أبواب مفصلية أو انزلاقية بأبعاد حسب الطلب. أضف حتى أربعة أبواب واسحب كل باب إلى الجدار والموضع المناسب.'],loading:'جاري تفعيل الغرفة التفاعلية…',drag:'اسحب لتدوير الغرفة أو لتحريك الباب',fallback:'معاينة ثابتة. يمكنك تخصيص الأبعاد والحرارة أدناه.'},en:{chill:'Chilled',freeze:'Frozen',deep:'Deep freeze',doorName:'Door',removeDoor:'Remove',doorWall:'Wall of',cooling:['AIRFLOW','The heart of the room.','Evaporators circulate cold air throughout the room. Our team specifies capacity and placement for your product and space.'],panels:['INSULATION','Cold starts with insulation.','Sandwich panels help limit heat transfer. Panel thickness and materials are specified for your project.'],door:['ACCESS','Every detail protects the cold.','Hinged and sliding doors are available in custom sizes. Add up to four doors and drag each one to the right wall and position.'],loading:'Activating the interactive room…',drag:'Drag to rotate the room or move a door',fallback:'Static preview. Dimensions and temperature can still be configured below.'}};
Object.assign(words.ar,{lite:'معاينة ثابتة',liteBuilder:'حدد الأبعاد والحرارة لإضافتها إلى طلبك. الصورة تعرض نموذجاً بمقاسات افتراضية.',fullBuilder:'غيّر الأبعاد وشاهد الغرفة تتشكّل. نراجع التصميم والمواصفات معك قبل التنفيذ.'});
Object.assign(words.en,{lite:'Still preview',liteBuilder:'Set dimensions and temperature for your inquiry. The preview shows a room with standard dimensions.',fullBuilder:'Change the dimensions and watch the room take shape. Our team reviews the design and specifications before production.'});
Object.assign(words.ar,{blueprint:'مخطط الغرفة',blueprintHint:'اختر أحد المكوّنات',blueprintBuilder:'غيّر الأبعاد لتحديث المخطط. هذا تصور للطلب تتم مراجعته قبل التنفيذ.'});
Object.assign(words.en,{blueprint:'Room blueprint',blueprintHint:'Select a component',blueprintBuilder:'Change the dimensions to update the plan. Our team reviews the concept before production.'});
const w=()=>words[language()];
const blueprint=createBlueprint($('#room-stage'),(key,button)=>activeHotspot===key?closeHotspot():openHotspot(key,button));
const dimensions=()=>({width:Number($('#room-width').value),length:Number($('#room-length').value),height:Number($('#room-height').value)});
function updateBlueprint(){blueprint.update({...dimensions(),doors,lang:language()});}
function releaseScene(){loadVersion++;scene?.dispose();scene=null;loadingPromise=null;$('#room-stage').classList.remove('scene-ready','scene-loading');}

function updateTemperature(value){
  value=Number(value);const display=`${value>0?'+':value<0?'−':''}${Math.abs(value)}`;
  $('#hero-temperature').textContent=`${display}°`;$('#temperature').value=value;$('#temperature-value').value=`${value>0?'+':''}${value}°C`;
  $('#climate-name').textContent=value<-25?w().deep:value<0?w().freeze:w().chill;
  const range=value<-25?'deep':value<0?'frozen':'chilled';$$('#room-stage, .lab-hero').forEach(el=>{el.dataset.climate=range;});
  // A preset stays highlighted while the temperature is anywhere in its range: chilled 0…+10, frozen 0…−25, deep below −25.
  $$('.climate-presets [data-climate]').forEach(b=>{const active=b.dataset.range===range;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  scene?.setTemperature(value);
  window.dispatchEvent(new CustomEvent('darouzi:temperature',{detail:{value}}));
}
// The door list mirrors the model: each row names a door, lets its wall change, and removes extra doors.
function renderDoors(){
 const lang=language(),names=wallNames[lang]||wallNames.ar;
 $('#door-list').innerHTML=doors.map((door,i)=>`<li><span>${w().doorName} ${i+1}</span><select data-door="${i}" aria-label="${w().doorWall} ${w().doorName} ${i+1}">${walls.map(wall=>`<option value="${wall}"${wall===door.wall?' selected':''}>${names[wall]}</option>`).join('')}</select><button type="button" class="door-remove" data-remove-door="${i}" aria-label="${w().removeDoor} ${w().doorName} ${i+1}"${doors.length<2?' disabled':''}>${icon('x')}</button></li>`).join('');
 $$('#add-door,#builder-add-door').forEach(button=>button.disabled=doors.length>=maxDoors);
}
function setDoors(next){const {width,length}=dimensions();doors=next.map(door=>clampDoor(door,width,length));doors=doors.map((_,i)=>separateDoor(doors,i,width,length));scene?.setDoors(doors);renderDoors();updateBlueprint();}
$$('#add-door,#builder-add-door').forEach(button=>button.addEventListener('click',()=>{if(doors.length<maxDoors)setDoors([...doors,nextDoor(doors)]);}));
$('#door-list').addEventListener('change',event=>{const i=Number(event.target.dataset.door);if(event.target.matches('select'))setDoors(doors.map((door,j)=>j===i?{wall:event.target.value,offset:0}:door));});
$('#door-list').addEventListener('click',event=>{const button=event.target.closest('[data-remove-door]');if(button&&doors.length>1){setDoors(doors.filter((_,j)=>j!==Number(button.dataset.removeDoor)));$('#builder-add-door').focus({preventScroll:true});}});
// Typed values (for example 3.8 m) and the sliders stay in step; out-of-range entries snap to the nearest limit.
function updateDimensions(){const {width,length,height}=dimensions();for(const key of ['width','length','height']){const input=$(`#room-${key}-input`);if(document.activeElement!==input)input.value=$(`#room-${key}`).value;}scene?.setDimensions(width,length,height);setDoors(doors);}
for(const key of ['width','length','height']){
 const range=$(`#room-${key}`),input=$(`#room-${key}-input`);
 range.addEventListener('input',updateDimensions);
 input.addEventListener('input',()=>{const value=Number(input.value);if(input.value!==''&&value>=Number(input.min)&&value<=Number(input.max)){range.value=Math.round(value*10)/10;updateDimensions();}});
 input.addEventListener('change',()=>{const value=Math.round(Math.max(Number(input.min),Math.min(Number(input.max),Number(input.value)||Number(range.value)))*10)/10;range.value=value;input.value=value;updateDimensions();});
}
$$('.climate-presets [data-climate]').forEach(b=>b.addEventListener('click',()=>updateTemperature(b.dataset.climate)));
$('#temperature').addEventListener('input',e=>updateTemperature(e.target.value));
$$('.view-switch [data-view]').forEach(button=>button.addEventListener('click',()=>{
 closeHotspot();mode=button.dataset.view;
 $$('.view-switch [data-view]').forEach(el=>{el.classList.toggle('active',el===button);el.setAttribute('aria-pressed',String(el===button));});
 $('#room-stage').dataset.roomView=mode;blueprint.show(mode==='blueprint');
 if(mode==='blueprint'){releaseScene();$('#scene-host').dataset.scene='blueprint';updateBlueprint();}
 else {scene?.setMode(mode);if(!scene)updatePreview();}
 $$('#rotate-left,#rotate-right,#reset-view').forEach(el=>el.disabled=isLite()||mode==='blueprint');
 qualityLabels();
}));
$('#rotate-left').addEventListener('click',()=>ensureScene().then(()=>scene?.rotate(1)));$('#rotate-right').addEventListener('click',()=>ensureScene().then(()=>scene?.rotate(-1)));
$('#reset-view').addEventListener('click',()=>ensureScene().then(()=>scene?.reset()));
let activeHotspot=null,activeHotspotTrigger=null;
function closeHotspot(){const trigger=activeHotspot;if(trigger&&$('#component-note').contains(document.activeElement))activeHotspotTrigger?.focus({preventScroll:true});activeHotspot=null;$('#component-note').hidden=true;$$('[data-hotspot],[data-blueprint-part]').forEach(b=>b.setAttribute('aria-expanded','false'));}
function openHotspot(key,trigger){activeHotspot=key;if(trigger)activeHotspotTrigger=trigger;const [category,title,desc]=w()[key];$('#component-category').textContent=category;$('#component-title').textContent=title;$('#component-desc').textContent=desc;$('#component-note').hidden=false;$$('[data-hotspot],[data-blueprint-part]').forEach(b=>b.setAttribute('aria-expanded',String((b.dataset.hotspot||b.dataset.blueprintPart)===key)));}
$$('[data-hotspot]').forEach(b=>b.addEventListener('click',()=>activeHotspot===b.dataset.hotspot?closeHotspot():openHotspot(b.dataset.hotspot,b)));
$('#close-component').addEventListener('click',closeHotspot);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeHotspot();});
const languageObserver=new MutationObserver(()=>{$('.builder-close')?.setAttribute('aria-label',language()==='ar'?'إغلاق الإعدادات':'Close configurator');if($('#room-stage').classList.contains('scene-unavailable'))$('.drag-hint').textContent=w().fallback;updateTemperature($('#temperature').value);renderDoors();updateBlueprint();if(activeHotspot)openHotspot(activeHotspot);});languageObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
function positionPreviewHotspots(){
 if(scene||mode==='blueprint')return;
 const host=$('#scene-host'),scale=Math.min(host.clientWidth/936,host.clientHeight/735),x=(host.clientWidth-936*scale)/2,y=(host.clientHeight-735*scale)/2;
 for(const [key,px,py] of previewPoints[previewKey]){const button=$(`[data-hotspot="${key}"]`);button.style.left=`${Math.round(x+px*scale)}px`;button.style.top=`${Math.round(y+py*scale)}px`;}
}
const previewObserver=new ResizeObserver(positionPreviewHotspots);previewObserver.observe($('#scene-host'));
function updatePreview(){
 if(mode==='blueprint')return;
 const key=`${mode}-closed`;requestedPreview=key;
 if(key===previewKey){positionPreviewHotspots();return;}
 const src=key==='cutaway-open'?'/assets/room-preview.webp':`/assets/room-${key}.webp`;
 const next=new Image();next.decoding='async';next.onload=()=>{if(requestedPreview!==key||scene)return;$('.scene-fallback').src=src;previewKey=key;positionPreviewHotspots();};next.src=src;
}
function qualityLabels(){
 $('.drag-hint').textContent=mode==='blueprint'?w().blueprintHint:isLite()?w().lite:loadingPromise&&!scene?w().loading:w().drag;
 $('[data-i="builderDesc"]').textContent=mode==='blueprint'?w().blueprintBuilder:isLite()?w().liteBuilder:w().fullBuilder;
}
function applyQuality(){
 const lite=isLite();$('#room-stage').classList.toggle('scene-lite',lite);
 if(lite){releaseScene();$('#scene-host').dataset.scene=mode==='blueprint'?'blueprint':'lite';updatePreview();}
 $$('#rotate-left,#rotate-right,#reset-view').forEach(button=>button.disabled=lite||mode==='blueprint');
 qualityLabels();
}
window.addEventListener('darouzi:quality',applyQuality);
new MutationObserver(qualityLabels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
applyQuality();renderDoors();updateBlueprint();
async function loadScene(version){
 try{
  const {createColdRoom}=await import('./room-scene.js');if(version!==loadVersion||isLite()||mode==='blueprint')return;
  scene=createColdRoom($('#scene-host'),{constrained:constrainedHardware(),onUnavailable:()=>setQuality('lite'),onDoorsChange:next=>{doors=next;renderDoors();updateBlueprint();}});
  $('#room-stage').classList.add('scene-ready');scene.setMode(mode);updateDimensions();updateTemperature($('#temperature').value);scene.finishSetup();qualityLabels();
 }catch(error){if(version!==loadVersion)return;console.warn('Live 3D unavailable; a still preview and all controls remain available.',error);setQuality('lite');}
}
// Live 3D is the default: the engine loads once the room approaches the viewport.
function ensureScene(){
 if(isLite()||mode==='blueprint')return Promise.resolve();
 if(!loadingPromise){const version=++loadVersion;$('.drag-hint').textContent=w().loading;$('#room-stage').classList.add('scene-loading');loadingPromise=loadScene(version).finally(()=>{if(version===loadVersion)$('#room-stage').classList.remove('scene-loading');});}
 return loadingPromise;
}
$('#scene-host').addEventListener('pointerdown',event=>{if(event.pointerType==='mouse')ensureScene();});
new IntersectionObserver((entries,observer)=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();ensureScene();}},{rootMargin:'200px'}).observe($('#room-stage'));
$$('.view-switch button,.scene-actions button').forEach(button=>button.addEventListener('click',ensureScene));
// Preserve a drag started while the renderer is loading; ordinary vertical touch scrolling is ignored.
let pendingDrag=null;
$('#scene-host').addEventListener('pointerdown',event=>{if(mode!=='blueprint'&&!scene&&!isLite())pendingDrag={x:event.clientX,y:event.clientY,id:event.pointerId};});
window.addEventListener('pointerup',event=>{if(!pendingDrag||event.pointerId!==pendingDrag.id)return;const dx=event.clientX-pendingDrag.x,dy=event.clientY-pendingDrag.y;pendingDrag=null;if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy))ensureScene().then(()=>scene?.rotate(dx/80));else if(Math.abs(dx)<=8&&Math.abs(dy)<=8)ensureScene();});
window.addEventListener('pointercancel',()=>{pendingDrag=null;});

// Product inspection: a real image viewer, controlled zoom, and a product-specific inquiry.
const productDialog=$('#product-dialog');let previousFocus;let panX=0,panY=0,panStart=null,panFrame=0,maxPanX=0,maxPanY=0;const inspectionArea=$('.inspection-image'),inspectionImage=$('#inspect-image');
function measurePan(){maxPanX=inspectionArea.clientWidth*(zoom-1)/2;maxPanY=inspectionImage.clientHeight*(zoom-1)/2;}
function paintPan(){panX=Math.max(-maxPanX,Math.min(maxPanX,panX));panY=Math.max(-maxPanY,Math.min(maxPanY,panY));inspectionImage.style.transform=`translate(${panX}px,${panY}px) scale(${zoom})`;}
function applyZoom(){zoom=Math.max(1,Math.min(2.5,zoom));if(zoom===1){panX=0;panY=0;}measurePan();paintPan();inspectionArea.classList.toggle('is-zoomed',zoom>1);$('#zoom-level').textContent=`${Math.round(zoom*100)}%`;$('#zoom-out').disabled=zoom<=1;$('#zoom-in').disabled=zoom>=2.5;}
inspectionImage.addEventListener('load',()=>{if(productDialog.open){measurePan();paintPan();}});
new ResizeObserver(()=>{if(productDialog.open){measurePan();paintPan();}}).observe(inspectionArea);
window.addEventListener('darouzi:inspect',event=>{const p=event.detail;activeProduct=p;previousFocus=document.activeElement;zoom=1;panX=0;panY=0;applyZoom();$('#inspect-image').src=`/assets/${p.image}.webp`;$('#inspect-image').alt=p[language()];$('#product-dialog-title').textContent=p[language()];$('#inspect-description').textContent=p.description[language()];productDialog.showModal();document.body.classList.add('no-scroll');});
$('#zoom-in').addEventListener('click',()=>{zoom+=.25;applyZoom();});$('#zoom-out').addEventListener('click',()=>{zoom-=.25;applyZoom();});
$('.product-dialog-close').addEventListener('click',()=>productDialog.close());
productDialog.addEventListener('click',event=>{if(event.target!==productDialog)return;const rect=productDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)productDialog.close();});
productDialog.addEventListener('close',()=>{cancelAnimationFrame(panFrame);panFrame=0;panStart=null;inspectionArea.classList.remove('is-panning');document.body.classList.toggle('no-scroll',!!document.querySelector('dialog[open]'));previousFocus?.focus({preventScroll:true});});
$('#inspect-add').addEventListener('click',()=>{if(activeProduct){productDialog.close();window.dispatchEvent(new CustomEvent('darouzi:add-part',{detail:{id:activeProduct.id}}));}});
$('#inspect-quote').addEventListener('click',()=>{productDialog.close();window.dispatchEvent(new CustomEvent('darouzi:quote',{detail:{selection:`product-${activeProduct.id}`}}));});
// Pointer tilt makes each real product image respond without hijacking scrolling or the cursor.
const canTilt=matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)');
let productTiltFrame=0,tiltedCard=null;
$('#product-grid').addEventListener('pointermove',event=>{
 if(!canTilt.matches||isLite()||constrainedHardware())return;
 const card=event.target.closest('.product-card');if(!card||productTiltFrame)return;
 const {clientX,clientY}=event;tiltedCard=card;
 productTiltFrame=requestAnimationFrame(()=>{productTiltFrame=0;const r=card.getBoundingClientRect();card.style.setProperty('--tilt-x',`${-(clientY-r.top-r.height/2)/30}deg`);card.style.setProperty('--tilt-y',`${(clientX-r.left-r.width/2)/25}deg`);});
});
$('#product-grid').addEventListener('pointerout',event=>{const card=event.target.closest('.product-card');if(card&&!card.contains(event.relatedTarget)){cancelAnimationFrame(productTiltFrame);productTiltFrame=0;card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');}});
window.addEventListener('darouzi:quality',()=>{cancelAnimationFrame(productTiltFrame);productTiltFrame=0;tiltedCard?.style.removeProperty('--tilt-x');tiltedCard?.style.removeProperty('--tilt-y');});
// Bring the configurator alongside the model instead of making visitors configure out of view.
const builder=$('#room-builder'),builderHome=builder.parentElement,builderNext=builder.nextElementSibling;
const closeBuilder=document.createElement('button');closeBuilder.className='builder-close';closeBuilder.hidden=true;closeBuilder.innerHTML=icon('x');closeBuilder.setAttribute('aria-label',language()==='ar'?'إغلاق الإعدادات':'Close configurator');builder.prepend(closeBuilder);
function openBuilder(event){event?.preventDefault();ensureScene();$('.lab-hero').classList.add('configuring');$('.lab-hero').append(builder);builder.classList.add('builder-active');closeBuilder.hidden=false;$('.lab-hero').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});closeBuilder.focus({preventScroll:true});}
$('.hero-actions a[href="#room-builder"]').addEventListener('click',openBuilder);
closeBuilder.addEventListener('click',()=>{$('.lab-hero').classList.remove('configuring');builder.classList.remove('builder-active');closeBuilder.hidden=true;builderHome.insertBefore(builder,builderNext);$('.hero-actions a[href="#room-builder"]').focus({preventScroll:true});});

// Pan an enlarged product without changing the page's scroll position.
$('#zoom-reset').addEventListener('click',()=>{zoom=1;applyZoom();});
$('#inspect-image').draggable=false;
inspectionArea.addEventListener('pointerdown',event=>{if(zoom<=1||event.target.closest('button'))return;panStart={id:event.pointerId,x:event.clientX-panX,y:event.clientY-panY};inspectionArea.setPointerCapture(event.pointerId);inspectionArea.classList.add('is-panning');});
inspectionArea.addEventListener('pointermove',event=>{if(!panStart||panStart.id!==event.pointerId)return;panX=event.clientX-panStart.x;panY=event.clientY-panStart.y;if(!panFrame)panFrame=requestAnimationFrame(()=>{panFrame=0;paintPan();});});
function stopPan(){if(panFrame){cancelAnimationFrame(panFrame);panFrame=0;paintPan();}panStart=null;inspectionArea.classList.remove('is-panning');}
inspectionArea.addEventListener('pointerup',stopPan);inspectionArea.addEventListener('pointercancel',stopPan);inspectionArea.addEventListener('lostpointercapture',stopPan);
productDialog.addEventListener('keydown',event=>{if(zoom<=1||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();panX+=event.key==='ArrowLeft'?30:event.key==='ArrowRight'?-30:0;panY+=event.key==='ArrowUp'?30:event.key==='ArrowDown'?-30:0;paintPan();});
