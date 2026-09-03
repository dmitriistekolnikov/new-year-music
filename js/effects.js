// === БАЗОВЫЕ ЭФФЕКТЫ ===
function initGarland() {
    const garland = document.getElementById('garland');
    if (!garland) return;
    const count = Math.floor(window.innerWidth / 25);
    for (let i = 0; i < count; i++) {
        const bulb = document.createElement('div');
        bulb.className = 'bulb';
        bulb.style.backgroundColor = BULB_COLORS[i % BULB_COLORS.length];
        bulb.style.color = BULB_COLORS[i % BULB_COLORS.length];
        bulb.style.animationDelay = `${i * 0.1}s`;
        garland.appendChild(bulb);
    }
}

function initFreeze() {
    document.querySelectorAll('.freeze-target').forEach(card => {
        card.addEventListener('click', function() {
            if (this.classList.contains('frozen')) return;
            this.classList.add('frozen');
            setTimeout(() => this.classList.remove('frozen'), 1500);
        });
    });
}

function initGift() {
    const gift = document.getElementById('magic-gift');
    const toast = document.getElementById('prediction-toast');
    if (!gift || !toast) return;
    
    gift.addEventListener('click', (e) => {
        e.stopPropagation();
        gift.classList.add('opened');
        if (typeof createClickParticles === 'function') {
            createClickParticles(gift.getBoundingClientRect().left + 30, gift.getBoundingClientRect().top + 30, 30, ['#fbbf24', '#ef4444', '#ffffff']);
        }
        toast.textContent = PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];
        toast.classList.add('show');
        setTimeout(() => { gift.classList.remove('opened'); toast.classList.remove('show'); }, 3000);
    });
}

function initThemeSwitcher() {
    const btn = document.getElementById('theme-btn');
    if (!btn) return;
    let currentTheme = 0;
    btn.addEventListener('click', () => {
        currentTheme = (currentTheme + 1) % THEMES.length;
        document.body.className = THEMES[currentTheme];
    });
    btn.addEventListener('mouseenter', () => { btn.innerHTML = '⛄ Тема'; });
    btn.addEventListener('mouseleave', () => { btn.innerHTML = '🎨 Тема'; });
}

function initTimer() {
    function update() {
        const now = new Date();
        const nextYear = new Date(now.getFullYear() + 1, 0, 1);
        const diff = nextYear - now;
        const d = document.getElementById('days');
        const h = document.getElementById('hours');
        const m = document.getElementById('minutes');
        const s = document.getElementById('seconds');
        if (d) d.textContent = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (h) h.textContent = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
        if (m) m.textContent = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
        if (s) s.textContent = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
    }
    update();
    setInterval(update, 1000);
}

// === НОВЫЕ ЭФФЕКТЫ ===
function initCandles() {
    const container = document.createElement('div');
    container.id = 'candles-container';
    container.style.cssText = 'position: fixed; bottom: 20px; left: 20px; display: flex; gap: 20px; z-index: 100;';
    for (let i = 0; i < 3; i++) {
        const candle = document.createElement('div');
        candle.className = 'candle';
        candle.style.cssText = 'width: 30px; height: 80px; background: linear-gradient(to bottom, #fff5e6, #f5deb3); border-radius: 4px; position: relative; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.3);';
        const flame = document.createElement('div');
        flame.className = 'flame';
        flame.style.cssText = 'position: absolute; top: -25px; left: 50%; transform: translateX(-50%); width: 20px; height: 30px; background: radial-gradient(circle, #fbbf24, #f59e0b, #ef4444); border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; animation: flicker 0.3s infinite alternate; box-shadow: 0 0 20px #fbbf24;';
        candle.appendChild(flame);
        candle.addEventListener('click', function() {
            if (this.classList.contains('blown')) {
                this.classList.remove('blown');
                flame.style.display = 'block';
            } else {
                this.classList.add('blown');
                flame.style.display = 'none';
                const smoke = document.createElement('div');
                smoke.style.cssText = 'position: absolute; top: -30px; left: 50%; width: 10px; height: 10px; background: rgba(200,200,200,0.5); border-radius: 50%; animation: smokeRise 2s forwards;';
                this.appendChild(smoke);
                setTimeout(() => smoke.remove(), 2000);
            }
        });
        container.appendChild(candle);
    }
    document.body.appendChild(container);
    const style = document.createElement('style');
    style.textContent = `@keyframes flicker { 0% { transform: translateX(-50%) scale(1) rotate(-2deg); } 100% { transform: translateX(-50%) scale(1.1) rotate(2deg); } } @keyframes smokeRise { 0% { opacity: 0.5; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-50px) scale(2); } }`;
    document.head.appendChild(style);
}

