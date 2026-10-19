import {whatsappLink} from './site-meta.js';
// Maintenance request: the visitor ticks what they see and WhatsApp opens with a structured message.
// The text is built from the visible labels, so it is always in the language on screen.
const form=document.querySelector('#repair-form'),error=form.querySelector('#repair-error');
const words={
 ar:{title:'طلب صيانة',equipment:'نوع التجهيز',problems:'المشكلة',goods:'توجد بضاعة داخل الغرفة الآن',area:'المنطقة',name:'الاسم',notes:'ملاحظات',photo:'سأرفق صورة للعطل أو للوحة التحكم.',areaMissing:'يرجى كتابة المنطقة أو العنوان.'},
 en:{title:'Service request',equipment:'Equipment',problems:'Problem',goods:'There are goods inside the room now',area:'Area',name:'Name',notes:'Notes',photo:'I will attach a photo of the fault or the control panel.',areaMissing:'Please enter your area or address.'}
};
const label=input=>input.closest('label').querySelector('span').textContent.trim();
const checked=name=>[...form.querySelectorAll(`input[name="${name}"]:checked`)];
form.addEventListener('change',event=>{if(event.target.name==='problem'&&checked('problem').length)error.hidden=true;});
form.addEventListener('submit',event=>{
 event.preventDefault();
 const lang=document.documentElement.lang==='en'?'en':'ar',w=words[lang],problems=checked('problem'),area=form.elements.area;
 if(!problems.length){error.hidden=false;form.querySelector('input[name="problem"]').focus();return;}
 if(!area.value.trim()){area.setCustomValidity(w.areaMissing);area.reportValidity();area.addEventListener('input',()=>area.setCustomValidity(''),{once:true});return;}
 const name=form.elements['repair-name'].value.trim(),notes=form.elements.notes.value.trim(),equipment=checked('equipment')[0];
 const lines=[w.title,`${w.equipment}: ${equipment?label(equipment):''}`,`${w.problems}:`,...problems.map(input=>`- ${label(input)}`)];
 if(form.elements.goods.checked)lines.push('',`! ${w.goods}`);
 lines.push('',`${w.area}: ${area.value.trim()}`);
 if(name)lines.push(`${w.name}: ${name}`);
 if(notes)lines.push(`${w.notes}: ${notes}`);
 lines.push('',w.photo);
 // Keep the handoff synchronous with the click so the app is allowed to open.
 const link=document.createElement('a');link.href=whatsappLink(lang,lines.join('\n'));link.target='_blank';link.rel='noopener noreferrer';link.hidden=true;
 document.body.append(link);link.click();link.remove();
});
