// === ПЛЕЕР С УМНЫМИ ЗАГЛУШКАМИ И НАДЕЖНЫМ ЧТЕНИЕМ ===

let currentTrackIndex = 0;
let isPlaying = false;
let tracks = [];

const audio = new Audio();
audio.volume = 0.7;

const DEFAULT_COVER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjgwIiBmaWxsPSIjYzlhMjI3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+OgDwvdGV4dD48L3N2Zz4=';

// Генератор красивой цветной заглушки с номером трека
function generateFallbackCover(fileNumber) {
    const hue = (fileNumber * 47) % 360;
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
<defs>
<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:hsl(${hue}, 70%, 30%)"/>
<stop offset="100%" style="stop-color:hsl(${hue}, 70%, 15%)"/>
</linearGradient>
</defs>
<rect width="200" height="200" fill="url(#g)"/>
<text x="50%" y="50%" font-size="70" fill="rgba(255,255,255,0.9)" text-anchor="middle" dy=".3em" font-family="sans-serif" font-weight="bold">${fileNumber}</text>
</svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

// ИСПРАВЛЕНО: используем jsmediatags вместо musicMetadata
function readMetadata(fileNumber) {
    const url = getTrackUrl(fileNumber);
    return new Promise((resolve) => {
        try {
            jsmediatags.read(url, {
                onSuccess: function(tag) {
                    const tags = tag.tags;
                    let coverUrl = generateFallbackCover(fileNumber);

                    if (tags.picture) {
                        try {
                            const pic = tags.picture;
                            const base64 = btoa(
                                String.fromCharCode.apply(null, new Uint8Array(pic.data))
                            );
                            coverUrl = `data:${pic.format};base64,${base64}`;
                        } catch (e) {
                            console.log(`Трек ${fileNumber}: ошибка обложки, используем заглушку`);
                        }
                    }

                    resolve({
                        id: fileNumber - 1,
                        title: tags.title || `🎄 Новогодний микс #${fileNumber}`,
                        artist: tags.artist || 'Праздничная атмосфера',
                        album: tags.album || 'Winter Vibes 2027',
                        cover: coverUrl,
                        url: url
                    });
                },
                onError: function(error) {
                    console.log(`Трек ${fileNumber}: метаданные не прочитаны, используем умную заглушку.`);
                    resolve({
                        id: fileNumber - 1,
                        title: `🎄 Новогодний микс #${fileNumber}`,
                        artist: 'Праздничная атмосфера',
                        album: 'Winter Vibes 2027',
                        cover: generateFallbackCover(fileNumber),
                        url: url
                    });
                }
            });
        } catch (e) {
            resolve({
                id: fileNumber - 1,
                title: `🎄 Новогодний микс #${fileNumber}`,
                artist: 'Праздничная атмосфера',
                album: 'Winter Vibes 2027',
                cover: generateFallbackCover(fileNumber),
                url: url
            });
        }
    });
}

async function loadTracks() {
    const loadedTracks = [];
    for (let i = 1; i <= TRACKS_COUNT; i++) {
        const track = await readMetadata(i);
        loadedTracks.push(track);
    }
    tracks = loadedTracks;
    buildPlaylist();
    updateMiniPlayer(0);
    console.log(`🎵 Загружено треков: ${tracks.length}`);
}

function buildPlaylist() {
    const list = document.getElementById('playlist-bangs');
    if (!list) return;
    list.innerHTML = '';
    tracks.forEach((track, i) => {
        const li = document.createElement('li');
        li.dataset.index = i;
        li.innerHTML = `
            <img src="${track.cover}" alt="cover" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
            <div style="flex: 1; overflow: hidden; margin-left: 10px;">
                <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.title}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.artist}</div>
            </div>
            <span style="color: var(--text-secondary); font-size: 0.85rem;">${i + 1}</span>
        `;
        if (i === currentTrackIndex) li.classList.add('active');
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            selectTrack(i);
        });
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
    const trackMini = document.getElementById('track-mini');
    const artistMini = document.getElementById('artist-mini');
    if (trackMini) trackMini.textContent = track.title;
    if (artistMini) artistMini.textContent = track.artist;
}

function togglePlay() {
    const btn = document.getElementById('play-btn-mini');
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        if (btn) btn.textContent = '▶';
    } else {
        if (!audio.src) selectTrack(currentTrackIndex);
        audio.play().then(() => {
            isPlaying = true;
            if (btn) btn.textContent = '⏸';
        }).catch(err => console.error('Play error:', err));
    }
}

function nextTrack() {
    selectTrack((currentTrackIndex + 1) % tracks.length);
}

function prevTrack() {
    selectTrack((currentTrackIndex - 1 + tracks.length) % tracks.length);
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
        }

        document.getElementById('play-btn-mini')?.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
        document.getElementById('next-btn-mini')?.addEventListener('click', (e) => { e.stopPropagation(); nextTrack(); });
        document.getElementById('prev-btn-mini')?.addEventListener('click', (e) => { e.stopPropagation(); prevTrack(); });

        audio.addEventListener('ended', nextTrack);
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                const fill = document.getElementById('progress-fill-mini');
                const cur = document.getElementById('current-time-mini');
                const tot = document.getElementById('total-time-mini');
                if (fill) fill.style.width = progress + '%';
                if (cur) cur.textContent = formatTime(audio.currentTime);
                if (tot) tot.textContent = formatTime(audio.duration);
            }
        });

        document.getElementById('progress-track-mini')?.addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            if (audio.duration) audio.currentTime = percent * audio.duration;
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
        bar.style.cssText = 'width:3px;background-color:var(--accent-green);border-radius:2px;height:20%;transition:height 0.1s ease;';
        container.appendChild(bar);
        bars.push(bar);
    }
    function animate() {
        if (isPlaying) {
            bars.forEach(bar => { bar.style.height = (20 + Math.random() * 80) + '%'; });
        } else {
            bars.forEach(bar => { bar.style.height = '20%'; });
        }
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}
