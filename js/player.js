// === ПЛЕЕР С ЧТЕНИЕМ МЕТАДАННЫХ MP3 ===

let currentTrackIndex = 0;
let isPlaying = false;
let tracks = [];
const audio = new Audio();
audio.volume = 0.7;

// Обложка по умолчанию (если в файле нет)
const DEFAULT_COVER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjgwIiBmaWxsPSIjYzlhMjI3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+OgDwvdGV4dD48L3N2Zz4=';

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
    const loadedTracks = [];
    for (let i = 1; i <= TRACKS_COUNT; i++) {
        const track = await readMetadata(i);
        loadedTracks.push(track);
    }
    tracks = loadedTracks;
    buildPlaylist();
    selectTrack(0, false); // Показываем первый трек, но не играем
}

function buildPlaylist() {
    const list = document.getElementById('playlist');
    if (!list) return;
    list.innerHTML = '';
    
    tracks.forEach((track, i) => {
        const li = document.createElement('li');
        li.dataset.index = i;
        li.innerHTML = `
            <img src="${track.cover}" alt="cover">
            <div style="flex: 1; overflow: hidden;">
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

function selectTrack(index, autoPlay = true) {
    currentTrackIndex = index;
    const track = tracks[index];
    if (!track) return;
    
    // Обновляем активный пункт в плейлисте
    document.querySelectorAll('.playlist li').forEach(li => li.classList.remove('active'));
    const activeLi = document.querySelector(`.playlist li[data-index="${index}"]`);
    if (activeLi) activeLi.classList.add('active');
    
    // Обновляем информацию о треке
    document.getElementById('track-title').textContent = track.title;
    document.getElementById('track-artist').textContent = track.artist;
    
    // Обновляем обложку
    const coverEl = document.getElementById('track-cover');
    coverEl.innerHTML = `<img src="${track.cover}" alt="cover">`;
    
    // Загружаем аудио
    console.log('Загрузка трека:', track.url);
    audio.src = track.url;
    
    if (autoPlay) {
        audio.play().then(() => {
            isPlaying = true;
            document.getElementById('play-btn').textContent = '⏸';
            coverEl.classList.add('playing');
        }).catch(err => {
            console.error('Ошибка воспроизведения:', err);
            isPlaying = false;
            document.getElementById('play-btn').textContent = '▶';
            coverEl.classList.remove('playing');
        });
    }
}

function togglePlay() {
    const coverEl = document.getElementById('track-cover');
    
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        document.getElementById('play-btn').textContent = '▶';
        coverEl.classList.remove('playing');
    } else {
        if (!audio.src) {
            selectTrack(currentTrackIndex, true);
            return;
        }
        audio.play().then(() => {
            isPlaying = true;
            document.getElementById('play-btn').textContent = '⏸';
            coverEl.classList.add('playing');
        }).catch(err => {
            console.error('Ошибка воспроизведения:', err);
        });
    }
}

function nextTrack() {
    const next = (currentTrackIndex + 1) % tracks.length;
    selectTrack(next);
}

function prevTrack() {
    const prev = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    selectTrack(prev);
}

function initPlayer() {
    // Сначала загружаем метаданные
    loadTracks().then(() => {
        // Кнопки управления
        document.getElementById('play-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });
        
        document.getElementById('next-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            nextTrack();
        });
        
        document.getElementById('prev-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            prevTrack();
        });
        
        // Автопереключение при окончании трека
        audio.addEventListener('ended', nextTrack);
        
        // Обработка ошибок загрузки
        audio.addEventListener('error', (e) => {
            console.error('Ошибка загрузки аудио:', e);
            document.getElementById('track-title').textContent = 'Ошибка загрузки';
        });
        
        // Обновление прогресс-бара
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                document.getElementById('progress-fill').style.width = progress + '%';
                document.getElementById('current-time').textContent = formatTime(audio.currentTime);
                document.getElementById('total-time').textContent = formatTime(audio.duration);
            }
        });
        
        // Клик по прогресс-бару для перемотки
        document.getElementById('progress-track').addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            if (audio.duration) audio.currentTime = percent * audio.duration;
        });
    });
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// === ЭКВАЛАЙЗЕР (визуальный) ===
function initEqualizer() {
    // Эквалайзер теперь не нужен в новом дизайне,
    // но функция оставлена для совместимости
}
