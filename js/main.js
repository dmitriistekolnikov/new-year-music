// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let currentBgEffect = 'none';
let currentThemeIndex = 0;

// === ТОЧКА ВХОДА ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎄 НовыйГодЧат загружается...');
    
    try {
        // === БАЗОВЫЕ ЭФФЕКТЫ ===
        if (typeof initSnow === 'function') initSnow();
        if (typeof initGarland === 'function') initGarland();
        if (typeof initTimer === 'function') initTimer();
        
        // === ПЛЕЕР ===
        if (typeof initPlayer === 'function') initPlayer();
        
        // === ИНТЕРАКТИВНЫЕ ЭФФЕКТЫ ===
        if (typeof initFreeze === 'function') initFreeze();
        if (typeof initGift === 'function') initGift();
        if (typeof initLetter === 'function') initLetter();
        
        // === ФЕЙЕРВЕРК И СТЕНА СЛАВЫ ===
        if (typeof initFireworks === 'function') initFireworks();
        if (typeof initWallOfFame === 'function') initWallOfFame();
        
        // === ТЕМЫ И ЭФФЕКТЫ ФОНА ===
        initThemeSwitcher();
        initBackgroundEffects();
        
        // === ОБРАБОТЧИК КНОПКИ ВХОДА В ШАПКЕ ===
        const headerLoginBtn = document.getElementById('header-login-btn');
        if (headerLoginBtn) {
            headerLoginBtn.addEventListener('click', () => {
                console.log('🔑 Клик по входу в шапке');
                const chatLoginBtn = document.getElementById('chat-login-btn');
                if (chatLoginBtn) {
                    chatLoginBtn.click();
                } else {
                    alert('Нажмите кнопку "🔑 Войти в чат"');
                }
            });
        }
        
        // === ПРОВЕРКА ПОДКЛЮЧЕНИЯ К БД ===
        if (typeof db !== 'undefined') {
            const isConnected = await db.checkConnection();
            if (isConnected) {
                console.log('✅ База данных подключена');
                
                const hasSession = await db.checkSession();
                if (hasSession) {
                    console.log('✅ Сессия активна:', db.currentNick);
                    const loginBtn = document.getElementById('chat-login-btn');
                    const lockedMsg = document.getElementById('locked-msg');
                    const letterArea = document.getElementById('letter-area');
                    if (loginBtn) loginBtn.style.display = 'none';
                    if (lockedMsg) lockedMsg.style.display = 'none';
                    if (letterArea) letterArea.style.display = 'flex';
                }
            } else {
                console.log('⚠️ База данных недоступна. Чат работает в офлайн-режиме.');
            }
        }
        
        console.log('✨ Все системы активны!');
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
    }
});

// ==========================================
// === СИСТЕМА ТЕМ ОФОРМЛЕНИЯ ===
// ==========================================
const themes = [
    { 
        name: '🎄 Классика и Елка', 
        colors: ['#0A3D2E', '#14532D', '#A7F3D0', '#4D5E37'],
        text: '#fff'
    },
    { 
        name: '🌌 Ночная магия', 
        colors: ['#0F172A', '#1E3A8A', '#2E1065', '#312E81'],
        text: '#fff'
    },
    { 
        name: '🔥 Уют и Тепло', 
        colors: ['#3E2723', '#4E342E', '#78350F', '#FEF3C7'],
        text: '#fff'
    },
    { 
        name: '🎅 Праздничный', 
        colors: ['#4C0519', '#7F1D1D', '#881337', '#DC2626'],
        text: '#fff'
    },
    { 
        name: '💜 Неон', 
        colors: ['#4C1D95', '#14532D', '#0284C7', '#0E7490'],
        text: '#fff'
    },
    { 
        name: '✨ Нежные', 
        colors: ['#DDD6FE', '#E0F2FE', '#FBCFE8', '#64748B'],
        text: '#1a1a1a'
    },
    { 
        name: '🌊 Морские', 
        colors: ['#2E4F4F', '#134E4A', '#0284C7', '#0E7490'],
        text: '#fff'
    },
    { 
        name: '🌙 Глубокая ночь', 
        colors: ['#020617', '#0F172A', '#1F2937', '#1E293B'],
        text: '#fff'
    },
];

