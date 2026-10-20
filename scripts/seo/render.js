import {parseHTML} from 'linkedom';
import {english,services,products} from '../../src/content.js';
import {faqPath,homeMeta,homePath,privacyPath,servicePath,shareImage,socialLinks,whatsappLink} from '../../src/site-meta.js';
import {faqItems,faqMeta} from './faq.js';
import {privacyCopy,privacyMeta,privacyUpdated} from './privacy.js';
import {installationContent} from '../../src/installation.js';
import {trayWords} from '../../src/parts-tray.js';
import {icon} from '../../src/icons.js';
import {details} from './details.js';
export const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
export function siteOrigin(value=''){
 if(!value)return '';
 const url=new URL(value);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/'||!url.hostname.includes('.')||/localhost|\.test$|\.example$|\.invalid$|\.trycloudflare\.com$|\.pages\.dev$/.test(url.hostname))throw new Error('SITE_URL must be the permanent HTTPS domain origin, without a path, query or preview hostname.');
 return url.origin;
}
// Absolute origin for link-preview images on a preview build (for example the current tunnel). Never makes pages indexable.
export function previewOrigin(value=''){
 if(!value)return '';
 const url=new URL(value);
 if(url.protocol!=='https:'||url.pathname!=='/'||url.search||url.hash)throw new Error('PREVIEW_URL must be an HTTPS origin without a path or query.');
 return url.origin;
}
export const routes=[...['ar','en'].flatMap(lang=>[{lang,path:homePath(lang)},...services.map(service=>({lang,path:servicePath(service.id,lang),service})),{lang,path:faqPath(lang),faq:true},{lang,path:privacyPath(lang),privacy:true}])];
// One description of each page type for metadata, structured data and language alternates.
function page({lang,service,privacy,faq}){
 const brand=lang==='ar'?'درعوزي للتبريد':'HMD Darouzi',info=meta=>({title:`${meta.name} ❄️ ${brand}`,description:meta.description,image:shareImage('home',lang),alt:brand});
 if(faq)return {meta:faqMeta[lang],path:faqPath(lang),alternate:faqPath,crumb:faqMeta[lang].name,share:info(faqMeta[lang])};
 if(privacy)return {meta:privacyMeta[lang],path:privacyPath(lang),alternate:privacyPath,crumb:privacyMeta[lang].name,share:info(privacyMeta[lang])};
 if(service)return {meta:serviceMeta(service,lang),path:servicePath(service.id,lang),alternate:l=>servicePath(service.id,l),crumb:service[lang],share:{title:`${service[lang]} ❄️ ${brand}`,description:lang==='ar'?service.descAr:service.descEn,image:shareImage(service.id,lang),alt:`${service[lang]} · ${brand}`}};
 return {meta:homeMeta[lang],path:homePath(lang),alternate:homePath,share:{title:homeMeta[lang].shareTitle,description:homeMeta[lang].shareDescription,image:shareImage('home',lang),alt:brand}};
}
export function schema({lang,origin='',service,privacy,faq}){
 const {path,meta,crumb}=page({lang,service,privacy,faq}),url=origin+path;
 const business={'@type':'LocalBusiness','@id':origin+'/#business',name:'HMD Darouzi',alternateName:['درعوزي','درعوزي للتبريد','درعوزي للتبريد الصناعي','HMD درعوزي','شركة درعوزي','HMD DAROUZI','Darouzi','Darouzi Refrigeration'],url:origin+'/',logo:origin+'/assets/logo.webp',image:origin+'/assets/plant.webp',telephone:'+963944699555',email:'h.darouzi@gmail.com',address:{'@type':'PostalAddress',streetAddress:'Suleiman al-Halabi, Talaat al-Arqoub',addressLocality:'Aleppo',addressCountry:'SY'},location:[{'@type':'Place',name:'HMD Darouzi sales office',address:{'@type':'PostalAddress',streetAddress:'Suleiman al-Halabi, Talaat al-Arqoub',addressLocality:'Aleppo',addressCountry:'SY'}},{'@type':'Place',name:'HMD Darouzi sales office',address:{'@type':'PostalAddress',streetAddress:'Al-Jamiliyah, Awqaf Directorate building',addressLocality:'Aleppo',addressCountry:'SY'}},{'@type':'Place',name:'HMD Darouzi industrial facility',address:{'@type':'PostalAddress',streetAddress:'Sheikh Najjar Industrial City',addressLocality:'Aleppo',addressCountry:'SY'}}],contactPoint:{'@type':'ContactPoint',telephone:'+963944699555',email:'h.darouzi@gmail.com',contactType:'sales',availableLanguage:['Arabic','English']},sameAs:Object.values(socialLinks)};
 const graph=[business,{'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'HMD Darouzi',alternateName:['درعوزي','درعوزي للتبريد','HMD درعوزي'],inLanguage:['ar','en'],publisher:{'@id':business['@id']}},{'@type':'WebPage','@id':url+'#webpage',url,name:meta.title,description:meta.description,inLanguage:lang,isPartOf:{'@id':origin+'/#website'},about:{'@id':service?url+'#service':business['@id']}}];
 if(service)graph.push({'@type':'Service','@id':url+'#service',name:service[lang],description:lang==='ar'?service.descAr:service.descEn,url,provider:{'@id':business['@id']},image:origin+`/assets/${service.image}.webp`});
 if(faq)graph.push({'@type':'FAQPage','@id':url+'#faq',url,inLanguage:lang,mainEntity:faqItems[lang].map(([question,answer])=>({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}}))});
 if(crumb)graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:lang==='ar'?'الرئيسية':'Home',item:origin+homePath(lang)},{'@type':'ListItem',position:2,name:crumb,item:url}]});
 return {'@context':'https://schema.org','@graph':graph};
}
export function serviceMeta(service,lang){return {title:lang==='ar'?`${service.ar} في حلب | درعوزي HMD Darouzi`:`${service.en} in Aleppo | HMD Darouzi`,description:lang==='ar'?`درعوزي في حلب، سوريا. ${service.descAr}`:`HMD Darouzi, Aleppo, Syria. ${service.descEn}`};}
// `share` is the absolute origin for link previews: the permanent domain, or PREVIEW_URL on a noindex preview build.
export function metadata({lang,origin='',service,privacy,faq,verification='',share=origin}){
 const {meta,path,alternate,share:card}=page({lang,service,privacy,faq});
 return `<title>${escape(meta.title)}</title>
<meta name="description" content="${escape(meta.description)}">
<meta name="robots" content="${origin?'index, follow, max-image-preview:large':'noindex, follow'}">
<meta name="site-origin" content="${escape(origin)}">
${origin?`<link rel="canonical" href="${origin+path}">${['ar','en','x-default'].map(l=>`<link rel="alternate" hreflang="${l}" href="${origin+alternate(l==='x-default'?'ar':l)}">`).join('')}`:''}
<meta property="og:type" content="website"><meta property="og:site_name" content="HMD Darouzi | درعوزي">
<meta property="og:title" content="${escape(card.title)}"><meta property="og:description" content="${escape(card.description)}">
<meta property="og:locale" content="${lang==='ar'?'ar_SY':'en_US'}"><meta property="og:locale:alternate" content="${lang==='ar'?'en_US':'ar_SY'}">
${share?`<meta property="og:url" content="${share+path}">`:''}
<meta property="og:image" content="${share+card.image}">${share?`<meta property="og:image:secure_url" content="${share+card.image}">`:''}<meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escape(card.alt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(card.title)}"><meta name="twitter:description" content="${escape(card.description)}"><meta name="twitter:image" content="${share+card.image}"><meta name="twitter:image:alt" content="${escape(card.alt)}">
${verification?`<meta name="google-site-verification" content="${escape(verification)}">`:''}
<script id="site-schema" type="application/ld+json">${json(schema({lang,origin,service,privacy,faq}))}</script>`;
}
export function renderHome(template,{lang='ar',origin='',verification='',share=origin}={}){
 const {document:d}=parseHTML(template),$=s=>d.querySelector(s),all=s=>[...d.querySelectorAll(s)];
 const arabic=JSON.parse($('#arabic-copy')?.textContent||'{}');
 for(const el of all('[data-i]'))arabic[el.dataset.i]??=el.innerHTML;
 for(const el of all('[data-a]'))arabic[el.dataset.a]??=el.tagName==='IMG'?el.getAttribute('alt'):el.getAttribute('aria-label');
 for(const el of all('[data-p]'))arabic[el.dataset.p]??=el.getAttribute('placeholder');
 const words=lang==='ar'?arabic:english;
 for(const el of all('[data-i]'))if(words[el.dataset.i]!=null)el.innerHTML=words[el.dataset.i];
 for(const el of all('[data-a]'))if(words[el.dataset.a]!=null)el.setAttribute(el.tagName==='IMG'?'alt':'aria-label',words[el.dataset.a]);
 for(const el of all('[data-p]'))if(words[el.dataset.p]!=null)el.setAttribute('placeholder',words[el.dataset.p]);
 d.documentElement.lang=lang;d.documentElement.dir=lang==='ar'?'rtl':'ltr';
 for(const el of all('title,meta[name=description],meta[name=robots],meta[name=site-origin],meta[name=google-site-verification],meta[property^="og:"],meta[name^="twitter:"],link[rel=canonical],link[hreflang],script[type="application/ld+json"],#arabic-copy'))el.remove();
 d.head.insertAdjacentHTML('beforeend',metadata({lang,origin,verification,share})+`<script id="arabic-copy" type="application/json">${json(arabic)}</script>`);
 $('#language').setAttribute('href',homePath(lang==='ar'?'en':'ar'));$('#language').setAttribute('hreflang',lang==='ar'?'en':'ar');$('#language').setAttribute('aria-label',lang==='ar'?'EN - Switch to English':'العربية - التبديل إلى العربية');$('#language').innerHTML=(lang==='ar'?'EN':'العربية')+' '+icon('language');
 $('#whatsapp-fab').setAttribute('href',whatsappLink(lang));$('.footer-privacy').setAttribute('href',privacyPath(lang));$('.footer-faq').setAttribute('href',faqPath(lang));$('#contact-whatsapp').setAttribute('href',whatsappLink(lang));
 $('#solution-tabs').innerHTML=services.map((s,i)=>`<button class="solution-tab" role="tab" id="tab-${s.id}" aria-controls="solution-panel" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-service="${s.id}"><span class="service-thumb"><img src="/assets/${s.image}.webp" alt="" width="400" height="300" loading="lazy"></span><span class="service-tab-arrow" aria-hidden="true">${icon('plus','service-expand-icon')}${icon('check','service-selected-icon')}</span><span class="service-tab-copy"><strong>${s[lang]}</strong><small>${s.eyebrow}</small></span></button>`).join('');
 const service=services[0];$('#service-title').innerHTML=lang==='ar'?service.titleAr:service.titleEn;$('#service-desc').textContent=lang==='ar'?service.descAr:service.descEn;$('#service-specs').innerHTML=service.specs.map(([v,ar,en])=>`<div><strong>${v}</strong><small>${lang==='ar'?ar:en}</small></div>`).join('');$('#service-image').alt=service[lang]+' · HMD Darouzi';$('#service-quote').setAttribute('data-selection','cold');$('#service-guide').href=servicePath('cold',lang);$('#service-guide').textContent=lang==='ar'?'تفاصيل غرف التبريد':'Explore cold rooms';
 $('.service-directory>div').innerHTML=services.map(s=>`<a data-guide="${s.id}" href="${servicePath(s.id,lang)}">${s[lang]}</a>`).join('');
 $('#product-grid').innerHTML=products.map((p,i)=>`<article class="product-card"><div class="product-media"><button class="product-image inspect-trigger" data-product="${p.id}" aria-label="${words.inspect||'افحص المنتج'}: ${escape(p[lang])}"><img src="/assets/${p.image}.webp" srcset="/assets/${p.image}-small.webp 300w, /assets/${p.image}.webp 650w" sizes="(max-width:640px) calc((100vw - 54px)/2), ${i<2?'50vw':'33vw'}" width="400" height="330" alt="${escape(p[lang])}" loading="lazy" decoding="async"></button></div><div class="product-info"><div><small>${lang==='ar'?'منتجات المفرق':'RETAIL PRODUCTS'}</small><h3>${escape(p[lang])}</h3></div><button class="product-quote quote-trigger" data-selection="product-${p.id}" aria-label="${words.quote}: ${escape(p[lang])}">${icon('arrow-right','icon-forward')}</button></div></article>`).join('');
 $('#product-count').textContent=lang==='ar'?'منتجات: 8':'8 products';
 const c=installationContent[lang],part=c.parts[0];
 for(const [sel,value] of [['#installation-title',c.title],['.installation-intro',c.intro],['.installation-source',c.source],['.installation-hint',c.hint],['#installation-component',part[0]],['#installation-detail-title',part[1]],['#installation-description',part[2]],['#installation-spec-note',part[3]],['#installation-add span',c.add],['#installation-inquiry span',c.inquiry]])$(sel).textContent=value;
 $('.installation-photo img').alt=c.alt;
 for(const el of all('[data-installation-part]')){const n=Number(el.dataset.installationPart);el.setAttribute('aria-label',`${n+1}. ${c.parts[n][0]}`);const label=el.querySelector('.installation-part-label');if(label)label.textContent=c.parts[n][0];}
 const tw=trayWords[lang];for(const [sel,value] of [['#tray-title',tw.title],['.tray-intro',tw.intro],['#tray-empty',tw.empty],['#tray-submit span',tw.send],['#tray-stock',tw.stock],['#tray-clear',tw.clear],['#tray-count-label',tw.items]])$(sel).textContent=value;
 for(const el of all('[data-tray-open-label]'))el.textContent=tw.open;
 if(lang==='en'){$('#layer-description').textContent='A metal surface protects the insulation core. Finish and materials are specified for the project environment.';$('#climate-name').textContent='Frozen';$('#mobile-menu').setAttribute('aria-label','Mobile navigation');}
 return '<!doctype html>\n'+d.documentElement.outerHTML;
}
export function renderServicePage({lang,service,origin='',verification='',share=origin}){
 const ar=lang==='ar',c=details[service.id][lang],home=homePath(lang),subject=(ar?'استفسار عن ':'Inquiry about ')+service[lang],body=(ar?'مرحباً درعوزي، أود الاستفسار عن ':'Hello HMD Darouzi, I would like to discuss ')+service[lang]+'.';
 return `<!doctype html><html lang="${lang}" dir="${ar?'rtl':'ltr'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#f6f9ff"><link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" sizes="any"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" sizes="180x180"><link rel="stylesheet" href="/assets/service-guide.css">${metadata({lang,origin,service,verification,share})}</head><body>
<a class="skip" href="#main">${ar?'انتقل إلى المحتوى':'Skip to content'}</a>
<header class="guide-header"><a href="${home}" aria-label="HMD Darouzi"><img src="/assets/logo.webp" width="140" height="71" alt="HMD Darouzi · درعوزي"></a><nav aria-label="${ar?'التنقل الرئيسي':'Main navigation'}"><a href="${home}#solutions">${ar?'مجالات الشركة':'Our solutions'}</a><a href="${home}#products">${ar?'قطع التبريد':'Refrigeration parts'}</a><a href="${servicePath(service.id,ar?'en':'ar')}" hreflang="${ar?'en':'ar'}" lang="${ar?'en':'ar'}">${ar?'English':'العربية'}</a></nav></header>
<main id="main"><nav class="breadcrumb" aria-label="${ar?'مسار التنقل':'Breadcrumb'}"><a href="${home}">${ar?'الرئيسية':'Home'}</a><span aria-hidden="true">/</span><span>${service[lang]}</span></nav>
<section class="guide-hero"><div><p class="eyebrow">HMD DAROUZI · ${ar?'حلب، سوريا':'ALEPPO, SYRIA'}</p><h1>${service[lang]}</h1><p class="lede">${ar?service.descAr:service.descEn}</p><a class="primary" href="#inquiry">${ar?'ناقش مشروعك':'Discuss your project'} ${icon('arrow-down')}</a></div><figure><img src="/assets/${service.image}.webp" alt="${escape(service[lang])} · HMD Darouzi" width="650" height="520" fetchpriority="high"${service.contain?' class="contain"':''}><figcaption>${ar?'من صور وتجهيزات ملف شركة درعوزي':'From the HMD Darouzi company profile'}</figcaption></figure></section>
<section class="guide-details"><div><p class="eyebrow">${service.eyebrow}</p><h2>${c.heading}</h2><p>${c.body}</p><p>${c.note}</p></div><aside><h2>${ar?'ماذا نحتاج لبدء العرض؟':'What helps us prepare your quote?'}</h2><ol>${c.questions.map(q=>`<li>${q}</li>`).join('')}</ol><a href="${home}${service.id==='cold'?'#room-builder':service.id==='insulation'?'#insulation-lab':'#solutions'}">${ar?'استكشف التجهيزات في الموقع':'Explore the equipment on our website'} ${icon('arrow-right','forward')}</a></aside></section>
${details[service.id].parts.length?`<section class="related"><h2>${ar?'قطع وتجهيزات مرتبطة':'Related components'}</h2><div>${details[service.id].parts.map(id=>{const p=products.find(p=>p.id===id);return `<a href="${home}#products"><img src="/assets/${p.image}-small.webp" alt="" width="76" height="76" loading="lazy"><span>${p[lang]}</span>${icon('arrow-right','forward')}</a>`;}).join('')}</div><p>${ar?'نؤكد الموديل والتوافق والتوفر والسعر عند التواصل.':'Model, compatibility, availability and pricing are confirmed when you contact us.'}</p></section>`:''}
<section class="guide-contact" id="inquiry"><div><p class="eyebrow">${ar?'طلب عرض سعر':'REQUEST A QUOTE'}</p><h2>${ar?'لنتحدث عن مشروعك.':'Let’s talk about your project.'}</h2><p>${ar?'أرسل المتطلبات المتاحة لفريق درعوزي. يمكنك إرفاق المواصفات والصور في تطبيقك قبل الإرسال.':'Share the requirements you have with the Darouzi team. Add specifications and photographs in your chosen app before sending.'}</p><div class="contact-actions"><a class="primary" href="${whatsappLink(lang,body)}">${icon('brand-whatsapp')}${ar?'تواصل عبر واتساب':'Contact via WhatsApp'}</a><a class="secondary" href="mailto:h.darouzi@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">${icon('mail')}${ar?'أرسل بريداً إلكترونياً':'Send an email'}</a></div></div><address><strong>HMD Darouzi · درعوزي</strong><a href="tel:+963944699555" dir="ltr">+963 944 699 555</a><a href="mailto:h.darouzi@gmail.com">h.darouzi@gmail.com</a><p>${ar?'الفرع الأول: حلب، سليمان الحلبي، طلعة العرقوب.':'First branch: Suleiman al-Halabi, Talaat al-Arqoub, Aleppo.'}</p><p>${ar?'الفرع الثاني: حلب، الجميلية، بناء مديرية الأوقاف.':'Second branch: Al-Jamiliyah, Awqaf Directorate building, Aleppo.'}</p><p>${ar?'المنشأة الصناعية: حلب، مدينة الشيخ نجار الصناعية.':'Industrial facility: Sheikh Najjar Industrial City, Aleppo.'}</p></address></section>
<nav class="other-services" aria-label="${ar?'مجالات التبريد':'Refrigeration services'}"><h2>${ar?'استكشف مجالاتنا':'Explore our services'}</h2>${services.filter(s=>s.id!==service.id).map(s=>`<a href="${servicePath(s.id,lang)}">${s[lang]} ${icon('arrow-right','forward')}</a>`).join('')}</nav></main><footer><a href="${home}">HMD Darouzi · درعوزي</a><a href="${faqPath(lang)}">${faqMeta[lang].name}</a><a href="${privacyPath(lang)}">${privacyMeta[lang].name}</a><a href="/hmd-darouzi-profile.pdf">${ar?'تحميل ملف الشركة (PDF)':'Download company profile (PDF)'}</a><span>${ar?'حلب، سوريا':'Aleppo, Syria'}</span></footer></body></html>`;
}
// Plain-text company summary for AI assistants and answer engines (llmstxt.org convention).
export function llmsText(origin=''){
 const ar=services.map(s=>`- [${s.ar}](${origin+servicePath(s.id,'ar')}): ${s.descAr}`).join('\n'),en=services.map(s=>`- [${s.en}](${origin+servicePath(s.id,'en')}): ${s.descEn}`).join('\n');
 return `# HMD Darouzi (درعوزي للتبريد)

> HMD Darouzi — known in Arabic as درعوزي, درعوزي للتبريد, HMD درعوزي and شركة درعوزي — is an industrial refrigeration company in Aleppo, Syria. It manufactures and supplies cold and freezer rooms, water chillers, cooling towers, block ice plants, refrigerated vehicle bodies and sandwich-panel thermal insulation, and sells refrigeration parts at retail.

درعوزي للتبريد (HMD Darouzi) شركة تبريد صناعي في حلب، سوريا: غرف تبريد وتجميد، شيلرات تبريد مياه، أبراج تبريد، معامل ألواح ثلج، صناديق سيارات مبردة، عزل حراري بألواح الساندويش بانل، وقطع تبريد بالمفرق.

## Contact
- Phone / WhatsApp: +963 944 699 555
- Landline: +963 21 2250266, +963 21 2254755
- Email: h.darouzi@gmail.com
- First branch (sales): Suleiman al-Halabi, Talaat al-Arqoub, Aleppo, Syria (الفرع الأول: حلب، سليمان الحلبي، طلعة العرقوب)
- Second branch (sales): Al-Jamiliyah, Awqaf Directorate building, Aleppo, Syria (الفرع الثاني: حلب، الجميلية، بناء مديرية الأوقاف)
- Industrial facility: Sheikh Najjar Industrial City, Aleppo, Syria (المدينة الصناعية بالشيخ نجار)
- Instagram: ${socialLinks.instagram}
- Facebook: ${socialLinks.facebook}

## Services (العربية)
${ar}

## Services (English)
${en}

## More
- [الصفحة الرئيسية](${origin+homePath('ar')}) · [Home (English)](${origin+homePath('en')})
- [الأسئلة الشائعة](${origin+faqPath('ar')}) · [FAQ (English)](${origin+faqPath('en')})
- [Company profile (PDF)](${origin}/hmd-darouzi-profile.pdf)
`;}
export function sitemap(origin){return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${routes.map(route=>`<url><loc>${origin+route.path}</loc>${['ar','en','x-default'].map(l=>`<xhtml:link rel="alternate" hreflang="${l}" href="${origin+(route.service?servicePath(route.service.id,l==='x-default'?'ar':l):homePath(l==='x-default'?'ar':l))}"/>`).join('')}</url>`).join('\n')}</urlset>`;}

// Script-free information pages (FAQ, privacy) share the service guides' header, footer and stylesheet.
function infoPage({lang,origin='',verification='',share=origin,kind,path,name,body}){
 const ar=lang==='ar',home=homePath(lang),other=ar?'en':'ar';
 return `<!doctype html><html lang="${lang}" dir="${ar?'rtl':'ltr'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#f6f9ff"><link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" sizes="any"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" sizes="180x180"><link rel="stylesheet" href="/assets/service-guide.css">${metadata({lang,origin,[kind]:true,verification,share})}</head><body>
<a class="skip" href="#main">${ar?'انتقل إلى المحتوى':'Skip to content'}</a>
<header class="guide-header"><a href="${home}" aria-label="HMD Darouzi"><img src="/assets/logo.webp" width="140" height="71" alt="HMD Darouzi · درعوزي"></a><nav aria-label="${ar?'التنقل الرئيسي':'Main navigation'}"><a href="${home}#solutions">${ar?'مجالات الشركة':'Our solutions'}</a><a href="${home}#contact">${ar?'تواصل معنا':'Contact'}</a><a href="${path(other)}" hreflang="${other}" lang="${other}">${ar?'English':'العربية'}</a></nav></header>
<main id="main" class="policy"><nav class="breadcrumb" aria-label="${ar?'مسار التنقل':'Breadcrumb'}"><a href="${home}">${ar?'الرئيسية':'Home'}</a><span aria-hidden="true">/</span><span>${name}</span></nav>
<article><p class="eyebrow">HMD DAROUZI · ${ar?'حلب، سوريا':'ALEPPO, SYRIA'}</p><h1>${name}</h1>${body}</article></main>
<footer><a href="${home}">HMD Darouzi · درعوزي</a><a href="${kind==='faq'?privacyPath(lang):faqPath(lang)}">${kind==='faq'?privacyMeta[lang].name:faqMeta[lang].name}</a><a href="/hmd-darouzi-profile.pdf">${ar?'تحميل ملف الشركة (PDF)':'Download company profile (PDF)'}</a><span>${ar?'حلب، سوريا':'Aleppo, Syria'}</span></footer></body></html>`;
}
const contactBlock=(lang,lead,back)=>`<section class="policy-contact"><p>${lead}</p><address><a href="tel:+963944699555" dir="ltr">+963 944 699 555</a><a href="mailto:h.darouzi@gmail.com">h.darouzi@gmail.com</a><span>${lang==='ar'?'الفرع الأول: حلب، سليمان الحلبي، طلعة العرقوب':'First branch: Suleiman al-Halabi, Talaat al-Arqoub, Aleppo'}</span><span>${lang==='ar'?'الفرع الثاني: حلب، الجميلية، بناء مديرية الأوقاف':'Second branch: Al-Jamiliyah, Awqaf Directorate building, Aleppo'}</span></address><a class="primary" href="${homePath(lang)}">${back} ${icon('arrow-right','forward')}</a></section>`;
export function renderPrivacyPage({lang,origin='',verification='',share=origin}){
 const c=privacyCopy[lang];
 return infoPage({lang,origin,verification,share,kind:'privacy',path:privacyPath,name:privacyMeta[lang].name,body:`<p class="policy-updated">${c.updated}: <time datetime="${privacyUpdated.iso}">${privacyUpdated[lang]}</time></p><p class="lede">${c.intro}</p>
${c.sections.map(([title,text])=>`<section><h2>${title}</h2><p>${text}</p></section>`).join('')}
${contactBlock(lang,c.contact,c.back)}`});
}
export function renderFaqPage({lang,origin='',verification='',share=origin}){
 const ar=lang==='ar';
 return infoPage({lang,origin,verification,share,kind:'faq',path:faqPath,name:faqMeta[lang].name,body:`<p class="lede">${ar?'إجابات مختصرة عن أكثر ما يسألنا عنه أصحاب المشاريع والفنيون. لكل مشروع تفاصيله، لذلك نؤكد المواصفات والأسعار معك مباشرة.':'Short answers to what project owners and technicians ask us most. Every project has its own details, so we confirm specifications and prices with you directly.'}</p>
${faqItems[lang].map(([question,answer])=>`<section><h2>${question}</h2><p>${answer}</p></section>`).join('')}
${contactBlock(lang,ar?'لم تجد إجابتك؟ تواصل معنا:':'Didn’t find your answer? Contact us:',ar?'العودة إلى الرئيسية':'Back to home')}`});
}
