import './performance.js';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const english = {
skip:'Skip to content',brand:'Industrial refrigeration',navLabel:'Main navigation',menuLabel:'Open menu',navSolutions:'Our solutions',navProducts:'Retail products',navAbout:'About Darouzi',navContact:'Contact',quote:'Request a quote',heroEyebrow:'PRECISION IN EVERY DEGREE',heroTitle1:'Engineered cold.',heroTitle2:'Lasting confidence.',heroDesc:'From the first drawing to the final degree. Industrial refrigeration built to protect what you create.',explore:'Explore solutions',profile:'Company profile',heroAlt:'Architectural visualization of an industrial cold room',factsLabel:'Company capabilities',fact1:'Solutions for deep freezing',fact2:'Water chiller capacity',fact3:'Specialist divisions. One partner.',fact4:'Design. Manufacture. Install.',fact5:'Technical support beyond delivery.',solutionsEyebrow:'OUR SOLUTIONS',solutionsTitle:'Every cooling challenge. Considered.',solutionsDesc:'Six specialisms, one dedicated team. Select your application and discover the right starting point.',tabsLabel:'Cooling solutions',companyEquipment:'Equipment and materials from our company profile',tempTitle:'One degree makes a difference.',tempDesc:'Select your target temperature and add it to your inquiry. Our team will confirm the right setting for your product.',tempLabel:'Target temperature',tempCTA:'Add to your inquiry',productsTitle:'The right component.<br>Performance you rely on.',productsDesc:'Refrigeration equipment and parts for specialists and project owners. Ask us about models, availability and pricing.',filterLabel:'Filter products',filterAll:'All products',filterCooling:'Refrigeration',filterInsulation:'Insulation & doors',filterTransport:'Transport cooling',brandsLabel:'Brands featured in our company profile',plantAlt:'Industrial refrigeration units shown in the Darouzi company profile',profileSmall:'Get to know our company',aboutEyebrow:'HMD DAROUZI',aboutTitle:'We build cooling systems.<br>And lasting relationships.',aboutDesc:'From our industrial facility in Sheikh Najjar to every installation, we combine manufacturing and technical experience around your actual needs.',about1Title:'Built around your project',about1Desc:'Equipment selected for your product, space and operating conditions.',about2Title:'Expertise beyond delivery',about2Desc:'Regular maintenance, equipment training and ongoing technical support.',processTitle:'From the first idea to operation.',processDesc:'A clear process. Direct communication. Care in every detail.',process1:'Understand',process1Desc:'Tell us about your project, dimensions and target temperature.',process2:'Engineer',process2Desc:'We specify the equipment and prepare a tailored quotation.',process3:'Build & install',process3Desc:'Manufacturing, preparation and installation by a specialist technical team.',process4:'Keep supporting',process4Desc:'Operating guidance, maintenance and support after handover.',contactEyebrow:'LET’S START WITH YOUR PROJECT',contactTitle:'Your next project.<br>A new degree of confidence.',phone:'Call us',email:'Email',sales:'Sales office',salesAddress:'Aleppo, Al-Jamiliyah<br>Awqaf Directorate building',factory:'Industrial facility',factoryAddress:'Aleppo<br>Sheikh Najjar Industrial City',footerLine:'Manufacturing & trading refrigeration equipment',rights:'All rights reserved.',backTop:'Back to top ↑',closeLabel:'Close',quoteEyebrow:'A SIMPLE FIRST STEP',quoteTitle:'Tell us about your project.',quoteDesc:'Complete the details to prepare a message you can send directly to the Darouzi team.',nameLabel:'Full name *',phoneLabel:'Phone number *',serviceLabel:'Solution or product *',detailsLabel:'Project details',detailsPlaceholder:'Dimensions, target temperature, product to store or the part you need...',formNote:'The button opens your email app with a prepared message. Your details are sent only when you confirm in your app.',prepareEmail:'Prepare email',emailReady:'Your message is ready. Send it from your email app, or copy it and email h.darouzi@gmail.com.',copyMessage:'Copy message',whatsapp:'Open in WhatsApp ↗',messageLabel:'Prepared message',copied:'Message copied',copyFailed:'Select and copy the message below.',serviceOption:'Select a solution or product',count:'products',productCategory:'RETAIL PRODUCTS',target:'Target temperature',name:'Name',phoneText:'Phone',details:'Details',subject:'Quote inquiry',general:'General inquiry'};
Object.assign(english, {
 heroEyebrow:'COLD. UNDER YOUR CONTROL.',heroTitle1:'Engineered cold.',heroTitle2:'In your hands.',heroDesc:'Open the door. Take it apart. Change the temperature.<br>Discover what we can build for you.',explore:'Build your room',allSolutions:'Our six solutions',modelLabel:'Interactive cold room',modelCaption:'Conceptual visualization',dragHint:'Drag to rotate the room',closeDoor:'Close door',resetView:'Reset view',rotateLeft:'Rotate room left',rotateRight:'Rotate room right',hotspotCooling:'Explore the evaporator',hotspotPanels:'Explore insulation',hotspotDoor:'Explore the door',viewComponents:'Explore components ↗',viewLabel:'Room viewing mode',viewInside:'Inside',viewOutside:'Outside',viewExploded:'Take it apart',climateLabel:'Illustrative temperatures',climateChill:'Chilled',climateFreeze:'Frozen',climateDeep:'Deep freeze',builderTitle:'Your room. Your dimensions.',builderDesc:'Change the dimensions and watch the room take shape. Our team reviews the design and specifications before production.',widthLabel:'Width',lengthLabel:'Length',volumeLabel:'Approximate interior volume',heightNote:'At a height of 2.8 m',tempCTA:'Quote this configuration',solutionsTitle:'Six worlds. One expertise.',solutionsDesc:'Open the field that matters to you. Explore how we approach it.',productsTitle:'Take a closer look.<br>Details make the difference.',productsDesc:'Explore the components. Open a product to inspect it, then ask our team about the right model for your project.',zoomOut:'Zoom out',zoomIn:'Zoom in',zoomReset:'Reset image',stockNote:'Model, availability and price are confirmed when you contact us.',inspect:'Inspect',configuration:'Room configuration',height:'Height',volume:'Approximate volume'
});
Object.assign(english, {
 layersTitle:'Strength in<br><span class="accent">the unseen.</span>',layersIntro:'Behind every stable degree, details work together.<br>Separate the panel and explore each layer.',layersLabel:'Insulated panel layers',layerSkin:'Outer skin',layerCore:'Insulation core',layerInner:'Inner surface',layerQuote:'Discuss your insulation',layerSlider:'Slide to separate the layers',layerClosed:'Assembled panel',layerOpen:'Details revealed',layerNote:'Illustrative panel construction. Materials and thickness are specified for each project.'
});
const arabic = {inspect:'افحص المنتج',configuration:'تكوين الغرفة',height:'الارتفاع',volume:'الحجم التقريبي',copied:'تم نسخ الرسالة',copyFailed:'حدد النص أدناه وانسخه.',serviceOption:'اختر المجال أو المنتج',count:'منتجات',productCategory:'منتجات المفرق',target:'درجة الحرارة المستهدفة',name:'الاسم',phoneText:'الهاتف',details:'التفاصيل',subject:'طلب عرض سعر',general:'استفسار عام'};
// Preserve the Arabic HTML as the source of truth; English mirrors every visible interface label.
$$('[data-i]').forEach(el => {arabic[el.dataset.i] ??= el.innerHTML;});
$$('[data-a]').forEach(el => {arabic[el.dataset.a] = el.tagName === 'IMG' ? el.alt : el.getAttribute('aria-label');});
$$('[data-p]').forEach(el => {arabic[el.dataset.p] = el.placeholder;});
const services = [
{id:'cold',ar:'غرف التبريد',en:'Cold rooms',eyebrow:'COLD ROOMS',titleAr:'حافظ على الجودة.<br>تحكّم بكل درجة.',titleEn:'Protect the quality.<br>Control every degree.',descAr:'غرف تبريد وتجميد مصممة وفق حجم مشروعك وطبيعة منتجاتك، مع وحدات تكثيف ومبخرات وأبواب تناسب احتياجك.',descEn:'Cold and freezer rooms tailored to your space and products, with matched condensing units, evaporators and doors.',image:'cold-room',specs:[['−40 / +15°C','نطاق درجات الحرارة','Temperature range'],['CUSTOM','أبعاد حسب الطلب','Made-to-measure dimensions']]},
{id:'chillers',ar:'شيلرات تبريد المياه',en:'Water chillers',eyebrow:'WATER CHILLERS',titleAr:'تبريد دقيق.<br>تشغيل يعتمد عليه.',titleEn:'Precise cooling.<br>Dependable operation.',descAr:'شيلرات لتبريد المياه في أنظمة التكييف المركزي والتطبيقات الصناعية، مع اختيار التجهيزات وفق متطلبات التشغيل.',descEn:'Water chillers for central air conditioning and industrial applications, configured around your operating requirements.',image:'chiller',specs:[['10–200 HP','استطاعة الشيلرات','Chiller capacity'],['12°C → 7°C','حرارة الدخول والخروج','Inlet and outlet temperature']]},
{id:'towers',ar:'أبراج التبريد',en:'Cooling towers',eyebrow:'COOLING TOWERS',titleAr:'حلول تبريد<br>لدورة عملك.',titleEn:'Cooling solutions.<br>For your process.',descAr:'تجهيز حلول أبراج التبريد وفق طبيعة المنشأة ومتطلبات دورة المياه. شارك فريقنا ظروف التشغيل لتحديد الحل المناسب.',descEn:'Cooling tower solutions specified for your facility and water circuit. Share your operating conditions so our team can assess the right system.',image:'plant',specs:[['PROJECT','تجهيز حسب المشروع','Project-specific equipment'],['SUPPORT','دعم فني وصيانة','Technical support']]},
{id:'ice',ar:'معامل ألواح الثلج',en:'Block ice plants',eyebrow:'BLOCK ICE PLANTS',titleAr:'من الماء إلى الثلج.<br>حل صناعي متكامل.',titleEn:'Water into ice.<br>A complete industrial solution.',descAr:'تجهيز معامل ألواح الثلج وتحديد منظومة التبريد المناسبة لاحتياجاتك الإنتاجية والمساحة المتاحة.',descEn:'Block ice plant equipment with a refrigeration system specified around your production needs and available space.',image:'condensing',contain:true,specs:[['CUSTOM','وفق احتياجات الإنتاج','Configured for your output'],['INSTALL','تجهيز وتركيب','Equipment and installation']]},
{id:'transport',ar:'صناديق سيارات مبردة',en:'Refrigerated vehicles',eyebrow:'REFRIGERATED TRANSPORT',titleAr:'الجودة نفسها.<br>في كل رحلة.',titleEn:'The same quality.<br>On every journey.',descAr:'صناديق سيارات مبردة ومعزولة حرارياً لنقل الأغذية والأدوية والمنتجات الحساسة للحرارة، مع وحدات تبريد تناسب المركبة.',descEn:'Refrigerated and insulated vehicle bodies for food, medicines and temperature-sensitive goods, with cooling units matched to the vehicle.',image:'truck',contain:true,specs:[['INSULATED','صناديق معزولة حرارياً','Thermally insulated bodies'],['CUSTOM','تجهيز حسب المركبة','Matched to your vehicle']]},
{id:'insulation',ar:'العزل الحراري',en:'Thermal insulation',eyebrow:'THERMAL INSULATION',titleAr:'العزل الصحيح.<br>أساس التبريد الفعّال.',titleEn:'The right insulation.<br>The basis of efficient cooling.',descAr:'ألواح ساندويش بانل وتجهيزات عزل حراري لغرف التبريد والمنشآت الصناعية، للحد من انتقال الحرارة ودعم كفاءة المنظومة.',descEn:'Sandwich panels and thermal insulation for cold rooms and industrial facilities, designed to limit heat transfer and support system efficiency.',image:'panels',contain:true,specs:[['SANDWICH PANEL','ألواح عازلة','Insulated panels'],['CUSTOM','تجهيز وفق المساحة','Fitted to your space']]}
];
// Product categories are sourced from the supplied company profile. Stock and pricing require an inquiry.
const products = [
{id:'compressor',ar:'ضواغط التبريد',en:'Refrigeration compressors',category:'cooling',image:'compressor'},
{id:'condensing',ar:'وحدات التكثيف',en:'Condensing units',category:'cooling',image:'condensing'},
{id:'evaporator',ar:'مبخرات التبريد',en:'Cooling evaporators',category:'cooling',image:'evaporator'},
{id:'panels',ar:'ألواح ساندويش بانل',en:'Sandwich panels',category:'insulation',image:'panels'},
{id:'door',ar:'أبواب غرف التبريد',en:'Cold room doors',category:'insulation',image:'door'},
{id:'truck-unit',ar:'وحدات تبريد النقل',en:'Transport cooling units',category:'transport',image:'truck-unit'},
{id:'truck',ar:'صناديق سيارات معزولة',en:'Insulated vehicle bodies',category:'transport',image:'truck'},
{id:'hardware',ar:'لوازم وأقفال الأبواب',en:'Door fittings & locks',category:'insulation',image:'hardware'}
];
let lang = 'ar';
let activeService = 'cold';
let activeFilter = 'all';
let preparedMessage = '';
let lastFocus = null;
const t = key => (lang === 'ar' ? arabic : english)[key] ?? key;
const local = item => item[lang];
function renderService() {
  const s = services.find(item => item.id === activeService);
  if ($('#solution-tabs').dataset.language !== lang) {
  $('#solution-tabs').innerHTML = services.map(item => `<button class="solution-tab" role="tab" id="tab-${item.id}" aria-controls="solution-panel" aria-selected="${item.id === activeService}" tabindex="${item.id === activeService ? 0 : -1}" data-service="${item.id}"><span class="service-thumb"><img src="/assets/${item.image}.webp" alt="" width="400" height="300" loading="lazy" /></span><span class="service-tab-arrow" aria-hidden="true">↗</span><span class="service-tab-copy"><strong>${local(item)}</strong><small>${item.eyebrow}</small></span></button>`).join('');
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
}
function renderProducts() {
  const visible = products.filter(item => activeFilter === 'all' || item.category === activeFilter);
  $('#product-grid').innerHTML = visible.map((item,index) => `<article class="product-card" style="animation-delay:${index * 35}ms"><button class="product-image inspect-trigger" data-product="${item.id}" aria-label="${t('inspect')}: ${local(item)}"><img src="/assets/${item.image}.webp" srcset="/assets/${item.image}-small.webp 300w, /assets/${item.image}.webp 650w" sizes="(max-width: 640px) 150px, (max-width: 900px) 300px, 250px" alt="${local(item)}" width="400" height="330" loading="lazy" decoding="async" /><span class="inspect-label">${t('inspect')} <span aria-hidden="true">+</span></span></button><div class="product-info"><div><small>${t('productCategory')}</small><h3>${local(item)}</h3></div><button class="product-quote quote-trigger" data-selection="product-${item.id}" aria-label="${t('quote')}: ${local(item)}"><span class="arrow" aria-hidden="true">↗</span></button></div></article>`).join('');
  $('#product-count').textContent = `${visible.length} ${t('count')}`;
}
function renderOptions(value = '') {
  $('#quote-service').innerHTML = `<option value="">${t('serviceOption')}</option><optgroup label="${t('navSolutions')}">${services.map(s => `<option value="${s.id}">${local(s)}</option>`).join('')}</optgroup><optgroup label="${t('navProducts')}">${products.map(p => `<option value="product-${p.id}">${local(p)}</option>`).join('')}</optgroup><option value="general">${t('general')}</option>`;
  $('#quote-service').value = value;
}
function setLanguage(next) {
  const selection = $('#quote-service').value;
  lang = next;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i]').forEach(el => {el.innerHTML = t(el.dataset.i);});
  $$('[data-a]').forEach(el => {el.setAttribute(el.tagName === 'IMG' ? 'alt' : 'aria-label', t(el.dataset.a));});
  $$('[data-p]').forEach(el => {el.placeholder = t(el.dataset.p);});
  $('#language').innerHTML = lang === 'ar' ? 'EN <span aria-hidden="true">↗</span>' : 'العربية <span aria-hidden="true">↗</span>';
  $('#language').setAttribute('aria-label', lang === 'ar' ? 'EN - Switch to English' : 'العربية - التبديل إلى العربية');
  document.title = lang === 'ar' ? 'درعوزي | هندسة التبريد الصناعي' : 'HMD Darouzi | Engineered Industrial Refrigeration';
  $('meta[name=description]').content = lang === 'ar' ? 'درعوزي للتبريد الصناعي في حلب. غرف تبريد وتجميد، شيلرات مياه، أبراج تبريد، معامل ثلج، صناديق سيارات مبردة وعزل حراري.' : 'HMD Darouzi in Aleppo: cold rooms, water chillers, cooling towers, block ice plants, refrigerated vehicles, thermal insulation and retail refrigeration parts.';
  $('#mobile-menu').setAttribute('aria-label',t('navLabel'));
  renderService();renderProducts();renderOptions(selection);
  try {localStorage.setItem('darouzi-language',lang);} catch {}
}
$('#language').addEventListener('click', () => setLanguage(lang === 'ar' ? 'en' : 'ar'));
$('#solution-tabs').addEventListener('click', event => {
  const tab = event.target.closest('[data-service]');
  if (!tab) return;
  activeService = tab.dataset.service;renderService();$(`#tab-${activeService}`).focus({preventScroll:true});
});
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
$('#temperature').addEventListener('input', event => {const n = Number(event.target.value);$('#temperature-value').textContent = `${n>0?'+':''}${n}°C`;});
function setMenu(open) {$('#mobile-menu').hidden = !open;$('.menu-toggle').setAttribute('aria-expanded',String(open));}
$('.menu-toggle').addEventListener('click',()=>setMenu($('#mobile-menu').hidden));
$$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#mobile-menu').hidden){setMenu(false);$('.menu-toggle').focus();}});
const dialog = $('#quote-dialog');
function openQuote(selection='',details) {
  lastFocus = document.activeElement;
  if (selection) $('#quote-service').value=selection;
  if (details!==undefined) $('#quote-details').value=details;
  $('#quote-result').hidden = true;
  dialog.showModal();document.body.classList.add('no-scroll');setMenu(false);
}
document.addEventListener('click',event=>{const trigger=event.target.closest('.quote-trigger');if(trigger)openQuote(trigger.dataset.selection||'');});
$('#temperature-quote').addEventListener('click',()=>openQuote('cold',`${t('configuration')}\n${t('widthLabel')}: ${$('#room-width').value} m\n${t('lengthLabel')}: ${$('#room-length').value} m\n${t('height')}: 2.8 m\n${t('volume')}: ${(Number($('#room-width').value)*Number($('#room-length').value)*2.8).toFixed(1)} m³\n${t('target')}: ${$('#temperature-value').value}`));
$('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.classList.remove('no-scroll');lastFocus?.focus({preventScroll:true});});
$('#quote-form').addEventListener('submit',event=>{
  event.preventDefault();
  const form=event.currentTarget;
  if(!form.reportValidity())return;
  const data=new FormData(form);
  const name=String(data.get('name')).trim();const phone=String(data.get('phone')).trim();
  if(!name||!phone){const input=form.elements[!name?'name':'phone'];input.setCustomValidity(lang==='ar'?'يرجى إدخال قيمة صحيحة.':'Please enter a valid value.');input.reportValidity();input.addEventListener('input',()=>input.setCustomValidity(''),{once:true});return;}
  const selected=$('#quote-service').selectedOptions[0].textContent;
  preparedMessage=`${t('subject')}: ${selected}\n\n${t('name')}: ${name}\n${t('phoneText')}: ${phone}\n\n${t('details')}:\n${String(data.get('details')).trim()}`;
  $('#message-preview').value=preparedMessage;
  $('#whatsapp-quote').href=`https://wa.me/963944699555?text=${encodeURIComponent(preparedMessage)}`;
  $('#quote-result').hidden=false;
  $('#copy-quote').textContent=t('copyMessage');
  const link=document.createElement('a');link.href=`mailto:h.darouzi@gmail.com?subject=${encodeURIComponent(`${t('subject')} | ${selected}`)}&body=${encodeURIComponent(preparedMessage)}`;link.hidden=true;document.body.append(link);link.click();link.remove();
});
$('#copy-quote').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(preparedMessage);$('#copy-quote').textContent=t('copied');}catch{$('#message-preview').focus();$('#message-preview').select();$('#copy-quote').textContent=t('copyFailed');}});
$('#year').textContent=new Date().getFullYear();
renderService();renderProducts();renderOptions();
try {if(localStorage.getItem('darouzi-language')==='en')setLanguage('en');}catch{}
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js-reveal');const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}},{threshold:.08});$$('.reveal').forEach(el=>observer.observe(el));}

