import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const base=process.env.TEST_URL||'http://localhost:4173';
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(base);
 await page.locator('[data-view=blueprint]').click();await expect(page.locator('#blueprint-panel')).toBeVisible();await expect(page.locator('.blueprint-size')).toHaveText('5 × 4 m');
 await expect(page.locator('#scene-host canvas')).toHaveCount(0);await expect(page.locator('#render-quality')).toHaveCount(0);
 for(const key of ['cooling','panels','door']){
  await page.locator(`[data-blueprint-part=${key}]`).click();await expect(page.locator('#component-note')).toBeVisible();await expect(page.locator(`[data-blueprint-part=${key}]`)).toHaveAttribute('aria-expanded','true');
  await page.locator('#close-component').click();await expect(page.locator(`[data-blueprint-part=${key}]`)).toBeFocused();
 }
 await expect(page.locator('.bp-doors rect')).toHaveCount(1);await page.locator('#add-door').click();await expect(page.locator('.bp-doors rect')).toHaveCount(2);await page.locator('#door-list select').nth(1).selectOption('back');await expect(page.locator('.bp-doors rect').nth(1)).toHaveAttribute('height','12');await page.locator('[data-remove-door="1"]').click();await expect(page.locator('.bp-doors rect')).toHaveCount(1);await expect(page.locator('[data-remove-door="0"]')).toBeDisabled();
 await page.locator('.hero-actions a[href="#room-builder"]').click();
 for(const [width,length] of [[7,6],[3,3],[5.5,4.5]]){
  await page.locator('#room-width').fill(String(width));await page.locator('#room-length').fill(String(length));
  await expect(page.locator('.blueprint-size')).toHaveText(`${width} × ${length} m`);
  await expect(page.locator('.bp-width-text')).toHaveText(`${width} m`);await expect(page.locator('.bp-length-text')).toHaveText(`${length} m`);
 }
 await expect(page.locator('#scene-host canvas')).toHaveCount(0);
 await page.locator('#temperature-quote').click();await expect(page.locator('#quote-details')).toHaveValue(/5.5 m/);await expect(page.locator('#quote-details')).toHaveValue(/4.5 m/);await page.keyboard.press('Escape');await page.locator('.builder-close').click();
 await page.locator('#language').click();await expect(page.locator('.blueprint-plan')).toHaveText('Plan view');
 const bpBox=await page.locator('#blueprint-panel').boundingBox(),copyBox=await page.locator('.hero-content').boundingBox();expect(bpBox.x+bpBox.width).toBeLessThan(copyBox.x);
 await page.screenshot({path:'test-results/blueprint-final-desktop.png'});
 for(const [key,service,contextLabel] of [['food','cold','Food & produce'],['medicine','cold','Medicines'],['process','chillers','Industrial processes']]){
  await page.locator(`[data-cooling=${key}]`).click();await expect(page.locator(`[data-service=${service}]`)).toHaveAttribute('aria-selected','true');expect(await page.locator('[data-service][data-relevant=true]').count()).toBe(3);
  await page.locator('#cooling-inquiry').click();await expect(page.locator('#quote-service')).toHaveValue(service);await expect(page.locator('#quote-application')).toHaveText(`Application: ${contextLabel}`);await page.keyboard.press('Escape');
 }
 await page.locator('[data-recommended-service=towers]').click();await expect(page.locator('[data-service=towers]')).toHaveAttribute('aria-selected','true');
 // Both handoffs carry the application and preserve the visitor's own draft. No messages are sent.
 await page.locator('#cooling-inquiry').click();await page.locator('#quote-details').fill('Keep this existing project note.');await page.keyboard.press('Escape');
 await page.locator('[data-cooling=medicine]').click();await page.locator('#cooling-inquiry').click();await expect(page.locator('#quote-details')).toHaveValue('Keep this existing project note.');
 await page.locator('[name=name]').fill('Test visitor');await page.locator('[name=phone]').fill('123456789');
 await page.evaluate(()=>{window.handoffs=[];const original=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.href.startsWith('mailto:')||this.href.startsWith('https://wa.me/'))window.handoffs.push(this.href);else original.call(this);};});
 await page.locator('#whatsapp-quote').click();await page.locator('#email-quote').click();
 const handoffs=await page.evaluate(()=>window.handoffs);expect(handoffs.length).toBe(2);for(const href of handoffs){expect(decodeURIComponent(href)).toContain('Application: Medicines');expect(decodeURIComponent(href)).toContain('Keep this existing project note.');}
 await page.keyboard.press('Escape');await page.locator('#language').click();await expect(page.locator('[data-cooling=medicine]')).toHaveAttribute('aria-pressed','true');await page.locator('#cooling-inquiry').click();await expect(page.locator('#quote-application')).toHaveText('الاستخدام: أدوية');await page.keyboard.press('Escape');
 await page.locator('#cooling-reset').click();await expect(page.locator('#cooling-result')).toBeHidden();await expect(page.locator('[data-service][data-relevant=true]')).toHaveCount(0);await page.locator('#service-quote').click();await expect(page.locator('#quote-application')).toBeHidden();await page.keyboard.press('Escape');
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:1000});await page.evaluate(()=>scrollTo(0,0));
  for(let language=0;language<2;language++){
   await page.locator('#language').click();await page.waitForTimeout(100);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   const actions=await page.locator('.scene-bottomline').boundingBox(),views=await page.locator('.view-switch').boundingBox();expect(actions.y+actions.height).toBeLessThanOrEqual(views.y+1);
  }
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'test-results/blueprint-final-mobile.png'});
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 // Switching back to a model explicitly loads 3D; returning to the plan disposes it.
 await page.setViewportSize({width:1440,height:1000});await page.locator('[data-view=exterior]').click();await expect(page.locator('#scene-host')).toHaveAttribute('data-scene','ready',{timeout:20000});await expect(page.locator('#blueprint-panel')).toBeHidden();await page.locator('[data-view=blueprint]').click();await expect(page.locator('#scene-host canvas')).toHaveCount(0);await expect(page.locator('#blueprint-panel')).toBeVisible();
 expect(errors).toEqual([]);await context.close();
 // A late engine import must not resurrect WebGL behind the blueprint.
 const race=await browser.newPage();
 await race.route('**/room-scene-*.js',async route=>{await new Promise(resolve=>setTimeout(resolve,500));await route.continue();});
 await race.goto(base);await race.locator('[data-view=exterior]').click();await race.locator('[data-view=blueprint]').click();await race.waitForTimeout(1000);await expect(race.locator('#scene-host canvas')).toHaveCount(0);await expect(race.locator('#blueprint-panel')).toBeVisible();await race.close();
 console.log('PASS: blueprint without a live canvas, live dimensions and door, accessible component details, bilingual responsive layouts, 3D disposal/import race, three application routes, relevant solutions, preserved drafts, WhatsApp/email context and accessibility.');
}finally{await browser.close();}
