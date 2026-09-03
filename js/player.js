// === ПЛЕЕР С ЧТЕНИЕМ МЕТАДАННЫХ MP3 ===

let currentTrackIndex = 0;
let isPlaying = false;
const audio = new Audio();
audio.volume = 0.7;

// Обложка по умолчанию (если в файле нет)
const DEFAULT_COVER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjgwIiBmaWxsPSIjZmJiZjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+OgDwvdGV4dD48L3N2Zz4=';

// Чтение метаданных MP3 через jsmediatags
async function readMetadata(fileNumber) {
    return new Promise((resolve) => {
        const url = getTrackUrl(fileNumber);
        
        jsmediatags.read(url, {
            onSuccess: function(tag) {
                const tags = tag.tags;
                
                // Извлекаем обложку
                let coverUrl = DEFAULT_COVER;
                if (tags.picture) {
                    const { data, format } = tags.picture;
                    let base64String = '';
                    for (let i = 0; i < data.length; i++) {
                        base64String += String.fromCharCode(data[i]);
                    }
                    coverUrl = `data:${format};base64,${window.btoa(base64String)}`;
                }
                
                resolve({
                    id: fileNumber - 1,
                    title: tags.title || `Трек ${fileNumber}`,
                    artist: tags.artist || 'Неизвестный исполнитель',
                    album: tags.album || '',
                    cover: coverUrl,
                    url: url
                });
            },
            onError: function(error) {
                console.warn(`Не удалось прочитать метаданные ${fileNumber}.mp3:`, error);
                resolve({
                    id: fileNumber - 1,
                    title: `Трек ${fileNumber}`,
                    artist: 'Неизвестный исполнитель',
                    album: '',
                    cover: DEFAULT_COVER,
                    url: url
                });
            }
        });
    });
}

// Загрузка всех треков и построение плейлиста
async function loadTracks() {
    const tracks = [];
    for (let i = 1; i <= TRACKS_COUNT; i++) {
        const track = await readMetadata(i);
        tracks.push(track);
    }
    TRACKS = tracks;
    buildPlaylist();
}

function buildPlaylist() {
    const list = document.getElementById('playlist-bangs');
    list.innerHTML = ''; // Очищаем
    
    TRACKS.forEach((track, i) => {
        const li = document.createElement('li');
        li.dataset.index = i;
        li.innerHTML = `
            <img src="${track.cover}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">
            <div style="flex: 1; overflow: hidden;">
                <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.title}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.artist}</div>
            </div>
            <span style="color: var(--text-secondary); font-size: 0.85rem;">${i + 1}.</span>
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
    const track = TRACKS[index];
    
    document.querySelectorAll('.playlist-bangs li').forEach(li => li.classList.remove('active'));
    const activeLi = document.querySelector(`.playlist-bangs li[data-index="${index}"]`);
    if (activeLi) activeLi.classList.add('active');
    
    document.getElementById('track-mini').textContent = track.title;
    document.getElementById('artist-mini').textContent = track.artist;
    
    // Обновляем обложку в мини-плеере (если есть место)
    const trackMini = document.getElementById('track-mini');
    trackMini.style.backgroundImage = `url(${track.cover})`;
    trackMini.style.backgroundSize = 'cover';
    
    console.log('Загрузка трека:', track.url);
    audio.src = track.url;
    
    if (isPlaying) {
        audio.play().catch(err => {
            console.error('Ошибка воспроизведения:', err);
        });
    }
}

function togglePlay() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('play-btn-mini');
    btn.textContent = isPlaying ? '⏸' : '▶';
    
    if (isPlaying) {
        if (!audio.src || audio.src === window.location.href) {
            selectTrack(currentTrackIndex);
        } else {
            audio.play().catch(err => {
                console.error('Ошибка воспроизведения:', err);
                isPlaying = false;
                btn.textContent = '▶';
            });
        }
    } else {
        audio.pause();
    }
}

function nextTrack() {
    const next = (currentTrackIndex + 1) % TRACKS.length;
    selectTrack(next);
}

function prevTrack() {
    const prev = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    selectTrack(prev);
}

function initPlayer() {
    // Сначала загружаем метаданные, потом инициализируем плеер
    loadTracks().then(() => {
        document.getElementById('player-bangs-header').addEventListener('click', (e) => {
            if (e.target.closest('.controls-mini')) return;
            document.getElementById('player-bangs').classList.toggle('expanded');
        });
        
        document.getElementById('play-btn-mini').addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });
        
        document.getElementById('next-btn-mini').addEventListener('click', (e) => {
            e.stopPropagation();
            nextTrack();
        });
        
        document.getElementById('prev-btn-mini').addEventListener('click', (e) => {
            e.stopPropagation();
            prevTrack();
        });
        
        audio.addEventListener('ended', nextTrack);
        
        audio.addEventListener('error', (e) => {
            console.error('Ошибка загрузки аудио:', e);
        });
        
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                document.getElementById('progress-fill-mini').style.width = progress + '%';
                document.getElementById('current-time-mini').textContent = formatTime(audio.currentTime);
                document.getElementById('total-time-mini').textContent = formatTime(audio.duration);
            }
        });
        
        document.querySelector('.progress-track-mini').addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            if (audio.duration) audio.currentTime = percent * audio.duration;
        });
    });
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// === ЭКВАЛАЙЗЕР ===
function initEqualizer() {
    const container = document.getElementById('eq-container');
    const bars = [];
    for (let i = 0; i < 5; i++) {
        const bar = document.createElement('div');
        bar.style.width = '3px';
        bar.style.backgroundColor = 'var(--accent-green)';
        bar.style.borderRadius = '2px';
        bar.style.height = '20%';
        bar.style.transition = 'height 0.1s ease';
        container.appendChild(bar);
        bars.push(bar);
    }
    
    function animate() {
        if (isPlaying) {
            bars.forEach(bar => {
                bar.style.height = (20 + Math.random() * 80) + '%';
            });
        } else {
            bars.forEach(bar => bar.style.height = '20%');
        }
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}