function initPhotoFrame() {
    const frame = document.createElement('div');
    frame.id = 'photo-frame';
    frame.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 300px; height: 300px; border: 15px solid transparent; border-image: repeating-linear-gradient(45deg, #ef4444, #22c55e, #38bdf8, #fbbf24) 30; background: rgba(0,0,0,0.8); display: none; align-items: center; justify-content: center; z-index: 1000; cursor: pointer; border-radius: 10px;';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'position: absolute; top: -40px; right: 0; background: #ef4444; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 1.2rem;';
    closeBtn.onclick = (e) => { e.stopPropagation(); frame.style.display = 'none'; };
    frame.appendChild(closeBtn);
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            Array.from(frame.children).forEach(child => { if (child !== closeBtn) frame.removeChild(child); });
            const img = document.createElement('img');
            img.src = ev.target.result;
            img.style.cssText = 'max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 4px;';
            frame.appendChild(img);
            frame.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    });
    frame.addEventListener('click', (e) => { if (e.target === frame) input.click(); });
    document.body.appendChild(frame);
    
    const btn = document.createElement('button');
    btn.textContent = '📸 Фото';
    btn.style.cssText = 'position: fixed; bottom: 100px; right: 20px; background: var(--accent-gold); color: #0f172a; border: none; padding: 10px 15px; border-radius: 12px; cursor: pointer; font-weight: bold; z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.3);';
    btn.onclick = () => input.click();
    document.body.appendChild(btn);
}

function initReflection() {
    const player = document.getElementById('player-bangs');
    if (!player) return;
    const reflection = player.cloneNode(true);
    reflection.id = 'player-reflection';
    reflection.style.cssText = 'position: fixed; top: calc(24px + 100%); left: 50%; transform: translateX(-50%) scaleY(-1); opacity: 0.15; pointer-events: none; filter: blur(2px); mask-image: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent); -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);';
    document.body.appendChild(reflection);
}

function initCuckooClock() {
    const clock = document.createElement('div');
    clock.id = 'cuckoo-clock';
    clock.style.cssText = 'position: fixed; top: 100px; left: 20px; width: 120px; height: 120px; background: radial-gradient(circle, #fbbf24, #f59e0b); border-radius: 50%; border: 8px solid #8b4513; box-shadow: 0 8px 20px rgba(0,0,0,0.3); z-index: 100; cursor: pointer; display: flex; align-items: center; justify-content: center;';
    const face = document.createElement('div');
    face.style.cssText = 'position: relative; width: 100%; height: 100%;';
    const hourHand = document.createElement('div');
    hourHand.style.cssText = 'position: absolute; top: 50%; left: 50%; width: 4px; height: 35px; background: #0f172a; transform-origin: bottom center; border-radius: 2px;';
    const minHand = document.createElement('div');
    minHand.style.cssText = 'position: absolute; top: 50%; left: 50%; width: 3px; height: 45px; background: #0f172a; transform-origin: bottom center; border-radius: 2px;';
    const cuckoo = document.createElement('div');
    cuckoo.textContent = '🐦';
    cuckoo.style.cssText = 'position: absolute; top: -40px; left: 50%; transform: translateX(-50%) translateY(50px); font-size: 2rem; opacity: 0; transition: all 0.5s;';
    
    face.appendChild(hourHand);
    face.appendChild(minHand);
    face.appendChild(cuckoo);
    clock.appendChild(face);
    
    function updateClock() {
        const now = new Date();
        const h = now.getHours() % 12;
        const m = now.getMinutes();
        const s = now.getSeconds();
        hourHand.style.transform = `translateX(-50%) rotate(${h * 30 + m * 0.5}deg)`;
        minHand.style.transform = `translateX(-50%) rotate(${m * 6 + s * 0.1}deg)`;
        if (m === 0 && s === 0) {
            cuckoo.style.opacity = '1';
            cuckoo.style.transform = 'translateX(-50%) translateY(0)';
            setTimeout(() => { cuckoo.style.opacity = '0'; cuckoo.style.transform = 'translateX(-50%) translateY(50px)'; }, 3000);
        }
    }
    setInterval(updateClock, 1000);
    updateClock();
    document.body.appendChild(clock);
}

