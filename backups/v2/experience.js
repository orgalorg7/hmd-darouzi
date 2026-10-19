const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let scene,doorOpen=true,mode='cutaway',zoom=1,activeProduct=null;
let loadingPromise;
const language=()=>document.documentElement.lang;
const words={ar:{chill:'تبريد',freeze:'تجميد',deep:'تجميد عميق',closeDoor:'أغلق الباب',openDoor:'افتح الباب',cooling:['AIRFLOW','قلب الغرفة.','توزّع المبخرات الهواء البارد داخل الغرفة. يختار الفريق سعتها وتوزيعها بحسب المنتج والمساحة.'],panels:['INSULATION','البرودة تبدأ من العزل.','ألواح ساندويش بانل تساعد على الحد من انتقال الحرارة. تحدد السماكة والمواد حسب متطلبات المشروع.'],door:['ACCESS','كل تفصيل يحفظ البرودة.','تتوفر أبواب مفصلية أو انزلاقية بأبعاد حسب الطلب. جرّب فتح الباب لرؤية حركة الدخول.'],loading:'جاري تفعيل الغرفة التفاعلية…',drag:'اسحب لتدوير الغرفة',fallback:'معاينة ثابتة. يمكنك تخصيص الأبعاد والحرارة أدناه.'},en:{chill:'Chilled',freeze:'Frozen',deep:'Deep freeze',closeDoor:'Close door',openDoor:'Open door',cooling:['AIRFLOW','The heart of the room.','Evaporators circulate cold air throughout the room. Our team specifies capacity and placement for your product and space.'],panels:['INSULATION','Cold starts with insulation.','Sandwich panels help limit heat transfer. Panel thickness and materials are specified for your project.'],door:['ACCESS','Every detail protects the cold.','Hinged and sliding doors are available in custom sizes. Open the door to explore access to the room.'],loading:'Activating the interactive room…',drag:'Drag to rotate the room',fallback:'Static preview. Dimensions and temperature can still be configured below.'}};
const w=()=>words[language()];
function updateTemperature(value){
  value=Number(value);const display=`${value>0?'+':value<0?'−':''}${Math.abs(value)}`;
  $('#hero-temperature').textContent=`${display}°`;$('#temperature').value=value;$('#temperature-value').value=`${value>0?'+':''}${value}°C`;
  $('#climate-name').textContent=value<-25?w().deep:value<0?w().freeze:w().chill;
  $$('#room-stage, .lab-hero').forEach(el=>{el.dataset.climate=value<-25?'deep':value<0?'frozen':'chilled';});
  $$('.climate-presets [data-climate]').forEach(b=>{const active=Number(b.dataset.climate)===value;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  scene?.setTemperature(value);
}
function updateDimensions(){const width=Number($('#room-width').value),length=Number($('#room-length').value);$('#width-output').value=`${width} m`;$('#length-output').value=`${length} m`;$('#room-volume').innerHTML=`${(width*length*2.8).toFixed(1).replace(/\.0$/,'')} <small>m³</small>`;scene?.setDimensions(width,length);}
$$('.climate-presets [data-climate]').forEach(b=>b.addEventListener('click',()=>updateTemperature(b.dataset.climate)));
$('#temperature').addEventListener('input',e=>updateTemperature(e.target.value));
$('#room-width').addEventListener('input',updateDimensions);$('#room-length').addEventListener('input',updateDimensions);
$$('.view-switch [data-view]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.view;$$('.view-switch [data-view]').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',String(el===b));});scene?.setMode(mode);$('#room-stage').dataset.roomView=mode;}));
$('#door-toggle').addEventListener('click',()=>{doorOpen=!doorOpen;scene?.setDoor(doorOpen);$('#door-toggle').textContent=doorOpen?w().closeDoor:w().openDoor;$('#door-toggle').setAttribute('aria-pressed',String(doorOpen));});
$('#rotate-left').addEventListener('click',()=>scene?.rotate(1));$('#rotate-right').addEventListener('click',()=>scene?.rotate(-1));
$('#reset-view').addEventListener('click',()=>scene?.reset());
let activeHotspot=null;
function closeHotspot(){const trigger=activeHotspot;if(trigger&&$('#component-note').contains(document.activeElement))$(`[data-hotspot="${trigger}"]`).focus({preventScroll:true});activeHotspot=null;$('#component-note').hidden=true;$$('[data-hotspot]').forEach(b=>b.setAttribute('aria-expanded','false'));}
function openHotspot(key){activeHotspot=key;const [category,title,desc]=w()[key];$('#component-category').textContent=category;$('#component-title').textContent=title;$('#component-desc').textContent=desc;$('#component-note').hidden=false;$$('[data-hotspot]').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.hotspot===key)));}
$$('[data-hotspot]').forEach(b=>b.addEventListener('click',()=>activeHotspot===b.dataset.hotspot?closeHotspot():openHotspot(b.dataset.hotspot)));
$('#close-component').addEventListener('click',closeHotspot);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeHotspot();});
const languageObserver=new MutationObserver(()=>{$('.builder-close')?.setAttribute('aria-label',language()==='ar'?'إغلاق الإعدادات':'Close configurator');if($('#room-stage').classList.contains('scene-unavailable'))$('.drag-hint').textContent=w().fallback;updateTemperature($('#temperature').value);$('#door-toggle').textContent=doorOpen?w().closeDoor:w().openDoor;if(activeHotspot)openHotspot(activeHotspot);});languageObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
const previewObserver=new ResizeObserver(()=>{if(scene)return;const host=$('#scene-host'),scale=Math.min(host.clientWidth/936,host.clientHeight/735),x=(host.clientWidth-936*scale)/2,y=(host.clientHeight-735*scale)/2;for(const [key,px,py] of [['cooling',487,212],['panels',272,290],['door',285,380]]){const button=$(`[data-hotspot="${key}"]`);button.style.left=`${x+px*scale}px`;button.style.top=`${y+py*scale}px`;}});previewObserver.observe($('#scene-host'));
async function loadScene(){
 try{const {createColdRoom}=await import('./room-scene.js');scene=createColdRoom($('#scene-host'));$('#room-stage').classList.add('scene-ready');scene.setMode(mode);scene.setDoor(doorOpen);updateDimensions();updateTemperature($('#temperature').value);scene.finishSetup();previewObserver.disconnect();$('.drag-hint').textContent=w().drag;}
 catch(error){console.warn('3D preview unavailable; static preview retained.',error);$('#room-stage').classList.add('scene-unavailable');$$('.view-switch button, .scene-actions button').forEach(button=>button.disabled=true);$('.drag-hint').textContent=w().fallback;}
}
// A matching rendered preview paints immediately. The engine wakes on intent, not during page startup.
function ensureScene(){if(!loadingPromise){$('.drag-hint').textContent=w().loading;$('#room-stage').classList.add('scene-loading');loadingPromise=loadScene().finally(()=>$('#room-stage').classList.remove('scene-loading'));}return loadingPromise;}
$('#room-stage').addEventListener('pointerenter',()=>{if(matchMedia('(hover:hover)').matches)ensureScene();},{once:true});
$('#room-stage').addEventListener('pointerdown',ensureScene,{once:true});
$('#room-stage').addEventListener('focusin',ensureScene,{once:true});
$$('.view-switch button,.climate-presets button,.scene-actions button').forEach(button=>button.addEventListener('click',ensureScene));
$$('#room-width,#room-length,#temperature').forEach(input=>input.addEventListener('input',ensureScene));
// Preserve a touch drag that starts while the renderer is still loading.
let pendingDrag=null;
$('#room-stage').addEventListener('pointerdown',event=>{if(!scene)pendingDrag={x:event.clientX,id:event.pointerId};});
window.addEventListener('pointerup',event=>{if(!pendingDrag||event.pointerId!==pendingDrag.id)return;const delta=event.clientX-pendingDrag.x;pendingDrag=null;if(Math.abs(delta)>8)ensureScene().then(()=>scene?.rotate(delta/80));});

