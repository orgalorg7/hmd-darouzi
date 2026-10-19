const applications={
 food:{services:['cold','transport','insulation'],ar:'أغذية ومنتجات زراعية',en:'Food & produce',description:{ar:'ابدأ بمساحة التخزين، ثم احتياجات النقل والعزل. أخبرنا بنوع المنتج ودرجة الحرارة المطلوبة.',en:'Start with storage, then consider transport and insulation. Tell us the product and required temperature.'}},
 medicine:{services:['cold','transport','insulation'],ar:'أدوية',en:'Medicines',description:{ar:'شاركنا شروط التخزين المحددة للمنتج. نراجع معك احتياجات التخزين والنقل والعزل.',en:'Share the product’s specified storage conditions. Our team will review storage, transport and insulation requirements.'}},
 process:{services:['chillers','towers','insulation'],ar:'عمليات صناعية',en:'Industrial processes',description:{ar:'شاركنا نوع العملية واحتياجات دورة المياه. نناقش معك شيلرات المياه وأبراج التبريد والعزل.',en:'Tell us about the process and water circuit. We’ll discuss water chillers, cooling towers and insulation.'}}
};
const serviceNames={cold:{ar:'غرف التبريد',en:'Cold rooms'},transport:{ar:'النقل المبرد',en:'Refrigerated transport'},insulation:{ar:'العزل الحراري',en:'Thermal insulation'},chillers:{ar:'شيلرات المياه',en:'Water chillers'},towers:{ar:'أبراج التبريد',en:'Cooling towers'}};
export function createCoolingFinder({selectService,onChange,quote}){
 const $=s=>document.querySelector(s);let selected=null;
 const lang=()=>document.documentElement.lang;
 function highlight(){document.querySelectorAll('[data-service]').forEach(button=>{
  const relevant=selected&&applications[selected].services.includes(button.dataset.service);
  if(relevant)button.dataset.relevant='true';else delete button.dataset.relevant;
 });}
 function refresh(){
  document.querySelectorAll('[data-cooling]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.cooling===selected)));
  $('#cooling-result').hidden=!selected;highlight();if(!selected)return;
  const application=applications[selected];
  $('#cooling-summary').textContent=application.description[lang()];
  $('#cooling-links').setAttribute('aria-label',lang()==='ar'?'حلول مرتبطة باحتياجك':'Solutions to explore');
  $('#cooling-links').replaceChildren(...application.services.map(id=>{
   const button=document.createElement('button');button.type='button';button.dataset.recommendedService=id;button.textContent=serviceNames[id][lang()];return button;
  }));
 }
 document.querySelectorAll('[data-cooling]').forEach(button=>button.addEventListener('click',()=>{
  selected=button.dataset.cooling;selectService(applications[selected].services[0],false);refresh();onChange();
 }));
 $('#cooling-reset').addEventListener('click',()=>{const previous=selected;selected=null;refresh();onChange();document.querySelector(`[data-cooling="${previous}"]`)?.focus();});
 $('#cooling-links').addEventListener('click',event=>{const button=event.target.closest('[data-recommended-service]');if(button)selectService(button.dataset.recommendedService,true);});
 $('#cooling-inquiry').addEventListener('click',()=>{if(selected)quote(applications[selected].services[0]);});
 refresh();
 return {refresh,highlight,context:()=>selected?applications[selected][lang()]:null};
}
