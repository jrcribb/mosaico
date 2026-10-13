const fs=require('fs');
let html=fs.readFileSync('mosaico-youtube.html','utf8');
html=html.replace('</style>',`#localToast{position:fixed;z-index:50;bottom:12px;left:50%;transform:translateX(-50%);width:max-content;max-width:calc(100vw - 24px);padding:12px 16px;border-radius:10px;background:#25352e;color:#fff;font-size:13px;pointer-events:none}#wake[data-waiting=true]{color:#f2cf83}#youtubeAccount p{line-height:1.5;font-size:14px}#youtubeAccount .row{margin-top:16px}#youtubeAccount a{padding:8px} .catalog-collapsed .card:first-child:not(.focused) .card-top h3{padding-left:152px}@media(max-width:600px){.card:first-child:not(.focused) .card-top h3{padding-left:152px}}</style>`);
html=html.replace('</header>','<button id="wake" type="button" aria-pressed="false"></button><button id="youtubeLogin" type="button"></button></header>');
html=html.replace('<script>',`<div id="localToast" role="status" hidden></div>
<dialog id="youtubeAccount" aria-labelledby="youtubeAccountTitle"><h2 id="youtubeAccountTitle">Tu cuenta de YouTube</h2><p>Iniciá sesión en YouTube con la cuenta que tenga tu suscripción Premium. El acceso se realiza en la página oficial de Google.</p><p>Mosaico no recibe tu contraseña ni puede comprobar tu suscripción. Iniciar sesión no garantiza que Premium se aplique a los reproductores insertados ni que sigan sonando con el celular bloqueado.</p><p>Para escuchar con la pantalla apagada, abrí el video directamente en YouTube con tu cuenta Premium.</p><div class="row"><a id="officialLogin" href="https://accounts.google.com/ServiceLogin?service=youtube&amp;continue=https%3A%2F%2Fwww.youtube.com%2F" target="_blank" rel="noopener noreferrer">Iniciar sesión en YouTube ↗</a><a id="premiumVideo" target="_blank" rel="noopener noreferrer">Abrir video en YouTube ↗</a><a href="https://www.youtube.com/premium" target="_blank" rel="noopener noreferrer">Ver YouTube Premium ↗</a></div><div class="row"><button id="closeAccount" type="button">Cerrar</button></div></dialog>
<script>`);
html=html.replace('const icons={',`const icons={
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',`);
const feature=`
// Wake Lock is opt-in for this session. Never imply that it overrides a manual lock.
let wakeWanted=false,wakeSentinel=null,wakePending=false,toastTimer;
const wakeSupported=window.isSecureContext&&'wakeLock' in navigator;
function toast(message){clearTimeout(toastTimer);$('localToast').textContent=message;$('localToast').hidden=false;toastTimer=setTimeout(()=>$('localToast').hidden=true,7000)}
function paintWake(){const held=!!wakeSentinel&&!wakeSentinel.released;setIcon($('wake'),'sun',held?'Permitir que la pantalla se apague':wakeWanted?'Pantalla encendida en espera · desactivar':'Mantener pantalla encendida');$('wake').setAttribute('aria-pressed',String(held));$('wake').dataset.waiting=String(wakeWanted&&!held);$('wake').disabled=wakePending}
async function acquireWake(){
 if(!wakeWanted||wakePending||wakeSentinel||document.visibilityState!=='visible')return;
 wakePending=true;paintWake();
 try{const sentinel=await navigator.wakeLock.request('screen');
  if(!wakeWanted||document.visibilityState!=='visible'){await sentinel.release();return}
  wakeSentinel=sentinel;sentinel.addEventListener('release',()=>{if(wakeSentinel===sentinel){wakeSentinel=null;paintWake();if(wakeWanted&&document.visibilityState==='visible')toast('El sistema liberó la pantalla. Desactivá y activá el botón para reintentar.')}});
 }catch{wakeWanted=false;toast('No se pudo mantener la pantalla encendida. Revisá el ahorro de batería y usá HTTPS o localhost en un navegador compatible.')}
 finally{wakePending=false;paintWake()}
}
$('wake').onclick=async()=>{
 if(!wakeSupported){toast('Este navegador no permite mantener la pantalla encendida aquí. Probá con HTTPS o localhost y un navegador compatible.');return}
 wakeWanted=!wakeWanted;
 if(wakeWanted){await acquireWake();if(wakeSentinel)toast('Pantalla encendida mientras Mosaico esté visible. El bloqueo manual sigue funcionando.')}
 else{const sentinel=wakeSentinel;wakeSentinel=null;try{await sentinel?.release()}catch{}paintWake();toast('Apagado automático de pantalla permitido.')}
};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&wakeWanted)acquireWake()});
window.addEventListener('pagehide',()=>{const sentinel=wakeSentinel;wakeSentinel=null;sentinel?.release().catch(()=>{})});
window.addEventListener('pageshow',()=>{if(wakeWanted)acquireWake()});
paintWake();setIcon($('youtubeLogin'),'user','Cuenta de YouTube / Premium');
$('youtubeLogin').onclick=()=>{
 const id=audioOwner||videos.find(v=>v.active)?.id;
 const link=$('premiumVideo');link.hidden=!id;
 if(id){const r=players.get(id);let seconds=0;try{seconds=Math.floor(r?.player?.getCurrentTime()||0)}catch{}link.href='https://www.youtube.com/watch?v='+id+(seconds>0?'&t='+seconds+'s':'')}
 $('youtubeAccount').showModal();
};
$('premiumVideo').onclick=()=>{for(const r of players.values())if(r.ready)r.player.mute();audioOwner=null;updateAudio()};
$('closeAccount').onclick=()=>$('youtubeAccount').close();
`;
html=html.replace('// Enumerate balanced row arrangements',feature+'\n// Enumerate balanced row arrangements');
new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
fs.writeFileSync('mosaico-youtube.html',html);
// Keep local entrypoints aligned; no push, saved Site version, or deployment.
for(const file of ['index.html','out/index.html','public/index.html'])if(fs.existsSync(file))fs.writeFileSync(file,html);
console.log('Local HTML and local entrypoints updated. Syntax valid.');
