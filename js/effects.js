// === ВСЕ ЭФФЕКТЫ ===

// === ГИРЛЯНДА ===
function initGarland() {
    const garland = document.getElementById('garland');
    if (!garland) return;
    const count = Math.floor(window.innerWidth / 25);
    for (let i = 0; i < count; i++) {
        const bulb = document.createElement('div');
        bulb.className = 'bulb';
        bulb.style.backgroundColor = BULB_COLORS[i % BULB_COLORS.length];
        bulb.style.color = BULB_COLORS[i % BULB_COLORS.length];
        bulb.style.animationDelay = `${i * 0.15}s`;
        garland.appendChild(bulb);
    }
}

// === ЗАМОРОЗКА КАРТОЧЕК ===
function initFreeze() {
    document.querySelectorAll('.freeze-target').forEach(card => {
        card.addEventListener('click', function() {
            if (this.classList.contains('frozen')) return;
            this.classList.add('frozen');
            setTimeout(() => this.classList.remove('frozen'), 1500);
        });
    });
}

// === ВОЛШЕБНЫЙ ПОДАРОК ===
function initGift() {
    const gift = document.getElementById('magic-gift');
    const toast = document.getElementById('prediction-toast');
    if (!gift || !toast) return;
    
    gift.addEventListener('click', (e) => {
        e.stopPropagation();
        gift.classList.add('opened');
        const rect = gift.getBoundingClientRect();
        createClickParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 30, ['#c9a227', '#8b0000', '#ffffff']);
        
        toast.textContent = PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];
        toast.classList.add('show');
        showToast('🎁 Предсказание получено!', 'success');
        
        setTimeout(() => {
            gift.classList.remove('opened');
            toast.classList.remove('show');
        }, 3000);
    });
}

// === ТАЙМЕР ОБРАТНОГО ОТСЧЁТА ===
function initTimer() {
    function update() {
        const now = new Date();
        const nextYear = new Date(now.getFullYear() + 1, 0, 1);
        const diff = nextYear - now;
        const days = document.getElementById('days');
        const hours = document.getElementById('hours');
        const minutes = document.getElementById('minutes');
        const seconds = document.getElementById('seconds');
        
        if (days) days.textContent = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (hours) hours.textContent = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
        if (minutes) minutes.textContent = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
        if (seconds) seconds.textContent = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
    }
    update();
    setInterval(update, 1000);
}

