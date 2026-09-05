// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let bgEffectInterval = null;
let currentBgEffect = 'none';

// === ТОЧКА ВХОДА ===

document.addEventListener('DOMContentLoaded', async () => {
    console.log(' НовыйГодЧат загружается...');
    
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
        
        // === ТЕМЫ И СТЕНА СЛАВЫ ===
        if (typeof initThemeSwitcher === 'function') initThemeSwitcher();
        if (typeof initWallOfFame === 'function') initWallOfFame();
        
        // === ФЕЙЕРВЕРК ===
        if (typeof initFireworks === 'function') initFireworks();
        
        // === ЭФФЕКТЫ ФОНА ===
        if (typeof initBackgroundEffects === 'function') initBackgroundEffects();
        
        // === ДОПОЛНИТЕЛЬНЫЕ ЭФФЕКТЫ ===
        if (typeof initCustomCursor === 'function') initCustomCursor();
        if (typeof initParallax === 'function') initParallax();
        if (typeof initTreeCounter === 'function') initTreeCounter();
        if (typeof initSparkWaterfall === 'function') initSparkWaterfall();
        if (typeof initElementTransforms === 'function') initElementTransforms();
        if (typeof initNameFirework === 'function') initNameFirework();
        
        // === ОБРАБОТЧИК КНОПКИ ВХОД В ШАПКЕ ===
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
        
        // === КНОПКА ЭФФЕКТОВ ФОНА ===
        const bgEffectsBtn = document.getElementById('bg-effects-btn');
        const bgEffectsSwitcher = document.getElementById('bg-effects-switcher');
        
        if (bgEffectsBtn && bgEffectsSwitcher) {
            bgEffectsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                bgEffectsSwitcher.classList.toggle('visible');
            });
            
            document.addEventListener('click', (e) => {
                if (!bgEffectsSwitcher.contains(e.target) && e.target !== bgEffectsBtn) {
                    bgEffectsSwitcher.classList.remove('visible');
                }
            });
        }
        
        // === ПРОВЕРКА БД ===
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
                console.log('️ База данных недоступна. Чат работает в офлайн-режиме.');
            }
        }
        
        // === ЗАГЛУШКИ ===
        const photoUpload = document.getElementById('photo-upload');
        if (photoUpload) {
            photoUpload.addEventListener('click', () => {
                console.log('📸 Загрузка фото');
            });
        }
        
        console.log('✨ Все системы активны!');
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
    }
});

// === ТЕМЫ ФОНА ===
const themes = [
    { name: '🎄 Классика и Елка', colors: ['#0A3D2E', '#14532D', '#A7F3D0', '#4D5E37'], text: '#fff' },
    { name: '🌌 Ночная магия', colors: ['#0F172A', '#1E3A8A', '#2E1065', '#312E81'], text: '#fff' },
    { name: ' Уют и Тепло', colors: ['#3E2723', '#4E342E', '#78350F', '#FEF3C7'], text: '#fff' },
    { name: '🎅 Праздничный', colors: ['#4C0519', '#7F1D1D', '#881337', '#DC2626'], text: '#fff' },
    { name: '💜 Неон', colors: ['#4C1D95', '#14532D', '#0284C7', '#0E7490'], text: '#fff' },
    { name: '✨ Нежные', colors: ['#DDD6FE', '#E0F2FE', '#FBCFE8', '#64748B'], text: '#1a1a1a' },
    { name: '🌊 Морские', colors: ['#2E4F4F', '#134E4A', '#0284C7', '#0E7490'], text: '#fff' },
    { name: '🌙 Глубокая ночь', colors: ['#020617', '#0F172A', '#1F2937', '#1E293B'], text: '#fff' },
];

let currentThemeIndex = 0;

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

function darkenColor(hex, amount) {
    return lerpColor(hex, '#000000', amount);
}

function getTimeBrightness() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const mins = h * 60 + m;
    
    const shifted = (mins - 60 + 1440) % 1440;
    let brightness = 0;
    
    if (shifted <= 780) {
        brightness = shifted / 780;
    } else {
        brightness = 1 - ((shifted - 780) / 660);
    }
    
    return Math.max(0, Math.min(1, brightness));
}

function applyTheme(index) {
    try {
        const theme = themes[index];
        const brightness = getTimeBrightness();
        
        const darkening = 1 - brightness;
        const nightDarkenAmount = 0.7;
        const actualDarken = darkening * nightDarkenAmount;
        
        const darkenedColors = theme.colors.map(color => darkenColor(color, actualDarken));
        const gradient = `linear-gradient(135deg, ${darkenedColors[0]}, ${darkenedColors[1]}, ${darkenedColors[2]}, ${darkenedColors[3]})`;
        
        document.body.style.background = gradient;
        
        const textColor = brightness < 0.5 ? '#e0e0e0' : theme.text;
        document.body.style.color = textColor;
        document.documentElement.style.setProperty('--text-color', textColor);
        
        localStorage.setItem('selectedTheme', index);
        currentThemeIndex = index;
    } catch (error) {
        console.error('Ошибка применения темы:', error);
    }
}

