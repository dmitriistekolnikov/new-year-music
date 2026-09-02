// === ЭФФЕКТЫ: ГИРЛЯНДА, ЗАМОРОЗКА, ПОДАРОК, ПИСЬМО, ТАЙМЕР ===

// 1. ГИРЛЯНДА
function initGarland() {
    const garland = document.getElementById('garland');
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

// 2. ЗАМОРОЗКА КАРТОЧЕК
function initFreeze() {
    document.querySelectorAll('.freeze-target').forEach(card => {
        card.addEventListener('click', function() {
            if (this.classList.contains('frozen')) return;
            this.classList.add('frozen');
            setTimeout(() => this.classList.remove('frozen'), 1500);
        });
    });
}

// 3. ВОЛШЕБНЫЙ ПОДАРОК
function initGift() {
    const gift = document.getElementById('magic-gift');
    const toast = document.getElementById('prediction-toast');
    
    gift.addEventListener('click', (e) => {
        e.stopPropagation();
        gift.classList.add('opened');
        
        const rect = gift.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        createClickParticles(centerX, centerY, 30, ['#fbbf24', '#ef4444', '#ffffff']);
        
        toast.textContent = PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];
        toast.classList.add('show');
        
        setTimeout(() => {
            gift.classList.remove('opened');
            toast.classList.remove('show');
        }, 3000);
    });
}

// 4. ЧАТ С АНТИ-МАТОМ
function initLetter() {
    let isLoggedIn = false;
    const chatInput = document.getElementById('letter-text');
    const sendBtn = document.getElementById('send-letter-btn');
    const chatContainer = document.getElementById('chat-messages');
    
    loadChatMessages();
    
    // Кнопка входа
    document.getElementById('chat-login-btn').addEventListener('click', async function() {
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
                
                appendMessageToChat({
                    nick: '🎅 Система',
                    text: `${nick} присоединился к чату!`,
                    system: 1,
                    time: Date.now()
                });
            } else {
                alert('Ошибка входа: сервер не вернул данные. Проверь консоль (F12) для деталей.');
            }
        } catch (error) {
            console.error('КРИТИЧЕСКАЯ ОШИБКА ЛОГИНА:', error);
            alert('Ошибка входа: ' + error.message + '\n\nПроверь консоль браузера (F12) для полной информации.');
        }
    });
    
    // Отправка сообщения
    sendBtn.addEventListener('click', async function() {
        if (!isLoggedIn) return;
        
        const text = chatInput.value.trim();
        if (!text) return;
        
        const check = antiMat.check(text);
        if (check.isBanned) {
            alert(`Сообщение содержит запрещенное слово!`);
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
                ['#22c55e', '#fbbf24']
            );
        } else {
            alert('Ошибка отправки сообщения');
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
        background: ${isSystem ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,0.05)'};
        border-radius: 8px;
        border-left: 3px solid ${isSystem ? 'var(--accent-gold)' : 'var(--accent-green)'};
        animation: fadeIn 0.3s ease;
    `;
    
    let content = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: bold; color: ${isSystem ? 'var(--accent-gold)' : 'var(--accent-green)'};">
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

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// 5. ПЕРЕКЛЮЧАТЕЛЬ ТЕМ
function initThemeSwitcher() {
    let currentTheme = 0;
    document.getElementById('theme-btn').addEventListener('click', () => {
        currentTheme = (currentTheme + 1) % THEMES.length;
        document.body.className = THEMES[currentTheme];
    });
}

// 6. ТАЙМЕР ОБРАТНОГО ОТСЧЁТА
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
