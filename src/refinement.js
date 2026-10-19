import {isLite,constrainedHardware} from './performance.js';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const layerDescriptions = {
 ar: [
  'سطح معدني يحمي القلب العازل. نحدد التشطيب والمواد وفق بيئة المشروع.',
  'القلب العازل يحدّ من انتقال الحرارة. يختار الفريق المادة والسماكة بناءً على درجة التشغيل والاستخدام.',
  'السطح المواجه للغرفة جزء من منظومة متكاملة. نراعي ملاءمة التشطيب وطريقة الوصل لاحتياجات مشروعك.'
 ],
 en: [
  'A metal skin protects the insulation core. Finish and material are specified for the project environment.',
  'The core limits heat transfer. Our team selects the material and thickness for your operating temperature and application.',
  'The room-facing surface is part of a complete system. Finish and joints are considered around your project requirements.'
 ]
};
const panel = $('.panel-assembly');
let activeLayer = 0;
function paintRange(input) {
 const fill = (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100;
 input.style.setProperty('--range-fill', `${fill}%`);
}
function spreadPanel() {
 const value = Number($('#panel-spread').value);
 panel.style.setProperty('--spread', value);
 $('#panel-spread-value').value = `${value}%`;
 paintRange($('#panel-spread'));
}
function selectLayer(index, expand = true) {
 activeLayer = index;
 panel.dataset.selected = index;
 $$('[data-layer]').forEach((button, i) => {
  button.setAttribute('aria-selected', String(i === index));
  button.tabIndex = i === index ? 0 : -1;
 });
 $('#layer-detail').setAttribute('aria-labelledby', `layer-tab-${index}`);
 $('#layer-description').textContent = layerDescriptions[document.documentElement.lang][index];
 if (expand && Number($('#panel-spread').value) < 40) {
  $('#panel-spread').value = 65;
  spreadPanel();
 }
}
$$('[data-layer]').forEach((button, index) => {
 button.addEventListener('click', () => selectLayer(index));
 button.addEventListener('keydown', event => {
  let next;
  if (event.key === 'ArrowDown') next = (index + 1) % 3;
  if (event.key === 'ArrowUp') next = (index + 2) % 3;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = 2;
  if (next === undefined) return;
  event.preventDefault();selectLayer(next);$(`[data-layer="${next}"]`).focus();
 });
});
$('.layer-tabs').setAttribute('aria-orientation', 'vertical');
$('#panel-spread').addEventListener('input', spreadPanel);
spreadPanel();
selectLayer(0, false);
$$('input[type=range]').forEach(input => {
 paintRange(input);
 input.addEventListener('input', () => paintRange(input));
});
window.addEventListener('darouzi:temperature',()=>paintRange($('#temperature')));
new MutationObserver(() => selectLayer(activeLayer, false)).observe(document.documentElement, {attributes:true,attributeFilter:['lang']});

// Navigation follows the visible content without a scroll handler or frame loop.
const sections = $$('main section[id]').filter(section => $(`.desktop-nav a[href="#${section.id}"]`));
const sectionObserver = new IntersectionObserver(entries => {
 for (const entry of entries) {
  if (!entry.isIntersecting) continue;
  $$('.desktop-nav a').forEach(link => {
   if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
   else link.removeAttribute('aria-current');
  });
 }
}, {rootMargin:'-15% 0px -55% 0px',threshold:0});
sections.forEach(section => sectionObserver.observe(section));
const heroObserver = new IntersectionObserver(entries => {
 if (entries[0].isIntersecting) $$('.desktop-nav a').forEach(link => link.removeAttribute('aria-current'));
}, {threshold:.4});
heroObserver.observe($('.lab-hero'));

// A light perspective response to the user's pointer. No perpetual animation.
const stage = $('.panel-stage');
const canTilt = matchMedia('(hover:hover) and (min-width:901px)');
let tiltFrame = 0;
stage.addEventListener('pointermove', event => {
 if (!canTilt.matches || reducedMotion.matches || isLite() || constrainedHardware() || tiltFrame) return;
 const {clientX,clientY} = event;
 tiltFrame = requestAnimationFrame(() => {
  tiltFrame = 0;
  const rect = stage.getBoundingClientRect();
  const x = (clientX - rect.left) / rect.width - .5;
  const y = (clientY - rect.top) / rect.height - .5;
  panel.style.transform = `translate(-50%,-35%) rotateX(${57-y*8}deg) rotateZ(${-34+x*9}deg)`;
 });
});
stage.addEventListener('pointerleave', () => {cancelAnimationFrame(tiltFrame);tiltFrame=0;panel.style.transform='';});

// Motion has a lifecycle: visible, capable devices only.
const hero = $('.lab-hero');
let heroVisible = false;
const canAnimate = () => !isLite() && !constrainedHardware() && !reducedMotion.matches && !document.hidden;
function syncAmbient(){
 const active=heroVisible&&canAnimate();hero.classList.toggle('motion-visible',active);
}
new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;syncAmbient();},{threshold:.08}).observe(hero);
document.addEventListener('visibilitychange',syncAmbient);
window.addEventListener('darouzi:quality',syncAmbient);
reducedMotion.addEventListener('change',syncAmbient);

