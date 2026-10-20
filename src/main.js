import {english,services,products} from './content.js';
import {faqPath,homePath,privacyPath,servicePath,updateHomeSEO,whatsappLink} from './site-meta.js';
import {initMobileExperience} from './mobile.js';
import {createInstallation} from './installation.js';
import {createPartsTray} from './parts-tray.js';
import {createCoolingFinder} from './cooling-finder.js';
import {icon} from './icons.js';
import './performance.js';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const arabic = {partsTray:'استفسار عن قطع',application:'الاستخدام',inspect:'افحص المنتج',configuration:'تكوين الغرفة',height:'الارتفاع',volume:'الحجم التقريبي',doors:'الأبواب',storedProduct:'المادة المخزنة',copied:'تم نسخ الرسالة',copyFailed:'حدد النص أدناه وانسخه.',serviceOption:'اختر المجال أو المنتج',count:'منتجات',productCategory:'منتجات المفرق',target:'درجة الحرارة المستهدفة',name:'الاسم',phoneText:'الهاتف',details:'التفاصيل',subject:'طلب عرض سعر',general:'استفسار عام'};
// Build-time English pages carry the original Arabic labels for instant switching.
Object.assign(arabic,JSON.parse(document.querySelector('#arabic-copy')?.textContent||'{}'));
// Preserve the Arabic HTML as the source of truth; English mirrors every visible interface label.
$$('[data-i]').forEach(el => {arabic[el.dataset.i] ??= el.innerHTML;});
$$('[data-a]').forEach(el => {arabic[el.dataset.a] ??= el.tagName === 'IMG' ? el.alt : el.getAttribute('aria-label');});
$$('[data-p]').forEach(el => {arabic[el.dataset.p] ??= el.placeholder;});
let lang = 'ar';
let activeService = 'cold';
let activeFilter = 'all';
let preparedMessage = '';
let lastFocus = null;
let coolingFinder=null;
let partsTray=null,installation=null,phoneExperience=null;
let productQuery='';
const t = key => (lang === 'ar' ? arabic : english)[key] ?? key;
const local = item => item[lang];
function renderService() {
  const s = services.find(item => item.id === activeService);
  if ($('#solution-tabs').dataset.language !== lang) {
  $('#solution-tabs').innerHTML = services.map(item => `<button class="solution-tab" role="tab" id="tab-${item.id}" aria-controls="solution-panel" aria-selected="${item.id === activeService}" tabindex="${item.id === activeService ? 0 : -1}" data-service="${item.id}"><span class="service-thumb"><img src="/assets/${item.image}.webp" alt="" width="400" height="300" loading="lazy" /></span><span class="service-tab-arrow" aria-hidden="true">${icon('plus','service-expand-icon')}${icon('check','service-selected-icon')}</span><span class="service-tab-copy"><strong>${local(item)}</strong><small>${item.eyebrow}</small></span></button>`).join('');
    $('#solution-tabs').dataset.language=lang;
  }
  $$('#solution-tabs .solution-tab').forEach(tab=>{const active=tab.dataset.service===activeService;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
  $('#solution-panel').setAttribute('aria-labelledby', `tab-${s.id}`);
  $('#service-en').textContent = s.eyebrow;
  $('#service-title').innerHTML = lang === 'ar' ? s.titleAr : s.titleEn;
  $('#service-desc').textContent = lang === 'ar' ? s.descAr : s.descEn;
  $('#service-image').src = `/assets/${s.image}.webp`;
  $('#service-image').alt = `${local(s)} · HMD Darouzi`;
  $('.solution-media').classList.toggle('contain', !!s.contain);
  $('#service-specs').innerHTML = s.specs.map(([value, ar, en]) => `<div><strong>${value.replace('–','-')}</strong><small>${lang === 'ar' ? ar : en}</small></div>`).join('');
  $('#service-quote').dataset.selection = s.id;
  $('#service-guide').href=servicePath(s.id,lang);
  $('#service-guide').textContent=lang==='ar'?`تفاصيل ${s.ar}`:`Explore ${s.en.toLowerCase()}`;
  coolingFinder?.highlight();
}
const productNodes = new Map();
const normalizeSearch=value=>value.normalize('NFKD').replace(/\p{M}/gu,'').replace(/ى/g,'ي').replace(/ة/g,'ه').toLowerCase().trim();
const searchAliases={compressor:'ضاغط كمبروسر',condensing:'وحدة تكثيف',evaporator:'مبخر',panels:'لوح بانل عازل',door:'باب','truck-unit':'وحدة نقل',truck:'صندوق سيارة',hardware:'قفل مفصل لوازم'};
const productSearch=new Map(products.map(p=>[p.id,normalizeSearch(`${p.ar} ${p.en} ${p.id} ${searchAliases[p.id]||''}`)]));
function renderProducts() {
  const terms=normalizeSearch(productQuery).split(/\s+/).filter(Boolean);
  const visible = products.filter(item => (activeFilter === 'all' || item.category === activeFilter)&&terms.every(term=>productSearch.get(item.id).includes(term)));
  $('#catalog-empty').hidden=visible.length>0;$('#catalog-search-clear').hidden=!productQuery;
  const nodes = visible.map((item,index) => {
    const key = `${lang}:${item.id}`;
    let card = productNodes.get(key);
    if (!card) {
      const template = document.createElement('template');
      template.innerHTML = `<article class="product-card"><div class="product-media"><button class="product-image inspect-trigger" data-product="${item.id}" aria-label="${t('inspect')}: ${local(item)}"><img src="/assets/${item.image}.webp" srcset="/assets/${item.image}-small.webp 300w, /assets/${item.image}.webp 650w" sizes="(max-width:640px) calc((100vw - 54px)/2), ${index<2?'(min-width:1440px) 658px, calc((100vw - 100px)/2)':'(min-width:1440px) 430px, calc((100vw - 120px)/3)'}" alt="${local(item)}" width="400" height="330" loading="lazy" decoding="async" /></button></div><div class="product-info"><div><small>${t('productCategory')}</small><h3>${local(item)}</h3></div><button class="product-quote quote-trigger" data-selection="product-${item.id}" aria-label="${t('quote')}: ${local(item)}">${icon('arrow-right','icon-forward')}</button></div></article>`;
      card = template.content.firstElementChild;
      productNodes.set(key, card);
    } else card.style.animation = 'none';
    // Reuse decoded images and controls; only the responsive slot changes with ordering.
    card.querySelector('img').sizes = `(max-width:640px) calc((100vw - 54px)/2), ${index<2?'(min-width:1440px) 658px, calc((100vw - 100px)/2)':'(min-width:1440px) 430px, calc((100vw - 120px)/3)'}`;
    card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y');
    return card;
  });
  $('#product-grid').replaceChildren(...nodes);
  $('#product-count').textContent = lang==='ar'?`${t('count')}: ${visible.length}`:`${visible.length} ${visible.length===1?'product':t('count')}`;
  partsTray?.updateSummary();
}
function renderOptions(value = '') {
  $('#quote-service').innerHTML = `<option value="">${t('serviceOption')}</option><optgroup label="${t('navSolutions')}">${services.map(s => `<option value="${s.id}">${local(s)}</option>`).join('')}</optgroup><optgroup label="${t('navProducts')}">${products.map(p => `<option value="product-${p.id}">${local(p)}</option>`).join('')}</optgroup><option value="parts-tray" ${!partsTray?.hasItems()?'disabled':''}>${t('partsTray')}</option><option value="general">${t('general')}</option>`;
  $('#quote-service').value = value;
}
function setLanguage(next) {
  const selection = $('#quote-service').value;
  $('#quote-result').hidden=true;preparedMessage='';$('#message-preview').value='';
  lang = next;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i]').forEach(el => {el.innerHTML = t(el.dataset.i);});
  $$('[data-a]').forEach(el => {el.setAttribute(el.tagName === 'IMG' ? 'alt' : 'aria-label', t(el.dataset.a));});
  $$('[data-p]').forEach(el => {el.placeholder = t(el.dataset.p);});
  $('#language').innerHTML = `${lang === 'ar' ? 'EN' : 'العربية'} ${icon('language')}`;
  $('#language').setAttribute('aria-label', lang === 'ar' ? 'EN - Switch to English' : 'العربية - التبديل إلى العربية');
  updateHomeSEO(lang);
  $('#language').href=homePath(lang==='ar'?'en':'ar')+location.hash;
  $('#language').hreflang=lang==='ar'?'en':'ar';
  $('#whatsapp-fab').href=whatsappLink(lang);$('#contact-whatsapp').href=whatsappLink(lang);$('.footer-privacy').href=privacyPath(lang);$('.footer-faq').href=faqPath(lang);
  $$('.service-directory a[data-guide]').forEach(a=>{const service=services.find(s=>s.id===a.dataset.guide);a.href=servicePath(service.id,lang);a.textContent=service[lang];});
  $('#mobile-menu').setAttribute('aria-label',t('navLabel'));
  renderService();renderProducts();renderOptions(selection);coolingFinder?.refresh();partsTray?.refresh();installation?.refresh();updateApplicationNote();updatePartsNote();
  try {localStorage.setItem('darouzi-language',lang);} catch {}
}
$('#language').addEventListener('click', event => {
 if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();const next=lang==='ar'?'en':'ar';
 history.pushState(null,'',homePath(next)+location.search+location.hash);setLanguage(next);
});
window.addEventListener('popstate',()=>setLanguage(location.pathname.startsWith('/en')?'en':'ar'));
$('#solution-tabs').addEventListener('click', event => {
  const tab = event.target.closest('[data-service]');
  if (!tab) return;
  activeService = tab.dataset.service;renderService();$(`#tab-${activeService}`).focus({preventScroll:true});revealTab(tab);
});
// On phones the selected card widens inside a swipeable strip; bring it fully into view once it has grown.
function revealTab(tab) {
  const strip = $('#solution-tabs');
  if (strip.scrollWidth <= strip.clientWidth) return;
  const reveal = () => tab.scrollIntoView({block:'nearest',inline:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  if (!parseFloat(getComputedStyle(tab).transitionDuration)) return reveal();
  const done = event => {if (event.target !== tab || event.propertyName !== 'flex-basis') return;tab.removeEventListener('transitionend', done);reveal();};
  tab.addEventListener('transitionend', done);
}
$('#solution-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault();
  let index = services.findIndex(s => s.id === activeService);
  if (event.key === 'Home') index = 0;
  else if (event.key === 'End') index = services.length - 1;
  else index = (index + (event.key === 'ArrowRight' ? (lang === 'ar' ? -1 : 1) : (lang === 'ar' ? 1 : -1)) + services.length) % services.length;
  activeService = services[index].id;renderService();$(`#tab-${activeService}`).focus({preventScroll:true});$(`#tab-${activeService}`).scrollIntoView({block:'nearest',inline:'nearest'});
});
$('.filters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');if (!button) return;
  activeFilter = button.dataset.filter;
  $$('.filter').forEach(b => {const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});renderProducts();
});
$('#catalog-search').addEventListener('input',event=>{productQuery=event.target.value;renderProducts();});
$('#catalog-search-clear').addEventListener('click',()=>{productQuery='';$('#catalog-search').value='';renderProducts();$('#catalog-search').focus();});
$('#catalog-reset').addEventListener('click',()=>{productQuery='';activeFilter='all';$('#catalog-search').value='';$$('.filter').forEach(b=>{const active=b.dataset.filter==='all';b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});renderProducts();$('#catalog-search').focus();});
$('#temperature').addEventListener('input', event => {const n = Number(event.target.value);$('#temperature-value').textContent = `${n>0?'+':''}${n}°C`;});
function setMenu(open) {$('#mobile-menu').hidden = !open;$('.menu-toggle').setAttribute('aria-expanded',String(open));}
$('.menu-toggle').addEventListener('click',()=>setMenu($('#mobile-menu').hidden));
$$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
// An open mobile menu must not survive a desktop resize or an outside click.
matchMedia('(min-width:901px)').addEventListener('change',event=>{if(event.matches)setMenu(false);});
document.addEventListener('click',event=>{if(!$('#mobile-menu').hidden&&!event.target.closest('#mobile-menu,.menu-toggle'))setMenu(false);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#mobile-menu').hidden){setMenu(false);$('.menu-toggle').focus();}});
const dialog = $('#quote-dialog');
function updateApplicationNote(){const context=coolingFinder?.context();$('#quote-application').hidden=!context;$('#quote-application').textContent=context?`${t('application')}: ${context}`:'';}
function updatePartsNote(){ $('#quote-parts').hidden=$('#quote-service').value!=='parts-tray'||!partsTray?.hasItems(); }
function invalidateMessage(){ $('#quote-result').hidden=true;preparedMessage='';$('#message-preview').value='';updatePartsNote(); }
function openQuote(selection='',details) {
  updateApplicationNote();
  lastFocus = document.activeElement;
  phoneExperience?.beforeQuote();
  if (selection) $('#quote-service').value=selection;
  else if($('#quote-service').value==='parts-tray')$('#quote-service').value='';
  updatePartsNote();
  if (details!==undefined) $('#quote-details').value=details;
  $('#quote-result').hidden = true;
  dialog.showModal();document.body.classList.add('no-scroll');setMenu(false);
}
document.addEventListener('click',event=>{const trigger=event.target.closest('.quote-trigger');if(trigger)openQuote(trigger.dataset.selection||'');});
// The quote carries the full configuration: typed dimensions, every door and its wall, and the stored product.
$('#temperature-quote').addEventListener('click',()=>{
  const [width,length,height]=['width','length','height'].map(key=>Number($(`#room-${key}`).value)),product=$('#room-product').value.trim();
  const doors=$$('#door-list select').map(select=>select.selectedOptions[0].textContent);
  openQuote('cold',[t('configuration'),`${t('widthLabel')}: ${width} m`,`${t('lengthLabel')}: ${length} m`,`${t('height')}: ${height} m`,`${t('volume')}: ${(width*length*height).toFixed(1)} m³`,`${t('doors')}: ${doors.length} (${doors.join(lang==='ar'?'، ':', ')})`,...(product?[`${t('storedProduct')}: ${product}`]:[]),`${t('target')}: ${$('#temperature-value').value}`].join('\n'));
});
$('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{if(!phoneExperience?.afterQuote())lastFocus?.focus({preventScroll:true});document.body.classList.toggle('no-scroll',!!document.querySelector('dialog[open]'));});
$('#quote-form').addEventListener('submit',event=>{
  event.preventDefault();
  const form=event.currentTarget;
  if(!form.reportValidity())return;
  const data=new FormData(form);
  const name=String(data.get('name')).trim();const phone=String(data.get('phone')).trim();
  if(!name||!phone){const input=form.elements[!name?'name':'phone'];input.setCustomValidity(lang==='ar'?'يرجى إدخال قيمة صحيحة.':'Please enter a valid value.');input.reportValidity();input.addEventListener('input',()=>input.setCustomValidity(''),{once:true});return;}
  if($('#quote-service').value==='parts-tray'&&!partsTray.hasItems()){dialog.close();$('#tray-title').focus();return;}
  const selected=$('#quote-service').selectedOptions[0].textContent;
  preparedMessage=`${t('subject')}: ${selected}${coolingFinder?.context()?`\n${t('application')}: ${coolingFinder.context()}`:''}\n\n${t('name')}: ${name}\n${t('phoneText')}: ${phone}\n\n${t('details')}:\n${String(data.get('details')).trim()}${$('#quote-service').value==='parts-tray'?`\n\n${partsTray.message()}`:''}`;
  $('#message-preview').value=preparedMessage;
  $('#quote-result').hidden=false;
  $('#copy-quote').textContent=t('copyMessage');
  const channel=event.submitter?.value==='email'?'email':'whatsapp';
  const link=document.createElement('a');
  if(channel==='whatsapp'){
    link.href=whatsappLink(lang,preparedMessage);
    link.target='_blank';link.rel='noopener noreferrer';
  }else link.href=`mailto:h.darouzi@gmail.com?subject=${encodeURIComponent(`${t('subject')} | ${selected}`)}&body=${encodeURIComponent(preparedMessage)}`;
  // Keep the handoff synchronous with the user's click so app opening isn't blocked.
  link.hidden=true;document.body.append(link);link.click();link.remove();
});
// An edited inquiry must not leave an outdated copyable message on screen.
$('#quote-service').addEventListener('change',invalidateMessage);
$('#quote-form').addEventListener('input',event=>{
 if(event.target.id==='message-preview')return;
 $('#quote-result').hidden=true;preparedMessage='';$('#message-preview').value='';
});
$('#copy-quote').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(preparedMessage);$('#copy-quote').textContent=t('copied');}catch{$('#message-preview').focus();$('#message-preview').select();$('#copy-quote').textContent=t('copyFailed');}});
$('#year').textContent=new Date().getFullYear();
setLanguage(location.pathname.startsWith('/en')?'en':'ar');
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js-reveal');const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}},{threshold:.08});$$('.reveal').forEach(el=>observer.observe(el));}