// Интерполяция между двумя HEX цветами
function lerpColor(colorA, colorB, t) {
    const ah = parseInt(colorA.replace(/#/g, ''), 16);
    const ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    
    const bh = parseInt(colorB.replace(/#/g, ''), 16);
    const br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    
    const rr = ar + t * (br - ar);
    const rg = ag + t * (bg - ag);
    const rb = ab + t * (bb - ab);
    
    return '#' + ((1 << 24) + (Math.round(rr) << 16) + (Math.round(rg) << 8) + Math.round(rb)).toString(16).slice(1);
}

// Вычисление текущей яркости на основе времени суток
function getTimeBrightness() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const mins = h * 60 + m;
    
    // Сдвиг: минимум в 1:00, максимум в 14:00
    const shifted = (mins - 60 + 1440) % 1440;
    let brightness = 0;
    
    if (shifted <= 780) {
        brightness = shifted / 780; // Рост от 0 до 1
    } else {
        brightness = 1 - ((shifted - 780) / 660); // Падение от 1 до 0
    }
    
    return Math.max(0, Math.min(1, brightness));
}

// Применение темы с учетом времени суток
function applyTheme(index) {
    try {
        const theme = themes[index];
        const brightness = getTimeBrightness();
        
        // Ночью затемняем цвета на 70%
        const darkening = (1 - brightness) * 0.7;
        const darkenedColors = theme.colors.map(color => 
            lerpColor(color, '#000000', darkening)
        );
        
        const gradient = `linear-gradient(135deg, ${darkenedColors.join(', ')})`;
        document.body.style.background = gradient;
        
        // Цвет текста зависит от яркости
        const textColor = brightness < 0.5 ? '#e0e0e0' : theme.text;
        document.body.style.color = textColor;
        document.documentElement.style.setProperty('--text-color', textColor);
        
        // Сохранение выбора
        localStorage.setItem('selectedTheme', index);
        currentThemeIndex = index;
    } catch (error) {
        console.error('Ошибка применения темы:', error);
    }
}

// Инициализация переключателя тем
function initThemeSwitcher() {
    try {
        const themeBtn = document.getElementById('theme-btn');
        const themeSwitcher = document.getElementById('theme-switcher');
        const themeList = document.getElementById('theme-list');
        
        // Загрузка сохраненной темы
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme !== null) {
            currentThemeIndex = parseInt(savedTheme);
        }
        
        applyTheme(currentThemeIndex);
        
        // Обновление фона каждую минуту
        setInterval(() => {
            applyTheme(currentThemeIndex);
        }, 60000);
        
        // Создание списка тем
        if (themeList) {
            themeList.innerHTML = '';
            themes.forEach((theme, index) => {
                const option = document.createElement('div');
                option.className = 'switcher-option';
                option.innerHTML = `
                    <div class="theme-preview" style="background: linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[3]})"></div>
                    <span>${theme.name}</span>
                `;
                option.addEventListener('click', () => {
                    applyTheme(index);
                    if (themeSwitcher) themeSwitcher.classList.remove('visible');
                });
                themeList.appendChild(option);
            });
        }
        
        // Обработчик кнопки
        if (themeBtn && themeSwitcher) {
            themeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                themeSwitcher.classList.toggle('visible');
                document.getElementById('bg-effects-switcher').classList.remove('visible');
            });
        }
    } catch (error) {
        console.error('Ошибка инициализации тем:', error);
    }
}

// ==========================================
// === СИСТЕМА ЭФФЕКТОВ ФОНА ===
// ==========================================

class BackgroundEffects {
    constructor() {
        this.canvas = document.getElementById('bg-effects-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.items = [];
        this.animId = null;
        
        this.resize();
        if (window) {
            window.addEventListener('resize', () => this.resize());
        }
    }
    
    resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }
    
    stop() {
        if (this.animId) {
            cancelAnimationFrame(this.animId);
        }
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.items = [];
    }
    
    // Эффект 1: Неоновые линии
    startLines() {
        this.items = [];
        const lineCount = 6;
        
        for (let i = 0; i < lineCount; i++) {
            this.items.push({
                x1: Math.random() * this.canvas.width,
                y1: Math.random() * this.canvas.height,
                x2: Math.random() * this.canvas.width,
                y2: Math.random() * this.canvas.height,
                color: `hsl(${Math.random() * 60 + 240}, 100%, 60%)`,
                speed: 0.5 + Math.random() * 1,
                angle: Math.random() * Math.PI * 2
            });
        }
        
        this.animate('lines');
    }
    
