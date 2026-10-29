/** Runs in <head>. Applies the reading view's saved theme; then, on the home page only: WebGL 2 on a real GPU gets the room. A software renderer (SwiftShader,
 *  llvmpipe) would pin the CPU, so it gets the plain page, like ?plain=1 does. ?room=1 forces it. */
export const ROOM_SCRIPT = `(function(){try{
try{var th=localStorage.getItem('plain.theme');if(th==='light'||th==='dark')document.documentElement.setAttribute('data-theme',th);}catch(e){}
var q=location.search,d=document.documentElement;
if(location.pathname!=='/'||/[?&]plain=1/.test(q))return;
var c=document.createElement('canvas'),g=c.getContext('webgl2');if(!g)return;
if(!/[?&]room=1/.test(q)){var e=g.getExtension('WEBGL_debug_renderer_info'),r=String(g.getParameter(e?e.UNMASKED_RENDERER_WEBGL:g.RENDERER)||'');
if(/swiftshader|llvmpipe|softpipe|lavapipe|software|basic render/i.test(r))return;}
d.classList.add('room');}catch(e){}})();`;