// === ЧАТ / ПИСЬМО ===
function initLetter() {
    let isLoggedIn = false;
    const chatInput = document.getElementById('letter-text');
    const sendBtn = document.getElementById('send-letter-btn');
    const chatContainer = document.getElementById('chat-messages');
    const loginBtn = document.getElementById('chat-login-btn');
    const lockedMsg = document.getElementById('locked-msg');
    const letterArea = document.getElementById('letter-area');

    if (!chatInput || !sendBtn || !chatContainer || !loginBtn) {
        console.error('initLetter: не найдены обязательные элементы!');
        return;
    }

    loadChatMessages();

    loginBtn.addEventListener('click', async function() {
        const nick = prompt('Введи свой ник (минимум 2 символа):');
        if (!nick || nick.trim().length < 2) {
            showToast('Ник должен быть минимум 2 символа!', 'warning');
            return;
        }
        if (typeof antiMat !== 'undefined') {
            const nickCheck = antiMat.check(nick);
            if (nickCheck.isBanned) {
                showToast('Ник содержит запрещенные слова!', 'error');
                return;
            }
        }

        try {
            const result = await db.login(nick.trim());
            if (result && result.session_id) {
                isLoggedIn = true;
                loginBtn.style.display = 'none';
                if (lockedMsg) lockedMsg.style.display = 'none';
                if (letterArea) letterArea.style.display = 'flex';
                
                const statusBadge = document.getElementById('chat-status-badge');
                if (statusBadge) {
                    statusBadge.className = 'status-badge';
                    statusBadge.style.background = 'rgba(45, 90, 39, 0.2)';
                    statusBadge.style.color = '#2d5a27';
                    statusBadge.innerHTML = '<span class="status-dot" style="background: #2d5a27;"></span> online';
                }
                
                showToast(`Добро пожаловать, ${nick}!`, 'success');
                appendMessageToChat({ nick: '🎅 Система', text: `${nick} присоединился к чату!`, system: 1, time: Date.now() });
            } else {
                showToast('Ошибка входа. Проверьте консоль (F12).', 'error');
                console.error('Результат логина:', result);
            }
        } catch (error) {
            console.error('ОШИБКА ЛОГИНА:', error);
            showToast('Ошибка входа: ' + error.message, 'error');
        }
    });

    sendBtn.addEventListener('click', async function() {
        if (!isLoggedIn) return;
        const text = chatInput.value.trim();
        if (!text) return;

        if (typeof antiMat !== 'undefined') {
            const check = antiMat.check(text);
            if (check.isBanned) {
                showToast('Сообщение содержит запрещенное слово!', 'error');
                chatInput.value = '';
                return;
            }
        }

        const result = await db.sendMessage(db.currentNick, text);
        if (result && result.success) {
            appendMessageToChat({ nick: db.currentNick, text, system: 0, time: Date.now() });
            chatInput.value = '';
            const rect = sendBtn.getBoundingClientRect();
            createClickParticles(rect.left + 20, rect.top, 15, ['#2d5a27', '#c9a227']);
        } else {
            showToast('Ошибка отправки. Проверьте консоль (F12).', 'error');
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });

    // Автообновление чата каждые 5 секунд
    setInterval(loadChatMessages, 5000);
}

async function loadChatMessages() {
    try {
        const messages = await db.getMessages(50);
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;
        
        if (messages && messages.length > 0) {
            chatContainer.innerHTML = '';
            messages.reverse().forEach(msg => appendMessageToChat(msg));
        }
    } catch (e) {
        console.warn('Ошибка загрузки сообщений:', e);
    }
}

function appendMessageToChat(msg) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    const msgDiv = document.createElement('div');
    const isSystem = msg.system === 1;
    const time = new Date(msg.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    msgDiv.style.cssText = `
        padding: 10px; margin-bottom: 8px;
        background: ${isSystem ? 'rgba(201, 162, 39, 0.1)' : 'rgba(255,255,255,0.05)'};
        border-radius: 8px;
        border-left: 3px solid ${isSystem ? '#c9a227' : '#2d5a27'};
        animation: fadeIn 0.3s ease;
    `;
    
    let content = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-weight:bold;color:${isSystem ? '#c9a227' : '#2d5a27'};">${msg.nick}</span>
            <span style="font-size:0.75rem;color:var(--text-secondary);">${time}</span>
        </div>
        <div style="color:var(--text-primary);word-wrap:break-word;">${msg.text || ''}</div>
    `;
    
    if (msg.sticker) content += `<img src="/stickers/${msg.sticker}" style="max-width:150px;border-radius:8px;margin-top:8px;">`;
    if (msg.photo) content += `<img src="${msg.photo}" style="max-width:100%;border-radius:8px;margin-top:8px;">`;
    
    msgDiv.innerHTML = content;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// === СОЗДАНИЕ ЧАСТИЦ ПРИ КЛИКЕ ===
function createClickParticles(x, y, count = 20, colors = PARTICLE_COLORS) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 4 + Math.random() * 8;
        const angle = (Math.random() * Math.PI * 2);
        const speed = 50 + Math.random() * 100;
        
        particle.style.cssText = `
            position: fixed; left: ${x}px; top: ${y}px;
            width: ${size}px; height: ${size}px;
            background: ${color}; border-radius: 50%;
            pointer-events: none; z-index: 9999;
        `;
        document.body.appendChild(particle);
        
        particle.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * speed}px, ${Math.sin(angle) * speed}px) scale(0)`, opacity: 0 }
        ], { duration: 600 + Math.random() * 400, fill: 'forwards' }).onfinish = () => particle.remove();
    }
}

