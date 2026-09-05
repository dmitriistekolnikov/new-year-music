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
function initLetter() {
    let isLoggedIn = false;
    const chatInput = document.getElementById('letter-text');
    const sendBtn = document.getElementById('send-letter-btn');
    const chatContainer = document.getElementById('chat-messages');
    const loginBtn = document.getElementById('chat-login-btn');
    const lockedMsg = document.getElementById('locked-msg');
    const letterArea = document.getElementById('letter-area');
    
    console.log('initLetter: элементы найдены:', {
        chatInput: !!chatInput,
        sendBtn: !!sendBtn,
        chatContainer: !!chatContainer,
        loginBtn: !!loginBtn,
        lockedMsg: !!lockedMsg,
        letterArea: !!letterArea
    });
    
    if (!chatInput || !sendBtn || !chatContainer || !loginBtn) {
        console.error('initLetter: не найдены обязательные элементы!');
        return;
    }
    
    loadChatMessages();
    
    loginBtn.addEventListener('click', async function() {
        console.log('Клик по кнопке входа');
        const nick = prompt('Введи свой ник (минимум 2 символа):');
        if (!nick || nick.trim().length < 2) {
            alert('Ник должен быть минимум 2 символа!');
            return;
        }
        
        const nickCheck = antiMat.check(nick);
        if (nickCheck.isBanned) {
            alert('Ник содержит запрещенные слова!');
            return;
        }
        
        console.log('Попытка входа под ником:', nick.trim());
        
        try {
            const result = await db.login(nick.trim());
            console.log('Результат логина:', result);
            
            if (result && result.session_id) {
                isLoggedIn = true;
                loginBtn.style.display = 'none';
                if (lockedMsg) lockedMsg.style.display = 'none';
                if (letterArea) {
                    letterArea.style.display = 'flex';
                    console.log('letterArea показан');
                }
                
                const statusBadge = document.getElementById('chat-status-badge');
                if (statusBadge) {
                    statusBadge.className = 'status-badge';
                    statusBadge.style.background = 'rgba(45, 90, 39, 0.2)';
                    statusBadge.style.color = '#2d5a27';
                    statusBadge.innerHTML = '<span class="status-dot" style="background: #2d5a27;"></span> online';
                }
                
                appendMessageToChat({
                    nick: '🎅 Система',
                    text: `${nick} присоединился к чату!`,
                    system: 1,
                    time: Date.now()
                });
                
                console.log('Вход выполнен успешно');
            } else {
                alert('Ошибка входа: сервер не вернул session_id. Проверь консоль (F12).');
                console.error('Результат логина без session_id:', result);
            }
        } catch (error) {
            console.error('КРИТИЧЕСКАЯ ОШИБКА ЛОГИНА:', error);
            alert('Ошибка входа: ' + error.message + '\n\nПроверь консоль (F12).');
        }
    });
    
    sendBtn.addEventListener('click', async function() {
        console.log('Клик по кнопке отправки, isLoggedIn:', isLoggedIn);
        if (!isLoggedIn) {
            console.warn('Пользователь не залогинен');
            return;
        }
        
        const text = chatInput.value.trim();
        if (!text) {
            console.warn('Пустое сообщение');
            return;
        }
        
        const check = antiMat.check(text);
        if (check.isBanned) {
            alert('Сообщение содержит запрещенное слово!');
            chatInput.value = '';
            return;
        }
        
        const nick = db.currentNick;
        console.log('Отправка сообщения от', nick, ':', text);
        
        const result = await db.sendMessage(nick, text);
        console.log('Результат отправки:', result);
        
        if (result && result.success) {
            appendMessageToChat({
                nick: nick,
                text: text,
                system: 0,
                time: Date.now()
            });
            
            chatInput.value = '';
            
            createClickParticles(
                sendBtn.getBoundingClientRect().left + 20,
                sendBtn.getBoundingClientRect().top,
                15,
                ['#2d5a27', '#c9a227']
            );
            console.log('Сообщение отправлено и отображено');
        } else {
            alert('Ошибка отправки сообщения. Проверь консоль (F12).');
            console.error('Ошибка отправки:', result);
        }
    });
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });
}

