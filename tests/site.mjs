import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base = process.env.TEST_URL || 'http://localhost:5174';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await mkdir('test-results',{recursive:true});
try {
 await page.goto(base);await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('h1')).toContainText('هندسة البرودة');
 for(const id of ['cold','chillers','towers','ice','transport','insulation']){
  await page.locator(`#tab-${id}`).click();await expect(page.locator(`#tab-${id}`)).toHaveAttribute('aria-selected','true');
  await page.locator('#service-quote').click();await expect(page.locator('#quote-service')).toHaveValue(id);await page.keyboard.press('Escape');
 }
 await page.locator('#tab-cold').click();await page.keyboard.press('ArrowLeft');await expect(page.locator('#tab-chillers')).toBeFocused();
 await page.evaluate(()=>{window.originalPanelCard=document.querySelector('[data-product=panels]').closest('.product-card');});
 await page.locator('[data-filter=insulation]').click();await expect(page.locator('.product-card')).toHaveCount(3);
 expect(await page.evaluate(()=>document.querySelector('[data-product=panels]').closest('.product-card')===window.originalPanelCard)).toBe(true);
 await page.locator('[data-filter=transport]').click();await expect(page.locator('.product-card')).toHaveCount(2);
 await page.locator('.product-quote').first().click();await expect(page.locator('#quote-service')).toHaveValue('product-truck-unit');await page.keyboard.press('Escape');
 await page.locator('[data-filter=all]').click();await expect(page.locator('.product-card')).toHaveCount(8);
 await page.locator('#temperature').fill('-25');await page.locator('#temperature').dispatchEvent('input');await page.locator('#temperature-quote').click();await expect(page.locator('#quote-details')).toHaveValue(/-25°C/);await expect(page.locator('#quote-service')).toHaveValue('cold');
 // Intercept both app handoffs: no test opens an external app or sends a message.
 await page.evaluate(()=>{window.handoffs=[];document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&(a.href.startsWith('mailto:')||a.href.startsWith('https://wa.me/'))){window.handoffs.push({href:a.href,target:a.target,rel:a.rel});e.preventDefault();}},true);});
 await expect(page.locator('#whatsapp-quote')).toBeVisible();await expect(page.locator('#email-quote')).toBeVisible();
 await page.locator('#whatsapp-quote').click();expect(await page.evaluate(()=>window.handoffs.length)).toBe(0);
 await page.locator('#email-quote').click();expect(await page.evaluate(()=>window.handoffs.length)).toBe(0);
 await page.locator('[name=name]').fill('اختبار درعوزي');await page.locator('[name=phone]').fill('+963 944 123 456');await page.locator('#whatsapp-quote').click();
 await expect(page.locator('#quote-result')).toBeVisible();await expect(page.locator('#message-preview')).toHaveValue(/اختبار درعوزي/);
 const wa=await page.evaluate(()=>window.handoffs[0]);expect(wa.href).toMatch(/^https:\/\/wa.me\/971506497817\?text=/);expect(wa.target).toBe('_blank');expect(wa.rel).toContain('noopener');
 const waText=new URL(wa.href).searchParams.get('text');expect(waText).toContain('اختبار درعوزي');expect(waText).toContain('-25°C');expect(waText).toContain('+963 944 123 456');
 await page.locator('#quote-details').fill('تفاصيل جديدة & أبعاد 5 × 4');await expect(page.locator('#quote-result')).toBeHidden();
 await page.locator('#email-quote').click();const email=await page.evaluate(()=>window.handoffs[1].href);expect(email).toContain('mailto:h.darouzi@gmail.com');expect(new URL(email).searchParams.get('body')).toContain('تفاصيل جديدة & أبعاد 5 × 4');expect(await page.evaluate(()=>window.handoffs.length)).toBe(2);
 let axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 await page.keyboard.press('Escape');await expect(page.locator('#temperature-quote')).toBeFocused();
 await page.locator('#language').click();await expect(page.locator('html')).toHaveAttribute('dir','ltr');await expect(page.locator('h1')).toContainText('Engineered cold');await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','en');
 for(const width of [1440,1024,768,390,320]){
  await page.setViewportSize({width,height:900});await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(200);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.setViewportSize({width:390,height:844});await page.locator('.menu-toggle').click();await expect(page.locator('#mobile-menu')).toBeVisible();await page.locator('#mobile-menu a[href="#products"]').click();await expect(page.locator('#mobile-menu')).toBeHidden();
 await page.locator('#language').click();await expect(page.locator('html')).toHaveAttribute('lang','ar');
 await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(500);await page.screenshot({path:'test-results/mobile-ar.png'});
 for(let y=0;y<8000;y+=700){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(70);}
 await page.waitForTimeout(500);expect(await page.evaluate(()=>[...document.images].filter(i=>i.currentSrc&&i.complete&&i.naturalWidth===0).map(i=>i.src))).toEqual([]);
 axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();await writeFile('test-results/accessibility.json',JSON.stringify(axe.violations,null,2));expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 await page.setViewportSize({width:1440,height:1000});for(let y=0;y<7000;y+=600){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(80);}await page.evaluate(()=>window.scrollTo(0,0));await page.locator('h1').click();await page.waitForTimeout(700);await page.screenshot({path:'test-results/desktop-ar.png',fullPage:true});
 await page.locator('#language').click();await page.screenshot({path:'test-results/desktop-en.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await expect(page.locator('h1')).toBeVisible();expect(await page.locator('.hero-content').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 expect(errors).toEqual([]);console.log('PASS: six service quote paths, keyboard tabs, product filters, product inquiries, temperature transfer, email/WhatsApp handoff, modal focus, both languages, persistence, mobile menu, five viewport widths, images, reduced motion and WCAG A/AA scans.');
} finally {await browser.close();}
