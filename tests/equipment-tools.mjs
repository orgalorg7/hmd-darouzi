import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox']});
const base=process.env.TEST_URL||'http://localhost:4173';
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.locator('#language').click();
 await page.locator('#installation').scrollIntoViewIfNeeded();
 for(const index of [0,1,2]){
  await page.locator(`.installation-pin[data-installation-part="${index}"]`).click();
  await expect(page.locator(`.installation-parts [data-installation-part="${index}"]`)).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#installation-component')).toHaveText(['Evaporators','Insulated panels','Drainage'][index]);
 }
 await expect(page.locator('#installation-add')).toBeHidden();
 await page.locator('.installation-parts [data-installation-part="0"]').focus();await page.keyboard.press('Enter');
 await page.locator('#installation-add').click();await expect(page.locator('#tray-count')).toHaveText('01');
 await expect(page.locator('#tray-status')).toContainText('Cooling evaporators');
 await page.locator('#installation').screenshot({path:'test-results/installation-desktop-en.png'});
 await page.locator('[data-add-part=compressor]').click();await page.locator('[data-add-part=compressor]').click();
 await expect(page.locator('#tray-count')).toHaveText('03');await expect(page.locator('#tray-quantity-compressor')).toHaveValue('2');
 await page.locator('#tray-note-compressor').fill('Model A & B <sample> "requested"');
 await page.locator('#tray-quantity-compressor').fill('5');await page.locator('#tray-quantity-compressor').press('Tab');await expect(page.locator('#tray-count')).toHaveText('06');
 await page.locator('[data-filter=insulation]').click();await expect(page.locator('#tray-count')).toHaveText('06');
 await page.reload();await expect(page.locator('#tray-note-compressor')).toHaveValue('Model A & B <sample> "requested"');await expect(page.locator('#tray-count')).toHaveText('06');
 await page.locator('[data-product=hardware]').click();await page.locator('#inspect-add').click();await expect(page.locator('#product-dialog')).not.toBeVisible();await expect(page.locator('#tray-count')).toHaveText('07');
 await page.locator('[data-tray-item=hardware] [data-tray-action=remove]').click();await expect(page.locator('#tray-count')).toHaveText('06');
 await page.locator('#parts-tray').screenshot({path:'test-results/parts-tray-desktop-en.png'});
 await page.locator('#tray-submit').click();await expect(page.locator('#quote-parts')).toBeVisible();await expect(page.locator('#quote-service')).toHaveValue('parts-tray');
 await page.locator('#quote-parts').getByText('5 × Refrigeration compressors · Model A & B <sample> "requested"').waitFor();
 await page.locator('[name=name]').fill('Tray visitor');await page.locator('[name=phone]').fill('123456789');await page.locator('#quote-details').fill('Keep my project note.');
 await page.evaluate(()=>{window.handoffs=[];document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&(a.href.startsWith('mailto:')||a.href.startsWith('https://wa.me/'))){window.handoffs.push(a.href);e.preventDefault();}},true);});
 await page.locator('#whatsapp-quote').click();await page.locator('#email-quote').click();
 const handoffs=await page.evaluate(()=>window.handoffs);expect(handoffs).toHaveLength(2);
 for(const href of handoffs){const message=new URL(href).searchParams.get(href.startsWith('mailto:')?'body':'text');expect(message).toContain('5 × Refrigeration compressors');expect(message).toContain('1 × Cooling evaporators');expect(message).toContain('Model A & B <sample> "requested"');expect(message).toContain('Keep my project note.');}
 await page.locator('#quote-service').selectOption('cold');await expect(page.locator('#quote-parts')).toBeHidden();await expect(page.locator('#quote-result')).toBeHidden();
 await page.locator('#email-quote').click();expect(new URL(await page.evaluate(()=>window.handoffs[2])).searchParams.get('body')).not.toContain('Requested parts');
 await page.keyboard.press('Escape');await page.locator('#language').click();
 await expect(page.locator('#tray-title')).toHaveText('قائمة قطعك.');await expect(page.locator('#tray-count')).toHaveText('06');await expect(page.locator('#tray-note-compressor')).toHaveValue('Model A & B <sample> "requested"');
 await page.locator('#tray-submit').click();await expect(page.locator('#quote-parts')).toContainText('ضواغط التبريد');await expect(page.locator('#quote-details')).toHaveValue('Keep my project note.');await page.keyboard.press('Escape');
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  for(let language=0;language<2;language++){
   await page.locator('#language').click();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   for(const selector of ['#installation','#parts-tray']){await page.locator(selector).scrollIntoViewIfNeeded();expect(await page.locator(selector).evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);}
  }
 }
 await page.setViewportSize({width:390,height:844});await page.locator('#installation').screenshot({path:'test-results/installation-mobile-ar.png'});await page.locator('#parts-tray').screenshot({path:'test-results/parts-tray-mobile-ar.png'});
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 for(const [input,expected] of [['0','1'],['1000','999'],['1.5','2'],['','1']]){await page.locator('#tray-quantity-compressor').fill(input);await page.locator('#tray-quantity-compressor').press('Tab');await expect(page.locator('#tray-quantity-compressor')).toHaveValue(expected);}
 await page.locator('[data-tray-item=compressor] [data-tray-action=increase]').click();await expect(page.locator('#tray-quantity-compressor')).toHaveValue('2');await expect(page.locator('[data-tray-item=compressor] [data-tray-action=increase]')).toBeFocused();
 await page.locator('[data-tray-item=compressor] [data-tray-action=decrease]').click();await expect(page.locator('#tray-quantity-compressor')).toHaveValue('1');
 await page.locator('#tray-clear').click();await expect(page.locator('#tray-empty')).toBeVisible();await expect(page.locator('#tray-submit')).toBeDisabled();await expect(page.locator('#tray-title')).toBeFocused();await page.reload();await expect(page.locator('#tray-count')).toHaveText('00');
 // Tampered saved data is bounded and untrusted notes stay text, never markup.
 await page.evaluate(()=>localStorage.setItem('darouzi-parts-tray-v1',JSON.stringify([{id:'compressor',quantity:-5,note:'<img src=x onerror=alert(1)>'},{id:'compressor',quantity:2},{id:'unknown',quantity:4}])));await page.reload();await expect(page.locator('[data-tray-item]')).toHaveCount(1);await expect(page.locator('#tray-quantity-compressor')).toHaveValue('1');await expect(page.locator('#tray-note-compressor')).toHaveValue('<img src=x onerror=alert(1)>');await expect(page.locator('#quote-parts img')).toHaveCount(0);
 expect(errors).toEqual([]);
 console.log('PASS: real-photo hotspots, keyboard selection, catalog/inspector additions, quantity bounds, notes, filtering/language/reload persistence, safe restoration, both message handoffs, independent project inquiries, empty state, mobile/RTL layouts, accessibility and no page errors.');
}finally{await browser.close();}
