import {chromium,expect} from '@playwright/test';

const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 await context.addInitScript(()=>{
  Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});
  Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
  localStorage.setItem('darouzi-quality','full');
 });
 const page=await context.newPage();
 await page.goto(process.env.TEST_URL||'http://localhost:4173');
 for(const lang of ['ar','en']){
  if(lang==='en')await page.locator('#language').click();
  const card=page.locator('.product-card').first(),surface=card.locator('.product-media'),add=card.locator('.product-add');
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(5,500);
  await expect.poll(()=>surface.evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).isIdentity)).toBe(true);
  const before=await add.boundingBox(),bounds=await surface.boundingBox();
  await page.mouse.move(bounds.x+bounds.width*.8,bounds.y+bounds.height*.8,{steps:10});
  await expect.poll(()=>surface.evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).isIdentity)).toBe(false);
  await expect.poll(async()=>{const after=await add.boundingBox();return Math.hypot(after.x-before.x,after.y-before.y)}).toBeGreaterThan(1);
  // Both controls must ride the same surface without nested buttons or a second tilt.
  await expect(card.locator('button button')).toHaveCount(0);
  expect(await card.locator('.product-image').evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).isIdentity)).toBe(true);
  await add.hover();
  await expect.poll(()=>surface.evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).isIdentity)).toBe(false);
  const count=Number(await page.locator('#tray-count').textContent());
  await add.click();await expect(page.locator('#tray-count')).toHaveText(String(count+1).padStart(2,'0'));
  await expect(page.locator('#product-dialog')).not.toBeVisible();
  await page.mouse.move(5,500);
  await expect.poll(()=>surface.evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).isIdentity)).toBe(true);
  await card.locator('.product-image').click();await expect(page.locator('#product-dialog')).toBeVisible();await page.keyboard.press('Escape');
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 const card=page.locator('.product-card').first();await card.scrollIntoViewIfNeeded();await card.locator('.product-add').hover();
 expect(await card.locator('.product-media').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
 await page.setViewportSize({width:390,height:844});
 const button=await card.locator('.product-add').boundingBox();expect(button.width).toBe(46);expect(button.height).toBe(46);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 console.log('PASS: add button moves with card tilt, hover stays active over +, independent add/inspect clicks, tilt reset, Arabic/English, reduced motion and mobile.');
}finally{await browser.close()}
