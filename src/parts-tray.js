import {icon} from './icons.js';
export const trayWords={
 ar:{title:'قائمة قطعك.',intro:'اجمع ما تحتاجه. أضف الكمية والموديل، ثم أرسل استفساراً واحداً.',empty:'ابدأ بإضافة قطعة من المنتجات أعلاه.',add:'أضف للقائمة',added:'أُضيف إلى القائمة',open:'راجع قائمة القطع',items:'قطعة',types:'أصناف',quantity:'الكمية',note:'الموديل أو مواصفات القطعة',placeholder:'الموديل، الأبعاد أو مواصفات القطعة…',remove:'حذف',decrease:'تقليل الكمية',increase:'زيادة الكمية',send:'استفسر عن هذه القطع',stock:'قائمة استفسار. نؤكد الموديلات والتوافق والتوفر والسعر معك.',heading:'قائمة القطع المطلوبة',quoteNote:'هذه القطع ستُرفق برسالتك.',clear:'أفرغ القائمة',edit:'تعديل قائمة القطع'},
 en:{title:'Your parts tray.',intro:'Collect what you need. Add quantities and model notes, then send one inquiry.',empty:'Start by adding a component from the products above.',add:'Add to tray',added:'Added to tray',open:'Review parts tray',items:'units',types:'types',quantity:'Quantity',note:'Model or component specifications',placeholder:'Model, dimensions or component specifications…',remove:'Remove',decrease:'Decrease quantity',increase:'Increase quantity',send:'Inquire about these parts',stock:'An inquiry list. We confirm models, compatibility, availability and pricing with you.',heading:'Requested parts',quoteNote:'These parts will be included in your message.',clear:'Empty tray',edit:'Edit parts tray'}
};
const key='darouzi-parts-tray-v1';
export function createPartsTray({products,onChange,quote}){
 const root=document.querySelector('#parts-tray'),list=root.querySelector('#tray-items');
 let items=[],statusTimer;
 const language=()=>document.documentElement.lang==='en'?'en':'ar';
 const w=()=>trayWords[language()];
 const product=id=>products.find(p=>p.id===id);
 // Restore known catalog IDs only; stored notes are always assigned through textContent/value.
 try{const saved=JSON.parse(localStorage.getItem(key));if(Array.isArray(saved)){const seen=new Set();items=saved.filter(i=>i&&product(i.id)&&!seen.has(i.id)&&seen.add(i.id)).slice(0,products.length).map(i=>({id:i.id,quantity:Math.min(999,Math.max(1,Math.round(Number(i.quantity)||1))),note:typeof i.note==='string'?i.note.slice(0,240):''}));}}catch{}
 function total(){return items.reduce((sum,i)=>sum+i.quantity,0);}
 function save(){try{localStorage.setItem(key,JSON.stringify(items));}catch{}onChange();}
 function updateSummary(){
  const c=w(),count=total();
  root.querySelector('#tray-count').textContent=`${String(count).padStart(2,'0')}`;
  root.querySelector('#tray-count-label').textContent=language()==='en'&&count===1?'unit':c.items;
  const option=document.querySelector('#quote-service option[value="parts-tray"]');if(option)option.disabled=!items.length;
  root.querySelector('#tray-empty').hidden=!!items.length;
  root.querySelector('#tray-submit').disabled=!items.length;
  root.querySelector('#tray-clear').hidden=!items.length;
  document.querySelectorAll('[data-tray-count]').forEach(el=>{el.textContent=String(count);el.toggleAttribute('data-empty',count===0);});
  document.querySelectorAll('[data-add-part]').forEach(button=>{
   const included=items.some(i=>i.id===button.dataset.addPart);
   button.classList.toggle('in-tray',included);
   const label=`${c.add}${included?' +1':''}: ${product(button.dataset.addPart)[language()]}`;
   button.setAttribute('aria-label',label);
   button.title=label;
   button.querySelector('span').textContent=included?`${c.add} +1`:c.add;
  });
  const context=document.querySelector('#quote-parts');
  context.replaceChildren();
  const heading=document.createElement('strong');heading.textContent=c.quoteNote;context.append(heading);
  for(const item of items){const line=document.createElement('p');line.textContent=`${item.quantity} × ${product(item.id)[language()]}${item.note?` · ${item.note}`:''}`;context.append(line);}
 }
 function render(){
  const c=w();
  list.replaceChildren(...items.map(item=>{
   const p=product(item.id),row=document.createElement('li');row.className='tray-item';row.dataset.trayItem=item.id;
   row.innerHTML=`<img src="/assets/${p.image}-small.webp" alt="" width="76" height="76" loading="lazy" decoding="async"><div class="tray-item-info"><h4>${p[language()]}</h4><label class="tray-note-label" for="tray-note-${p.id}">${c.note}</label><input id="tray-note-${p.id}" class="tray-note" maxlength="240" placeholder="${c.placeholder}"></div><div class="tray-item-controls"><div class="tray-quantity"><button type="button" data-tray-action="decrease" aria-label="${c.decrease}: ${p[language()]}">${icon('minus')}</button><input id="tray-quantity-${p.id}" type="number" min="1" max="999" step="1" inputmode="numeric" aria-label="${c.quantity}: ${p[language()]}"><button type="button" data-tray-action="increase" aria-label="${c.increase}: ${p[language()]}">${icon('plus')}</button></div><button type="button" class="tray-remove" data-tray-action="remove" aria-label="${c.remove}: ${p[language()]}">${icon('x')} ${c.remove}</button></div>`;
   row.querySelector('.tray-note').value=item.note;
   row.querySelector('input[type=number]').value=item.quantity;
   row.querySelector('[data-tray-action=decrease]').disabled=item.quantity===1;
   row.querySelector('[data-tray-action=increase]').disabled=item.quantity===999;
   return row;
  }));
  updateSummary();
 }
 function refresh(){clearTimeout(statusTimer);document.querySelector('#tray-status').textContent='';const c=w();root.querySelector('h3').textContent=c.title;root.querySelector('.tray-intro').textContent=c.intro;root.querySelector('#tray-empty').textContent=c.empty;root.querySelector('#tray-submit span').textContent=c.send;root.querySelector('#tray-stock').textContent=c.stock;root.querySelector('#tray-clear').textContent=c.clear;document.querySelectorAll('[data-tray-open-label]').forEach(el=>el.textContent=c.open);render();}
 function add(id){
  if(!product(id))return;
  const existing=items.find(i=>i.id===id);if(existing)existing.quantity=Math.min(999,existing.quantity+1);else items.push({id,quantity:1,note:''});
  render();save();const status=document.querySelector('#tray-status'),text=document.createElement('span'),review=document.createElement('button');
  text.textContent=`${w().added}: ${product(id)[language()]}`;review.type='button';review.dataset.openTray='';review.dataset.returnPart=id;review.textContent=w().open;
  review.addEventListener('click',()=>{if(!matchMedia('(max-width:640px)').matches){document.querySelector('#parts-tray').scrollIntoView({block:'start'});document.querySelector('#tray-title').focus({preventScroll:true});status.replaceChildren();}});
  status.replaceChildren(text,review);clearTimeout(statusTimer);statusTimer=setTimeout(()=>{if(!status.contains(document.activeElement))status.replaceChildren();},8000);
 }
 document.addEventListener('click',event=>{const button=event.target.closest('[data-add-part]');if(button)add(button.dataset.addPart);});
 root.addEventListener('click',event=>{
  const button=event.target.closest('[data-tray-action]');if(!button)return;
  const id=button.closest('[data-tray-item]').dataset.trayItem,index=items.findIndex(i=>i.id===id),item=items[index],action=button.dataset.trayAction;
  if(action==='remove')items.splice(index,1);else item.quantity=Math.min(999,Math.max(1,item.quantity+(action==='increase'?1:-1)));
  render();save();
  const focus=list.querySelector(`[data-tray-item="${id}"] [data-tray-action="${action}"]:not(:disabled)`)||list.querySelector(`[data-tray-item="${id}"] input[type=number]`)||list.children[Math.min(index,list.children.length-1)]?.querySelector('input')||(document.querySelector('#tray-dialog[open] #tray-dialog-title')||document.querySelector('#tray-title'));focus.focus({preventScroll:true});
 });
 list.addEventListener('input',event=>{
  const row=event.target.closest('[data-tray-item]');if(!row)return;const item=items.find(i=>i.id===row.dataset.trayItem);
  if(event.target.classList.contains('tray-note')){item.note=event.target.value.slice(0,240);updateSummary();save();}
 });
 list.addEventListener('change',event=>{
  if(event.target.type!=='number')return;const row=event.target.closest('[data-tray-item]'),item=items.find(i=>i.id===row.dataset.trayItem);
  item.quantity=Math.min(999,Math.max(1,Math.round(Number(event.target.value)||1)));event.target.value=item.quantity;
  row.querySelector('[data-tray-action=decrease]').disabled=item.quantity===1;row.querySelector('[data-tray-action=increase]').disabled=item.quantity===999;updateSummary();save();
 });
 root.querySelector('#tray-clear').addEventListener('click',()=>{items=[];render();save();(document.querySelector('#tray-dialog[open] #tray-dialog-title')||document.querySelector('#tray-title')).focus({preventScroll:true});});
 root.querySelector('#tray-submit').addEventListener('click',()=>{if(items.length)quote('parts-tray');});
 function message(){return items.length?`${w().heading}:\n${items.map(i=>`${i.quantity} × ${product(i.id)[language()]}${i.note?`\n  ${i.note}`:''}`).join('\n')}`:'';}
 refresh();return {add,refresh,updateSummary,message,hasItems:()=>items.length>0};
}
