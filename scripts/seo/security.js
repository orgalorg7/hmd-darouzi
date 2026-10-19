// One HTTP security policy for Cloudflare's _headers file and the local preview server.
// Every page loads only its own files: no inline code, eval, third-party scripts, frames or plugins.
export const sitePolicy="default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'";
// Service guides, the FAQ, the privacy notice and the 404 page are plain documents, so they also forbid scripts entirely.
export const documentPolicy="default-src 'none'; style-src 'self'; img-src 'self'; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
export const documentPaths=['/services/*','/en/services/*','/faq/*','/en/faq/*','/privacy/*','/en/privacy/*'];
// The PDF opens in the browser's own viewer; a page policy there can break rendering.
export const profilePath='/hmd-darouzi-profile.pdf';
const disabledFeatures=['accelerometer','browsing-topics','camera','display-capture','geolocation','gyroscope','hid','idle-detection','magnetometer','microphone','midi','payment','publickey-credentials-get','screen-wake-lock','serial','usb','xr-spatial-tracking'];
export function securityHeaders(origin){
 return {
  'Content-Security-Policy':sitePolicy,'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'same-origin',
  'Permissions-Policy':disabledFeatures.map(feature=>`${feature}=()`).join(', '),
  // Other origins cannot open a window handle to the site or embed its files (no hotlinking).
  'Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Resource-Policy':'same-origin','X-Permitted-Cross-Domain-Policies':'none',
  ...(origin?{'Strict-Transport-Security':'max-age=63072000; includeSubDomains; preload'}:{'X-Robots-Tag':'noindex, follow'})
 };
}
// Cloudflare joins repeated headers with commas; browsers enforce every listed policy, so guides get the stricter one.
export function headersFile(origin,immutable){
 const lines=Object.entries(securityHeaders(origin)).map(([name,value])=>`  ${name}: ${value}\n`).join('');
 return `${immutable}/*\n${lines}${documentPaths.map(path=>`${path}\n  Content-Security-Policy: ${documentPolicy}\n`).join('')}${profilePath}\n  ! Content-Security-Policy\n`;
}
export function applySecurityHeaders(res,path,origin,plainDocument=false){
 for(const [name,value] of Object.entries(securityHeaders(origin)))res.setHeader(name,value);
 if(path===profilePath)res.removeHeader('Content-Security-Policy');
 else if(plainDocument||/^\/(en\/)?(services|faq|privacy)\//.test(path))res.setHeader('Content-Security-Policy',[sitePolicy,documentPolicy]);
}
// RFC 9116: a private route for vulnerability reports. Rebuild before it expires.
export function securityText(origin,now=new Date()){
 const expires=new Date(now.getTime()+360*864e5);expires.setUTCHours(0,0,0,0);
 return `Contact: mailto:h.darouzi@gmail.com\nExpires: ${expires.toISOString().replace('.000Z','Z')}\nPreferred-Languages: ar, en\n${origin?`Canonical: ${origin}/.well-known/security.txt\n`:''}`;
}
// Bulk scrapers and offline site copiers that honor robots.txt. Search engines, link previews and AI assistants
// (ChatGPT, Claude, Gemini and others) stay allowed so the company can be found and described accurately there.
export const blockedCrawlers=['Bytespider','Diffbot','Omgilibot','ImagesiftBot','img2dataset','HTTrack','Wget','WebCopier','WebZIP','Teleport','TeleportPro','Offline Explorer','SiteSnagger','WebStripper','WebReaper'];
