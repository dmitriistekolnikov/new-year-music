// === ПЛЕЕР С МЕТАДАННЫМИ MP3 ===

let currentTrackIndex = 0;
let isPlaying = false;
let tracks = [];
const audio = new Audio();
audio.volume = 0.7;

const DEFAULT_COVER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjgwIiBmaWxsPSIjYzlhMjI3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+OgDwvdGV4dD48L3N2Zz4=';

function getFallbackTrack(trackNumber) {
    return {
        id: trackNumber - 1,
        title: `Трек ${trackNumber}`,
        artist: 'Неизвестный исполнитель',
        album: '',
        cover: DEFAULT_COVER,
        url: getTrackUrl(trackNumber)
    };
}

async function readMetadata(trackNumber) {
    return new Promise((resolve) => {
        const url = getTrackUrl(trackNumber);
        let resolved = false;

        function done(result) {
            if (resolved) return;
            resolved = true;
            clearTimeout(timer);
            resolve(result);
        }

        // Таймаут 4 секунды — если jsmediatags завис, не блокируем
        const timer = setTimeout(() => {
            console.warn(`Таймаут метаданных для трека ${trackNumber}, использую fallback`);
            done(getFallbackTrack(trackNumber));
        }, 4000);

        // Если библиотека не загрузилась — сразу fallback
        if (typeof jsmediatags === 'undefined') {
            console.warn('jsmediatags не загружен, использую fallback для всех треков');
            done(getFallbackTrack(trackNumber));
            return;
        }

        try {
            jsmediatags.read(url, {
                onSuccess: function(tag) {
                    const tags = tag.tags;
                    let coverUrl = DEFAULT_COVER;
                    
                    if (tags.picture) {
                        try {
                            const { data, format } = tags.picture;
                            let base64String = '';
                            for (let i = 0; i < data.length; i++) {
                                base64String += String.fromCharCode(data[i]);
                            }
                            coverUrl = `data:${format};base64,${window.btoa(base64String)}`;
                        } catch (e) {
                            console.warn('Ошибка декодирования обложки:', e);
                        }
                    }
                    
                    done({
                        id: trackNumber - 1,
                        title: tags.title || `Трек ${trackNumber}`,
                        artist: tags.artist || 'Неизвестный исполнитель',
                        album: tags.album || '',
                        cover: coverUrl,
                        url: url
                    });
                },
                onError: function(error) {
                    console.warn(`Не удалось прочитать метаданные ${trackNumber}.mp3:`, error);
                    done(getFallbackTrack(trackNumber));
                }
            });
        } catch (e) {
            console.warn(`Исключение при чтении метаданных ${trackNumber}:`, e);
            done(getFallbackTrack(trackNumber));
        }
    });
}

async function loadTracks() {
    console.log('Загрузка треков...');
    const loadedTracks = [];
    for (let i = 1; i <= TRACKS_COUNT; i++) {
        const track = await readMetadata(i);
        loadedTracks.push(track);
    }
    tracks = loadedTracks;
    console.log(`Загружено ${tracks.length} треков`);
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

function selectTrack(index) {
    if (tracks.length === 0) return;
    currentTrackIndex = index;
    const track = tracks[index];
    if (!track) return;
    
    document.querySelectorAll('.playlist-bangs li').forEach(li => li.classList.remove('active'));
    const activeLi = document.querySelector(`.playlist-bangs li[data-index="${index}"]`);
    if (activeLi) activeLi.classList.add('active');
    
    updateMiniPlayer(index);
    
    audio.src = track.url;
    audio.load();
    
    if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.error('Ошибка воспроизведения:', err);
                isPlaying = false;
                const btn = document.getElementById('play-btn-mini');
                if (btn) btn.textContent = '▶';
            });
        }
    }
}

function updateMiniPlayer(index) {
    const track = tracks[index];
    if (!track) return;
    
    const titleEl = document.getElementById('track-mini');
    const artistEl = document.getElementById('artist-mini');
    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
}

function togglePlay() {
    const btn = document.getElementById('play-btn-mini');
    if (!btn) return;
    
    if (tracks.length === 0) {
        console.warn('Треки ещё не загружены, подождите...');
        return;
    }
    
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        btn.textContent = '▶';
    } else {
        if (!audio.src || audio.src === '' || audio.src === window.location.href) {
            selectTrack(currentTrackIndex);
        }
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                btn.textContent = '⏸';
            }).catch(err => {
                console.error('Play error:', err);
                // Повторная попытка через 50мс
                setTimeout(() => {
                    audio.play().then(() => {
                        isPlaying = true;
                        btn.textContent = '⏸';
                    }).catch(e => console.error('Retry play error:', e));
                }, 50);
            });
        }
    }
}

function nextTrack() {
    if (tracks.length === 0) return;
    const next = (currentTrackIndex + 1) % tracks.length;
    selectTrack(next);
    if (!isPlaying) {
        audio.play().then(() => {
            isPlaying = true;
            const btn = document.getElementById('play-btn-mini');
            if (btn) btn.textContent = '⏸';
        }).catch(() => {});
    }
}

function prevTrack() {
    if (tracks.length === 0) return;
    const prev = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    selectTrack(prev);
    if (!isPlaying) {
        audio.play().then(() => {
            isPlaying = true;
            const btn = document.getElementById('play-btn-mini');
            if (btn) btn.textContent = '⏸';
        }).catch(() => {});
    }
}

function initPlayer() {
    loadTracks().then(() => {
        const header = document.getElementById('player-bangs-header');
        const player = document.getElementById('player-bangs');
        
        if (header) {
            header.addEventListener('click', (e) => {
                if (e.target.closest('.controls-mini')) return;
                player.classList.toggle('expanded');
            });
        }
        
        const playBtn = document.getElementById('play-btn-mini');
        const prevBtn = document.getElementById('prev-btn-mini');
        const nextBtn = document.getElementById('next-btn-mini');
        
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePlay();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                nextTrack();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                prevTrack();
            });
        }
        
        audio.addEventListener('ended', nextTrack);
        
        audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
        });
        
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                const fillEl = document.getElementById('progress-fill-mini');
                const curEl = document.getElementById('current-time-mini');
                const totEl = document.getElementById('total-time-mini');
                if (fillEl) fillEl.style.width = progress + '%';
                if (curEl) curEl.textContent = formatTime(audio.currentTime);
                if (totEl) totEl.textContent = formatTime(audio.duration);
            }
        });
        
        document.getElementById('progress-track-mini')?.addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            if (audio.duration) audio.currentTime = percent * audio.duration;
        });
        
        initEqualizer();
    }).catch(err => {
        console.error('Ошибка инициализации плеера:', err);
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
