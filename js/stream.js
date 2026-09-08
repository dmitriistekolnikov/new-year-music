(() => {
  const $ = s => document.querySelector(s);
  let streams = [];
  let currentIndex = 0;

  function videoId(url) {
    try {
      const u = new URL(url);
      if (u.hostname === 'youtu.be') return u.pathname.slice(1);
      if (u.hostname.includes('youtube.com')) {
        if (u.pathname === '/watch') return u.searchParams.get('v');
        const m = u.pathname.match(/\/(?:live|shorts|embed)\/([^/?]+)/);
        return m?.[1] || null;
      }
    } catch {}
    return null;
  }

  function setStatus(text) {
    const el = $('#stream-status');
    if (el) el.textContent = text;
  }

  function renderTabs() {
    const host = $('#stream-tabs');
    if (!host) return;
    host.innerHTML = streams.map((s, i) => `
      <button type="button" class="stream-tab ${i === currentIndex ? 'active' : ''}" data-stream-index="${i}">
        📺 ${escapeHtml(s.name || `Стрим ${i + 1}`)}
      </button>`).join('');
    host.hidden = streams.length <= 1;
    host.querySelectorAll('[data-stream-index]').forEach(b => {
      b.onclick = () => showStream(Number(b.dataset.streamIndex));
    });
  }

  function escapeHtml(v) {
    return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function showStream(index) {
    if (!streams[index]) return;
    currentIndex = index;
    const frame = $('#youtube-stream-frame');
    const empty = $('#stream-empty');
    const s = streams[index];
    const id = videoId(s.url || '');
    if (!frame || !empty) return;
    if (id) {
      frame.src = 'https://www.youtube.com/embed/' + encodeURIComponent(id) + '?autoplay=0&rel=0&modestbranding=1';
      frame.hidden = false;
      empty.hidden = true;
      setStatus(s.name || `Стрим ${index + 1}`);
    } else {
      frame.removeAttribute('src');
      frame.hidden = true;
      empty.hidden = false;
      setStatus('Стрим не настроен');
    }
    renderTabs();
  }

  function ensureControls() {
    const wrap = $('.stream-frame-wrap');
    if (!wrap || $('#stream-controls')) return;
    const controls = document.createElement('div');
    controls.id = 'stream-controls';
    controls.className = 'stream-controls';
    controls.innerHTML = '<button type="button" class="btn" id="stream-fullscreen-btn">⛶ На весь экран</button>';
    wrap.parentElement?.insertBefore(controls, wrap.nextSibling);
    $('#stream-fullscreen-btn').onclick = async () => {
      const target = $('.stream-frame-wrap');
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (target?.requestFullscreen) await target.requestFullscreen();
      } catch {}
    };
  }

  async function load() {
    try {
      const d = await fetch('/api/stream').then(r => r.json());
      streams = Array.isArray(d.streams) ? d.streams.filter(s => s && s.url) : [];
      if (!streams.length && d.url) streams = [{ slot: 1, name: 'Стрим 1', url: d.url }];
      currentIndex = Math.min(currentIndex, Math.max(0, streams.length - 1));
      ensureControls();
      renderTabs();
      if (streams.length) showStream(currentIndex);
      else {
        const frame = $('#youtube-stream-frame'), empty = $('#stream-empty');
        if (frame) { frame.removeAttribute('src'); frame.hidden = true; }
        if (empty) empty.hidden = false;
        setStatus('Стримы не настроены');
      }
    } catch {
      setStatus('Ошибка загрузки стримов');
    }
  }

  function init() {
    const b = $('#youtube-stream-btn'), m = $('#youtube-stream-modal');
    if (!b || !m) return;
    b.onclick = async () => {
      await load();
      m.classList.add('visible');
      document.body.classList.add('modal-open');
    };
    ensureControls();
    load();
  }

  window.loadYouTubeStream = load;
  document.addEventListener('DOMContentLoaded', init);
})();
