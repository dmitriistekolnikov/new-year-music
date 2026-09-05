// === ПЛЕЕР — МЕТАДАННЫЕ MP3 + ОБЛОЖКИ ИЗ ID3 ===
let currentTrackIndex = 0;
let isPlaying = false;
let tracks = [];
let trackLoaded = false;
const coverObjectUrls = [];

const audio = new Audio();
audio.volume = 0.7;
audio.preload = 'metadata';

function generateFallbackCover(fileNumber) {
    const hue = (fileNumber * 47) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
        <defs><linearGradient id="g${fileNumber}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:hsl(${hue},70%,30%)"/><stop offset="100%" style="stop-color:hsl(${(hue+55)%360},70%,12%)"/>
        </linearGradient></defs>
        <rect width="400" height="400" rx="44" fill="url(#g${fileNumber})"/>
        <text x="50%" y="46%" font-size="105" fill="white" text-anchor="middle" font-family="sans-serif" font-weight="800">🎄</text>
        <text x="50%" y="68%" font-size="34" fill="rgba(255,255,255,.88)" text-anchor="middle" font-family="sans-serif">Новогодний микс #${fileNumber}</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function pictureToDataUrl(picture) {
    if (!picture || !picture.data || !picture.format) return null;
    try {
        const bytes = new Uint8Array(picture.data);
        let binary = '';
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
        }
        return `data:${picture.format};base64,${btoa(binary)}`;
    } catch (e) {
        console.warn('Не удалось прочитать обложку:', e);
        return null;
    }
}

function readTrackMetadata(url, fallbackNumber) {
    return new Promise(resolve => {
        const fallback = {
            title: `🎄 Новогодний микс #${fallbackNumber}`,
            artist: 'Праздничная атмосфера',
            album: 'Winter Vibes 2027',
            cover: generateFallbackCover(fallbackNumber)
        };

        if (typeof jsmediatags === 'undefined') {
            resolve(fallback);
            return;
        }

        let settled = false;
        const finish = data => { if (!settled) { settled = true; resolve(data); } };
        const timer = setTimeout(() => finish(fallback), 9000);

        try {
            jsmediatags.read(url, {
                onSuccess: result => {
                    clearTimeout(timer);
                    const tags = result.tags || {};
                    const picture = tags.picture ? pictureToDataUrl(tags.picture) : null;
                    finish({
                        title: tags.title || fallback.title,
                        artist: tags.artist || fallback.artist,
                        album: tags.album || fallback.album,
                        cover: picture || fallback.cover
                    });
                },
                onError: error => {
                    clearTimeout(timer);
                    console.warn(`ID3 не прочитан для ${url}:`, error);
                    finish(fallback);
                }
            });
        } catch (e) {
            clearTimeout(timer);
            finish(fallback);
        }
    });
}

async function loadTracks() {
    const baseTracks = [];
    for (let i = 1; i <= TRACKS_COUNT; i++) {
        baseTracks.push({ id: i - 1, number: i, url: getTrackUrl(i) });
    }

    tracks = await Promise.all(baseTracks.map(async base => {
        const meta = await readTrackMetadata(base.url, base.number);
        return { ...base, ...meta };
    }));

    buildPlaylist();
    updateMiniPlayer(0);
    if (tracks[0]) {
        audio.src = tracks[0].url;
        trackLoaded = true;
    }
}

