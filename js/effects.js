// === ВСЕ ЭФФЕКТЫ ===

// === 10. ГИРЛЯНДА ===
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

// === 16. ЗАМОРОЗКА КАРТОЧЕК ===
function initFreeze() {
    document.querySelectorAll('.freeze-target').forEach(card => {
        card.addEventListener('click', function() {
            if (this.classList.contains('frozen')) return;
            this.classList.add('frozen');
            setTimeout(() => this.classList.remove('frozen'), 1500);
        });
    });
}

// === 5. ВОЛШЕБНЫЙ ПОДАРОК ===
function initGift() {
    const gift = document.getElementById('magic-gift');
    const toast = document.getElementById('prediction-toast');
    if (!gift || !toast) return;

    gift.addEventListener('click', (e) => {
        e.stopPropagation();
        gift.classList.add('opened');
        const rect = gift.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        createClickParticles(centerX, centerY, 30, ['#c9a227', '#8b0000', '#ffffff']);
        toast.textContent = PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];
        toast.classList.add('show');
        setTimeout(() => {
            gift.classList.remove('opened');
            toast.classList.remove('show');
        }, 3000);
    });
}

// === 7. ПИСЬМО / ЧАТ С АНТИ-МАТОМ ===
// === 7. ЧАТ С ОТПРАВКОЙ СТИКЕРОВ И ФОТО ===
function initLetter() {
    let isLoggedIn = false;
    let currentNick = '';

    const chatInput     = document.getElementById('letter-text');
    const sendBtn       = document.getElementById('send-letter-btn');
    const chatContainer = document.getElementById('chat-messages');
    const loginBtn      = document.getElementById('chat-login-btn');
    const lockedMsg     = document.getElementById('locked-msg');
    const letterArea    = document.getElementById('letter-area');

    if (!chatInput || !sendBtn || !chatContainer || !loginBtn) {
        console.error('initLetter: не найдены обязательные элементы!');
        return;
    }

    // Стиль единой кнопки тулбара
    function mkBtn(emoji, title, color) {
        const btn = document.createElement('button');
        btn.textContent = emoji;
        btn.title = title;
        btn.style.cssText = `
            background: rgba(255,255,255,0.06);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            color: var(--text-primary);
            font-size: 1.15rem;
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s, transform 0.15s, border-color 0.2s;
            flex-shrink: 0;
        `;
        btn.addEventListener('mouseenter', () => {
            btn.style.background = color || 'rgba(201,162,39,0.18)';
            btn.style.borderColor = 'var(--accent-gold)';
            btn.style.transform = 'scale(1.08)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'rgba(255,255,255,0.06)';
            btn.style.borderColor = 'var(--glass-border)';
            btn.style.transform = 'scale(1)';
        });
        return btn;
    }

    // === Тулбар ===
    function buildToolbar() {
        if (document.getElementById('chat-toolbar')) return;

        // Скрываем старый photo-upload если есть
        const old = document.getElementById('photo-upload');
        if (old) old.style.display = 'none';

        const toolbar = document.createElement('div');
        toolbar.id = 'chat-toolbar';
        toolbar.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid var(--glass-border);
            position: relative;
        `;

        // --- Панель стикеров ---
        const stickerPanel = buildStickerPanel();
        toolbar.appendChild(stickerPanel);

        // --- Кнопка фото ---
        const photoInput = document.createElement('input');
        photoInput.type = 'file';
        photoInput.accept = 'image/*';
        photoInput.style.display = 'none';
        toolbar.appendChild(photoInput);

        const photoBtn = mkBtn('📷', 'Фото', 'rgba(14,165,233,0.2)');
        photoBtn.addEventListener('click', () => photoInput.click());
        photoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target.result;
                appendMessageToChat({ nick: currentNick, text: '', photo: dataUrl, system: 0, time: Date.now() });
                // Отправка на сервер (если поддерживается)
                if (typeof db !== 'undefined') {
                    db.sendMessage(currentNick, '', null, dataUrl).catch(() => {});
                }
            };
            reader.readAsDataURL(file);
            photoInput.value = '';
        });

        // --- Кнопка стикеров ---
        const stickerBtn = mkBtn('🎭', 'Стикеры', 'rgba(147,51,234,0.2)');
        stickerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            stickerPanel.style.display = stickerPanel.style.display === 'block' ? 'none' : 'block';
        });

        // --- Кнопка отправки (единый стиль) ---
        sendBtn.textContent = '➤';
        sendBtn.title = 'Отправить';
        sendBtn.style.cssText = `
            background: linear-gradient(135deg, var(--accent-green), #1a3d1a);
            border: 1px solid rgba(45,90,39,0.5);
            border-radius: 10px;
            color: #fff;
            font-size: 1.15rem;
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.15s, box-shadow 0.2s;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(45,90,39,0.3);
        `;
        sendBtn.addEventListener('mouseenter', () => {
            sendBtn.style.transform = 'scale(1.08)';
            sendBtn.style.boxShadow = '0 4px 16px rgba(45,90,39,0.5)';
        });
        sendBtn.addEventListener('mouseleave', () => {
            sendBtn.style.transform = 'scale(1)';
            sendBtn.style.boxShadow = '0 2px 8px rgba(45,90,39,0.3)';
        });

        toolbar.appendChild(photoBtn);
        toolbar.appendChild(stickerBtn);
        toolbar.appendChild(sendBtn);

        if (letterArea) letterArea.appendChild(toolbar);

        // Закрывать панель стикеров кликом снаружи
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#chat-toolbar')) {
                stickerPanel.style.display = 'none';
            }
        });
    }

    loadChatMessages();

    // === ЛОГИН ===
    loginBtn.addEventListener('click', async function () {
        const nick = prompt('Введи свой ник (минимум 2 символа):');
        if (!nick || nick.trim().length < 2) { alert('Ник должен быть минимум 2 символа!'); return; }
        const nickCheck = antiMat.check(nick);
        if (nickCheck.isBanned) { alert('Ник содержит запрещённые слова!'); return; }

        try {
            const result = await db.login(nick.trim());
            if (result && result.session_id) {
                isLoggedIn = true;
                currentNick = nick.trim();
                loginBtn.style.display = 'none';
                if (lockedMsg) lockedMsg.style.display = 'none';
                if (letterArea) letterArea.style.display = 'flex';

                const statusBadge = document.getElementById('chat-status-badge');
                if (statusBadge) {
                    statusBadge.className = 'status-badge';
                    statusBadge.style.background = 'rgba(45,90,39,0.2)';
                    statusBadge.style.color = '#2d5a27';
                    statusBadge.innerHTML = '<span class="status-dot" style="background:#2d5a27;"></span> online';
                }
                appendMessageToChat({ nick: '🎅 Система', text: `${currentNick} присоединился к чату!`, system: 1, time: Date.now() });
                buildToolbar();
            } else {
                alert('Ошибка входа: сервер не вернул session_id. Проверь консоль (F12).');
            }
        } catch (error) {
            console.error('КРИТИЧЕСКАЯ ОШИБКА ЛОГИНА:', error);
            alert('Ошибка входа: ' + error.message);
        }
    });

    // === ОТПРАВКА ТЕКСТА ===
    sendBtn.addEventListener('click', async function () {
        if (!isLoggedIn) return;
        const text = chatInput.value.trim();
        if (!text) return;
        const check = antiMat.check(text);
        if (check.isBanned) { alert('Сообщение содержит запрещённое слово!'); chatInput.value = ''; return; }

        const result = await db.sendMessage(currentNick, text);
        if (result && result.success) {
            appendMessageToChat({ nick: currentNick, text, system: 0, time: Date.now() });
            chatInput.value = '';
            createClickParticles(
                sendBtn.getBoundingClientRect().left + 20,
                sendBtn.getBoundingClientRect().top,
                15, ['#2d5a27', '#c9a227']
            );
        } else {
            alert('Ошибка отправки. Проверь консоль (F12).');
        }
    });

    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });

    // Если сессия уже есть — показываем тулбар сразу
    if (typeof db !== 'undefined') {
        db.checkSession && db.checkSession().then(has => {
            if (has) {
                isLoggedIn = true;
                currentNick = db.currentNick || '';
                if (letterArea) letterArea.style.display = 'flex';
                buildToolbar();
            }
        }).catch(() => {});
    }
}

// === ПАНЕЛЬ СТИКЕРОВ ===
function buildStickerPanel() {
    const panel = document.createElement('div');
    panel.id = 'sticker-panel';
    panel.style.cssText = `
        display: none;
        position: absolute;
        bottom: 50px;
        left: 0;
        width: 100%;
        max-height: 220px;
        background: rgba(10,10,15,0.97);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 14px;
        padding: 10px;
        z-index: 200;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    `;

    // --- Вкладки ---
    const tabs = document.createElement('div');
    tabs.style.cssText = 'display:flex;gap:6px;margin-bottom:8px;';

    function makeTab(label, active) {
        const t = document.createElement('button');
        t.textContent = label;
        t.style.cssText = `
            padding: 4px 12px;
            border-radius: 8px;
            border: 1px solid ${active ? 'var(--accent-gold)' : 'var(--glass-border)'};
            background: ${active ? 'rgba(201,162,39,0.18)' : 'transparent'};
            color: ${active ? 'var(--accent-gold)' : 'var(--text-secondary)'};
            cursor: pointer;
            font-size: 0.78rem;
            transition: all 0.2s;
        `;
        return t;
    }

    const catTab  = makeTab('🐱 Коты', true);
    const memeTab = makeTab('😂 Мемы', false);
    tabs.appendChild(catTab);
    tabs.appendChild(memeTab);
    panel.appendChild(tabs);

    // --- Грид ---
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,60px);gap:6px;';
    panel.appendChild(grid);

    function setActiveTab(active, inactive) {
        active.style.borderColor = 'var(--accent-gold)';
        active.style.background  = 'rgba(201,162,39,0.18)';
        active.style.color       = 'var(--accent-gold)';
        inactive.style.borderColor = 'var(--glass-border)';
        inactive.style.background  = 'transparent';
        inactive.style.color       = 'var(--text-secondary)';
    }

    function addSticker(url, stickerPath) {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = url;
        img.style.cssText = `
            width: 60px; height: 60px;
            object-fit: cover;
            border-radius: 8px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: border-color 0.15s, transform 0.15s;
        `;
        img.addEventListener('mouseenter', () => {
            img.style.borderColor = 'var(--accent-gold)';
            img.style.transform = 'scale(1.12)';
        });
        img.addEventListener('mouseleave', () => {
            img.style.borderColor = 'transparent';
            img.style.transform = 'scale(1)';
        });
        img.addEventListener('click', () => {
            sendStickerMessage(stickerPath);
            panel.style.display = 'none';
        });
        grid.appendChild(img);
    }

    function loadCats() {
        setActiveTab(catTab, memeTab);
        grid.innerHTML = '';
        for (let i = STICKERS_CATS_RANGE.start; i <= STICKERS_CATS_RANGE.end; i++) {
            const path = `cats/1-${i}-256b.png`;
            addSticker(`/stickers/${path}`, path);
        }
    }

    function loadMemes() {
        setActiveTab(memeTab, catTab);
        grid.innerHTML = '';
        STICKERS_MEMES.forEach(filename => {
            const path = `memes/${filename}`;
            addSticker(`/stickers/${path}`, path);
        });
    }

    catTab.addEventListener('click',  loadCats);
    memeTab.addEventListener('click', loadMemes);
    loadCats();

    return panel;
}

async function sendStickerMessage(stickerPath) {
    const nick = (typeof db !== 'undefined' && db.currentNick) ? db.currentNick : null;
    if (!nick) return;

    // Показываем локально сразу
    appendMessageToChat({ nick, text: '', sticker: stickerPath, system: 0, time: Date.now() });

    // Отправляем на сервер
    try {
        const sessionId = db.sessionId || db.currentSession || '';
        await fetch('/api/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nick, text: '', sticker: stickerPath, session_id: sessionId })
        });
    } catch (e) {
        console.warn('Стикер отправлен локально, но не сохранён на сервере:', e);
    }
                          }

function appendMessageToChat(msg) {
    const chatContainer = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    const isSystem = msg.system === 1;
    const time = new Date(msg.time).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });

    msgDiv.style.cssText = `
        padding: 10px;
        margin-bottom: 8px;
        background: ${isSystem ? 'rgba(201, 162, 39, 0.1)' : 'rgba(255,255,255,0.05)'};
        border-radius: 8px;
        border-left: 3px solid ${isSystem ? '#c9a227' : '#2d5a27'};
        animation: fadeIn 0.3s ease;
    `;

    let content = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: bold; color: ${isSystem ? '#c9a227' : '#2d5a27'};">
                ${msg.nick}
            </span>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">
                ${time}
            </span>
        </div>
        <div style="color: var(--text-primary); word-wrap: break-word;">${msg.text}</div>
    `;

    if (msg.sticker) {
        const stickerUrl = `/stickers/${msg.sticker}`;
        content += `<img src="${stickerUrl}" style="max-width: 150px; border-radius: 8px; margin-top: 8px;">`;
    }
    if (msg.photo) {
        content += `<img src="${msg.photo}" style="max-width: 100%; border-radius: 8px; margin-top: 8px;">`;
    }

    msgDiv.innerHTML = content;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// === 6. ТАЙМЕР ОБРАТНОГО ОТСЧЁТА ===
function initTimer() {
    function update() {
        const now = new Date();
        const nextYear = new Date(now.getFullYear() + 1, 0, 1);
        const diff = nextYear - now;
        document.getElementById('days').textContent = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById('hours').textContent = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
        document.getElementById('minutes').textContent = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
        document.getElementById('seconds').textContent = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
    }
    update();
    setInterval(update, 1000);
}

// === 12. КАСТОМНЫЙ КУРСОР ===
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const trailContainer = document.getElementById('cursor-trail-container');
    if (!cursor || !trailContainer) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    const trailPoints = [];
    const maxTrailPoints = 20;
    const trailInterval = 30;
    let lastTrailTime = 0;

    const stars = [];
    const maxStars = 15;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function createStar(x, y) {
        if (stars.length >= maxStars) {
            const oldStar = stars.shift();
            if (oldStar && oldStar.el) {
                oldStar.el.remove();
            }
        }
        const star = document.createElement('div');
        star.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 12px;
            height: 12px;
            pointer-events: none;
            z-index: 9998;
            font-size: 12px;
            color: #FFD700;
            text-shadow: 0 0 10px #FFD700, 0 0 20px #FFA500;
            animation: starFade 0.8s ease-out forwards;
        `;
        star.textContent = '✨';
        document.body.appendChild(star);
        const starObj = { el: star, life: 1, x, y };
        stars.push(starObj);
        setTimeout(() => {
            if (star.parentNode) star.remove();
            const index = stars.indexOf(starObj);
            if (index > -1) stars.splice(index, 1);
        }, 800);
    }

    function animateCursor(timestamp) {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        cursor.style.left = cursorX - 10 + 'px';
        cursor.style.top = cursorY - 10 + 'px';

        if (timestamp - lastTrailTime > trailInterval) {
            trailPoints.push({ x: mouseX, y: mouseY, life: 1 });
            if (trailPoints.length > maxTrailPoints) {
                trailPoints.shift();
            }
            if (Math.random() < 0.3) {
                createStar(mouseX + (Math.random() - 0.5) * 20, mouseY + (Math.random() - 0.5) * 20);
            }
            lastTrailTime = timestamp;
        }

        trailContainer.innerHTML = '';
        trailPoints.forEach((point, index) => {
            point.life -= 0.05;
            if (point.life <= 0) {
                trailPoints.splice(index, 1);
                return;
            }
            const dot = document.createElement('div');
            const size = 6 * point.life;
            dot.style.cssText = `
                position: fixed;
                left: ${point.x - size/2}px;
                top: ${point.y - size/2}px;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle, rgba(255,215,0,${point.life}), rgba(255,165,0,${point.life * 0.5}));
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
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
            setTimeout(() => {
                createStar(
                    mouseX + (Math.random() - 0.5) * 40,
                    mouseY + (Math.random() - 0.5) * 40
                );
            }, i * 50);
        }
    });

    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
    });

    // FIX: стили для starFade инжектируем здесь, внутри функции — не на уровне файла
    const starFadeStyle = document.createElement('style');
    starFadeStyle.textContent = `
        @keyframes starFade {
            0%   { opacity: 1; transform: scale(1) rotate(0deg); }
            100% { opacity: 0; transform: scale(0.3) rotate(180deg) translateY(-20px); }
        }
    `;
    document.head.appendChild(starFadeStyle);

    console.log('✅ Кастомный курсор со звёздами инициализирован');
}

