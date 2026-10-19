import {readFile, writeFile, copyFile} from 'node:fs/promises';

// Tabler outline originals, kept as one tiny static asset. No client icon library.
const names = ['bolt','arrow-right','arrow-up','arrow-down','rotate','rotate-clockwise','restore','zoom-in','zoom-out','zoom-reset','language','menu-2','x','plus','check','file-type-pdf','mail','phone','adjustments-horizontal','tool','door','door-enter','box','box-model','stack-2','brand-whatsapp','ruler-measure','apple','vaccine-bottle','building-factory-2','propeller','minus','clipboard-list','search','arrows-maximize','brand-facebook','brand-instagram','phone-call','building-warehouse'];
const symbols = await Promise.all(names.map(async name => {
  const svg = await readFile(new URL(`../node_modules/@tabler/icons/icons/outline/${name}.svg`, import.meta.url), 'utf8');
  const body = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
  return `<symbol id="${name}" viewBox="0 0 24 24">${body}</symbol>`;
}));
await writeFile(new URL('../public/assets/interface-icons.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg"><!-- Tabler Icons, MIT license; see tabler-license.txt -->${symbols.join('')}</svg>\n`);
await copyFile(new URL('../node_modules/@tabler/icons/LICENSE', import.meta.url), new URL('../public/assets/tabler-license.txt', import.meta.url));
