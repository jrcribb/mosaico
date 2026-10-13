const fs=require('fs');let s=fs.readFileSync('mosaico.html','utf8');s=s.replace('<button id="iptvButton" type="button"></button>','<button id="iptvButton" type="button"></button><button id="detachWindow" type="button"></button>');s=s.replace('padding-left:188px','padding-left:225px').replace('padding-left:188px','padding-left:225px');s=s.replace("initIptv();setIcon",`let detachedWindow=null;
setIcon($('detachWindow'),'external','Separar ventana');
$('detachWindow').onclick=()=>{
 try{
  if(detachedWindow&&!detachedWindow.closed){detachedWindow.focus();return}
  const width=Math.min(1200,screen.availWidth||1200),height=Math.min(800,screen.availHeight||800);
  detachedWindow=window.open(location.href,'mosaico_detached','popup=yes,width='+width+',height='+height+',resizable=yes,scrollbars=no');
  if(!detachedWindow){toast('El navegador bloqueó la ventana. Permití las ventanas emergentes para este sitio y volvé a intentar.');return}
  silenceAll();detachedWindow.focus();
 }catch{toast('No se pudo abrir la ventana independiente en este navegador.')}
};
initIptv();setIcon`);new Function(s.match(/<script>([\s\S]*?)<\/script>/)[1]);for(const file of ['mosaico.html','out/index.html','public/index.html'])fs.writeFileSync(file,s);console.log('Icon button added; JavaScript syntax valid.');