// === 17. ПАРАЛЛАКС ПРИ НАКЛОНЕ ===
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

// === 24. ВОЛШЕБНЫЙ ВОДОПАД ИЗ ИСКР (за 7 дней до НГ) ===
function initSparkWaterfall() {
    const now = new Date();
    const newYear = new Date(now.getFullYear() + 1, 0, 1);
    const diffDays = (newYear - now) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'waterfall-canvas';
    canvas.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        z-index: 5;
    `;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 2 + Math.random() * 4,
            length: 10 + Math.random() * 30,
            opacity: 0.3 + Math.random() * 0.5
        });
    }

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
            if (p.y > canvas.height) {
                p.y = -p.length;
                p.x = Math.random() * canvas.width;
            }
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// === 26. ПРЕВРАЩЕНИЕ ЭЛЕМЕНТОВ ===
function initElementTransforms() {
    const btn = document.getElementById('theme-btn');
    if (btn) {
        btn.addEventListener('mouseenter', () => { btn.innerHTML = '⛄'; });
        btn.addEventListener('mouseleave', () => { btn.innerHTML = '🎨'; });
    }
}

// === 30. ФЕЙЕРВЕРК ИЗ ИМЁН ===
function initNameFirework() {
    const sendBtn = document.getElementById('send-letter-btn');
    if (!sendBtn) return;

    sendBtn.addEventListener('click', () => {
        const nick = db.currentNick;
        if (!nick) return;
        const letters = nick.split('');
        const colors = ['#c9a227', '#8b0000', '#2d5a27', '#1e3a5f', '#9333ea'];
        letters.forEach((char, i) => {
            setTimeout(() => {
                const span = document.createElement('span');
                span.textContent = char;
                span.style.cssText = `
                    position: fixed;
                    left: 50%; top: 50%;
                    color: ${colors[i % colors.length]};
                    font-size: 2rem;
                    font-weight: bold;
                    pointer-events: none;
                    z-index: 9999;
                `;
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

// === 32. НОВОГОДНИЙ ПАЗЛ ===
function initPuzzle() {
    const imageUrl = '/i-_1_.png';
    const puzzleContainer = document.createElement('div');
    puzzleContainer.id = 'puzzle-container';
    puzzleContainer.style.cssText = `
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        background: rgba(10, 10, 15, 0.95);
        border-radius: 16px;
        padding: 20px;
        display: none;
        flex-direction: column;
        align-items: center;
        z-index: 1001;
        border: 1px solid var(--glass-border);
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
        align-self: flex-end;
        background: #8b0000; color: white;
        border: none; width: 30px; height: 30px;
        border-radius: 50%; cursor: pointer; margin-bottom: 10px;
    `;
    closeBtn.onclick = () => puzzleContainer.style.display = 'none';
    puzzleContainer.appendChild(closeBtn);

    const title = document.createElement('h3');
    title.textContent = '🧩 Собери картинку!';
    title.style.cssText = 'color: #c9a227; margin-bottom: 10px;';
    puzzleContainer.appendChild(title);

    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 5px;
        width: 270px; height: 270px;
    `;

    const pieces = [];
    let selectedPiece = null;

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const piece = document.createElement('div');
            piece.style.cssText = `
                width: 90px; height: 90px;
                background-image: url(${imageUrl});
                background-size: 270px 270px;
                background-position: ${-c * 90}px ${-r * 90}px;
                border: 2px solid #c9a227;
                cursor: pointer;
                transition: all 0.2s;
                border-radius: 4px;
            `;
            piece.dataset.row = r;
            piece.dataset.col = c;
            piece.dataset.originalRow = r;
            piece.dataset.originalCol = c;

            piece.addEventListener('click', function() {
                if (selectedPiece === null) {
                    selectedPiece = this;
                    this.style.border = '3px solid #ffffff';
                    this.style.transform = 'scale(1.05)';
                } else if (selectedPiece === this) {
                    this.style.border = '2px solid #c9a227';
                    this.style.transform = 'scale(1)';
                    selectedPiece = null;
                } else {
                    const tempPos = this.style.backgroundPosition;
                    const tempRow = this.dataset.row;
                    const tempCol = this.dataset.col;
                    this.style.backgroundPosition = selectedPiece.style.backgroundPosition;
                    this.dataset.row = selectedPiece.dataset.row;
                    this.dataset.col = selectedPiece.dataset.col;
                    selectedPiece.style.backgroundPosition = tempPos;
                    selectedPiece.dataset.row = tempRow;
                    selectedPiece.dataset.col = tempCol;
                    selectedPiece.style.border = '2px solid #c9a227';
                    selectedPiece.style.transform = 'scale(1)';
                    selectedPiece = null;
                    checkPuzzleComplete();
                }
            });

            pieces.push(piece);
            grid.appendChild(piece);
        }
    }

    function shufflePuzzle() {
        const positions = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                positions.push({ r, c });
            }
        }
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        pieces.forEach((piece, idx) => {
            const pos = positions[idx];
            piece.style.backgroundPosition = `${-pos.c * 90}px ${-pos.r * 90}px`;
            piece.dataset.row = pos.r;
            piece.dataset.col = pos.c;
        });
    }

    shufflePuzzle();

    function checkPuzzleComplete() {
        const isComplete = pieces.every(piece =>
            piece.dataset.row === piece.dataset.originalRow &&
            piece.dataset.col === piece.dataset.originalCol
        );
        if (isComplete) {
            setTimeout(() => {
                alert('🎉 Поздравляем! Пазл собран!');
                createClickParticles(window.innerWidth / 2, window.innerHeight / 2, 50, ['#c9a227', '#8b0000', '#2d5a27']);
                puzzleContainer.style.display = 'none';
            }, 300);
        }
    }

    puzzleContainer.appendChild(grid);
    document.body.appendChild(puzzleContainer);

    const btn = document.createElement('button');
    btn.textContent = '🧩 Пазл';
    btn.style.cssText = `
        position: fixed;
        bottom: 140px; right: 20px;
        background: #1e3a5f; color: white;
        border: none; padding: 10px 15px;
        border-radius: 12px; cursor: pointer;
        font-weight: bold; z-index: 100;
    `;
    btn.onclick = () => puzzleContainer.style.display = 'flex';
    document.body.appendChild(btn);
}