function initPuzzle() {
    const imageUrl = '/i-_1_.png'; 
    const puzzleContainer = document.createElement('div');
    puzzleContainer.id = 'puzzle-container';
    puzzleContainer.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 300px; height: 300px; background: rgba(0,0,0,0.9); border-radius: 16px; padding: 20px; display: none; flex-direction: column; align-items: center; z-index: 1001; border: 1px solid var(--glass-border);';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'align-self: flex-end; background: #ef4444; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; margin-bottom: 10px;';
    closeBtn.onclick = () => puzzleContainer.style.display = 'none';
    puzzleContainer.appendChild(closeBtn);
    
    const title = document.createElement('h3');
    title.textContent = '🧩 Собери картинку!';
    title.style.cssText = 'color: white; margin-bottom: 10px; font-size: 1rem;';
    puzzleContainer.appendChild(title);
    
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; width: 270px; height: 270px;';
    
    const pieces = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const piece = document.createElement('div');
            piece.style.cssText = `width: 90px; height: 90px; background-image: url(${imageUrl}); background-size: 270px 270px; background-position: ${-c * 90}px ${-r * 90}px; border: 2px solid var(--accent-gold); border-radius: 4px; cursor: pointer; transition: transform 0.2s;`;
            piece.dataset.row = r;
            piece.dataset.col = c;
            piece.addEventListener('click', function() {
                const idx = pieces.indexOf(this);
                if (idx > 0 && Math.random() > 0.5) {
                    const temp = pieces[idx - 1].style.backgroundPosition;
                    pieces[idx - 1].style.backgroundPosition = this.style.backgroundPosition;
                    this.style.backgroundPosition = temp;
                }
            });
            pieces.push(piece);
            grid.appendChild(piece);
        }
    }
    pieces.forEach(piece => {
        const randomRow = Math.floor(Math.random() * 3);
        const randomCol = Math.floor(Math.random() * 3);
        piece.style.backgroundPosition = `${-randomCol * 90}px ${-randomRow * 90}px`;
    });
    
    puzzleContainer.appendChild(grid);
    document.body.appendChild(puzzleContainer);
    
    const btn = document.createElement('button');
    btn.textContent = '🧩 Пазл';
    btn.style.cssText = 'position: fixed; bottom: 140px; right: 20px; background: var(--accent-blue); color: white; border: none; padding: 10px 15px; border-radius: 12px; cursor: pointer; font-weight: bold; z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.3);';
    btn.onclick = () => puzzleContainer.style.display = 'flex';
    document.body.appendChild(btn);
}

function initCustomCursor() {
    if ('ontouchstart' in window) return;
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    cursor.innerHTML = '❄️';
    cursor.style.cssText = 'position: fixed; pointer-events: none; font-size: 1.5rem; z-index: 9999; transition: transform 0.1s;';
    document.body.appendChild(cursor);
    document.body.style.cursor = 'none';

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('button, a, input, .playlist-bangs li, .candle').forEach(el => {
        el.addEventListener('mouseenter', () => { cursor.style.transform = 'scale(1.5)'; cursor.innerHTML = '🎄'; });
        el.addEventListener('mouseleave', () => { cursor.style.transform = 'scale(1)'; cursor.innerHTML = '❄️'; });
    });
}

function initParallax() {
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
            const x = (e.gamma || 0) / 30; 
            const y = (e.beta || 0) / 30;
            document.querySelectorAll('.bg-orb').forEach((orb, i) => {
                const speed = (i + 1) * 15;
                orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
            });
        });
    }
}

