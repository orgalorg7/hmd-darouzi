import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.addInitScript(()=>{
  Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});
  Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
  window.footerPaints=0;
  const clear=CanvasRenderingContext2D.prototype.clearRect;
  CanvasRenderingContext2D.prototype.clearRect=function(...args){window.footerPaints++;return clear.apply(this,args)};
 });
 const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>requests.push(request.url()));
 await page.goto(process.env.TEST_URL||'http://localhost:4173');
 await page.waitForTimeout(500);expect(requests.some(url=>/\/footer-[\w-]+\.js/.test(url))).toBe(false);
 await page.locator('#contact').scrollIntoViewIfNeeded();
 await expect(page.locator('.contact-field canvas')).toHaveCount(0);
 const rect=await page.locator('.contact-field').boundingBox();
 await page.mouse.move(rect.x+150,rect.y+120);await page.mouse.move(rect.x+500,rect.y+210,{steps:12});
 await expect(page.locator('.contact-field canvas')).toHaveCount(1);
 await page.waitForTimeout(200);expect(await page.evaluate(()=>window.footerPaints)).toBeGreaterThan(4);
 await page.waitForTimeout(1600);const idle=await page.evaluate(()=>window.footerPaints);
 await page.waitForTimeout(350);expect(await page.evaluate(()=>window.footerPaints)).toBe(idle);
 expect(await page.locator('.contact-field canvas').evaluate(el=>el.width*el.height)).toBeLessThanOrEqual(450000);
 for(const lang of ['ar','en']){
  if(lang==='en')await page.locator('#language').click();
  for(const id of ['cold','chillers','towers','ice','transport','insulation']){
   await page.locator(`[data-inquiry="${id}"]`).click();
   await expect(page.locator('[data-inquiry][aria-pressed=true]')).toHaveCount(1);
   await page.locator('.contact-project').click();await expect(page.locator('#quote-service')).toHaveValue(id);
   await page.keyboard.press('Escape');await expect(page.locator('.contact-project')).toBeFocused();
  }
  for(const width of [320,390,768,1440,1920]){
   await page.setViewportSize({width,height:1000});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.setViewportSize({width:1440,height:1000});await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(300);
  await page.locator('#contact').screenshot({path:`test-results/footer-interactive-${lang}.png`});
  const audit=await new AxeBuilder({page}).include('#contact').include('.site-footer').withTags(['wcag2a','wcag2aa']).analyze();expect(audit.violations).toEqual([]);
 }
 await page.locator('#language').click();
 await expect(page.locator('[data-inquiry=insulation]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#contact-project-topic')).toHaveText(await page.locator('[data-inquiry=insulation] span').textContent());
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(300);
 const offscreen=await page.evaluate(()=>window.footerPaints);await page.waitForTimeout(400);expect(await page.evaluate(()=>window.footerPaints)).toBe(offscreen);
 // When the GPU is lost and the still preview takes over, the footer animation is removed as well.
 await page.waitForFunction(()=>document.querySelector('#scene-host')?.dataset.scene==='ready',null,{timeout:30000});await page.locator('#scene-host canvas').evaluate(canvas=>canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await expect(page.locator('html')).toHaveAttribute('data-performance','lite');await expect(page.locator('.contact-field canvas')).toHaveCount(0);
 await page.locator('#contact').scrollIntoViewIfNeeded();await page.locator('[data-inquiry=chillers]').click();await page.locator('.contact-project').click();await expect(page.locator('#quote-service')).toHaveValue('chillers');await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});await page.locator('#contact').screenshot({path:'test-results/footer-interactive-mobile-lite.png'});
 expect(errors).toEqual([]);
 // Automatic fallback: reduced motion and constrained hardware both keep the static artwork.
 for(const reduced of [false,true]){
  const fallback=await browser.newContext({reducedMotion:reduced?'reduce':'no-preference'});
  await fallback.addInitScript(low=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>low?2:8});Object.defineProperty(navigator,'deviceMemory',{get:()=>low?2:8})},!reduced);
  const other=await fallback.newPage();await other.goto(process.env.TEST_URL||'http://localhost:4173');await other.locator('#contact').scrollIntoViewIfNeeded();await other.waitForTimeout(300);
  await expect(other.locator('.contact-field canvas')).toHaveCount(0);await expect(other.locator('.contact-field-static')).toBeVisible();
  await other.locator('[data-inquiry=transport]').click();await other.locator('.contact-project').click();await expect(other.locator('#quote-service')).toHaveValue('transport');await fallback.close();
 }
 console.log('PASS: six inquiry paths in both languages, responsive layouts, accessibility, motion response, idle/offscreen suspension, pixel budget, lazy loading and light/reduced-motion fallback.');
}finally{await browser.close()}
