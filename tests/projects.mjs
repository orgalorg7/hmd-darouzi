import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const base=process.env.TEST_URL||'http://localhost:4173';
const scan=async(page,include)=>{const axe=await new AxeBuilder({page}).include(include).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);};
const noScroll=page=>page.evaluate(()=>document.body.classList.contains('no-scroll'));
try{
 const desktop=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await desktop.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.evaluate(()=>document.fonts.ready);
 const cases=page.locator('.case'),cold=cases.nth(0);
 await expect(cases).toHaveCount(4);await expect(page.locator('#projects [data-photo]')).toHaveCount(11);
 await expect(cold.locator('h3')).toContainText('4800');await expect(cold.locator('.case-thumb')).toHaveCount(5);
 await cold.scrollIntoViewIfNeeded();
 // A card's thumbnails switch only that card's photograph, caption and count.
 await cold.locator('.case-thumb').nth(3).click();await expect(cold.locator('.case-thumb').nth(3)).toHaveAttribute('aria-pressed','true');await expect(cold.locator('.case-thumb').nth(0)).toHaveAttribute('aria-pressed','false');
 await expect(cold.locator('.case-index')).toHaveText('4');await expect(cold.locator('.case-caption-text')).toHaveText('درجات حرارة مدروسة لجميع أماكن المشروع');
 await expect(cold.locator('.case-image')).toHaveAttribute('src',/cold-store-4800-evaporators\.webp$/);await expect(cold.locator('.case-image')).toHaveAttribute('alt','درجات حرارة مدروسة لجميع أماكن المشروع');
 await expect(cold).not.toHaveClass(/is-changing/);await expect(cases.nth(3).locator('.case-index')).toHaveText('1');
 // The viewer opens at the photograph a card shows and browses all eleven in page order.
 const viewer=page.locator('#project-viewer'),index=page.locator('#viewer-index');
 await cold.locator('.case-open').click();await expect(viewer).toBeVisible();await expect(index).toHaveText('04');await expect(page.locator('#viewer-total')).toHaveText('11');
 await expect(page.locator('#viewer-image')).toHaveAttribute('src',/cold-store-4800-evaporators\.webp$/);
 await expect.poll(()=>noScroll(page)).toBe(true);await expect(page.locator('#whatsapp-fab')).toBeHidden();
 await scan(page,'#project-viewer');
 // Arabic reading order: ArrowLeft is next, ArrowRight is previous; buttons wrap around both ends.
 await page.keyboard.press('ArrowLeft');await expect(index).toHaveText('05');
 await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');await expect(index).toHaveText('03');
 for(let i=0;i<3;i++)await page.locator('.viewer-prev').click();await expect(index).toHaveText('11');
 await page.locator('.viewer-next').click();await expect(index).toHaveText('01');await expect(page.locator('#viewer-caption')).toHaveText('مستودع التبريد');
 await page.keyboard.press('Escape');await expect(viewer).toBeHidden();await expect(cold.locator('.case-open')).toBeFocused();await expect.poll(()=>noScroll(page)).toBe(false);
 // Single-photograph cards open at their own place; the backdrop closes and focus returns.
 const towers=cases.nth(2).locator('.case-open');await towers.click();await expect(index).toHaveText('07');await expect(page.locator('#viewer-caption')).toHaveText('أبراج تبريد بشعار HMD');
 await page.mouse.click(8,8);await expect(viewer).toBeHidden();await expect(towers).toBeFocused();
 // Each card's action opens the quote with its service selected.
 for(const [card,service] of [[0,'cold'],[1,'chillers'],[2,'towers'],[3,'cold']]){await cases.nth(card).locator('.case-cta').click();await expect(page.locator('#quote-dialog')).toBeVisible();await expect(page.locator('#quote-service')).toHaveValue(service);await page.keyboard.press('Escape');await expect(page.locator('#quote-dialog')).toBeHidden();}
 await scan(page,'#projects');
 // Captions follow the language switch without losing each card's selection.
 await page.locator('#language').click();await expect(page.locator('html')).toHaveAttribute('lang','en');
 await expect(cold.locator('.case-caption-text')).toHaveText('Temperatures planned for every area of the project');await expect(cold.locator('.case-index')).toHaveText('4');
 await expect(cases.nth(1).locator('h3')).toHaveText('Water chillers');
 await cases.nth(1).locator('.case-open').click();await expect(page.locator('#viewer-caption')).toHaveText('Water chillers installed on a roof');
 await page.keyboard.press('ArrowRight');await expect(index).toHaveText('07');await page.keyboard.press('Escape');
 await scan(page,'#projects');
 // A direct English visit shows English captions before any interaction.
 const english=await desktop.newPage();await english.goto(base+'/en/');const first=english.locator('.case').first();
 await expect(first.locator('.case-caption-text')).toHaveText('Cold store');await expect(first.locator('.case-image')).toHaveAttribute('alt','Cold store');await english.close();
 for(const width of [1100,900,768]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 expect(errors).toEqual([]);await desktop.close();

 // Reduced motion: no cross-fade state.
 const calm=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});const quiet=await calm.newPage();
 await quiet.goto(base);const quietCard=quiet.locator('.case').first();await quietCard.scrollIntoViewIfNeeded();
 await quietCard.locator('.case-thumb').nth(1).click();await expect(quietCard).not.toHaveClass(/is-changing/);await expect(quietCard.locator('.case-index')).toHaveText('2');
 await calm.close();

 // Phone: touch targets, swipes, and the dock and WhatsApp button stay out of the viewer.
 const phone=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mobile=await phone.newPage(),mobileErrors=[];mobile.on('pageerror',e=>mobileErrors.push(e.message));
 await mobile.goto(base);await mobile.locator('#projects').scrollIntoViewIfNeeded();
 for(const width of [320,360,390,430]){await mobile.setViewportSize({width,height:844});expect(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const selector of ['.case-thumb','.case-open','.case-cta','.projects-source a']){const sizes=await mobile.locator(selector).evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return Math.min(r.width,r.height);}));for(const size of sizes)expect(size).toBeGreaterThanOrEqual(44);}}
 await mobile.setViewportSize({width:390,height:844});
 const mobileTowers=mobile.locator('.case').nth(2).locator('.case-open');await mobileTowers.scrollIntoViewIfNeeded();await expect(mobile.locator('#mobile-dock')).toBeVisible();
 await mobileTowers.tap();await expect(mobile.locator('#project-viewer')).toBeVisible();await expect(mobile.locator('#viewer-index')).toHaveText('07');
 await expect(mobile.locator('#mobile-dock')).toBeHidden();await expect(mobile.locator('#whatsapp-fab')).toBeHidden();
 for(const selector of ['.viewer-close','.viewer-prev','.viewer-next']){const box=await mobile.locator(selector).boundingBox();expect(Math.min(box.width,box.height)).toBeGreaterThanOrEqual(44);}
 const swipe=async(from,to)=>{const box=await mobile.locator('#viewer-image').boundingBox(),y=box.y+box.height/2,cdp=await phone.newCDPSession(mobile);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width*from,y}]});
  // Paced like a finger: an instant flick makes Chrome spend the next tap stopping the fling.
  for(let i=1;i<=6;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width*(from+(to-from)*i/6),y}]});await mobile.waitForTimeout(30);}await mobile.waitForTimeout(120);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 await swipe(.2,.8);await expect(mobile.locator('#viewer-index')).toHaveText('08');
 await swipe(.8,.2);await expect(mobile.locator('#viewer-index')).toHaveText('07');
 await mobile.locator('.viewer-close').tap();await expect(mobile.locator('#project-viewer')).toBeHidden();await expect(mobile.locator('#mobile-dock')).toBeVisible();
 await scan(mobile,'#projects');
 expect(mobileErrors).toEqual([]);
 console.log('PASS: four case cards with independent photo sets, per-card quote actions, full-size viewer across all eleven photographs, RTL keys and swipes, wrap-around, Escape/backdrop close with focus return, bilingual captions, reduced motion, 44px phone targets, dock/WhatsApp hidden in the viewer, 320–1440px layouts and accessibility scans.');
}finally{await browser.close();}