async function loadChatMessages() {
    const messages = await db.getMessages(50);
    const chatContainer = document.getElementById('chat-messages');
    
    if (messages.length > 0) {
        chatContainer.innerHTML = '';
        messages.reverse().forEach(msg => {
            appendMessageToChat(msg);
        });
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

// === 15. ПЕРЕКЛЮЧАТЕЛЬ ТЕМ ===
function initThemeSwitcher() {
    let currentTheme = 0;
    document.getElementById('theme-btn').addEventListener('click', () => {
        currentTheme = (currentTheme + 1) % THEMES.length;
        document.body.className = THEMES[currentTheme];
        localStorage.setItem('theme', THEMES[currentTheme]);
    });
    
    const saved = localStorage.getItem('theme');
    if (saved) {
        document.body.className = saved;
        currentTheme = THEMES.indexOf(saved);
    }
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
    
    // Создаём контейнер для следа, если его нет
    if (!trailContainer) {
        const container = document.createElement('div');
        container.id = 'cursor-trail-container';
        container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9998;';
        document.body.appendChild(container);
    }
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    // Массив точек следа (более частый)
    const trailPoints = [];
    const maxTrailPoints = 20;
    const trailInterval = 30; // Обновление каждые 30мс (быстрее)
    let lastTrailTime = 0;
    
    // Звёзды следа
    const stars = [];
    const maxStars = 15;
    
    // Отслеживание мыши
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Создание звезды
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
    
    // Анимация курсора и следа
    function animateCursor(timestamp) {
        // Плавное движение основного курсора
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        cursor.style.left = cursorX - 10 + 'px';
        cursor.style.top = cursorY - 10 + 'px';
        
        // Добавление точек следа (чаще)
        if (timestamp - lastTrailTime > trailInterval) {
            trailPoints.push({ x: mouseX, y: mouseY, life: 1 });
            
            if (trailPoints.length > maxTrailPoints) {
                trailPoints.shift();
            }
            
            // Создание звезды каждые 100мс
            if (Math.random() < 0.3) {
                createStar(mouseX + (Math.random() - 0.5) * 20, mouseY + (Math.random() - 0.5) * 20);
            }
            
            lastTrailTime = timestamp;
        }
        
        // Обновление точек следа
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
    
    // Эффект при клике
    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.8)';
        // Создаём несколько звёзд при клике
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
    
    console.log('✅ Кастомный курсор со звёздами инициализирован');
}

// Добавляем анимацию для звёзд
const style = document.createElement('style');
style.textContent = `
    @keyframes starFade {
        0% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
        }
        100% {
            opacity: 0;
            transform: scale(0.3) rotate(180deg) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);
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
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
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
        btn.addEventListener('mouseenter', () => {
            btn.innerHTML = '⛄';
        });
        btn.addEventListener('mouseleave', () => {
            btn.innerHTML = '🎨';
        });
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
                    left: 50%;
                    top: 50%;
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
        top: 50%;
        left: 50%;
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
        background: #8b0000;
        color: white;
        border: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        margin-bottom: 10px;
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
        width: 270px;
        height: 270px;
    `;
    
    const pieces = [];
    let selectedPiece = null;
    
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const piece = document.createElement('div');
            piece.style.cssText = `
                width: 90px;
                height: 90px;
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
        const isComplete = pieces.every(piece => {
            return piece.dataset.row === piece.dataset.originalRow && 
                   piece.dataset.col === piece.dataset.originalCol;
        });
        
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
        bottom: 140px;
        right: 20px;
        background: #1e3a5f;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 12px;
        cursor: pointer;
        font-weight: bold;
        z-index: 100;
    `;
    btn.onclick = () => puzzleContainer.style.display = 'flex';
    document.body.appendChild(btn);
}

// === СТИЛИ ДЛЯ АНИМАЦИЙ ===
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
