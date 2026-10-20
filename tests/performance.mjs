import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const base=process.env.TEST_URL||'http://localhost:4173';
const report={};
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>2});Object.defineProperty(navigator,'deviceMemory',{get:()=>2});});
 const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 // Even a 2-core/2-GB phone at 6× CPU slowdown gets live 3D, in the economy renderer, with no light-view switch.
 const session=await context.newCDPSession(page);await session.send('Emulation.setCPUThrottlingRate',{rate:6});
 await page.goto(base);await expect(page.locator('html')).not.toHaveAttribute('data-performance','lite');await expect(page.locator('#render-quality')).toHaveCount(0);
 await page.locator('#room-stage').scrollIntoViewIfNeeded();await expect(page.locator('#scene-host')).toHaveAttribute('data-scene','ready',{timeout:30000});await expect(page.locator('#scene-host')).toHaveAttribute('data-quality','economy');
 const buffer=await page.locator('#scene-host canvas').evaluate(canvas=>({width:canvas.width,height:canvas.height}));expect(buffer.width*buffer.height).toBeLessThanOrEqual(400000);report.economyBuffer=buffer;
 await page.locator('[data-view=exploded]').click();await expect(page.locator('#scene-host')).toHaveAttribute('data-mode','exploded');
 await page.locator('[data-hotspot=panels]').click();await expect(page.locator('#component-note')).toBeVisible();await page.locator('#close-component').click();
 await page.locator('[data-climate="-40"]').click();await expect(page.locator('#temperature')).toHaveValue('-40');
 await page.locator('.hero-actions a[href="#room-builder"]').click();await page.locator('#room-width-input').fill('6');await page.locator('#room-width-input').press('Tab');await page.locator('#temperature-quote').click();await expect(page.locator('#quote-details')).toHaveValue(/6 m/);await expect(page.locator('#quote-details')).toHaveValue(/-40°C/);await page.keyboard.press('Escape');await page.locator('.builder-close').click();
 await page.locator('#panel-spread').fill('100');await page.locator('#panel-spread').dispatchEvent('input');await expect(page.locator('#panel-spread-value')).toHaveText('100%');
 await page.locator('.inspect-trigger').first().click();await page.locator('#zoom-in').click();await expect(page.locator('#zoom-level')).toHaveText('125%');await page.keyboard.press('Escape');
 report.economy={cpuSlowdown:6,simulatedCores:2,simulatedMemoryGB:2,quality:'economy'};
 await session.send('Emulation.setCPUThrottlingRate',{rate:1});
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'test-results/potato-mobile.png'});
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 // A lost GPU falls back to the still preview with every control intact; a reload brings 3D back (nothing is remembered).
 await page.locator('#scene-host canvas').evaluate(canvas=>canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await expect(page.locator('#scene-host canvas')).toHaveCount(0);await expect(page.locator('html')).toHaveAttribute('data-performance','lite');await expect(page.locator('.scene-fallback')).toHaveAttribute('src',/room-exploded-closed/);
 await page.locator('#add-door').click();await expect(page.locator('#door-list li')).toHaveCount(2);
 await page.locator('#language').click();await expect(page.locator('[data-i=builderDesc]')).toContainText('standard dimensions');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:844});await page.waitForTimeout(150);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.reload();await expect(page.locator('html')).not.toHaveAttribute('data-performance','lite');
 expect(errors).toEqual([]);await context.close();
 // Live 3D is the default, including on phones and modest hardware, once the room is in view.
 for(const options of [{viewport:{width:1440,height:1000}},{viewport:{width:390,height:844},isMobile:true,hasTouch:true}]){const normal=await browser.newContext(options);await normal.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});});const normalPage=await normal.newPage();await normalPage.goto(base);await expect(normalPage.locator('html')).not.toHaveAttribute('data-performance','lite');await normalPage.locator('#room-stage').scrollIntoViewIfNeeded();await expect(normalPage.locator('#scene-host')).toHaveAttribute('data-scene','ready',{timeout:20000});await normal.close();}
 // WebGL failure must preserve the image viewer, doors and all quote controls.
 const failed=await browser.newContext();await failed.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:get.call(this,type,...args);};});const fallback=await failed.newPage();await fallback.goto(base);await fallback.locator('[data-view=exterior]').click();await expect(fallback.locator('html')).toHaveAttribute('data-performance','lite');await expect(fallback.locator('.scene-fallback')).toHaveAttribute('src',/room-exterior-closed/);await fallback.locator('#add-door').click();await expect(fallback.locator('#door-list li')).toHaveCount(2);await failed.close();
 await writeFile('test-results/performance-behavior.json',JSON.stringify(report,null,2));
 console.log('PASS: 2-core/2-GB phone at 6× CPU slowdown gets economy 3D with a bounded buffer, no light-view switch, hotspots, configuration-to-quote, layer interaction, inspection, accessible bilingual UI, runtime GPU loss to a still preview with doors, no remembered fallback, 3D by default on desktop and phone, and WebGL failure fallback.');
}finally{await browser.close();}
