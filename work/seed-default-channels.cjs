const fs=require('fs');let s=fs.readFileSync('mosaico.html','utf8');
s=s.replace("const players=new Map();let videos=[]", "const players=new Map();let catalogLoaded=true,videos=[]");
s=s.replace("}catch{$('storageNotice').textContent='No se pudo recuperar el catálogo. El guardado anterior no se modifica hasta que guardes cambios.'}", "}catch{catalogLoaded=false;$('storageNotice').textContent='No se pudo recuperar el catálogo. El guardado anterior no se modifica hasta que guardes cambios.'}");
const marker='// Radios do not reconnect automatically on page load; only one can be selected.';
const seed=`// Add the default news channels once without replacing a user's existing catalog.
const DEFAULT_CHANNELS=[
 {title:'A24',url:'ArKbAx1K-2U',active:true},
 {title:'LN+',url:'FEWZjXJ7M0c',active:true},
 {title:'TN',url:'cb12KmMMDJA',active:true},
 {title:'Crónica',url:'hw4uHyct4vg',active:true},
 {title:'26',url:'C_RnFD6xiX8',active:true},
 {title:'CNN',url:'Qr61waJ6AZg',active:true}
];
try{if(catalogLoaded&&localStorage.getItem(KEY+'.defaultNews.v1')!=='1'){const known=new Set(videos.filter(v=>v.type==='youtube').map(v=>v.url));let added=0;for(const channel of DEFAULT_CHANNELS){if(known.has(channel.url))continue;videos.push({id:'s_'+crypto.randomUUID().replaceAll('-',''),type:'youtube',url:channel.url,title:channel.title,active:channel.active,listIds:[],imported:false});known.add(channel.url);added++}localStorage.setItem(KEY+'.defaultNews.v1','1');if(added)save()}}catch{}
`;
if(!s.includes(marker))throw Error('seed insertion point missing');s=s.replace(marker,seed+marker);
for(const f of ['mosaico.html','out/index.html','public/index.html'])fs.writeFileSync(f,s);
console.log('Added one-time default channel seeding.');
