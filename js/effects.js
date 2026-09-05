// === ВСЕ ЭФФЕКТЫ (КРОМЕ ЧАСОВ И СВЕЧЕЙ) ===

// === TOAST УВЕДОМЛЕНИЯ ===
class ToastManager {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            }

            .toast {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 15px 20px;
                min-width: 280px;
                max-width: 400px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                gap: 12px;
                animation: toastSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                pointer-events: auto;
                position: relative;
                overflow: hidden;
            }

            .toast::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: linear-gradient(180deg, #c9a227, #2d5a27);
            }

            .toast.success::before { background: linear-gradient(180deg, #2d5a27, #4ade80); }
            .toast.error::before { background: linear-gradient(180deg, #8b0000, #ef4444); }
            .toast.warning::before { background: linear-gradient(180deg, #c9a227, #fbbf24); }
            .toast.info::before { background: linear-gradient(180deg, #1e3a5f, #3b82f6); }

            .toast-icon {
                font-size: 1.5rem;
                flex-shrink: 0;
            }

            .toast-content {
                flex: 1;
                color: #fff;
                font-size: 0.95rem;
                line-height: 1.4;
            }

            .toast-title {
                font-weight: 600;
                margin-bottom: 2px;
                color: #c9a227;
            }

            .toast-message {
                color: rgba(255, 255, 255, 0.9);
            }

            .toast-close {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: #fff;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
                transition: all 0.2s;
                flex-shrink: 0;
            }

            .toast-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }

            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, #c9a227, #2d5a27);
                animation: toastProgress linear forwards;
            }

            @keyframes toastSlideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes toastSlideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }

            @keyframes toastProgress {
                from { width: 100%; }
                to { width: 0%; }
            }
        `;
        document.head.appendChild(style);
    }

    show(title, message, type = 'info', duration = 4000) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const progress = document.createElement('div');
        progress.className = 'toast-progress';
        progress.style.animationDuration = `${duration}ms`;

        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">×</button>
        `;

        toast.appendChild(progress);
        this.container.appendChild(toast);

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));

        setTimeout(() => this.removeToast(toast), duration);
    }

    removeToast(toast) {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

const toast = new ToastManager();

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
        bulb.style.animationDelay = `${i * 0.1}s`;
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
    const toastEl = document.getElementById('prediction-toast');
    if (!gift || !toastEl) return;
    
    gift.addEventListener('click', (e) => {
        e.stopPropagation();
        gift.classList.add('opened');
        
        const rect = gift.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        createClickParticles(centerX, centerY, 30, ['#c9a227', '#8b0000', '#ffffff']);
        
        const prediction = PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];
        toastEl.textContent = prediction;
        toastEl.classList.add('show');
        
        setTimeout(() => {
            gift.classList.remove('opened');
            toastEl.classList.remove('show');
        }, 3000);
    });
}

// === 7. ПИСЬМО / ЧАТ С АНТИ-МАТОМ И СТИКЕРАМИ ===
function initLetter() {
    let isLoggedIn = false;
    const chatInput = document.getElementById('letter-text');
    const sendBtn = document.getElementById('send-letter-btn');
    const chatContainer = document.getElementById('chat-messages');
    const stickerBtn = document.getElementById('sticker-btn');
    const stickerPanel = document.getElementById('sticker-panel');
    
    if (!chatInput || !sendBtn || !chatContainer) return;
    
    loadChatMessages();
    initStickerPanel();
    
    // Кнопка входа
    const chatLoginBtn = document.getElementById('chat-login-btn');
    if (chatLoginBtn) {
        chatLoginBtn.addEventListener('click', async function() {
            const nick = prompt('Введи свой ник (минимум 2 символа):');
            if (!nick || nick.trim().length < 2) {
                toast.show('Ошибка', 'Ник должен быть минимум 2 символа!', 'error');
                return;
            }
            
            const nickCheck = antiMat.check(nick);
            if (nickCheck.isBanned) {
                toast.show('Ошибка', 'Ник содержит запрещенные слова!', 'error');
                return;
            }
            
            console.log('Попытка входа под ником:', nick.trim());
            
            try {
                const result = await db.login(nick.trim());
                console.log('Результат логина:', result);
                
                if (result) {
                    isLoggedIn = true;
                    this.style.display = 'none';
                    document.getElementById('locked-msg').style.display = 'none';
                    document.getElementById('letter-area').style.display = 'flex';
                    
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
                    
                    toast.show('Добро пожаловать!', `Вы вошли как ${nick}`, 'success');
                } else {
                    toast.show('Ошибка входа', 'Сервер не вернул данные. Проверь консоль (F12) для деталей.', 'error');
                }
            } catch (error) {
                console.error('КРИТИЧЕСКАЯ ОШИБКА ЛОГИНА:', error);
                toast.show('Критическая ошибка', 'Ошибка входа: ' + error.message, 'error');
            }
        });
    }
    
    // Отправка сообщения
    sendBtn.addEventListener('click', async function() {
        if (!isLoggedIn) {
            toast.show('Доступ запрещен', 'Войдите в чат, чтобы отправлять сообщения', 'warning');
            return;
        }
        
        const text = chatInput.value.trim();
        if (!text) {
            toast.show('Пустое сообщение', 'Напишите что-нибудь перед отправкой', 'warning');
            return;
        }
        
        const check = antiMat.check(text);
        if (check.isBanned) {
            toast.show('Модерация', 'Сообщение содержит запрещенное слово!', 'error');
            chatInput.value = '';
            return;
        }
        
        const nick = db.currentNick;
        const result = await db.sendMessage(nick, text);
        
        if (result) {
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
            
            toast.show('Отправлено!', 'Сообщение успешно отправлено в чат', 'success', 2000);
        } else {
            toast.show('Ошибка', 'Не удалось отправить сообщение', 'error');
        }
    });
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });
    
    // Панель стикеров
    if (stickerBtn && stickerPanel) {
        stickerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            stickerPanel.classList.toggle('visible');
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.sticker-panel') && !e.target.closest('#sticker-btn')) {
                stickerPanel.classList.remove('visible');
            }
        });
    }
}

