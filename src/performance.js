// Live 3D always; the still preview appears only when WebGL is unavailable or the GPU is lost.
export function constrainedHardware() {
 return (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) ||
  (navigator.deviceMemory > 0 && navigator.deviceMemory <= 4);
}
let preference = 'full';
export function isLite() {
 return preference==='lite';
}
function apply() {
 document.documentElement.dataset.performance=isLite()?'lite':constrainedHardware()?'balanced':'full';
 window.dispatchEvent(new CustomEvent('darouzi:quality',{detail:{lite:isLite()}}));
}
export function setQuality(next) {
 preference=next;
 apply();
}
apply();