// === СТИЛИ ДЛЯ АНИМАЦИЙ ===
// FIX: была вторая дублирующая `const style` — переименована в `animStyle`
const animStyle = document.createElement('style');
animStyle.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(animStyle);
// === TOAST УВЕДОМЛЕНИЯ ===
(function () {
    const style = document.createElement('style');
    style.textContent = `
        #toast-container {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column-reverse;
            gap: 10px;
            z-index: 99999;
            pointer-events: none;
            align-items: center;
        }
        .toast {
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 600;
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            animation: toastIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
            max-width: 320px;
            text-align: center;
            pointer-events: none;
        }
        .toast.removing {
            animation: toastOut 0.3s ease forwards;
        }
        .toast-success { background: rgba(45,90,39,0.9);  color: #a7f3d0; border-color: rgba(45,90,39,0.5); }
        .toast-error   { background: rgba(139,0,0,0.9);   color: #fca5a5; border-color: rgba(139,0,0,0.5); }
        .toast-info    { background: rgba(30,58,95,0.9);   color: #bae6fd; border-color: rgba(30,58,95,0.5); }
        .toast-warn    { background: rgba(120,80,0,0.9);   color: #fde68a; border-color: rgba(120,80,0,0.5); }
        @keyframes toastIn {
            from { opacity: 0; transform: translateY(20px) scale(0.9); }
            to   { opacity: 1; transform: translateY(0)    scale(1);   }
        }
        @keyframes toastOut {
            from { opacity: 1; transform: translateY(0)    scale(1);   }
            to   { opacity: 0; transform: translateY(10px) scale(0.9); }
        }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
})();

function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = (icons[type] || '') + ' ' + message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
