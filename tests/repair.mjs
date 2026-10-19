import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const base=process.env.TEST_URL||'http://localhost:4173';
const scan=async(page,include)=>{const axe=await new AxeBuilder({page}).include(include).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);};
// Intercept WhatsApp handoffs: no test opens an app or sends a message.
const intercept=page=>page.evaluate(()=>{window.handoffs=[];document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.href.startsWith('https://wa.me/')){window.handoffs.push({href:a.href,target:a.target,rel:a.rel});e.preventDefault();}},true);});
const lastMessage=async page=>{const h=await page.evaluate(()=>window.handoffs.at(-1));return h&&{...h,text:decodeURIComponent(h.href.split('?text=')[1])};};
try{
 const desktop=await browser.newContext({viewport:{width:1440,height:900}});const page=await desktop.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await intercept(page);
 const form=page.locator('#repair-form'),send=page.locator('.repair-send'),error=page.locator('#repair-error');
 await form.scrollIntoViewIfNeeded();await expect(page.locator('.repair-call')).toHaveAttribute('href','tel:+963944699555');
 // Nothing ticked: a visible, announced error and focus on the first problem; nothing opens.
 await send.click();await expect(error).toBeVisible();await expect(error).toHaveAttribute('role','alert');await expect(page.locator('input[name=problem]').first()).toBeFocused();
 expect(await page.evaluate(()=>window.handoffs.length)).toBe(0);
 // The tiles are real checkboxes and radios: keyboard Space toggles them.
 await page.keyboard.press('Space');await expect(page.locator('input[name=problem]').first()).toBeChecked();await expect(error).toBeHidden();
 await page.locator('.repair-option',{hasText:'صوت غير طبيعي'}).click();
 await page.locator('.repair-option',{hasText:'شيلر تبريد مياه'}).click();await expect(page.locator('input[name=equipment][value=chiller]')).toBeChecked();await expect(page.locator('input[name=equipment][value=room]')).not.toBeChecked();
 await page.locator('.repair-urgent').click();await expect(page.locator('input[name=goods]')).toBeChecked();
 // The area is required before WhatsApp opens.
 await send.click();expect(await page.evaluate(()=>window.handoffs.length)).toBe(0);expect(await form.locator('[name=area]').evaluate(el=>el.validationMessage)).not.toBe('');
 await form.locator('[name=area]').fill('حلب، الشيخ نجار');await form.locator('[name=repair-name]').fill('اختبار');await form.locator('[name=notes]').fill('الحرارة 8 درجات');
 await send.click();let message=await lastMessage(page);
 expect(message.href).toMatch(/^https:\/\/wa\.me\/971506497817\?text=/);expect(message.target).toBe('_blank');expect(message.rel).toContain('noopener');
 expect(message.text).toBe(['طلب صيانة','نوع التجهيز: شيلر تبريد مياه','المشكلة:','- لا تبرّد أو الحرارة مرتفعة','- صوت غير طبيعي من الضاغط','','! توجد بضاعة داخل الغرفة الآن','','المنطقة: حلب، الشيخ نجار','الاسم: اختبار','ملاحظات: الحرارة 8 درجات','','سأرفق صورة للعطل أو للوحة التحكم.'].join('\n'));
 await scan(page,'#repair');
 // English: the same selections produce an English message; optional fields stay out when empty.
 await page.locator('#language').click();await expect(page.locator('html')).toHaveAttribute('lang','en');await intercept(page);
 await page.locator('.repair-urgent').click();await form.locator('[name=repair-name]').fill('');await form.locator('[name=notes]').fill('');
 await send.click();message=await lastMessage(page);
 expect(message.text).toBe(['Service request','Equipment: Water chiller','Problem:','- Not cooling or temperature too high','- Unusual noise from the compressor','','Area: حلب، الشيخ نجار','','I will attach a photo of the fault or the control panel.'].join('\n'));
 await expect(page.locator('.repair-send')).toContainText('Prepare WhatsApp message');await scan(page,'#repair');
 await expect(page.locator('.contact-channel-link')).toHaveAttribute('href',/^https:\/\/whatsapp\.com\/channel\//);await expect(page.locator('.contact-channel-link')).toHaveAttribute('rel',/noopener/);
 await expect(page.locator('.footer-faq')).toHaveAttribute('href','/en/faq/');await expect(page.locator('.footer-privacy')).toHaveAttribute('href','/en/privacy/');
 expect(errors).toEqual([]);await desktop.close();

 // Phone: menu entry, readable inputs, large targets and no sideways scrolling.
 const phone=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mobile=await phone.newPage();
 await mobile.goto(base);await mobile.locator('.menu-toggle').tap();await expect(mobile.locator('#mobile-menu a[href="#repair"]')).toBeVisible();await mobile.locator('#mobile-menu a[href="#repair"]').tap();
 for(const width of [320,360,390,430]){await mobile.setViewportSize({width,height:844});expect(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const selector of ['.repair-option','.repair-urgent','.repair-send','.repair-call','.contact-channel-link']){const sizes=await mobile.locator(selector).evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));for(const size of sizes)expect(size).toBeGreaterThanOrEqual(44);}
  for(const field of await mobile.locator('#repair-form input[name=area], #repair-form textarea').all())expect(await field.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);}
 await mobile.locator('#repair-form [name=area]').focus();await expect(mobile.locator('#whatsapp-fab')).toBeHidden();
 await scan(mobile,'#repair');await phone.close();
 console.log('PASS: maintenance request with required problem and area, keyboard-operable tiles, Arabic and English WhatsApp messages to the company number, urgency flag, direct call link, WhatsApp channel and FAQ/privacy links per language, phone menu entry, 44px targets, 16px inputs, 320–1440px layouts and accessibility scans.');
}finally{await browser.close();}
