// === ПЛЕЕР С ЧЕЛКОЙ (БЕЗ JSMEDIATAGS) ===

let currentTrackIndex = 0;
let isPlaying = false;
const audio = new Audio();
audio.volume = 0.7;

function buildPlaylist() {
    const list = document.getElementById('playlist-bangs');
    if (!list) return;
    list.innerHTML = '';
    
    TRACKS.forEach((track, i) => {
        const li = document.createElement('li');
        li.dataset.index = i;
        li.innerHTML = `
            <div style="width: 32px; height: 32px; background: var(--glass-bg); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">🎵</div>
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
    currentTrackIndex = index;
    const track = TRACKS[index];
    if (!track) return;
    
    document.querySelectorAll('.playlist-bangs li').forEach(li => li.classList.remove('active'));
    const activeLi = document.querySelector(`.playlist-bangs li[data-index="${index}"]`);
    if (activeLi) activeLi.classList.add('active');
    
    updateMiniPlayer(index);
    
    audio.src = getTrackUrl(track.file);
    
    if (isPlaying) {
        audio.play().catch(err => {
            console.error('Ошибка воспроизведения:', err);
            isPlaying = false;
            document.getElementById('play-btn-mini').textContent = '▶';
        });
    }
}

function updateMiniPlayer(index) {
    const track = TRACKS[index];
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
        if (!audio.src) {
            selectTrack(currentTrackIndex);
        }
        audio.play().then(() => {
            isPlaying = true;
            btn.textContent = '⏸';
        }).catch(err => {
            console.error('Play error:', err);
        });
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
    buildPlaylist();
    updateMiniPlayer(0);
    
    // Челка - раскрытие/скрытие
    const header = document.getElementById('player-bangs-header');
    const player = document.getElementById('player-bangs');
    
    if (header) {
        header.addEventListener('click', (e) => {
            if (e.target.closest('.controls-mini')) return;
            player.classList.toggle('expanded');
        });
    }
    
    // Кнопки управления
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
    
    // Автопереключение
    audio.addEventListener('ended', nextTrack);
    
    // Ошибки
    audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
    });
    
    // Прогресс
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            document.getElementById('progress-fill-mini').style.width = progress + '%';
            document.getElementById('current-time-mini').textContent = formatTime(audio.currentTime);
            document.getElementById('total-time-mini').textContent = formatTime(audio.duration);
        }
    });
    
    // Клик по прогрессу
    document.getElementById('progress-track-mini')?.addEventListener('click', (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (audio.duration) audio.currentTime = percent * audio.duration;
    });
    
    // Эквалайзер
    initEqualizer();
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// === ЭКВАЛАЙЗЕР ===
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
