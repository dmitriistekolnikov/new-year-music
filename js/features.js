/* === НОВОГОДНИЙ ЧАТ: V9 INTERACTIVE PACK === */
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const safe = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const api = async (path, options={}) => {
    const r = await fetch('/api' + path, { cache:'no-store', ...options, headers:{'Content-Type':'application/json', ...(options.headers||{})} });
    const d = await r.json().catch(()=>({}));
    if (!r.ok) throw new Error(d.message || d.error || 'Ошибка API');
    return d;
  };

  function toast(title, message, type='info') {
    if (window.toast?.show) return window.toast.show(title, message, type, 2800);
    console.log(title, message);
  }

  /* 1-10: атмосферные визуальные эффекты */
  class HolidayFX {
    constructor() {
      this.canvas = null; this.ctx = null; this.id = null; this.last = 0;
      this.stars = []; this.ice = []; this.santa = null;
      this.init();
    }
    init() {
      const c = document.createElement('canvas'); c.id='holiday-fx-canvas';
      document.body.appendChild(c); this.canvas=c; this.ctx=c.getContext('2d');
      this.resize(); addEventListener('resize',()=>this.resize(),{passive:true});
      this.draw();
      this.iceEdges();
      this.tree();
      this.randomSanta();
      this.reindeer();
    }
    resize(){ this.canvas.width=innerWidth*devicePixelRatio; this.canvas.height=innerHeight*devicePixelRatio; this.canvas.style.width=innerWidth+'px'; this.canvas.style.height=innerHeight+'px'; this.ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); }
    draw(){
      const w=innerWidth,h=innerHeight,ctx=this.ctx; ctx.clearRect(0,0,w,h);
      const t=performance.now()/1000;
      /* созвездия */
      if (!this.stars.length) for(let i=0;i<48;i++) this.stars.push({x:Math.random()*w,y:Math.random()*h*.65,r:.6+Math.random()*1.5,p:Math.random()*6.28});
      ctx.save(); ctx.globalAlpha=.48;
      for(let i=0;i<this.stars.length;i++){ const a=this.stars[i]; ctx.beginPath(); ctx.arc(a.x,a.y,a.r*(.75+.25*Math.sin(t*1.4+a.p)),0,7); ctx.fillStyle='#fff'; ctx.fill();
        for(let j=i+1;j<this.stars.length;j++){const b=this.stars[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy); if(d<115){ctx.strokeStyle=`rgba(180,210,255,${(1-d/115)*.16})`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}
      } ctx.restore();
      /* ёлка из частиц */
      if(this.treeParticles?.length){ctx.save();this.treeParticles.forEach(p=>{p.y+=p.v;if(p.y>p.baseY+10)p.y=p.baseY-20;ctx.fillStyle=`rgba(80,180,120,${p.a})`;ctx.fillRect(p.x,p.y,p.s,p.s)});ctx.restore();}
      this.id=requestAnimationFrame(()=>this.draw());
    }
    tree(){
      const n=110, baseX=innerWidth-100, baseY=innerHeight-60;
      this.treeParticles=Array.from({length:n},()=>{const y=baseY-Math.random()*230; const width=(baseY-y)*.45+15; return {baseY:y,x:baseX+(Math.random()-.5)*width,y:y-Math.random()*25,s:1+Math.random()*3,v:.1+Math.random()*.35,a:.15+Math.random()*.6};});
    }
    iceEdges(){
      const el=document.createElement('div'); el.id='ice-edges';
      el.innerHTML='<i></i><i></i><i></i><i></i>'; document.body.appendChild(el);
    }
    randomSanta(){
      setTimeout(()=>this.spawnSanta(), 35000+Math.random()*65000);
      setInterval(()=>{ if(Math.random()<.32) this.spawnSanta(); }, 120000);
    }
    spawnSanta(){
      if($('.holiday-santa')) return;
      const el=document.createElement('div');el.className='holiday-santa';el.textContent='🎅🛷';document.body.appendChild(el);
      setTimeout(()=>el.remove(),11000);
    }
    reindeer(){
      setInterval(()=>{if(Math.random()<.25&&!$('.holiday-reindeer')){const el=document.createElement('div');el.className='holiday-reindeer';el.textContent='🦌 🦌 🦌';document.body.appendChild(el);setTimeout(()=>el.remove(),9000);}},150000);
    }
  }

  /* 16-24: чат */
  const reactions=['❤️','🎄','😂','🔥','🎁','✨'];
  let currentReactionMessage=null;
  async function loadReactions(msgId, node){
    try{
      const d=await api(`/reactions/${encodeURIComponent(msgId)}`);
      const box=node.querySelector('.message-reactions'); if(!box)return;
      box.innerHTML='';
      d.reactions.forEach(r=>{
        const b=document.createElement('button');b.className='reaction-pill';b.textContent=`${r.emoji} ${r.count}`;
        b.onclick=()=>toggleReaction(msgId,r.emoji,node);box.appendChild(b);
      });
    }catch{}
  }
  async function toggleReaction(id,emoji,node){
    if(!db?.currentNick){toast('Вход нужен','Войди, чтобы ставить реакции','warning');return;}
    try{await api('/reactions',{method:'POST',body:JSON.stringify({message_id:id,nick:db.currentNick,emoji})});loadReactions(id,node);}catch(e){toast('Ошибка',e.message,'error');}
  }
  function enhanceMessages(){
    $$('#chat-messages > div').forEach((node)=>{
      if(node.dataset.enhanced==='1')return;
      node.dataset.enhanced='1';
      node.classList.add('chat-message-enhanced');
      const img=node.querySelector('img[src^="data:image"], img[src*="/uploads/"]');
      if(img){
        img.loading='lazy';img.classList.add('chat-photo');img.addEventListener('click',()=>openPhoto(img.src));
        /* Умная оптимизация старых фото: уменьшаем декодируемую копию на экране,
           не меняя оригинал в БД. */
        if((img.src||'').length>1200000) img.addEventListener('load',()=>{
          try{
            if(img.dataset.optimized)return;
            const max=1400;if(img.naturalWidth<=max)return;
            const scale=max/img.naturalWidth,c=document.createElement('canvas');c.width=max;c.height=Math.round(img.naturalHeight*scale);
            c.getContext('2d').drawImage(img,0,0,c.width,c.height);img.src=c.toDataURL('image/jpeg',.76);img.dataset.optimized='1';
          }catch{}
        },{once:true});
      }
      const id=node.dataset.messageId;
      if(id && !node.querySelector('.message-reaction-row')){
        const row=document.createElement('div');row.className='message-reaction-row';
        const add=document.createElement('button');add.className='reaction-add';add.textContent='😊';add.title='Реакция';
        const box=document.createElement('span');box.className='message-reactions';
        add.onclick=()=>{currentReactionMessage=id;openReactionPicker(add,id,node)};
        row.append(add,box);node.appendChild(row);loadReactions(id,node);
      }
    });
  }
  function openReactionPicker(anchor,id,node){
    let p=$('.reaction-picker');if(p)p.remove();p=document.createElement('div');p.className='reaction-picker';
    reactions.forEach(e=>{const b=document.createElement('button');b.textContent=e;b.onclick=()=>{toggleReaction(id,e,node);p.remove()};p.appendChild(b)});
    document.body.appendChild(p);const r=anchor.getBoundingClientRect();p.style.left=Math.min(r.left,innerWidth-220)+'px';p.style.top=(r.bottom+6)+'px';
  }
  function openPhoto(src){
    const m=$('#photo-lightbox');if(!m)return;
    $('#photo-lightbox-img').src=src;m.classList.add('visible');document.body.classList.add('modal-open');
  }
  function initChatEnhancer(){
    const c=$('#chat-messages');if(!c)return;
    const obs=new MutationObserver(enhanceMessages);obs.observe(c,{childList:true});
    enhanceMessages();
    c.addEventListener('click',e=>{const img=e.target.closest('.chat-photo');if(img)openPhoto(img.src);});
  }

  /* 17-18,21: карточка, достижения, streak */
  async function openProfile(nick){
    try{
      const d=await api(`/profile?nick=${encodeURIComponent(nick)}`);
      const m=$('#profile-modal'); if(!m)return;
      $('#profile-content').innerHTML=`
        <div class="profile-avatar">${safe(nick).slice(0,1).toUpperCase()}</div>
        <h2>${safe(nick)}</h2>
        <div class="profile-grid">
          <b>💬 ${d.messages}</b><span>сообщений</span><b>🔥 ${d.streak}</b><span>дней streak</span>
          <b>📸 ${d.photos}</b><span>фото</span><b>🏆 ${d.achievements.length}</b><span>достижений</span>
        </div>
        <div class="achievement-list">${d.achievements.map(a=>`<span title="${safe(a.description)}">${a.icon} ${safe(a.name)}</span>`).join('')}</div>`;
      m.classList.add('visible');document.body.classList.add('modal-open');
    }catch(e){toast('Профиль','Не удалось загрузить карточку','error');}
  }
  function initProfiles(){
    const c=$('#chat-messages'); if(!c)return;
    c.addEventListener('click',e=>{const n=e.target.closest('[data-profile-nick]');if(n)openProfile(n.dataset.profileNick)});
  }

  /* 19,28,29: подарки */
  function dailyGift(){
    const key='dailyGift-'+new Date().toISOString().slice(0,10);
    if(localStorage.getItem(key))return;
    setTimeout(()=>{
      const g=document.createElement('button');g.className='secret-gift';g.textContent='🎁';g.title='Тайный подарок дня';document.body.appendChild(g);
      g.onclick=()=>{localStorage.setItem(key,'1');g.remove();const p=PREDICTIONS[Math.floor(Math.random()*PREDICTIONS.length)];toast('🎁 Тайный подарок',p,'success');window.createClickParticles?.(innerWidth/2,innerHeight/2,45);};
    },12000+Math.random()*30000);
  }
  function secretCommands(){
    const input=$('#letter-text');if(!input)return;
    input.addEventListener('keydown',e=>{
      if(e.key!=='Enter')return;
      const v=input.value.trim().toLowerCase();
      if(v==='/snowstorm'){window.createClickParticles?.(innerWidth/2,innerHeight/2,120);toast('❄️ Снежный вихрь','Секретная команда активирована','info');}
      if(v==='/fireworks'){window.fireworks?.launchRegular?.();toast('🎆 Фейерверк','Команда принята','success');}
      if(v==='/predict'){toast('🔮 Предсказание',PREDICTIONS[Math.floor(Math.random()*PREDICTIONS.length)],'info');}
    });
  }

  /* 30-34: общая ёлка и Новый год */
  async function treeState(){
    try{return await api('/tree')}catch{return {stars:[],total:0}}
  }
  async function addTreeStar(){
    if(!db?.currentNick){toast('Вход нужен','Войди, чтобы добавить звезду','warning');return;}
    try{const d=await api('/tree/star',{method:'POST',body:JSON.stringify({nick:db.currentNick})});renderTree(d);}
    catch(e){toast('Ёлка',e.message,'error');}
  }
  function renderTree(d){
    let el=$('#community-tree');if(!el)return;
    const stars=(d.stars||[]).map((s,i)=>`<span style="left:${s.x}%;top:${s.y}%" title="${safe(s.nick)}">⭐</span>`).join('');
    el.innerHTML=`<div class="tree-art">🎄</div><div class="tree-stars">${stars}</div><div class="tree-count">⭐ ${d.total||0} звёзд от сообщества</div><button class="btn tree-star-btn" id="add-tree-star">⭐ Добавить свою звезду</button>`;
    $('#add-tree-star')?.addEventListener('click',addTreeStar);
  }
  async function initCommunityTree(){const el=$('#community-tree');if(!el)return;renderTree(await treeState());setInterval(async()=>renderTree(await treeState()),45000);}
  function midnightMode(){
    const now=new Date(), next=new Date(now.getFullYear()+1,0,1);
    const diff=next-now;
    if(diff<10000&&diff>0) document.body.classList.add('new-year-final');
    if(now.getMonth()===0&&now.getDate()===1){
      document.body.classList.add('new-year-mode');
      const key='ny-modal-shown-'+now.getFullYear();
      if(localStorage.getItem(key)!=='1'){ $('#after-new-year')?.classList.add('visible'); localStorage.setItem(key,'1'); }
    } else { document.body.classList.remove('new-year-mode'); }
  }
  function globalMidnight(){
    const check=async()=>{
      const now=new Date(), year=now.getFullYear();
      if(now.getMonth()===0 && now.getDate()===1 && now.getHours()===0 && now.getMinutes()===0 && now.getSeconds()<10){
        try{await api('/celebration',{method:'POST',body:JSON.stringify({year})});}catch{}
      }
      try{
        const d=await api(`/celebration?year=${year}`);
        if(d.celebration && localStorage.getItem('ny-midnight')!==String(year)){
          localStorage.setItem('ny-midnight',String(year));
          if(window.fireworks?.megaFireworks)window.fireworks.megaFireworks();
        }
      }catch{}
    };
    setInterval(check,5000);check();
  }

  /* 23: красивое уведомление о новых сообщениях + лёгкий realtime-poll */
  let lastSeenMessageId = 0;
  let initialMessageIds = new Set();
  let notificationTimer = null;
  function showNewMessageNotification(msg){
    const el=$('#new-message-notification'); if(!el)return;
    const nick=safe(msg.nick||'Новый пользователь');
    const text=safe((msg.text||'📨 Новое сообщение').slice(0,90));
    el.innerHTML=`💬 <strong>${nick}</strong>: ${text}`;
    el.classList.add('visible');
    clearTimeout(notificationTimer); notificationTimer=setTimeout(()=>el.classList.remove('visible'),3200);
    if(document.hidden && 'Notification' in window && Notification.permission==='granted'){
      try{new Notification('НовыйГодЧат',{body:`${msg.nick}: ${msg.text||'Новое сообщение'}`});}catch{}
    }
  }
  async function pollNewMessages(){
    try{
      const list=await db.getMessages(50);
      const fresh=list.filter(m=>Number(m.id)>lastSeenMessageId).sort((a,b)=>Number(a.id)-Number(b.id));
      for(const msg of fresh){
        lastSeenMessageId=Math.max(lastSeenMessageId,Number(msg.id)||0);
        if(initialMessageIds.has(msg.id))continue;
        if(typeof window.appendMessageToChat==='function') window.appendMessageToChat(msg);
        if(msg.nick!==db.currentNick) showNewMessageNotification(msg);
      }
    }catch{}
  }
  function initMessageNotifications(){
    const c=$('#chat-messages'); if(!c)return;
    const existing=[...c.querySelectorAll('[data-message-id]')].map(n=>Number(n.dataset.messageId)).filter(Boolean);
    existing.forEach(id=>initialMessageIds.add(id));
    lastSeenMessageId=Math.max(0,...existing);
    setInterval(pollNewMessages,5000);
    if('Notification' in window && Notification.permission==='default'){
      // Разрешение спрашивается только после явного взаимодействия пользователя с чатом.
      c.addEventListener('click',()=>{ if(Notification.permission==='default') Notification.requestPermission().catch(()=>{}); },{once:true});
    }
  }

  /* 11-15: музыка */

  function initMeteorShower(){
    const c=document.createElement('canvas');c.id='meteor-canvas';document.body.appendChild(c);const x=c.getContext('2d');
    const resize=()=>{c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';x.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)};resize();addEventListener('resize',resize,{passive:true});
    let meteors=[];let last=0;let enabled=false;c.style.opacity='0';window.setMeteorEnabled=v=>{enabled=!!v;c.style.opacity=enabled?'1':'0'};
    const spawn=()=>{meteors.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight*.45,vx:7+Math.random()*8,vy:4+Math.random()*6,len:70+Math.random()*100,a:1});};
    const loop=t=>{if(!enabled){requestAnimationFrame(loop);return}if(t-last>650){last=t;spawn()}x.clearRect(0,0,innerWidth,innerHeight);meteors=meteors.filter(m=>m.a>0&&m.x<innerWidth+200&&m.y<innerHeight+200);meteors.forEach(m=>{x.strokeStyle=`rgba(220,240,255,${m.a})`;x.lineWidth=2;x.shadowBlur=14;x.shadowColor='#fff';x.beginPath();x.moveTo(m.x,m.y);x.lineTo(m.x-m.vx*m.len/8,m.y-m.vy*m.len/8);x.stroke();m.x+=m.vx;m.y+=m.vy;m.a-=.018});requestAnimationFrame(loop)};requestAnimationFrame(loop);
  }

  function musicNight(){
    const btn=$('#music-night-btn');if(!btn)return;
    btn.onclick=()=>{document.body.classList.toggle('music-night');localStorage.setItem('musicNight',document.body.classList.contains('music-night'));};
    if(localStorage.getItem('musicNight')==='true')document.body.classList.add('music-night');
  }

  /* Обёртка для старой функции appendMessage: добавляем id/профиль */
  const oldAppend=window.appendMessageToChat;
  if(oldAppend){
    window.appendMessageToChat=function(msg){
      oldAppend(msg);
      const nodes=$$('#chat-messages > div');const n=nodes[nodes.length-1];
      if(n){if(msg.id)n.dataset.messageId=msg.id;if(msg.nick&&!msg.system){const name=n.querySelector('span[style*="font-weight"]');if(name){name.dataset.profileNick=msg.nick;name.style.cursor='pointer';}}}
      setTimeout(enhanceMessages,0);
    };
  }

  document.addEventListener('DOMContentLoaded',()=>{
    try{
      new HolidayFX();
      initMeteorShower();
      initChatEnhancer();initProfiles();initMessageNotifications();dailyGift();secretCommands();initCommunityTree();musicNight();globalMidnight();
      $$('.modal-close,[data-close-modal]').forEach(b=>b.onclick=()=>b.closest('.ui-modal')?.classList.remove('visible'));
      $('#photo-lightbox')?.addEventListener('click',e=>{if(e.target.id==='photo-lightbox'||e.target.closest('.modal-close')){e.currentTarget.classList.remove('visible');document.body.classList.remove('modal-open')}});
      $('#profile-modal')?.addEventListener('click',e=>{if(e.target.id==='profile-modal'||e.target.closest('.modal-close')){e.currentTarget.classList.remove('visible');document.body.classList.remove('modal-open')}});
      $('#wall-of-fame-btn')?.addEventListener('click',()=>window.wallOfFame?.open?.());
      $('#tree-open-btn')?.addEventListener('click',()=>$('#tree-modal')?.classList.add('visible'));
      $('#after-new-year-close')?.addEventListener('click',()=>$('#after-new-year')?.classList.remove('visible'));
      setInterval(midnightMode,1000);midnightMode();
    }catch(e){console.error('V9 init',e);}
  });
})();
