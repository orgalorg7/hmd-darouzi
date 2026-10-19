import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const b=await chromium.launch({channel:'chrome',args:['--no-sandbox']});
try{
 const c=await b.newContext({viewport:{width:1440,height:1000}});
 await c.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});window.cost={rects:0,paths:0,strokes:0,clips:0,paints:0};const rect=Element.prototype.getBoundingClientRect;Element.prototype.getBoundingClientRect=function(){if(this.classList?.contains('contact-field'))window.cost.rects++;return rect.call(this)};const P=window.Path2D;window.Path2D=new Proxy(P,{construct(target,args){window.cost.paths++;return Reflect.construct(target,args)}});for(const [name,key] of [['stroke','strokes'],['clip','clips'],['clearRect','paints']]){const original=CanvasRenderingContext2D.prototype[name];CanvasRenderingContext2D.prototype[name]=function(...args){window.cost[key]++;return original.apply(this,args)}}});
 const p=await c.newPage();await p.goto(process.env.TEST_URL||'http://localhost:4173');await p.locator('#contact').scrollIntoViewIfNeeded();await p.waitForTimeout(600);
 const result=await p.evaluate(async()=>{window.cost={rects:0,paths:0,strokes:0,clips:0,paints:0};const s=document.querySelector('#contact'),r=document.querySelector('.contact-field').getBoundingClientRect();for(let batch=0;batch<20;batch++){for(let i=0;i<50;i++)s.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:r.left+200+batch*15+i,clientY:r.top+150+batch*3}));await new Promise(resolve=>setTimeout(resolve,16))}await new Promise(resolve=>setTimeout(resolve,1600));const canvas=s.querySelector('canvas');return {...window.cost,pixels:canvas?canvas.width*canvas.height:0}});
 console.log(result);await writeFile(`test-results/footer-cost-${process.argv[2]||'before'}.json`,JSON.stringify(result,null,2));
}finally{await b.close()}