const productDescriptions = {
 cooling:{ar:'تجهيزات لدورة التبريد الصناعي. يحدد فريقنا السعة والموديل والتوافق مع منظومتك وفق الاستخدام وظروف التشغيل.',en:'Equipment for the industrial refrigeration cycle. Our team confirms capacity, model and compatibility with your system and operating conditions.'},
 insulation:{ar:'تجهيزات عزل وأبواب لغرف التبريد. شاركنا الأبعاد ومتطلبات الاستخدام لتحديد القطعة أو التجهيز المناسب.',en:'Insulation and access components for cold rooms. Share your dimensions and application to identify the right component or assembly.'},
 transport:{ar:'تجهيزات تبريد وعزل لنقل المنتجات الحساسة للحرارة. يعتمد الاختيار على المركبة وطبيعة الحمولة وظروف النقل.',en:'Refrigeration and insulation equipment for temperature-sensitive transport. Selection depends on your vehicle, cargo and transport conditions.'}
};
$('#product-grid').addEventListener('click',event=>{const button=event.target.closest('.inspect-trigger');if(!button)return;const product=products.find(p=>p.id===button.dataset.product);window.dispatchEvent(new CustomEvent('darouzi:inspect',{detail:{...product,description:productDescriptions[product.category]}}));});
window.addEventListener('darouzi:quote',event=>openQuote(event.detail.selection));
import('./experience.js');
import('./refinement.js');