function initThemeSwitcher() {
    try {
        const themeBtn = document.getElementById('theme-btn');
        const themeSwitcher = document.getElementById('theme-switcher');
        const themeList = document.getElementById('theme-list');
        
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme !== null) {
            currentThemeIndex = parseInt(savedTheme);
        }
        
        applyTheme(currentThemeIndex);
        
        setInterval(() => {
            applyTheme(currentThemeIndex);
        }, 60000);
        
        if (themeList) {
            themeList.innerHTML = '';
            themes.forEach((theme, index) => {
                const option = document.createElement('div');
                option.className = 'theme-option';
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
        
        if (themeBtn) {
            themeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (themeSwitcher) themeSwitcher.classList.toggle('visible');
            });
        }
        
        document.addEventListener('click', (e) => {
            if (themeSwitcher && !themeSwitcher.contains(e.target) && e.target !== themeBtn) {
                themeSwitcher.classList.remove('visible');
            }
        });
    } catch (error) {
        console.error('Ошибка инициализации переключателя тем:', error);
    }
}

// === ЭФФЕКТЫ ФОНА ===

class BackgroundEffects {
    constructor() {
        this.canvas = document.getElementById('bg-effects-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.particles = [];
        this.lines = [];
        this.balls = [];
        this.animationId = null;
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
    
    startLines() {
        this.lines = [];
        const lineCount = 5;
        
        for (let i = 0; i < lineCount; i++) {
            this.lines.push({
                x1: Math.random() * this.canvas.width,
                y1: Math.random() * this.canvas.height,
                x2: Math.random() * this.canvas.width,
                y2: Math.random() * this.canvas.height,
                color: `hsl(${Math.random() * 60 + 240}, 100%, 50%)`,
                speed: 0.5 + Math.random() * 0.5,
                angle: Math.random() * Math.PI * 2
            });
        }
        
        this.animateLines();
    }
    
    animateLines() {
        if (currentBgEffect !== 'lines') return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.lines.forEach(line => {
            line.x1 += Math.cos(line.angle) * line.speed;
            line.y1 += Math.sin(line.angle) * line.speed;
            line.x2 += Math.cos(line.angle + 0.5) * line.speed;
            line.y2 += Math.sin(line.angle + 0.5) * line.speed;
            
            if (line.x1 < 0 || line.x1 > this.canvas.width) line.angle = Math.PI - line.angle;
            if (line.y1 < 0 || line.y1 > this.canvas.height) line.angle = -line.angle;
            
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = line.color;
            this.ctx.strokeStyle = line.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(line.x1, line.y1);
            this.ctx.lineTo(line.x2, line.y2);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        });
        
        this.animationId = requestAnimationFrame(() => this.animateLines());
    }
    
    startBalls() {
        this.balls = [];
        const ballCount = 20;
        
        for (let i = 0; i < ballCount; i++) {
            this.balls.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + Math.random() * 200,
                size: 10 + Math.random() * 30,
                color: `hsla(${Math.random() * 360}, 70%, 60%, 0.6)`,
                speed: 1 + Math.random() * 2,
                wobble: Math.random() * Math.PI * 2
            });
        }
        
        this.animateBalls();
    }
    
    animateBalls() {
        if (currentBgEffect !== 'balls') return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.balls.forEach(ball => {
            ball.y -= ball.speed;
            ball.wobble += 0.02;
            ball.x += Math.sin(ball.wobble) * 0.5;
            
            if (ball.y < -50) {
                ball.y = this.canvas.height + 50;
                ball.x = Math.random() * this.canvas.width;
            }
            
            this.ctx.shadowBlur = 30;
            this.ctx.shadowColor = ball.color;
            this.ctx.fillStyle = ball.color;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        this.animationId = requestAnimationFrame(() => this.animateBalls());
    }
    
    startParticles() {
        this.particles = [];
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 2 + Math.random() * 5,
                color: `hsla(${Math.random() * 60 + 180}, 100%, 70%, 0.8)`,
                pulseSpeed: 0.02 + Math.random() * 0.03,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
        
        this.animateParticles();
    }
    
    animateParticles() {
        if (currentBgEffect !== 'particles') return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.pulsePhase += particle.pulseSpeed;
            const pulseSize = particle.size * (1 + Math.sin(particle.pulsePhase) * 0.5);
            
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = particle.color;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        this.animationId = requestAnimationFrame(() => this.animateParticles());
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

const bgEffects = new BackgroundEffects();

function initBackgroundEffects() {
    const switcher = document.getElementById('bg-effects-switcher');
    const options = document.querySelectorAll('.effect-option');
    
    const savedEffect = localStorage.getItem('bgEffect');
    if (savedEffect) {
        currentBgEffect = savedEffect;
        applyBackgroundEffect(savedEffect);
        updateActiveOption(savedEffect);
    }
    
    options.forEach(option => {
        option.addEventListener('click', () => {
            const effect = option.dataset.effect;
            currentBgEffect = effect;
            localStorage.setItem('bgEffect', effect);
            applyBackgroundEffect(effect);
            updateActiveOption(effect);
        });
    });
    
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
    
    function updateActiveOption(activeEffect) {
        options.forEach(opt => {
            if (opt.dataset.effect === activeEffect) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }
}

// === ОБРАБОТКА ОШИБОК ===
window.addEventListener('error', (e) => {
    console.error('Глобальная ошибка:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Необработанная ошибка Promise:', e.reason);
});
