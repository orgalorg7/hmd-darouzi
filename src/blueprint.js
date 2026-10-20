import {icon} from './icons.js';
import {doorWidth} from './doors.js';
const copy={
 ar:{title:'مخطط الغرفة',plan:'مسقط أفقي',note:'مخطط تصوّري للطلب، وليس مخطط تنفيذ.',height:'الارتفاع',cooling:'المبخر',panels:'العزل',door:'الباب',dimensions:'الأبعاد الداخلية المطلوبة'},
 en:{title:'Room blueprint',plan:'Plan view',note:'Concept plan for your inquiry, not a construction drawing.',height:'Height',cooling:'Evaporator',panels:'Insulation',door:'Door',dimensions:'Requested interior dimensions'}
};
export function createBlueprint(stage,onPart){
 const panel=document.createElement('div');panel.id='blueprint-panel';panel.hidden=true;
 panel.innerHTML=`<div class="blueprint-heading"><strong class="blueprint-plan"></strong><span class="blueprint-size" dir="ltr"></span></div>
 <svg class="blueprint-drawing" viewBox="0 0 560 410" role="img" aria-labelledby="blueprint-svg-title" focusable="false">
 <title id="blueprint-svg-title"></title>
 <defs><pattern id="blueprint-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#cbdcf2" stroke-width=".65"/></pattern></defs>
 <rect width="560" height="410" fill="url(#blueprint-grid)"/>
 <rect class="bp-floor" fill="#f4f8ff" stroke="none"/>
 <path class="bp-wall-outer" fill="none" stroke="#244a7a" stroke-width="3"/>
 <path class="bp-wall-inner" fill="none" stroke="#244a7a" stroke-width="1.2"/>
 <g class="bp-cooling" fill="#dbe9ff" stroke="#174ee8" stroke-width="1.8"><rect x="230" width="100" height="34" rx="3"/><circle cx="250" r="10"/><circle cx="280" r="10"/><circle cx="310" r="10"/></g>
 <g class="bp-doors" fill="#dbe9ff" stroke="#174ee8" stroke-width="2.5"></g>
 <g class="bp-dimensions" fill="none" stroke="#6683a8" stroke-width="1"><path class="bp-width-line"/><path class="bp-length-line"/></g>
 <g fill="#183b68" font-family="Manrope, sans-serif" font-size="24" text-anchor="middle"><text class="bp-width-text"/><text class="bp-length-text"/></g>
 <g class="bp-marker" fill="#174ee8" stroke="#fff" stroke-width="2"><circle data-bp-marker="cooling" r="14"/><circle data-bp-marker="panels" r="14"/><circle data-bp-marker="door" r="14"/></g>
 <g fill="white" font-family="Manrope, sans-serif" font-size="14" text-anchor="middle" dominant-baseline="central"><text data-bp-number="cooling">1</text><text data-bp-number="panels">2</text><text data-bp-number="door">3</text></g>
 </svg>
 <div class="blueprint-parts" role="group">${[['cooling','propeller'],['panels','stack-2'],['door','door']].map(([key,glyph],i)=>`<button type="button" data-blueprint-part="${key}" aria-expanded="false" aria-controls="component-note">${icon(glyph)}<span class="bp-part-label"></span><small aria-hidden="true">${i+1}</small></button>`).join('')}</div>
 <p class="blueprint-note"></p>`;
 stage.append(panel);
 panel.querySelectorAll('[data-blueprint-part]').forEach(button=>button.addEventListener('click',()=>onPart(button.dataset.blueprintPart,button)));
 panel.querySelector('svg').addEventListener('click',event=>{const marker=event.target.closest('[data-bp-marker],[data-bp-number]');if(marker)panel.querySelector(`[data-blueprint-part="${marker.dataset.bpMarker||marker.dataset.bpNumber}"]`).click();});
 const $=s=>panel.querySelector(s);
 const attrs=(selector,values)=>{const element=$(selector);for(const [name,value] of Object.entries(values))element.setAttribute(name,value);};
 function update({width,length,height,doors,lang}){
  const t=copy[lang]||copy.ar,w=width*48,h=length*48,x=280-w/2,y=190-h/2,bottom=y+h,leaf=doorWidth*48;
  panel.dir=lang==='ar'?'rtl':'ltr';
  attrs('.blueprint-drawing',{viewBox:`${x-80} ${y-25} ${w+110} ${h+105}`});
  $('.blueprint-plan').textContent=t.plan;$('.blueprint-size').textContent=`${width} × ${length} m`;
  $('.blueprint-note').textContent=`${t.height}: ${height} m · ${t.note}`;
  $('.blueprint-parts').setAttribute('aria-label',t.title);
  $('#blueprint-svg-title').textContent=`${t.title}: ${t.dimensions} ${width} × ${length} m`;
  panel.querySelectorAll('[data-blueprint-part]').forEach(button=>button.querySelector('.bp-part-label').textContent=t[button.dataset.blueprintPart]);
  attrs('.bp-floor',{x,y,width:w,height:h});
  attrs('.bp-wall-outer',{d:`M${x-8} ${y-8}H${x+w+8}V${bottom+8}H${x-8}Z`});
  attrs('.bp-wall-inner',{d:`M${x} ${y}H${x+w}V${bottom}H${x}Z`});
  attrs('.bp-cooling rect',{y:y+13});panel.querySelectorAll('.bp-cooling circle').forEach(circle=>circle.setAttribute('cy',y+30));
  // Each door is drawn as a closed leaf set into its wall, seen from above.
  const centre=({wall,offset})=>wall==='front'?[280+offset*48,bottom+4]:wall==='back'?[280+offset*48,y-4]:wall==='left'?[x-4,190+offset*48]:[x+w+4,190+offset*48];
  $('.bp-doors').innerHTML=doors.map(door=>{const [cx,cy]=centre(door),side=door.wall==='left'||door.wall==='right';return `<rect x="${side?cx-6:cx-leaf/2}" y="${side?cy-leaf/2:cy-6}" width="${side?12:leaf}" height="${side?leaf:12}" rx="2"/>`;}).join('');
  attrs('.bp-width-line',{d:`M${x} ${bottom+17}v38m${w} -38v38M${x-6} ${bottom+44}H${x+w+6}M${x-4} ${bottom+48}l8 -8m${w-8} 8l8 -8`});
  attrs('.bp-length-line',{d:`M${x-17} ${y}h-38m38 ${h}h-38M${x-44} ${y-6}V${bottom+6}M${x-48} ${y+4}l8 -8m-8 ${h+8}l8 -8`});
  attrs('.bp-width-text',{x:280,y:bottom+69});$('.bp-width-text').textContent=`${width} m`;
  attrs('.bp-length-text',{x:x-67,y:190,transform:`rotate(-90 ${x-67} 190)`});$('.bp-length-text').textContent=`${length} m`;
  // The insulation marker sits on a wall without doors, so markers never cover a door.
  const panelWall=['right','left','back','front'].find(wall=>!doors.some(door=>door.wall===wall))||'right',panelPoint={right:[x+w+8,190],left:[x-8,190],back:[x+w/4,y-8],front:[x+w/4,bottom+8]}[panelWall];
  const points={cooling:[344,y+30],panels:panelPoint,door:doors[0]?centre(doors[0]):[280,bottom+4]};
  for(const [key,[px,py]] of Object.entries(points)){attrs(`[data-bp-marker="${key}"]`,{cx:px,cy:py});attrs(`[data-bp-number="${key}"]`,{x:px,y:py});}
 }
 return {update,show:visible=>{panel.hidden=!visible;}};
}
