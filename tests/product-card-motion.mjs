import {chromium,expect} from '@playwright/test';

const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 await context.addInitScript(()=>{
  Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});
  Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
 });
 const page=await context.newPage();
 await page.goto(process.env.TEST_URL||'http://localhost:4173');
 for(const lang of ['ar','en']){
  if(lang==='en')await page.locator('#language').click();
  const card=page.locator('.product-card').first(),surface=card.locator('.product-media');
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(5,500);
  await expect.poll(()=>surface.evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).isIdentity)).toBe(true);
  const bounds=await surface.boundingBox();
  await page.mouse.move(bounds.x+bounds.width*.8,bounds.y+bounds.height*.8,{steps:10});
  await expect.poll(()=>surface.evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).isIdentity)).toBe(false);
  // The photo is the only control on the image: no add button or inspect label, and no nested buttons.
  await expect(card.locator('.product-add,.inspect-label')).toHaveCount(0);await expect(card.locator('button button')).toHaveCount(0);
  expect(await card.locator('.product-image').evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).isIdentity)).toBe(true);
  await page.mouse.move(5,500);
  await expect.poll(()=>surface.evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).isIdentity)).toBe(true);
  await card.locator('.product-image').click();await expect(page.locator('#product-dialog')).toBeVisible();await page.keyboard.press('Escape');
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 const card=page.locator('.product-card').first();await card.scrollIntoViewIfNeeded();await card.locator('.product-image').hover();
 expect(await card.locator('.product-media').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 console.log('PASS: photo-only product cards (no + or inspect label), card tilt and reset, photo opens the viewer, Arabic/English, reduced motion and mobile.');
}finally{await browser.close()}
