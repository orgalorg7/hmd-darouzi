import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const base=process.env.TEST_URL||'http://localhost:4173';
const report={};
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>2});Object.defineProperty(navigator,'deviceMemory',{get:()=>2});if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('darouzi-quality','lite');}});
 const page=await context.newPage();const requested=[];const errors=[];
 page.on('request',request=>requested.push(request.url()));page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base);await expect(page.locator('html')).toHaveAttribute('data-performance','lite');
 const session=await context.newCDPSession(page);await session.send('Emulation.setCPUThrottlingRate',{rate:6});
 await page.locator('#room-stage').hover();await page.locator('#scene-host').click({position:{x:80,y:80}});
 await page.locator('[data-view=exploded]').click();await expect(page.locator('.scene-fallback')).toHaveAttribute('src',/room-exploded-open/);
 await page.locator('#door-toggle').click();await expect(page.locator('.scene-fallback')).toHaveAttribute('src',/room-exploded-closed/);
 await page.locator('[data-hotspot=panels]').click();await expect(page.locator('#component-note')).toBeVisible();await page.locator('#close-component').click();
 await page.locator('[data-climate="-40"]').click();await expect(page.locator('#temperature')).toHaveValue('-40');
 await page.locator('.hero-actions a[href="#room-builder"]').click();await page.locator('#room-width').fill('6');await page.locator('#room-width').dispatchEvent('input');await page.locator('#temperature-quote').click();await expect(page.locator('#quote-details')).toHaveValue(/6 m/);await expect(page.locator('#quote-details')).toHaveValue(/-40°C/);await page.keyboard.press('Escape');await page.locator('.builder-close').click();
 await page.locator('#panel-spread').fill('100');await page.locator('#panel-spread').dispatchEvent('input');await expect(page.locator('#panel-spread-value')).toHaveText('100%');
 await page.locator('.inspect-trigger').first().click();await page.locator('#zoom-in').click();await expect(page.locator('#zoom-level')).toHaveText('125%');await page.keyboard.press('Escape');
 expect(requested.filter(url=>/room-scene.*\.js/.test(url))).toEqual([]);await expect(page.locator('#scene-host canvas')).toHaveCount(0);
 report.lite={cpuSlowdown:6,simulatedCores:2,simulatedMemoryGB:2,engineRequests:0,canvasCount:0};
 await session.send('Emulation.setCPUThrottlingRate',{rate:1});
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'test-results/potato-mobile.png'});
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 await page.locator('#render-quality').click();await expect(page.locator('#scene-host')).toHaveAttribute('data-scene','ready',{timeout:20000});await expect(page.locator('#scene-host')).toHaveAttribute('data-quality','economy');
 const buffer=await page.locator('#scene-host canvas').evaluate(canvas=>({width:canvas.width,height:canvas.height}));expect(buffer.width*buffer.height).toBeLessThanOrEqual(400000);report.economyBuffer=buffer;
 await page.locator('#scene-host canvas').evaluate(canvas=>canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await expect(page.locator('#scene-host canvas')).toHaveCount(0);await expect(page.locator('html')).toHaveAttribute('data-performance','lite');await page.locator('#render-quality').click();await expect(page.locator('#scene-host')).toHaveAttribute('data-scene','ready');await page.locator('#render-quality').click();await expect(page.locator('#scene-host canvas')).toHaveCount(0);await page.reload();await expect(page.locator('html')).toHaveAttribute('data-performance','lite');
 await page.locator('#language').click();await expect(page.locator('#render-quality')).toHaveText('Enable 3D');await expect(page.locator('[data-i=builderDesc]')).toContainText('standard dimensions');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:844});await page.waitForTimeout(150);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 expect(errors).toEqual([]);await context.close();
 // Live 3D is the default, including on phones and modest hardware, once the room is in view.
 for(const options of [{viewport:{width:1440,height:1000}},{viewport:{width:390,height:844},isMobile:true,hasTouch:true}]){const normal=await browser.newContext(options);await normal.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});});const normalPage=await normal.newPage();await normalPage.goto(base);await expect(normalPage.locator('html')).not.toHaveAttribute('data-performance','lite');await normalPage.locator('#room-stage').scrollIntoViewIfNeeded();await expect(normalPage.locator('#scene-host')).toHaveAttribute('data-scene','ready',{timeout:20000});await expect(normalPage.locator('#render-quality')).toHaveAttribute('data-mode','full');await normal.close();}
 // GPU failure must preserve the image viewer and all quote controls.
 const failed=await browser.newContext();await failed.addInitScript(()=>{localStorage.setItem('darouzi-quality','full');const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:get.call(this,type,...args);};});const fallback=await failed.newPage();await fallback.goto(base);await fallback.locator('[data-view=exterior]').click();await expect(fallback.locator('html')).toHaveAttribute('data-performance','lite');await expect(fallback.locator('.scene-fallback')).toHaveAttribute('src',/room-exterior-open/);await fallback.locator('#door-toggle').click();await expect(fallback.locator('.scene-fallback')).toHaveAttribute('src',/room-exterior-closed/);await failed.close();
 await writeFile('test-results/performance-behavior.json',JSON.stringify(report,null,2));
 console.log('PASS: 2-core/2-GB simulation at 6× CPU slowdown, no WebGL download in light mode, six-state viewer, hotspots, configuration-to-quote, layer interaction, inspection, accessible bilingual UI, bounded render buffer, manual 3D, teardown, persistence, 3D by default on desktop and phone, runtime GPU loss, and WebGL failure fallback.');
}finally{await browser.close();}
