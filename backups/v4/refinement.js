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
$$('.climate-presets button').forEach(button => button.addEventListener('click', () => paintRange($('#temperature'))));
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
