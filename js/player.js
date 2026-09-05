// === ПЛЕЕР — БЫСТРАЯ ВЕРСИЯ (без тяжёлого fetch) ===
let currentTrackIndex = 0;
let isPlaying = false;
let tracks = [];
let trackLoaded = false;

const audio = new Audio();
audio.volume = 0.7;
audio.preload = 'metadata';

function generateFallbackCover(fileNumber) {
    const hue = (fileNumber * 47) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <defs>
            <linearGradient id="g${fileNumber}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:hsl(${hue},70%,30%)"/>
                <stop offset="100%" style="stop-color:hsl(${hue},70%,15%)"/>
            </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#g${fileNumber})"/>
        <text x="50%" y="50%" font-size="70" fill="rgba(255,255,255,0.9)"
              text-anchor="middle" dy=".3em" font-family="sans-serif"
              font-weight="bold">${fileNumber}</text>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

async function loadTracks() {
    const loadedTracks = [];
    for (let i = 1; i <= TRACKS_COUNT; i++) {
        loadedTracks.push({
            id: i - 1,
            title: `🎄 Новогодний микс #${i}`,
            artist: 'Праздничная атмосфера',
            album: 'Winter Vibes 2027',
            cover: generateFallbackCover(i),
            url: getTrackUrl(i)
        });
    }
    tracks = loadedTracks;
    buildPlaylist();
    updateMiniPlayer(0);
    // Заряжаем первый трек сразу
    audio.src = tracks[0].url;
    trackLoaded = true;
}

function buildPlaylist() {
    const list = document.getElementById('playlist-bangs');
    if (!list) return;
    list.innerHTML = '';
    tracks.forEach((track, i) => {
        const li = document.createElement('li');
        li.dataset.index = i;
        li.innerHTML = `
            <img src="${track.cover}" alt="cover"
                 style="width:40px;height:40px;border-radius:4px;object-fit:cover;">
            <div style="flex:1;overflow:hidden;margin-left:10px;">
                <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${track.title}</div>
                <div style="font-size:0.8rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${track.artist}</div>
            </div>
            <span style="color:var(--text-secondary);font-size:0.85rem;">${i + 1}</span>
        `;
        if (i === currentTrackIndex) li.classList.add('active');
        li.addEventListener('click', (e) => { e.stopPropagation(); selectTrack(i); });
        list.appendChild(li);
    });
}

function selectTrack(index) {
    currentTrackIndex = index;
    const track = tracks[index];
    if (!track) return;

    document.querySelectorAll('.playlist-bangs li').forEach(li => li.classList.remove('active'));
    const activeLi = document.querySelector(`.playlist-bangs li[data-index="${index}"]`);
    if (activeLi) activeLi.classList.add('active');

    updateMiniPlayer(index);
    audio.src = track.url;
    trackLoaded = true;

    if (isPlaying) {
        audio.play().catch(err => {
            console.error('Ошибка воспроизведения:', err);
            isPlaying = false;
            const btn = document.getElementById('play-btn-mini');
            if (btn) btn.textContent = '▶';
        });
    }
}

function updateMiniPlayer(index) {
    const track = tracks[index];
    if (!track) return;
    const trackEl = document.getElementById('track-mini');
    const artistEl = document.getElementById('artist-mini');
    if (trackEl) trackEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
}

function togglePlay() {
    const btn = document.getElementById('play-btn-mini');
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        if (btn) btn.textContent = '▶';
    } else {
        if (!trackLoaded && tracks.length > 0) {
            audio.src = tracks[currentTrackIndex].url;
            trackLoaded = true;
        }
        audio.play().then(() => {
            isPlaying = true;
            if (btn) btn.textContent = '⏸';
        }).catch(err => {
            console.error('Play error — нужно взаимодействие пользователя:', err);
        });
    }
}

function nextTrack() {
    const wasPlaying = isPlaying;
    selectTrack((currentTrackIndex + 1) % tracks.length);
    if (wasPlaying) {
        audio.play().then(() => {
            isPlaying = true;
            const btn = document.getElementById('play-btn-mini');
            if (btn) btn.textContent = '⏸';
        }).catch(e => console.error(e));
    }
}

function prevTrack() {
    const wasPlaying = isPlaying;
    selectTrack((currentTrackIndex - 1 + tracks.length) % tracks.length);
    if (wasPlaying) {
        audio.play().then(() => {
            isPlaying = true;
            const btn = document.getElementById('play-btn-mini');
            if (btn) btn.textContent = '⏸';
        }).catch(e => console.error(e));
    }
}

function initPlayer() {
    loadTracks().then(() => {
        const header = document.getElementById('player-bangs-header');
        const player = document.getElementById('player-bangs');
        const body = document.getElementById('player-bangs-body');
        const indicator = document.querySelector('.expand-indicator');

        if (header) {
            header.addEventListener('click', (e) => {
                if (e.target.closest('.controls-mini')) return;
                if (player.classList.contains('expanded')) {
                    player.classList.remove('expanded');
                    if (body) body.style.setProperty('display', 'none', 'important');
                    if (indicator) indicator.textContent = '▼';
                } else {
                    player.classList.add('expanded');
                    if (body) body.style.setProperty('display', 'block', 'important');
                    if (indicator) indicator.textContent = '▲';
                }
            });
        } else {
            console.error('player-bangs-header не найден!');
        }

        document.getElementById('play-btn-mini')?.addEventListener('click',
            (e) => { e.stopPropagation(); togglePlay(); });
        document.getElementById('next-btn-mini')?.addEventListener('click',
            (e) => { e.stopPropagation(); nextTrack(); });
        document.getElementById('prev-btn-mini')?.addEventListener('click',
            (e) => { e.stopPropagation(); prevTrack(); });

        audio.addEventListener('ended', () => nextTrack());
        audio.addEventListener('timeupdate', () => {
            if (!audio.duration) return;
            const pct = (audio.currentTime / audio.duration) * 100;
            const fill = document.getElementById('progress-fill-mini');
            const curr = document.getElementById('current-time-mini');
            const tot  = document.getElementById('total-time-mini');
            if (fill) fill.style.width = pct + '%';
            if (curr) curr.textContent = formatTime(audio.currentTime);
            if (tot)  tot.textContent  = formatTime(audio.duration);
        });

        document.getElementById('progress-track-mini')?.addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            if (audio.duration) audio.currentTime = pct * audio.duration;
        });

        initEqualizer();
    });
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function initEqualizer() {
    const container = document.getElementById('eq-container');
    if (!container) return;
    container.innerHTML = '';
    const bars = [];
    for (let i = 0; i < 5; i++) {
        const bar = document.createElement('div');
        bar.style.cssText =
            'width:3px;background-color:var(--accent-green);border-radius:2px;height:20%;transition:height 0.1s ease;';
        container.appendChild(bar);
        bars.push(bar);
    }
    function animate() {
        bars.forEach(bar => {
            bar.style.height = isPlaying ? (20 + Math.random() * 80) + '%' : '20%';
        });
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}
