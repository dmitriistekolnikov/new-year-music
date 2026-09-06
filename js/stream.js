(() => {
  const $=s=>document.querySelector(s);
  function videoId(url){try{const u=new URL(url);if(u.hostname==='youtu.be')return u.pathname.slice(1);if(u.hostname.includes('youtube.com')){if(u.pathname==='/watch')return u.searchParams.get('v');const m=u.pathname.match(/\/(?:live|shorts|embed)\/([^/?]+)/);return m?.[1]||null;}}catch{}return null;}
  async function load(){try{const d=await fetch('/api/stream').then(r=>r.json());const id=videoId(d.url||'');const frame=$('#youtube-stream-frame'), empty=$('#stream-empty'), status=$('#stream-status');if(id){frame.src='https://www.youtube.com/embed/'+encodeURIComponent(id)+'?autoplay=0&rel=0';frame.hidden=false;empty.hidden=true;status.textContent='Стрим доступен';}else{frame.removeAttribute('src');frame.hidden=true;empty.hidden=false;status.textContent='Стрим не настроен';}}catch{}}
  function init(){const b=$('#youtube-stream-btn'),m=$('#youtube-stream-modal');if(!b||!m)return;b.onclick=async()=>{await load();m.classList.add('visible');document.body.classList.add('modal-open')};load();}
  window.loadYouTubeStream=load;document.addEventListener('DOMContentLoaded',init);
})();