const productDescriptions = {
 cooling:{ar:'تجهيزات لدورة التبريد الصناعي. يحدد فريقنا السعة والموديل والتوافق مع منظومتك وفق الاستخدام وظروف التشغيل.',en:'Equipment for the industrial refrigeration cycle. Our team confirms capacity, model and compatibility with your system and operating conditions.'},
 insulation:{ar:'تجهيزات عزل وأبواب لغرف التبريد. شاركنا الأبعاد ومتطلبات الاستخدام لتحديد القطعة أو التجهيز المناسب.',en:'Insulation and access components for cold rooms. Share your dimensions and application to identify the right component or assembly.'},
 transport:{ar:'تجهيزات تبريد وعزل لنقل المنتجات الحساسة للحرارة. يعتمد الاختيار على المركبة وطبيعة الحمولة وظروف النقل.',en:'Refrigeration and insulation equipment for temperature-sensitive transport. Selection depends on your vehicle, cargo and transport conditions.'}
};
$('#product-grid').addEventListener('click',event=>{const button=event.target.closest('.inspect-trigger');if(!button)return;const product=products.find(p=>p.id===button.dataset.product);window.dispatchEvent(new CustomEvent('darouzi:inspect',{detail:{...product,description:productDescriptions[product.category]}}));});
window.addEventListener('darouzi:quote',event=>openQuote(event.detail.selection));
coolingFinder=createCoolingFinder({
 selectService:(id,reveal)=>{activeService=id;renderService();if(reveal){const tab=$(`#tab-${id}`);tab.focus({preventScroll:true});tab.scrollIntoView({block:'nearest',inline:'nearest'});}},
 onChange:()=>{updateApplicationNote();$('#quote-result').hidden=true;preparedMessage='';$('#message-preview').value='';},
 quote:selection=>openQuote(selection)
});
partsTray=createPartsTray({products,onChange:invalidateMessage,quote:openQuote});
installation=createInstallation({add:id=>partsTray.add(id),quote:openQuote});
window.addEventListener('darouzi:add-part',event=>partsTray.add(event.detail.id));
phoneExperience=initMobileExperience();
import('./experience.js');
import('./refinement.js');
import('./projects.js');
import('./repair.js');

// Load the closing interaction only as the visitor approaches it.
const footerLoader=new IntersectionObserver(entries=>{
 if(entries.some(entry=>entry.isIntersecting)){footerLoader.disconnect();import('./footer.js');}
},{rootMargin:'500px'});
footerLoader.observe(document.querySelector('#contact'));
