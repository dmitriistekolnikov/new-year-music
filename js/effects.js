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
        
        // Конфетти из подарка
        createClickParticles(centerX, centerY, 30, ['#fbbf24', '#ef4444', '#ffffff']);
        
        // Предсказание
        toast.textContent = PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];
        toast.classList.add('show');
        
        setTimeout(() => {
            gift.classList.remove('opened');
            toast.classList.remove('show');
        }, 3000);
    });
}

// 4. ПИСЬМО ДЕДУ МОРОЗУ
function initLetter() {
    let isLoggedIn = false;
    
    document.getElementById('chat-login-btn').addEventListener('click', function() {
        isLoggedIn = true;
        this.style.display = 'none';
        document.getElementById('locked-msg').style.display = 'none';
        document.getElementById('letter-area').style.display = 'flex';
    });
    
    document.getElementById('send-letter-btn').addEventListener('click', function(e) {
        const input = document.getElementById('letter-text');
        if (!input.value.trim()) return;
        
        const envelope = document.createElement('div');
        envelope.className = 'flying-envelope';
        envelope.textContent = '️';
        
        const rect = input.getBoundingClientRect();
        envelope.style.left = rect.left + 'px';
        envelope.style.top = rect.top + 'px';
        
        document.body.appendChild(envelope);
        input.value = '';
        
        setTimeout(() => envelope.remove(), 1500);
    });
}

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