// Product inspection: a real image viewer, controlled zoom, and a product-specific inquiry.
const productDialog=$('#product-dialog');let previousFocus;
function applyZoom(){zoom=Math.max(1,Math.min(2.5,zoom));$('#inspect-image').style.transform=`scale(${zoom})`;$('#zoom-level').textContent=`${Math.round(zoom*100)}%`;$('#zoom-out').disabled=zoom<=1;$('#zoom-in').disabled=zoom>=2.5;}
window.addEventListener('darouzi:inspect',event=>{const p=event.detail;activeProduct=p;previousFocus=document.activeElement;zoom=1;applyZoom();$('#inspect-image').src=`/assets/${p.image}.webp`;$('#inspect-image').alt=p[language()];$('#product-dialog-title').textContent=p[language()];$('#inspect-description').textContent=p.description[language()];productDialog.showModal();document.body.classList.add('no-scroll');});
$('#zoom-in').addEventListener('click',()=>{zoom+=.25;applyZoom();});$('#zoom-out').addEventListener('click',()=>{zoom-=.25;applyZoom();});
$('.product-dialog-close').addEventListener('click',()=>productDialog.close());
productDialog.addEventListener('close',()=>{document.body.classList.remove('no-scroll');previousFocus?.focus({preventScroll:true});});
$('#inspect-quote').addEventListener('click',()=>{productDialog.close();window.dispatchEvent(new CustomEvent('darouzi:quote',{detail:{selection:`product-${activeProduct.id}`}}));});
// Pointer tilt makes each real product image respond without hijacking scrolling or the cursor.
const canTilt=matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)');
$('#product-grid').addEventListener('pointermove',event=>{if(!canTilt.matches)return;const card=event.target.closest('.product-card');if(!card)return;const r=card.getBoundingClientRect();card.style.setProperty('--tilt-x',`${-(event.clientY-r.top-r.height/2)/30}deg`);card.style.setProperty('--tilt-y',`${(event.clientX-r.left-r.width/2)/25}deg`);});
$('#product-grid').addEventListener('pointerout',event=>{const card=event.target.closest('.product-card');if(card&&!card.contains(event.relatedTarget)){card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');}});
// Bring the configurator alongside the model instead of making visitors configure out of view.
const builder=$('#room-builder'),builderHome=builder.parentElement,builderNext=builder.nextElementSibling;
const closeBuilder=document.createElement('button');closeBuilder.className='builder-close';closeBuilder.textContent='×';closeBuilder.setAttribute('aria-label',language()==='ar'?'إغلاق الإعدادات':'Close configurator');builder.prepend(closeBuilder);
function openBuilder(event){event?.preventDefault();ensureScene();$('.lab-hero').classList.add('configuring');$('.lab-hero').append(builder);builder.classList.add('builder-active');$('.lab-hero').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});closeBuilder.focus({preventScroll:true});}
$('.hero-actions a[href="#room-builder"]').addEventListener('click',openBuilder);
closeBuilder.addEventListener('click',()=>{$('.lab-hero').classList.remove('configuring');builder.classList.remove('builder-active');builderHome.insertBefore(builder,builderNext);$('.hero-actions a[href="#room-builder"]').focus({preventScroll:true});});
