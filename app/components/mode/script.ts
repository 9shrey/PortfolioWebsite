export const KEY = "mode";

/** Inlined into <head>. Keep it tiny and dependency-free. */
export const MODE_SCRIPT = `(function(){var d=document.documentElement,m="pro";try{var q=new URLSearchParams(location.search).get("mode");if(q==="fun"||q==="pro"){m=q;localStorage.setItem("${KEY}",q)}else if(localStorage.getItem("${KEY}")==="fun")m="fun"}catch(e){}d.dataset.mode=m;try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)d.dataset.motion="on"}catch(e){}})()`;