// === КАСТОМНЫЙ КУРСОР ===
function initCustomCursor() {
    if ('ontouchstart' in window) return;
    const cursor = document.getElementById('custom-cursor');
    const trailContainer = document.getElementById('cursor-trail-container');
    if (!cursor || !trailContainer) return;

    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    const trailPoints = [];
    const maxTrailPoints = 20;
    const trailInterval = 30;
    let lastTrailTime = 0;
    const stars = [];
    const maxStars = 15;

    document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

    function createStar(x, y) {
        if (stars.length >= maxStars) {
            const oldStar = stars.shift();
            if (oldStar && oldStar.el) oldStar.el.remove();
        }
        const star = document.createElement('div');
        star.style.cssText = `
            position:fixed; left:${x}px; top:${y}px;
            width:12px; height:12px; pointer-events:none; z-index:9998;
            font-size:12px; color:#FFD700;
            text-shadow: 0 0 10px #FFD700, 0 0 20px #FFA500;
            animation: starFade 0.8s ease-out forwards;
        `;
        star.textContent = '✨';
        document.body.appendChild(star);
        const starObj = { el: star };
        stars.push(starObj);
        setTimeout(() => {
            star.remove();
            const i = stars.indexOf(starObj);
            if (i > -1) stars.splice(i, 1);
        }, 800);
    }

    function animateCursor(timestamp) {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        cursor.style.left = cursorX - 10 + 'px';
        cursor.style.top = cursorY - 10 + 'px';

        if (timestamp - lastTrailTime > trailInterval) {
            trailPoints.push({ x: mouseX, y: mouseY, life: 1 });
            if (trailPoints.length > maxTrailPoints) trailPoints.shift();
            if (Math.random() < 0.3) createStar(mouseX + (Math.random() - 0.5) * 20, mouseY + (Math.random() - 0.5) * 20);
            lastTrailTime = timestamp;
        }

        trailContainer.innerHTML = '';
        trailPoints.forEach((point, index) => {
            point.life -= 0.05;
            if (point.life <= 0) { trailPoints.splice(index, 1); return; }
            const dot = document.createElement('div');
            const size = 6 * point.life;
            dot.style.cssText = `
                position:fixed; left:${point.x - size/2}px; top:${point.y - size/2}px;
                width:${size}px; height:${size}px;
                background: radial-gradient(circle, rgba(255,215,0,${point.life}), rgba(255,165,0,${point.life * 0.5}));
                border-radius:50%; pointer-events:none; z-index:9998;
                box-shadow: 0 0 ${10 * point.life}px rgba(255,215,0,${point.life});
            `;
            trailContainer.appendChild(dot);
        });

        requestAnimationFrame(animateCursor);
    }

    requestAnimationFrame(animateCursor);

    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.8)';
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createStar(mouseX + (Math.random() - 0.5) * 40, mouseY + (Math.random() - 0.5) * 40), i * 50);
        }
    });
    document.addEventListener('mouseup', () => { cursor.style.transform = 'scale(1)'; });
}

// === ПАРАЛЛАКС ПРИ НАКЛОНЕ (мобильный) ===
function initParallax() {
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
            const x = e.gamma / 30 || 0;
            const y = e.beta / 30 || 0;
            document.querySelectorAll('.bg-orb').forEach((orb, i) => {
                const speed = (i + 1) * 10;
                orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
            });
        });
    }
}

// === ВОДОПАД ИСКР (за 7 дней до НГ) ===
function initSparkWaterfall() {
    const now = new Date();
    const newYear = new Date(now.getFullYear() + 1, 0, 1);
    const diffDays = (newYear - now) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 2 + Math.random() * 4,
        length: 10 + Math.random() * 30,
        opacity: 0.3 + Math.random() * 0.5
    }));

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#c9a227';
        particles.forEach(p => {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x, p.y + p.length);
            ctx.strokeStyle = `rgba(201, 162, 39, ${p.opacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            p.y += p.speed;
            if (p.y > canvas.height) { p.y = -p.length; p.x = Math.random() * canvas.width; }
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// === ФЕЙЕРВЕРК ===
function initFireworks() {
    const canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

    const particles = [];

    function launchFirework() {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.5;
        const color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        for (let i = 0; i < 40; i++) {
            const angle = (i / 40) * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color });
        }
    }

    function animateFireworks() {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.02;
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
            if (p.life <= 0) particles.splice(i, 1);
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(animateFireworks);
    }

    const now = new Date();
    const isNY = (now.getMonth() === 11 && now.getDate() === 31) || (now.getMonth() === 0 && now.getDate() === 1);
    if (isNY) {
        setInterval(launchFirework, 800);
        animateFireworks();
    }
}

// === СТЕНА СЛАВЫ (заглушка) ===
function initWallOfFame() {
    // Заготовка под будущую функцию
}

// === СМЕНА ТЕМЫ (простая) ===
function initThemeSwitcher() {
    // Обрабатывается через main.js
}

// === СТИЛИ АНИМАЦИЙ ===
(function() {
    const s1 = document.createElement('style');
    s1.textContent = `
        @keyframes starFade {
            0% { opacity: 1; transform: scale(1) rotate(0deg); }
            100% { opacity: 0; transform: scale(0.3) rotate(180deg) translateY(-20px); }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(s1);
})();