    // Эффект 2: Летающие шары
    startBalls() {
        this.items = [];
        const ballCount = 25;
        
        for (let i = 0; i < ballCount; i++) {
            this.items.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + Math.random() * 200,
                size: 10 + Math.random() * 30,
                color: `hsla(${Math.random() * 360}, 80%, 60%, 0.5)`,
                speed: 1 + Math.random() * 2,
                wobble: Math.random() * Math.PI * 2
            });
        }
        
        this.animate('balls');
    }
    
    // Эффект 3: Пульсирующие частицы
    startParticles() {
        this.items = [];
        const particleCount = 60;
        
        for (let i = 0; i < particleCount; i++) {
            this.items.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 2 + Math.random() * 4,
                color: `hsla(${Math.random() * 60 + 180}, 100%, 70%, 0.8)`,
                pulseSpeed: 0.02 + Math.random() * 0.03,
                phase: Math.random() * Math.PI * 2
            });
        }
        
        this.animate('particles');
    }
    
    // Главный цикл анимации
    animate(type) {
        if (currentBgEffect !== type) return;
        
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        if (type === 'lines') {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            this.items.forEach(line => {
                // Движение
                line.x1 += Math.cos(line.angle) * line.speed;
                line.y1 += Math.sin(line.angle) * line.speed;
                line.x2 += Math.cos(line.angle + 0.5) * line.speed;
                line.y2 += Math.sin(line.angle + 0.5) * line.speed;
                
                // Отскок от границ
                if (line.x1 < 0 || line.x1 > w) line.angle = Math.PI - line.angle;
                if (line.y1 < 0 || line.y1 > h) line.angle = -line.angle;
                
                // Рисование с glow эффектом
                ctx.shadowBlur = 15;
                ctx.shadowColor = line.color;
                ctx.strokeStyle = line.color;
                ctx.lineWidth = 2;
                
                ctx.beginPath();
                ctx.moveTo(line.x1, line.y1);
                ctx.lineTo(line.x2, line.y2);
                ctx.stroke();
            });
            
        } else if (type === 'balls') {
            this.items.forEach(ball => {
                // Движение вверх с покачиванием
                ball.y -= ball.speed;
                ball.wobble += 0.02;
                ball.x += Math.sin(ball.wobble) * 0.5;
                
                // Возврат вниз
                if (ball.y < -50) {
                    ball.y = h + 50;
                    ball.x = Math.random() * w;
                }
                
                // Рисование с glow
                ctx.shadowBlur = 25;
                ctx.shadowColor = ball.color;
                ctx.fillStyle = ball.color;
                
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
        } else if (type === 'particles') {
            this.items.forEach(particle => {
                // Пульсация
                particle.phase += particle.pulseSpeed;
                const size = particle.size * (1 + Math.sin(particle.phase) * 0.5);
                
                // Рисование с glow
                ctx.shadowBlur = 12;
                ctx.shadowColor = particle.color;
                ctx.fillStyle = particle.color;
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        
        ctx.shadowBlur = 0;
        this.animId = requestAnimationFrame(() => this.animate(type));
    }
}

// Глобальный экземпляр эффектов
const bgEffects = new BackgroundEffects();

// Инициализация переключателя эффектов
function initBackgroundEffects() {
    try {
        const btn = document.getElementById('bg-effects-btn');
        const panel = document.getElementById('bg-effects-switcher');
        const options = document.querySelectorAll('.switcher-option[data-effect]');
        
        // Загрузка сохраненного эффекта
        const savedEffect = localStorage.getItem('bgEffect');
        if (savedEffect) {
            currentBgEffect = savedEffect;
            applyBackgroundEffect(savedEffect);
            updateActiveOption(savedEffect);
        }
        
        // Обработчики кликов по опциям
        options.forEach(option => {
            option.addEventListener('click', () => {
                const effect = option.dataset.effect;
                currentBgEffect = effect;
                localStorage.setItem('bgEffect', effect);
                applyBackgroundEffect(effect);
                updateActiveOption(effect);
            });
        });
        
        // Применение эффекта
        function applyBackgroundEffect(effect) {
            bgEffects.stop();
            
            switch(effect) {
                case 'lines':
                    bgEffects.startLines();
                    break;
                case 'balls':
                    bgEffects.startBalls();
                    break;
                case 'particles':
                    bgEffects.startParticles();
                    break;
                default:
                    bgEffects.stop();
            }
        }
        
        // Обновление активной опции
        function updateActiveOption(activeEffect) {
            options.forEach(opt => {
                if (opt.dataset.effect === activeEffect) {
                    opt.classList.add('active');
                } else {
                    opt.classList.remove('active');
                }
            });
        }
        
        // Обработчик кнопки
        if (btn && panel) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                panel.classList.toggle('visible');
                document.getElementById('theme-switcher').classList.remove('visible');
            });
        }
        
        // Закрытие панелей при клике вне
        document.addEventListener('click', (e) => {
            const isPanel = e.target.closest('.switcher-panel');
            const isButton = e.target.closest('.floating-btn');
            
            if (!isPanel && !isButton) {
                document.querySelectorAll('.switcher-panel').forEach(p => {
                    p.classList.remove('visible');
                });
            }
        });
        
    } catch (error) {
        console.error('Ошибка инициализации эффектов:', error);
    }
}

// ==========================================
// === ОБРАБОТКА ОШИБОК ===
// ==========================================

window.addEventListener('error', (e) => {
    console.error('🔴 Глобальная ошибка:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('🔴 Необработанная ошибка Promise:', e.reason);
});