function initTreeCounter() {
    let count = parseInt(localStorage.getItem('treeClicks') || '0');
    const counter = document.createElement('div');
    counter.id = 'tree-counter';
    counter.innerHTML = `🎄 ${count}`;
    counter.style.cssText = 'position: fixed; top: 100px; right: 20px; background: var(--glass-bg); backdrop-filter: blur(10px); padding: 10px 15px; border-radius: 12px; border: 1px solid var(--glass-border); cursor: pointer; font-weight: bold; z-index: 100; transition: transform 0.2s; user-select: none;';
    
    counter.addEventListener('click', () => {
        count++;
        counter.innerHTML = `🎄 ${count}`;
        counter.style.transform = 'scale(1.2) rotate(10deg)';
        setTimeout(() => counter.style.transform = 'scale(1) rotate(0deg)', 200);
        localStorage.setItem('treeClicks', count);
    });
    document.body.appendChild(counter);
}

function initSparkWaterfall() {
    const now = new Date();
    const newYear = new Date(now.getFullYear() + 1, 0, 1);
    const diffDays = (newYear - now) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) return; 
    
    const canvas = document.createElement('canvas');
    canvas.id = 'waterfall-canvas';
    canvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5;';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: 2 + Math.random() * 4, length: 10 + Math.random() * 30, opacity: 0.3 + Math.random() * 0.5 });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fbbf24';
        particles.forEach(p => {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x, p.y + p.length);
            ctx.strokeStyle = `rgba(251, 191, 36, ${p.opacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            p.y += p.speed;
            if (p.y > canvas.height) { p.y = -p.length; p.x = Math.random() * canvas.width; }
        });
        requestAnimationFrame(animate);
    }
    animate();
}

function initNameFirework() {
    const sendBtn = document.getElementById('send-letter-btn');
    if (!sendBtn) return;
    
    sendBtn.addEventListener('click', () => {
        const nick = db.currentNick;
        if (!nick) return;
        const letters = nick.split('');
        const colors = ['#fbbf24', '#ef4444', '#22c55e', '#38bdf8', '#f472b6'];
        
        letters.forEach((char, i) => {
            setTimeout(() => {
                const span = document.createElement('span');
                span.textContent = char;
                span.style.cssText = `position: fixed; left: 50%; top: 50%; color: ${colors[i % colors.length]}; font-size: 2rem; font-weight: bold; pointer-events: none; z-index: 9999;`;
                document.body.appendChild(span);
                const angle = (i / letters.length) * Math.PI * 2;
                const dist = 100 + Math.random() * 200;
                span.animate([
                    { transform: 'translate(0,0) scale(1)', opacity: 1 },
                    { transform: `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px) scale(0)`, opacity: 0 }
                ], { duration: 1500, fill: 'forwards' }).onfinish = () => span.remove();
            }, i * 50);
        });
    });
}

// === ФУНКЦИИ ЧАТА (ТЕПЕРЬ ОНИ НА МЕСТЕ!) ===
async function loadChatMessages() {
    const messages = await db.getMessages(50);
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    if (messages.length > 0) {
        chatContainer.innerHTML = '';
        messages.reverse().forEach(msg => {
            appendMessageToChat(msg);
        });
    }
}

function appendMessageToChat(msg) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    const msgDiv = document.createElement('div');
    const isSystem = msg.system === 1;
    const time = new Date(msg.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    msgDiv.style.cssText = `padding: 10px; margin-bottom: 8px; background: ${isSystem ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,0.05)'}; border-radius: 8px; border-left: 3px solid ${isSystem ? 'var(--accent-gold)' : 'var(--accent-green)'}; animation: fadeIn 0.3s ease;`;
    
    let content = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-weight: bold; color: ${isSystem ? 'var(--accent-gold)' : 'var(--accent-green)'};">${msg.nick}</span>
        <span style="font-size: 0.75rem; color: var(--text-secondary);">${time}</span>
    </div>
    <div style="color: var(--text-primary); word-wrap: break-word;">${msg.text}</div>`;
    
    if (msg.sticker) {
        content += `<img src="https://raw.githubusercontent.com/dmitriistekolnikov/new-year-music/main/stickers/${msg.sticker}" style="max-width: 150px; border-radius: 8px; margin-top: 8px;">`;
    }
    if (msg.photo) {
        content += `<img src="${msg.photo}" style="max-width: 100%; border-radius: 8px; margin-top: 8px;">`;
    }
    
    msgDiv.innerHTML = content;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Добавляем стиль анимации чата
const chatStyle = document.createElement('style');
chatStyle.textContent = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(chatStyle);

function initLetter() {
    let isLoggedIn = false;
    const chatInput = document.getElementById('letter-text');
    const sendBtn = document.getElementById('send-letter-btn');
    
    loadChatMessages();
    
    document.getElementById('chat-login-btn').addEventListener('click', async function() {
        const nick = prompt('Введи свой ник:');
        if (!nick || nick.trim().length < 2) { alert('Ник должен быть минимум 2 символа!'); return; }
        if (antiMat.check(nick).isBanned) { alert('Ник содержит запрещенные слова!'); return; }
        
        const result = await db.login(nick.trim());
        if (result) {
            isLoggedIn = true;
            this.style.display = 'none';
            document.getElementById('locked-msg').style.display = 'none';
            document.getElementById('letter-area').style.display = 'flex';
            
            const statusBadge = document.getElementById('chat-status-badge');
            if (statusBadge) {
                statusBadge.className = 'status-badge';
                statusBadge.style.background = 'rgba(34, 197, 94, 0.2)';
                statusBadge.style.color = 'var(--accent-green)';
                statusBadge.innerHTML = '<span class="status-dot" style="background: var(--accent-green);"></span> online';
            }
            appendMessageToChat({ nick: '🎅 Система', text: `${nick} присоединился к чату!`, system: 1, time: Date.now() });
        } else {
            alert('Ошибка входа.');
        }
    });
    
    sendBtn.addEventListener('click', async function() {
        if (!isLoggedIn) return;
        const text = chatInput.value.trim();
        if (!text) return;
        if (antiMat.check(text).isBanned) { alert('Сообщение содержит запрещенное слово!'); chatInput.value = ''; return; }
        
        const result = await db.sendMessage(db.currentNick, text);
        if (result) {
            appendMessageToChat({ nick: db.currentNick, text: text, system: 0, time: Date.now() });
            chatInput.value = '';
            if (typeof createClickParticles === 'function') {
                createClickParticles(sendBtn.getBoundingClientRect().left + 20, sendBtn.getBoundingClientRect().top, 15, ['#22c55e', '#fbbf24']);
            }
        } else {
            alert('Ошибка отправки');
        }
    });
    
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });
}
// === ИНИЦИАЛИЗАЦИЯ НИЖНЕЙ ПАНЕЛИ ===
function initBottomPanel() {
    const panel = document.getElementById('bottom-panel');
    const header = document.getElementById('bottom-panel-header');
    
    if (!panel || !header) return;
    
    header.addEventListener('click', () => {
        panel.classList.toggle('expanded');
    });
    
    // Кнопка Фото
    document.getElementById('btn-photo').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = document.createElement('img');
                img.src = ev.target.result;
                img.style.cssText = 'max-width: 90vw; max-height: 90vh; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);';
                const overlay = document.createElement('div');
                overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 9999; cursor: pointer;';
                overlay.appendChild(img);
                overlay.onclick = () => overlay.remove();
                document.body.appendChild(overlay);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    });
    
    // Кнопка Пазл
    document.getElementById('btn-puzzle').addEventListener('click', () => {
        if (typeof initPuzzle === 'function') initPuzzle();
    });
    
    // Кнопка Свечи
    document.getElementById('btn-candles').addEventListener('click', () => {
        if (typeof initCandles === 'function') initCandles();
    });
    
    // Кнопка Часы
    document.getElementById('btn-clock').addEventListener('click', () => {
        if (typeof initCuckooClock === 'function') initCuckooClock();
    });
    
    // Кнопка Ёлка
    document.getElementById('btn-tree').addEventListener('click', () => {
        if (typeof initTreeCounter === 'function') initTreeCounter();
    });
}
