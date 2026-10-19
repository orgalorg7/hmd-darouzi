import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});localStorage.setItem('darouzi-quality','full');});
 const page=await context.newPage();await page.goto(process.env.TEST_URL||'http://localhost:4173');
 await expect(page.locator('.lab-hero')).toHaveClass(/motion-visible/);
 await expect(page.locator('#airflow, .airflow-control, .airflow-light')).toHaveCount(0);
 // Hovering the background must not animate SVGs.
 await page.setViewportSize({width:1440,height:1000});
 await page.mouse.move(1400,20);await page.mouse.move(250,220);await page.mouse.move(350,300);
 expect(await page.locator('.hero-environment').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
 for(let cycle=0;cycle<4;cycle++){
  if(cycle)await page.locator('#language').click();
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});await page.waitForTimeout(500);
   const geometry=await page.locator('.view-switch').evaluate(el=>{const selected=el.querySelector('[aria-pressed=true]'),mark=getComputedStyle(el,'::before');return{left:new DOMMatrixReadOnly(mark.transform).m41,expected:selected.offsetLeft,width:parseFloat(mark.width),expectedWidth:selected.offsetWidth};});
   expect(Math.abs(geometry.left-geometry.expected)).toBeLessThan(2);expect(Math.abs(geometry.width-geometry.expectedWidth)).toBeLessThan(2);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 }
 await page.locator('[data-climate="-40"]').click();await expect(page.locator('#temperature')).toHaveValue('-40');expect(await page.locator('#temperature').evaluate(el=>el.style.getPropertyValue('--range-fill'))).toBe('0%');
 await page.locator('[data-climate="4"]').click();expect(parseFloat(await page.locator('#temperature').evaluate(el=>el.style.getPropertyValue('--range-fill')))).toBe(80);
 await page.locator('#language').click();expect(parseFloat(await page.locator('#temperature').evaluate(el=>el.style.getPropertyValue('--range-fill')))).toBe(80);
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(500);
 const actions=await page.locator('.hero-actions').boundingBox(),topline=await page.locator('.scene-topline').boundingBox();expect(topline.y).toBeGreaterThan(actions.y+actions.height);
 await page.locator('.menu-toggle').click();await expect(page.locator('#mobile-menu')).toBeVisible();await page.setViewportSize({width:1440,height:1000});await expect(page.locator('#mobile-menu')).toBeHidden();await page.setViewportSize({width:390,height:844});await page.locator('.menu-toggle').click();await page.locator('#hero-temperature').click();await expect(page.locator('#mobile-menu')).toBeHidden();
 await page.setViewportSize({width:1440,height:1000});await page.locator('.inspect-trigger').first().click();await expect(page.locator('#product-dialog')).toBeVisible();await page.mouse.click(8,8);await expect(page.locator('#product-dialog')).toBeHidden();await expect(page.locator('.inspect-trigger').first()).toBeFocused();
 await page.locator('#contact').scrollIntoViewIfNeeded();await expect(page.locator('.lab-hero')).not.toHaveClass(/motion-visible/);
 await page.evaluate(()=>scrollTo(0,0));await expect(page.locator('.lab-hero')).toHaveClass(/motion-visible/);await page.locator('#render-quality').click();await expect(page.locator('.lab-hero')).not.toHaveClass(/motion-visible/);
 expect(await page.locator('.hero-environment').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
 expect(await page.locator('.environment-art').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/vivid-mobile-lite.png'});
 await page.emulateMedia({reducedMotion:'reduce'});expect(await page.locator('.hero-environment').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
 // The close control belongs only to the floating configurator, never the inline grid.
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  for(let language=0;language<2;language++){
   await expect(page.locator('.builder-close')).toBeHidden();
   expect(await page.locator('#room-builder').evaluate(el=>[...el.children].filter(child=>child.getBoundingClientRect().width>0).length)).toBe(3);
   await page.locator('.hero-actions a[href="#room-builder"]').click();
   await expect(page.locator('.builder-close')).toBeVisible();
   const close=await page.locator('.builder-close').boundingBox();expect(close.width).toBeLessThanOrEqual(width<=640?44:40);expect(close.height).toBeLessThanOrEqual(width<=640?44:40);
   await page.locator('.builder-close').click();await expect(page.locator('.builder-close')).toBeHidden();
   await expect(page.locator('#room-builder')).not.toHaveClass(/builder-active/);
   await expect(page.locator('.hero-actions a[href="#room-builder"]')).toBeFocused();
   await page.locator('#language').click();
  }
 }
 console.log('PASS: selected view marker aligns across RTL/LTR and 320–1440px, preset tracks stay in sync, mobile controls do not overlap, menu resize/outside dismissal, viewer backdrop/focus restoration, ambient motion pauses offscreen/in light/reduced-motion modes, and configurator close control stays hidden outside its open panel.');
}finally{await browser.close();}
