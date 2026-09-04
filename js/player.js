// === ПЛЕЕР С УМНЫМИ ЗАГЛУШКАМИ ===

let currentTrackIndex = 0;
let isPlaying = false;
let tracks = [];
const audio = new Audio();
audio.volume = 0.7;

const DEFAULT_COVER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjgwIiBmaWxsPSIjYzlhMjI3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+OgDwvdGV4dD48L3N2Zz4=';

// Генератор красивой цветной заглушки с номером трека (если нет обложки)
function generateFallbackCover(fileNumber) {
    const hue = (fileNumber * 47) % 360; // Разные цвета для разных треков
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:hsl(${hue}, 70%, 30%)"/>
                <stop offset="100%" style="stop-color:hsl(${hue}, 70%, 15%)"/>
            </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#g)"/>
        <text x="50%" y="50%" font-size="70" fill="rgba(255,255,255,0.8)" text-anchor="middle" dy=".3em" font-family="sans-serif" font-weight="bold">${fileNumber}</text>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

async function readMetadata(fileNumber) {
    const url = getTrackUrl(fileNumber);
    try {
        // ХИТРОСТЬ: Запрашиваем только первые 64 КБ файла. Там живут ID3-теги.
        // Это работает в 100 раз быстрее и не ломается на Cloudflare, как загрузка целого файла.
        const response = await fetch(url, {
            headers: { 'Range': 'bytes=0-65535' }
        });

        let buffer;
        if (response.status === 206 || response.status === 200) {
            buffer = await response.arrayBuffer();
        } else {
            throw new Error("Range request failed");
        }

        // Парсим буфер через music-metadata-browser
        const metadata = await musicMetadata.parseBuffer(buffer, 'audio/mpeg');
        
        let coverUrl = DEFAULT_COVER;
        if (metadata.common.picture && metadata.common.picture.length > 0) {
            const pic = metadata.common.picture[0];
            const base64 = btoa(String.fromCharCode(...new Uint8Array(pic.data)));
            coverUrl = `data:${pic.format};base64,${base64}`;
        }

        return {
            id: fileNumber - 1,
            title: metadata.common.title || `🎄 Новогодний микс #${fileNumber}`, // Умная заглушка
            artist: metadata.common.artist || 'Праздничный плейлист',          // Умная заглушка
            album: metadata.common.album || 'Winter Vibes 2027',
            cover: coverUrl,
            url: url
        };
    } catch (error) {
        // Если теги не найдены или произошла ошибка, мы НЕ показываем "Неизвестный исполнитель".
        // Мы выдаем красивую, сгенерированную заглушку.
        console.log(`Трек ${fileNumber}: метаданные отсутствуют, используем умную заглушку.`);
        return {
            id: fileNumber - 1,
            title: `🎄 Новогодний микс #${fileNumber}`,
            artist: 'Праздничная атмосфера',
            album: 'Winter Vibes 2027',
            cover: generateFallbackCover(fileNumber),
            url: url
        };
    }
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
            document.getElementById('play-btn-mini').textContent = '▶';
        });
    }
}

function updateMiniPlayer(index) {
    const track = tracks[index];
    if (!track) return;
    document.getElementById('track-mini').textContent = track.title;
    document.getElementById('artist-mini').textContent = track.artist;
}

function togglePlay() {
    const btn = document.getElementById('play-btn-mini');
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        btn.textContent = '▶';
    } else {
        if (!audio.src) selectTrack(currentTrackIndex);
        audio.play().then(() => {
            isPlaying = true;
            btn.textContent = '⏸';
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
                
                // ЖЕСТКОЕ управление развертыванием, чтобы работало 100%
                if (player.classList.contains('expanded')) {
                    player.classList.remove('expanded');
                    if (body) body.style.display = 'none';
                    if (indicator) indicator.textContent = '▼';
                } else {
                    player.classList.add('expanded');
                    if (body) body.style.display = 'block';
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
                document.getElementById('progress-fill-mini').style.width = progress + '%';
                document.getElementById('current-time-mini').textContent = formatTime(audio.currentTime);
                document.getElementById('total-time-mini').textContent = formatTime(audio.duration);
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
