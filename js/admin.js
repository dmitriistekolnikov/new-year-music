(() => {
  const COMMANDS = [
    ['/snowstorm','❄️ Снежный вихрь'],['/fireworks','🎆 Фейерверк'],['/predict','🔮 Предсказание'],
    ['/aurora','🌌 Северное сияние'],['/galaxy','🪐 Галактика'],['/vortex','🌀 Воронка'],['/meteor','🌠 Метеориты'],
    ['/night','🎧 Музыкальная ночь'],['/gift','🎁 Подарок'],['/tree','🎄 Ёлка']
  ];
  const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const api=async(path,opt={})=>{const r=await fetch('/api'+path,{headers:{'Content-Type':'application/json',...(opt.headers||{})},...opt});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||d.message||'Ошибка сервера');return d;};
  let state=JSON.parse(localStorage.getItem('ny-admin')||'null');
  const save=()=>localStorage.setItem('ny-admin',JSON.stringify(state));
  const commandsFrom=arr=>Array.isArray(arr)?arr:COMMANDS.map(x=>x[0]);
  function sessionHeaders(){return {'X-Admin-Session':state?.session_id||''};}
  function renderCommands(target, selected){
    const el=$(target); if(!el)return; const set=new Set(commandsFrom(selected));
    el.innerHTML=COMMANDS.map(([cmd,label])=>`<label class="admin-command"><input type="checkbox" value="${cmd}" ${set.has(cmd)?'checked':''}><span>${label}</span><code>${cmd}</code></label>`).join('');
  }
  function selected(target){return $$(target+' input:checked').map(x=>x.value)}
  function showPanel(){
    $('#admin-login-view').hidden=!!state; $('#admin-panel-view').hidden=!state;
    if(!state)return;
    $('#admin-role-label').textContent=state.role==='master'?'Главный администратор: Ключник':'Администратор: '+state.nick;
    renderCommands('#admin-command-list',state.commands);
    const master=state.role==='master'; $('#admin-manage-section').hidden=!master;
    if(master){renderCommands('#new-admin-commands',COMMANDS.map(x=>x[0])); loadAdmins();}
    loadStreamForAdmin();
  }
  async function login(){
    const nick=$('#admin-nick').value.trim(), password=$('#admin-password').value;
    $('#admin-login-error').textContent='';
    try{state=await api('/admin/login',{method:'POST',body:JSON.stringify({nick,password})});save();showPanel();}
    catch(e){$('#admin-login-error').textContent=e.message;}
  }
  async function loadAdmins(){
    try{const d=await api('/admin/admins',{headers:sessionHeaders()});$('#admin-list').innerHTML=(d.admins||[]).map(a=>`<div class="admin-row"><div><b>${esc(a.nick)}</b><span>${a.enabled?'активен':'отключён'}</span></div><button class="btn admin-remove" data-nick="${esc(a.nick)}">Удалить</button></div>`).join('')||'<div class="admin-muted">Назначенных админов пока нет.</div>';}catch(e){$('#admin-action-message').textContent=e.message;}
  }
  async function addAdmin(){
    const nick=$('#new-admin-nick').value.trim(), password=$('#new-admin-password').value;
    if(!nick||!password){$('#admin-action-message').textContent='Укажи ник и пароль.';return;}
    try{await api('/admin/admins',{method:'POST',headers:sessionHeaders(),body:JSON.stringify({nick,password,commands:selected('#new-admin-commands')})});$('#new-admin-nick').value='';$('#new-admin-password').value='';$('#admin-action-message').textContent='Администратор назначен.';loadAdmins();}
    catch(e){$('#admin-action-message').textContent=e.message;}
  }
  async function removeAdmin(nick){if(!confirm('Удалить администратора '+nick+'?'))return;try{await api('/admin/admins',{method:'DELETE',headers:sessionHeaders(),body:JSON.stringify({nick})});loadAdmins();}catch(e){$('#admin-action-message').textContent=e.message;}}
  async function saveCommands(){
    if(!state)return; const commands=selected('#admin-command-list');
    try{const d=await api('/admin/me',{method:'PATCH',headers:sessionHeaders(),body:JSON.stringify({commands})});state.commands=d.commands;save();$('#admin-action-message').textContent='Доступ к командам сохранён.';}catch(e){$('#admin-action-message').textContent=e.message;}
  }
  async function loadStreamForAdmin(){try{const d=await api('/stream');$('#youtube-stream-url').value=d.url||'';}catch{}}
  async function saveStream(){try{const url=$('#youtube-stream-url').value.trim();await api('/admin/stream',{method:'POST',headers:sessionHeaders(),body:JSON.stringify({url})});$('#stream-admin-message').textContent=url?'Стрим сохранён.':'Стрим отключён.';window.loadYouTubeStream?.();}catch(e){$('#stream-admin-message').textContent=e.message;}}
  async function clearStream(){ $('#youtube-stream-url').value=''; await saveStream(); }
  function init(){
    const btn=$('#admin-btn'), modal=$('#admin-modal'); if(!btn||!modal)return;
    btn.onclick=()=>{showPanel();modal.classList.add('visible');document.body.classList.add('modal-open');};
    $('#admin-login-submit').onclick=login; $('#admin-password').onkeydown=e=>{if(e.key==='Enter')login()};
    $('#admin-logout').onclick=()=>{state=null;localStorage.removeItem('ny-admin');showPanel();};
    $('#add-admin-submit').onclick=addAdmin; $('#save-stream-submit').onclick=saveStream; $('#clear-stream-submit').onclick=clearStream;
    $('#admin-command-list').addEventListener('change',saveCommands);
    $('#admin-list').addEventListener('click',e=>{const b=e.target.closest('.admin-remove');if(b)removeAdmin(b.dataset.nick)});
    $$('.modal-close').forEach(b=>b.addEventListener('click',()=>{b.closest('.ui-modal')?.classList.remove('visible');document.body.classList.remove('modal-open')}));
    modal.addEventListener('click',e=>{if(e.target===modal){modal.classList.remove('visible');document.body.classList.remove('modal-open')}});
    if(state){api('/admin/me',{headers:sessionHeaders()}).then(d=>{state={...state,...d};save()}).catch(()=>{state=null;localStorage.removeItem('ny-admin')});}
  }
  window.adminState=()=>state; window.adminAllowedCommand=cmd=>!!state&&state.commands?.includes(cmd);
  document.addEventListener('DOMContentLoaded',init);
})();
