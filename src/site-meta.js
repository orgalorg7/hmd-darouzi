export const homePath=lang=>lang==='en'?'/en/':'/';
export const slugs={cold:'cold-rooms',chillers:'water-chillers',towers:'cooling-towers',ice:'block-ice-plants',transport:'refrigerated-transport',insulation:'thermal-insulation'};
export const servicePath=(id,lang)=>`${homePath(lang)}services/${slugs[id]}/`;
export const privacyPath=lang=>`${homePath(lang)}privacy/`;
export const faqPath=lang=>`${homePath(lang)}faq/`;
// The company's Facebook page lists +971 50 649 7817 as its WhatsApp number; +963 944 699 555 remains the phone line.
export const whatsappNumber='971506497817';
export const socialLinks={facebook:'https://www.facebook.com/profile.php?id=61586906683380',facebookArchive:'https://www.facebook.com/profile.php?id=100057065696533',instagram:'https://www.instagram.com/hmd.darouzi_for_cooling/',whatsappChannel:'https://whatsapp.com/channel/0029Vb7Rni4GU3BRVHPs7M0F'};
// Direct chat skips the form: WhatsApp already knows the visitor's number.
export const whatsappGreeting={ar:'مرحباً درعوزي، أود الاستفسار عن مشروع تبريد.',en:'Hello HMD Darouzi, I would like to ask about a refrigeration project.'};
export const whatsappLink=(lang,text=whatsappGreeting[lang])=>`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
// Link previews (WhatsApp, Telegram, Facebook…) get a short title, a one-line pitch and a designed 1200×630 card.
export const shareImage=(card,lang)=>`/assets/share/${card}-${lang}.jpg`;
export const homeMeta={
 ar:{shareTitle:'درعوزي للتبريد ❄️ هندسة البرودة بين يديك',shareDescription:'غرف تبريد وتجميد، شيلرات، أبراج تبريد، معامل ثلج ونقل مبرد في حلب. صمّم غرفتك بتقنية 3D واطلب عرض سعرك عبر واتساب.',title:'درعوزي للتبريد | HMD درعوزي للتبريد الصناعي في حلب، سوريا',description:'درعوزي للتبريد (HMD Darouzi) في حلب: غرف تبريد وتجميد، شيلرات مياه، أبراج تبريد، معامل ثلج، نقل مبرد وعزل حراري. تصنيع وتجهيز وقطع تبريد بالمفرق. تواصل لطلب عرض سعر.'},
 en:{shareTitle:'HMD Darouzi ❄️ Refrigeration, engineered',shareDescription:'Cold rooms, chillers, cooling towers, ice plants and refrigerated transport in Aleppo. Design your room in 3D and get a quote on WhatsApp.',title:'HMD Darouzi (درعوزي) | Industrial Refrigeration in Aleppo, Syria',description:'HMD Darouzi (درعوزي للتبريد) supplies cold rooms, water chillers, cooling towers, block ice plants, refrigerated transport, insulation and refrigeration parts in Aleppo, Syria.'}
};
export function updateHomeSEO(lang){
 const meta=homeMeta[lang],origin=document.querySelector('meta[name="site-origin"]')?.content||'';
 document.title=meta.title;
 for(const [selector,value] of [['meta[name=description]',meta.description],['meta[property="og:title"]',meta.shareTitle],['meta[property="og:description"]',meta.shareDescription],['meta[property="og:locale"]',lang==='ar'?'ar_SY':'en_US'],['meta[property="og:locale:alternate"]',lang==='ar'?'en_US':'ar_SY'],['meta[name="twitter:title"]',meta.shareTitle],['meta[name="twitter:description"]',meta.shareDescription]]){const node=document.querySelector(selector);if(node)node.content=value;}
 for(const node of document.querySelectorAll('meta[property="og:image"],meta[name="twitter:image"]'))node.content=node.content.replace(/-(ar|en)\.jpg$/,`-${lang}.jpg`);
 if(origin){document.querySelector('link[rel=canonical]').href=origin+homePath(lang);document.querySelector('meta[property="og:url"]').content=origin+homePath(lang);}
 const node=document.querySelector('#site-schema');
 if(node){const graph=JSON.parse(node.textContent);for(const entry of graph['@graph']||[]){if(entry['@type']==='WebPage'){entry.name=meta.title;entry.description=meta.description;entry.inLanguage=lang;entry.url=origin+homePath(lang);entry['@id']=origin+homePath(lang)+'#webpage';}}node.textContent=JSON.stringify(graph);}
}