// === ПАНЕЛЬ СТИКЕРОВ ===
function initStickerPanel() {
    const stickerPanel = document.getElementById('sticker-panel');
    if (!stickerPanel) return;
    
    const stickers = [
        { id: 'santa.png', name: 'Санта' },
        { id: 'tree.png', name: 'Елка' },
        { id: 'gift.png', name: 'Подарок' },
        { id: 'snowman.png', name: 'Снеговик' },
        { id: 'reindeer.png', name: 'Олень' },
        { id: 'bell.png', name: 'Колокольчик' }
    ];
    
    stickerPanel.innerHTML = '';
    
    stickers.forEach(sticker => {
        const stickerEl = document.createElement('div');
        stickerEl.className = 'sticker-item';
        stickerEl.innerHTML = `<img src="/stickers/${sticker.id}" alt="${sticker.name}" title="${sticker.name}">`;
        
        stickerEl.addEventListener('click', async () => {
            if (!db.currentNick) {
                toast.show('Доступ запрещен', 'Войдите в чат, чтобы отправлять стикеры', 'warning');
                return;
            }
            
            const result = await db.sendMessage(db.currentNick, '', sticker.id);
            
            if (result) {
                appendMessageToChat({
                    nick: db.currentNick,
                    text: '',
                    sticker: sticker.id,
                    system: 0,
                    time: Date.now()
                });
                
                stickerPanel.classList.remove('visible');
                toast.show('Стикер отправлен!', `${sticker.name} добавлен в чат`, 'success', 2000);
            } else {
                toast.show('Ошибка', 'Не удалось отправить стикер', 'error');
            }
        });
        
        stickerPanel.appendChild(stickerEl);
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
    `;
    
    if (msg.text) {
        content += `<div style="color: var(--text-primary); word-wrap: break-word;">${msg.text}</div>`;
    }
    
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

// === 19. ФОТО-ЗОНА С РАМКОЙ ===
function initPhotoFrame() {
    const photoUploadBtn = document.getElementById('photo-upload');
    if (!photoUploadBtn) return;

    const frame = document.createElement('div');
    frame.id = 'photo-frame';
    frame.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        height: 300px;
        border: 15px solid transparent;
        border-image: repeating-linear-gradient(45deg, #8b0000, #2d5a27, #1e3a5f, #c9a227) 30;
        background: rgba(0,0,0,0.8);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        cursor: pointer;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: -40px;
        right: 0;
        background: #8b0000;
        color: white;
        border: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.2rem;
    `;
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        frame.style.display = 'none';
    };
    frame.appendChild(closeBtn);
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            toast.show('Файл слишком большой', 'Максимальный размер: 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const photoData = ev.target.result;
            
            frame.innerHTML = '';
            frame.appendChild(closeBtn);
            
            const img = document.createElement('img');
            img.src = photoData;
            img.style.cssText = `
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            `;
            frame.appendChild(img);
            frame.style.display = 'flex';
            
            if (db.currentNick) {
                const result = await db.sendMessage(db.currentNick, '', null, photoData);
                
                if (result) {
                    appendMessageToChat({
                        nick: db.currentNick,
                        text: '',
                        photo: photoData,
                        system: 0,
                        time: Date.now()
                    });
                    
                    toast.show('Фото отправлено!', 'Ваше фото добавлено в чат', 'success');
                } else {
                    toast.show('Ошибка', 'Не удалось отправить фото', 'error');
                }
            } else {
                toast.show('Доступ запрещен', 'Войдите в чат, чтобы отправлять фото', 'warning');
            }
        };
        reader.readAsDataURL(file);
    });
    
    frame.addEventListener('click', (e) => {
        if (e.target === frame) input.click();
    });
    
    document.body.appendChild(frame);
    
    photoUploadBtn.addEventListener('click', () => {
        if (!db.currentNick) {
            toast.show('Доступ запрещен', 'Войдите в чат, чтобы загружать фото', 'warning');
            return;
        }
        input.click();
    });
}

