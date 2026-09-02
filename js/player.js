// === ПЛЕЕР ===

let currentTrackIndex = 11;
let isPlaying = false;
const audio = new Audio();
audio.volume = 0.7;

function getTrackUrl(filename) {
    return `${MEDIA_BASE_URL}/music/${encodeURIComponent(filename)}`;
}

function buildPlaylist() {
    const list = document.getElementById('playlist-bangs');
    TRACKS.forEach((track, i) => {
        const li = document.createElement('li');
        li.dataset.index = i;
        li.innerHTML = `<span>${i + 1}.</span> ${track.title} — ${track.artist}`;
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
    
    audio.src = getTrackUrl(track.file);
    if (isPlaying) {
        audio.play().catch(err => {
            console.log('Ошибка воспроизведения:', err);
        });
    }
}

function togglePlay() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('play-btn-mini');
    btn.textContent = isPlaying ? '⏸' : '▶';
    
    if (isPlaying) {
        if (!audio.src) selectTrack(currentTrackIndex);
        audio.play().catch(err => console.log('Play error:', err));
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
    buildPlaylist();
    
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
    
    // Автопереключение при окончании трека
    audio.addEventListener('ended', nextTrack);
    
    // Обновление прогресс-бара
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            document.getElementById('progress-fill-mini').style.width = progress + '%';
            document.getElementById('current-time-mini').textContent = formatTime(audio.currentTime);
            document.getElementById('total-time-mini').textContent = formatTime(audio.duration);
        }
    });
    
    // Клик по прогресс-бару для перемотки
    document.querySelector('.progress-track-mini').addEventListener('click', (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (audio.duration) audio.currentTime = percent * audio.duration;
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
