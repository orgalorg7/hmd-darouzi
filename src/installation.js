export const installationContent = {
 ar: {
  title:'داخل غرفة تبريد حقيقية.', intro:'المعدات في مكانها. اضغط على التفاصيل لتعرف دور كل جزء.',
  alt:'صورة غرفة تبريد من ملف درعوزي، تظهر المبخرات والألواح المعزولة وخطوط التصريف',
  source:'الصورة من ملف الشركة', hint:'اختر نقطة في الصورة أو أحد الأجزاء أدناه.', add:'أضف القطعة إلى قائمتك', inquiry:'ناقش تجهيز غرفة مماثلة',
  parts:[
   ['المبخرات','هنا يتوزع الهواء البارد.','المبخرات المعلقة على الجدار توزع الهواء داخل الغرفة. يحدد فريقنا عدد الوحدات وسعتها وفق الحمولة والمساحة ودرجة الحرارة المطلوبة.','للاستفسار: المنتج المخزّن، أبعاد الغرفة ودرجة الحرارة.','evaporator'],
   ['الألواح المعزولة','غلاف يحافظ على البرودة.','ألواح الجدران والسقف تحدّ من انتقال الحرارة. اتصال الألواح وإحكام الفواصل جزء أساسي من تجهيز الغرفة.','للاستفسار: الأبعاد والسماكة المطلوبة، إن كانت معروفة.','panels'],
   ['تصريف المياه','تفصيل صغير. وظيفة ضرورية.','تظهر خطوط التصريف أسفل المبخرات. تجمع مياه التكاثف وإزالة الجليد وتوجهها خارج الوحدة؛ يُراجع مسار التصريف ضمن تصميم المشروع.','ناقش مسار التصريف ومتطلبات الصيانة مع فريقنا.',null]
  ]
 },
 en: {
  title:'Inside a real cold room.', intro:'Equipment in place. Select a detail to see what it does.',
  alt:'Cold room photograph from the Darouzi profile showing evaporators, insulated panels and drainage lines',
  source:'Photograph from the company profile', hint:'Select a point in the photograph or a component below.', add:'Add component to tray', inquiry:'Discuss a room like this',
  parts:[
   ['Evaporators','Where cold air circulates.','Wall-mounted evaporators distribute air through the room. Our team specifies their number and capacity for the load, room dimensions and target temperature.','For your inquiry: stored product, room dimensions and temperature.','evaporator'],
   ['Insulated panels','The envelope that holds the cold.','Wall and ceiling panels limit heat transfer. Panel connections and sealed joints are part of the room assembly.','For your inquiry: dimensions and required thickness, if known.','panels'],
   ['Drainage','A small detail with an essential job.','Drainage lines are visible beneath the evaporators. They carry condensation and defrost water away from the unit; routing is reviewed as part of the project design.','Discuss drainage routing and maintenance access with our team.',null]
  ]
 }
};
export function createInstallation({add,quote}) {
 const root=document.querySelector('#installation');
 let selected=0;
 const get=()=>installationContent[document.documentElement.lang==='en'?'en':'ar'];
 function refresh(){
  const c=get(),p=c.parts[selected];
  root.querySelector('h2').textContent=c.title;
  root.querySelector('.installation-intro').textContent=c.intro;
  root.querySelector('img').alt=c.alt;
  root.querySelector('.installation-source').textContent=c.source;
  root.querySelector('.installation-hint').textContent=c.hint;
  root.querySelectorAll('[data-installation-part]').forEach(button=>{
   const index=Number(button.dataset.installationPart);
   button.setAttribute('aria-pressed',String(index===selected));
   button.setAttribute('aria-label',`${index+1}. ${c.parts[index][0]}`);
   const label=button.querySelector('.installation-part-label');if(label)label.textContent=c.parts[index][0];
  });
  root.dataset.part=selected;
  root.querySelector('#installation-component').textContent=p[0];
  root.querySelector('#installation-detail-title').textContent=p[1];
  root.querySelector('#installation-description').textContent=p[2];
  root.querySelector('#installation-spec-note').textContent=p[3];
  root.querySelector('#installation-add').hidden=!p[4];
  root.querySelector('#installation-add span').textContent=c.add;
  root.querySelector('#installation-inquiry span').textContent=c.inquiry;
 }
 root.addEventListener('click',event=>{
  const button=event.target.closest('[data-installation-part]');
  if(button){selected=Number(button.dataset.installationPart);refresh();}
 });
 root.querySelector('#installation-add').addEventListener('click',()=>add(get().parts[selected][4]));
 root.querySelector('#installation-inquiry').addEventListener('click',()=>quote('cold'));
 refresh();return {refresh};
}
