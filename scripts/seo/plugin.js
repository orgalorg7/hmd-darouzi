import {readFile,writeFile,mkdir,stat,readdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {renderFaqPage,renderHome,renderPrivacyPage,renderServicePage,routes,sitemap,siteOrigin} from './render.js';
import {applySecurityHeaders,blockedCrawlers,headersFile,securityText} from './security.js';
export function seoPlugin(env){
 const origin=siteOrigin(env.SITE_URL),verification=env.GOOGLE_SITE_VERIFICATION||'';
 if(env.SEO_REQUIRE_DOMAIN==='1'&&!origin)throw new Error('Set SITE_URL to the purchased permanent HTTPS domain before building for indexing.');
 let config;
 const crawlers=`${blockedCrawlers.map(agent=>`User-agent: ${agent}`).join('\n')}\nDisallow: /\n\n`;
 const robots=()=>crawlers+(origin?`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`:'User-agent: *\nAllow: /\n# Preview pages use noindex until SITE_URL is configured.\n');
 const missing=()=>`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, follow"><title>الصفحة غير موجودة | HMD Darouzi</title><link rel="stylesheet" href="/assets/service-guide.css"></head><body><main><section class="guide-details"><div><p class="eyebrow">404 · HMD DAROUZI</p><h1>الصفحة غير موجودة</h1><p lang="en" dir="ltr">This page could not be found.</p><a class="primary" href="/">الرئيسية</a> <a class="secondary" href="/en/" lang="en">English home</a></div></section></main></body></html>`;
 return {name:'darouzi-static-seo',configResolved(c){config=c;},transformIndexHtml:{order:'pre',handler(html,ctx){return renderHome(html,{lang:ctx.path.startsWith('/en')?'en':'ar',origin,verification});}},
 configureServer(server){server.middlewares.use(async(req,res,next)=>{
  const path=new URL(req.url,'http://local').pathname;
  if(path==='/robots.txt'){res.setHeader('Content-Type','text/plain');res.end(robots());return;}
  if(path==='/.well-known/security.txt'){res.setHeader('Content-Type','text/plain; charset=utf-8');res.end(securityText(origin));return;}
  if(path==='/sitemap.xml'){res.setHeader('Content-Type',origin?'application/xml':'text/plain');res.statusCode=origin?200:404;res.end(origin?sitemap(origin):'No sitemap for a preview build.');return;}
  const route=routes.find(r=>r.path===path);
  const renderPage=route?.service?renderServicePage:route?.privacy?renderPrivacyPage:route?.faq?renderFaqPage:null;
  if(renderPage){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(renderPage({...route,origin,verification}));return;}
  if(path==='/en/'){try{const html=await server.transformIndexHtml(path,await readFile(resolve(config.root,'index.html'),'utf8'));res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);}catch(e){next(e);}return;}
  next();
 });},
 configurePreviewServer(server){server.middlewares.use(async(req,res,next)=>{
  const path=new URL(req.url,'http://local').pathname;
  const known=routes.some(r=>r.path===path||r.path+'index.html'===path||r.path.slice(0,-1)===path);
  let fileExists=false;
  if(!known){try{const out=resolve(config.root,config.build.outDir),file=resolve(out,'.'+decodeURIComponent(path));fileExists=file.startsWith(out+'/')&&(await stat(file)).isFile();}catch{}}
  // Preview responses carry the production headers, so tests exercise the deployed policy.
  applySecurityHeaders(res,path,origin,!known&&!fileExists);
  if(!known&&!fileExists){
   res.statusCode=404;res.setHeader('Content-Type','text/html; charset=utf-8');res.end(missing());return;
  }
  next();
 });},
 async closeBundle(){if(config.command!=='build')return;
  const out=resolve(config.root,config.build.outDir),html=await readFile(resolve(out,'index.html'),'utf8');
  for(const route of routes){if(route.path==='/')continue;const file=resolve(out,'.'+route.path,'index.html');await mkdir(dirname(file),{recursive:true});await writeFile(file,route.service?renderServicePage({...route,origin,verification}):route.privacy?renderPrivacyPage({...route,origin,verification}):route.faq?renderFaqPage({...route,origin,verification}):renderHome(html,{...route,origin,verification}));}
  await writeFile(resolve(out,'robots.txt'),robots());
  if(origin)await writeFile(resolve(out,'sitemap.xml'),sitemap(origin));
  await writeFile(resolve(out,'404.html'),missing());
  await mkdir(resolve(out,'.well-known'),{recursive:true});await writeFile(resolve(out,'.well-known/security.txt'),securityText(origin));
  const immutable=(await readdir(resolve(out,'assets'))).filter(name=>/-[a-zA-Z0-9_-]{8}\.(js|css)$/.test(name)).map(name=>`/assets/${name}\n  Cache-Control: public, max-age=31536000, immutable\n`).join('');
  await writeFile(resolve(out,'_headers'),headersFile(origin,immutable));
  console.log(`SEO: ${routes.length} static Arabic/English pages. ${origin?'Indexable domain: '+origin:'Preview: noindex; set SITE_URL for canonical URLs and sitemap.'}`);
 }};
}