function buildPlaylist() {
    const list = document.getElementById('playlist-bangs');
    if (!list) return;
    list.innerHTML = '';
    tracks.forEach((track, i) => {
        const li = document.createElement('li');
        li.dataset.index = i;
        li.innerHTML = `
            <img src="${track.cover}" alt="Обложка" style="width:42px;height:42px;border-radius:7px;object-fit:cover;flex:0 0 auto;">
            <div style="flex:1;min-width:0;margin-left:10px;overflow:hidden;">
                <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(track.title)}</div>
                <div style="font-size:.78rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(track.artist)}</div>
            </div>
            <span style="color:var(--text-secondary);font-size:.8rem;">${i+1}</span>`;
        if (i === currentTrackIndex) li.classList.add('active');
        li.addEventListener('click', e => { e.stopPropagation(); selectTrack(i); });
        list.appendChild(li);
    });
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function selectTrack(index) {
    if (!tracks.length) return;
    currentTrackIndex = (index + tracks.length) % tracks.length;
    const track = tracks[currentTrackIndex];
    document.querySelectorAll('.playlist-bangs li').forEach(li => li.classList.remove('active'));
    document.querySelector(`.playlist-bangs li[data-index="${currentTrackIndex}"]`)?.classList.add('active');
    updateMiniPlayer(currentTrackIndex);
    audio.src = track.url;
    trackLoaded = true;
    if (isPlaying) audio.play().catch(() => { isPlaying = false; updatePlayButton(); });
}

function updateMiniPlayer(index) {
    const track = tracks[index];
    if (!track) return;
    document.getElementById('track-mini')?.replaceChildren(document.createTextNode(track.title));
    document.getElementById('artist-mini')?.replaceChildren(document.createTextNode(track.artist));
}

function updatePlayButton() {
    const btn = document.getElementById('play-btn-mini');
    if (btn) btn.textContent = isPlaying ? '⏸' : '▶';
}

function togglePlay() {
    if (isPlaying) { audio.pause(); isPlaying = false; updatePlayButton(); return; }
    if (!trackLoaded && tracks.length) { audio.src = tracks[currentTrackIndex].url; trackLoaded = true; }
    audio.play().then(() => { isPlaying = true; updatePlayButton(); }).catch(err => console.error('Ошибка воспроизведения:', err));
}

function nextTrack() {
    const wasPlaying = isPlaying;
    selectTrack(currentTrackIndex + 1);
    if (wasPlaying) audio.play().then(() => { isPlaying = true; updatePlayButton(); }).catch(() => {});
}
function prevTrack() {
    const wasPlaying = isPlaying;
    selectTrack(currentTrackIndex - 1);
    if (wasPlaying) audio.play().then(() => { isPlaying = true; updatePlayButton(); }).catch(() => {});
}

function initPlayer() {
    loadTracks().then(() => {
        const header = document.getElementById('player-bangs-header');
        const player = document.getElementById('player-bangs');
        const body = document.querySelector('.player-bangs-body');
        const indicator = document.querySelector('.expand-indicator');

        header?.addEventListener('click', e => {
            if (e.target.closest('.controls-mini')) return;
            const expanded = player?.classList.toggle('expanded');
            if (body) body.style.display = expanded ? 'block' : 'none';
            if (indicator) indicator.textContent = expanded ? '▲' : '▼';
        });
        document.getElementById('play-btn-mini')?.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
        document.getElementById('next-btn-mini')?.addEventListener('click', e => { e.stopPropagation(); nextTrack(); });
        document.getElementById('prev-btn-mini')?.addEventListener('click', e => { e.stopPropagation(); prevTrack(); });
        audio.addEventListener('ended', nextTrack);
        audio.addEventListener('timeupdate', () => {
            if (!audio.duration) return;
            const pct = audio.currentTime / audio.duration * 100;
            document.getElementById('progress-fill-mini')?.style.setProperty('width', pct + '%');
            const curr = document.getElementById('current-time-mini');
            const total = document.getElementById('total-time-mini');
            if (curr) curr.textContent = formatTime(audio.currentTime);
            if (total) total.textContent = formatTime(audio.duration);
        });
        document.getElementById('progress-track-mini')?.addEventListener('click', e => {
            const rect = e.currentTarget.getBoundingClientRect();
            if (audio.duration) audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
        });
        initEqualizer();
    });
}

function formatTime(seconds) {
    if (!seconds || Number.isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2,'0')}`;
}

function initEqualizer() {
    const container = document.getElementById('eq-container');
    if (!container) return;
    container.innerHTML = '';
    const bars = [];
    for (let i = 0; i < 5; i++) {
        const bar = document.createElement('div');
        bar.style.cssText = 'width:3px;background-color:var(--accent-green);border-radius:2px;height:20%;transition:height .1s ease;';
        container.appendChild(bar); bars.push(bar);
    }
    const animate = () => {
        bars.forEach(bar => bar.style.height = (isPlaying ? 20 + Math.random()*80 : 20) + '%');
        requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
}
