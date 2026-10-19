import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.addInitScript(()=>{
  localStorage.setItem('darouzi-quality','full');
  Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});
  Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
 });
 await page.goto(process.env.TEST_URL||'http://localhost:4173');await page.waitForTimeout(1500);
 const client=await page.context().newCDPSession(page);
 await client.send('Emulation.setCPUThrottlingRate',{rate:4});
 await client.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame',transferMode:'ReturnAsStream'});
 await page.waitForTimeout(3000);
 const complete=new Promise(resolve=>client.once('Tracing.tracingComplete',resolve));
 await client.send('Tracing.end');const {stream}=await complete;
 let trace='';
 while(true){const chunk=await client.send('IO.read',{handle:stream});trace+=chunk.base64Encoded?Buffer.from(chunk.data,'base64').toString():chunk.data;if(chunk.eof)break;}
 await client.send('IO.close',{handle:stream});
 const events=JSON.parse(trace).traceEvents;
 const report={viewport:'390 × 844',cpuSlowdown:4,sampleSeconds:3,events:{}};
 for(const name of ['Paint','PrePaint','UpdateLayoutTree','Layout','RasterTask']){
  const matching=events.filter(event=>event.name===name&&event.ph==='X');
  report.events[name]={count:matching.length,totalMs:Number((matching.reduce((sum,event)=>sum+(event.dur||0),0)/1000).toFixed(2))};
 }
 report.activeBackgroundAnimations=await page.locator('.hero-environment').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length);
 const label=process.argv[2]==='before'?'before':'after';
 await writeFile(`test-results/hero-paint-${label}.json`,JSON.stringify(report,null,2));
 await writeFile(`test-results/hero-paint-${label}-trace.json`,trace);
 console.log(report);
}finally{await browser.close();}
