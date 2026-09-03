// === ПЛЕЕР С ПАРАЛЛЕЛЬНОЙ ЗАГРУЗКОЙ И ОБРАБОТЧИКОМ ОШИБОК ===

let currentTrackIndex = 0;
let isPlaying = false;
let isTracksLoaded = false;
const audio = new Audio();
audio.volume = 0.7;

const DEFAULT_COVER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjgwIiBmaWxsPSIjZmJiZjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+OgDwvdGV4dD48L3N2Zz4=';

async function readMetadata(fileNumber) {
    return new Promise((resolve) => {
        const url = getTrackUrl(fileNumber);
        
        // Если библиотека не загрузилась, сразу отдаем запасной вариант
        if (typeof jsmediatags === 'undefined') {
            return resolve(getFallbackTrack(fileNumber));
        }

        jsmediatags.read(url, {
            onSuccess: function(tag) {
                const tags = tag.tags;
                let coverUrl = DEFAULT_COVER;
                if (tags.picture) {
                    try {
                        const { data, format } = tags.picture;
                        let base64String = '';
                        for (let i = 0; i < data.length; i++) base64String += String.fromCharCode(data[i]);
                        coverUrl = `data:${format};base64,${window.btoa(base64String)}`;
                    } catch (e) { console.warn('Ошибка обложки:', e); }
                }
                resolve({ id: fileNumber - 1, title: tags.title || `Трек ${fileNumber}`, artist: tags.artist || 'Неизвестный', cover: coverUrl, url: url });
            },
            onError: function(error) {
                console.warn(`Не удалось прочитать теги ${fileNumber}.mp3. Использую запасной вариант.`);
                resolve(getFallbackTrack(fileNumber));
            }
        });
    });
}

function getFallbackTrack(fileNumber) {
    const fallback = FALLBACK_TRACKS[fileNumber - 1] || { title: `Трек ${fileNumber}`, artist: 'Неизвестный' };
    return { id: fileNumber - 1, title: fallback.title, artist: fallback.artist, cover: DEFAULT_COVER, url: getTrackUrl(fileNumber) };
}

async function loadTracks() {
    const trackTitleEl = document.getElementById('track-mini');
    const artistEl = document.getElementById('artist-mini');
    trackTitleEl.textContent = "Загрузка музыки...";
    artistEl.textContent = "Подождите";

    // Параллельная загрузка всех треков для скорости
    const promises = [];
    for (let i = 1; i <= TRACKS_COUNT; i++) {
        promises.push(readMetadata(i).catch(() => getFallbackTrack(i)));
    }
    
    try {
        TRACKS = await Promise.all(promises);
        isTracksLoaded = true;
        
        trackTitleEl.textContent = TRACKS[0].title;
        artistEl.textContent = TRACKS[0].artist;
        
        buildPlaylist();
        selectTrack(0, false);
        console.log('✅ Музыка загружена:', TRACKS.length, 'треков');
    } catch (error) {
        console.error('❌ Ошибка загрузки плейлиста:', error);
        trackTitleEl.textContent = "Ошибка";
    }
}

function buildPlaylist() {
    const list = document.getElementById('playlist-bangs');
    list.innerHTML = '';
    TRACKS.forEach((track, i) => {
        const li = document.createElement('li');
        li.dataset.index = i;
        li.innerHTML = `
            <img src="${track.cover}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;" onerror="this.src='${DEFAULT_COVER}'">
            <div style="flex: 1; overflow: hidden;">
                <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.title}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${track.artist}</div>
            </div>
        `;
        if (i === currentTrackIndex) li.classList.add('active');
        li.addEventListener('click', (e) => { e.stopPropagation(); selectTrack(i, true); });
        list.appendChild(li);
    });
}

function selectTrack(index, shouldPlay = false) {
    if (!isTracksLoaded || !TRACKS[index]) return;
    currentTrackIndex = index;
    const track = TRACKS[index];
    
    document.querySelectorAll('.playlist-bangs li').forEach(li => li.classList.remove('active'));
    const activeLi = document.querySelector(`.playlist-bangs li[data-index="${index}"]`);
    if (activeLi) activeLi.classList.add('active');
    
    document.getElementById('track-mini').textContent = track.title;
    document.getElementById('artist-mini').textContent = track.artist;
    
    audio.src = track.url;
    if (shouldPlay) {
        isPlaying = true;
        document.getElementById('play-btn-mini').textContent = '⏸';
        audio.play().catch(err => {
            console.error('Ошибка воспроизведения:', err);
            isPlaying = false;
            document.getElementById('play-btn-mini').textContent = '▶';
        });
    }
}

function togglePlay() {
    if (!isTracksLoaded) return;
    isPlaying = !isPlaying;
    const btn = document.getElementById('play-btn-mini');
    btn.textContent = isPlaying ? '⏸' : '▶';
    
    if (isPlaying) {
        if (!audio.src || audio.readyState === 0) selectTrack(currentTrackIndex, true);
        else audio.play().catch(() => { isPlaying = false; btn.textContent = '▶'; });
    } else {
        audio.pause();
    }
}

function nextTrack() { if (!isTracksLoaded) return; selectTrack((currentTrackIndex + 1) % TRACKS.length, true); }
function prevTrack() { if (!isTracksLoaded) return; selectTrack((currentTrackIndex - 1 + TRACKS.length) % TRACKS.length, true); }

function initPlayer() {
    loadTracks();
    document.getElementById('player-bangs-header').addEventListener('click', (e) => { if (!e.target.closest('.controls-mini')) document.getElementById('player-bangs').classList.toggle('expanded'); });
    document.getElementById('play-btn-mini').addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
    document.getElementById('next-btn-mini').addEventListener('click', (e) => { e.stopPropagation(); nextTrack(); });
    document.getElementById('prev-btn-mini').addEventListener('click', (e) => { e.stopPropagation(); prevTrack(); });
    
    audio.addEventListener('ended', nextTrack);
    audio.addEventListener('error', () => { document.getElementById('track-mini').textContent = "Файл не найден"; });
    audio.addEventListener('timeupdate', () => {
        if (audio.duration && !isNaN(audio.duration)) {
            document.getElementById('progress-fill-mini').style.width = ((audio.currentTime / audio.duration) * 100) + '%';
            document.getElementById('current-time-mini').textContent = formatTime(audio.currentTime);
            document.getElementById('total-time-mini').textContent = formatTime(audio.duration);
        }
    });
    document.querySelector('.progress-track-mini').addEventListener('click', (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        if (audio.duration && !isNaN(audio.duration)) audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

function initEqualizer() {
    const container = document.getElementById('eq-container');
    if (!container) return;
    const bars = [];
    for (let i = 0; i < 5; i++) {
        const bar = document.createElement('div');
        bar.style.cssText = 'width: 3px; background-color: var(--accent-green); border-radius: 2px; height: 20%; transition: height 0.1s ease;';
        container.appendChild(bar);
        bars.push(bar);
    }
    function animate() {
        bars.forEach(bar => { bar.style.height = isPlaying ? (20 + Math.random() * 80) + '%' : '20%'; });
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
        }
