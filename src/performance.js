// Live 3D is the default; the light preview is used only when chosen or when WebGL fails.
export function constrainedHardware() {
 return (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) ||
  (navigator.deviceMemory > 0 && navigator.deviceMemory <= 4);
}
let preference = 'full';
try {const saved=localStorage.getItem('darouzi-quality');if(['lite','full'].includes(saved))preference=saved;}catch{}
export function isLite() {
 return preference==='lite';
}
function apply() {
 document.documentElement.dataset.performance=isLite()?'lite':constrainedHardware()?'balanced':'full';
 window.dispatchEvent(new CustomEvent('darouzi:quality',{detail:{lite:isLite()}}));
}
export function setQuality(next, persist = true) {
 preference=next;
 if(persist)try{localStorage.setItem('darouzi-quality',next);}catch{}
 apply();
}
apply();