// === 15. ПЕРЕКЛЮЧАТЕЛЬ ТЕМ ===
function initThemeSwitcher() {
    let currentTheme = 0;
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            currentTheme = (currentTheme + 1) % THEMES.length;
            document.body.className = THEMES[currentTheme];
            localStorage.setItem('theme', THEMES[currentTheme]);
            toast.show('Тема изменена', `Применена тема: ${THEMES[currentTheme]}`, 'info', 2000);
        });
    }
    
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
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    cursor.innerHTML = '❄️';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('button, a, input, .playlist li').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursor.innerHTML = '🎄';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.innerHTML = '❄️';
        });
    });
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

// === 22. ЁЛОЧНАЯ ИГРУШКА-СЧЁТЧИК ===
function initTreeCounter() {
    let count = 0;
    const counter = document.createElement('div');
    counter.id = 'tree-counter';
    counter.innerHTML = ' 0';
    document.body.appendChild(counter);
    
    counter.addEventListener('click', () => {
        count++;
        counter.innerHTML = `🎄 ${count}`;
        counter.style.transform = 'scale(1.2) rotate(10deg)';
        setTimeout(() => counter.style.transform = 'scale(1) rotate(0deg)', 200);
        localStorage.setItem('treeClicks', count);
    });
    
    const saved = localStorage.getItem('treeClicks');
    if (saved) {
        count = parseInt(saved);
        counter.innerHTML = `🎄 ${count}`;
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

// === 21. ЗЕРКАЛЬНОЕ ОТРАЖЕНИЕ ===
function initReflection() {
    const player = document.querySelector('.music-section');
    if (!player) return;
    
    const reflection = player.cloneNode(true);
    reflection.id = 'player-reflection';
    reflection.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%) scaleY(-1);
        opacity: 0.15;
        pointer-events: none;
        filter: blur(2px);
        mask-image: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
        -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
        width: 90%;
        max-width: 800px;
        z-index: 0;
    `;
    
    document.body.appendChild(reflection);
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
                transition: transform 0.2s;
            `;
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

// === СТИЛИ ДЛЯ СТИКЕРОВ ===
const stickerStyle = document.createElement('style');
stickerStyle.textContent = `
    .sticker-panel {
        position: absolute;
        bottom: 100%;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 15px;
        display: none;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 10px;
        max-height: 300px;
        overflow-y: auto;
    }
    
    .sticker-panel.visible {
        display: grid;
    }
    
    .sticker-item {
        cursor: pointer;
        transition: all 0.2s;
        border-radius: 8px;
        padding: 5px;
        background: rgba(255, 255, 255, 0.05);
    }
    
    .sticker-item:hover {
        transform: scale(1.1);
        background: rgba(255, 255, 255, 0.15);
    }
    
    .sticker-item img {
        width: 100%;
        height: auto;
        border-radius: 4px;
    }
`;
document.head.appendChild(stickerStyle);

// === СТИЛИ ДЛЯ АНИМАЦИЙ ===
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
// === НОВОЕ: ИНИЦИАЛИЗАЦИЯ СТИКЕРОВ ===
function initStickers() {
    const stickerBtn = document.getElementById('sticker-btn');
    const stickerPanel = document.getElementById('sticker-panel');
    
    // Если элементов нет в HTML, тихо выходим, чтобы не ломать остальной код
    if (!stickerBtn || !stickerPanel) {
        console.warn('Элементы стикеров (sticker-btn или sticker-panel) не найдены в DOM');
        return;
    }

    // Список стикеров (адаптируй пути под реальные файлы в твоей папке /stickers/)
    const stickers = [
        { id: 'cats/1.png', name: 'Кот 1' },
        { id: 'cats/2.png', name: 'Кот 2' },
        { id: 'memes/1.png', name: 'Мем 1' },
        { id: 'memes/2.png', name: 'Мем 2' }
    ];

    // Очищаем и заполняем панель
    stickerPanel.innerHTML = '';
    stickers.forEach(sticker => {
        const stickerEl = document.createElement('div');
        stickerEl.className = 'sticker-item';
        // Добавлен onerror, чтобы не было битых картинок, если файла временно нет
        stickerEl.innerHTML = `<img src="/stickers/${sticker.id}" alt="${sticker.name}" title="${sticker.name}" onerror="this.style.display='none'; this.parentElement.innerText='🎄'">`;
        
        stickerEl.addEventListener('click', async () => {
            if (typeof db !== 'undefined' && db.currentNick) {
                const result = await db.sendMessage(db.currentNick, '', sticker.id);
                if (result) {
                    if (typeof appendMessageToChat === 'function') {
                        appendMessageToChat({
                            nick: db.currentNick,
                            text: '',
                            sticker: sticker.id,
                            system: 0,
                            time: Date.now()
                        });
                    }
                    stickerPanel.classList.remove('visible');
                } else {
                    alert('Ошибка отправки стикера. Проверь консоль (F12).');
                }
            } else {
                alert('Сначала войдите в чат, чтобы отправлять стикеры!');
            }
        });
        stickerPanel.appendChild(stickerEl);
    });

    // Открытие/закрытие панели по клику на кнопку
    stickerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        stickerPanel.classList.toggle('visible');
    });

    // Закрытие панели при клике в любое другое место экрана
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sticker-panel') && !e.target.closest('#sticker-btn')) {
            stickerPanel.classList.remove('visible');
        }
    });
}