// A physical selection indicator follows the actual button widths, including Arabic/English changes.
const viewSwitch=$('.view-switch');
let markFrame=0;
function positionViewMark(){
 cancelAnimationFrame(markFrame);
 markFrame=requestAnimationFrame(()=>{
  markFrame=0;
  const selected=$('.view-switch [aria-pressed="true"]');
  viewSwitch.style.setProperty('--mark-left',`${selected.offsetLeft}px`);
  viewSwitch.style.setProperty('--mark-width',`${selected.offsetWidth}px`);
  viewSwitch.classList.add('mark-ready');
 });
}
const markResize=new ResizeObserver(()=>{viewSwitch.classList.remove('mark-ready');positionViewMark();});
markResize.observe(viewSwitch);$$('.view-switch button').forEach(button=>markResize.observe(button));
new MutationObserver(positionViewMark).observe(viewSwitch,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
positionViewMark();
new MutationObserver(()=>{viewSwitch.classList.remove('mark-ready');positionViewMark();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});

// Small, cancellable state transitions communicate the change without delaying it.
let temperatureAnimation,previousTemperature=$('#hero-temperature').textContent;
new MutationObserver(()=>{
 const next=$('#hero-temperature').textContent;if(next===previousTemperature)return;previousTemperature=next;
 temperatureAnimation?.cancel();
 if(canAnimate())temperatureAnimation=$('#hero-temperature').animate([{transform:'translateY(7px)',opacity:.65},{transform:'translateY(0)',opacity:1}],{duration:300,easing:'cubic-bezier(.22,1,.36,1)'});
}).observe($('#hero-temperature'),{childList:true,characterData:true,subtree:true});
let serviceAnimation;
new MutationObserver(()=>{
 serviceAnimation?.cancel();
 if(canAnimate())serviceAnimation=$('.solution-copy').animate([{transform:'translateY(9px)',opacity:.7},{transform:'translateY(0)',opacity:1}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'});
}).observe($('#service-title'),{childList:true,subtree:true});
window.addEventListener('darouzi:quality',()=>{if(!canAnimate()){temperatureAnimation?.cancel();serviceAnimation?.cancel();}});
document.addEventListener('pointerdown',event=>{
 const button=event.target.closest('.button');if(!button||!canAnimate()||event.button!==0)return;
 const rect=button.getBoundingClientRect(),wave=document.createElement('i');
 wave.className='button-wave';wave.setAttribute('aria-hidden','true');wave.style.left=`${event.clientX-rect.left}px`;wave.style.top=`${event.clientY-rect.top}px`;button.append(wave);
 const animation=wave.animate([{transform:'translate(-50%,-50%) scale(0)',opacity:.28},{transform:'translate(-50%,-50%) scale(4)',opacity:0}],{duration:550,easing:'ease-out'});
 animation.finished.then(()=>wave.remove(),()=>wave.remove());
});
