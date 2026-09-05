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
        if (typeof initPhotoFrame === 'function') initPhotoFrame();// ИСПРАВЛЕНО: добавлена инициализация фото-рамки
        // === КАСТОМНЫЙ КУРСОР ===
        if (typeof initCustomCursor === 'function') initCustomCursor();

        // === ФЕЙЕРВЕРК И СТЕНА СЛАВЫ ===
        if (typeof initFireworks === 'function') initFireworks();
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                if (typeof initWallOfFame === 'function') initWallOfFame();
            }, { timeout: 1800 });
        } else {
            setTimeout(() => { if (typeof initWallOfFame === 'function') initWallOfFame(); }, 300);
        }

        // === ТЕМЫ И ЭФФЕКТЫ ФОНА ===
        initThemeSwitcher();
        initBackgroundEffects();

        // === ОБРАБОТЧИК КНОПКИ ВХОДА В ШАПКЕ (ИСПРАВЛЕНО) ===
        const headerLoginBtn = document.getElementById('header-login-btn');
        if (headerLoginBtn) {
            headerLoginBtn.addEventListener('click', () => {
                console.log('🔑 Клик по входу в шапке');
                // Плавная прокрутка к чату
                const chatSection = document.querySelector('main > section:last-of-type');
                if (chatSection) {
                    chatSection.scrollIntoView({ behavior: 'smooth' });
                }
                // Имитация клика по кнопке входа в чате с небольшой задержкой для завершения скролла
                const chatLoginBtn = document.getElementById('chat-login-btn');
                if (chatLoginBtn) {
                    setTimeout(() => chatLoginBtn.click(), 500);
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
    { name: '🎄 Классика и Елка', colors: ['#0A3D2E','#14532D','#A7F3D0','#4D5E37','#DCFCE7','#86EFAC','#2E4F4F'], text: '#ffffff' },
    { name: '🌌 Ночная зимняя магия', colors: ['#0F172A','#1E3A8A','#2E1065','#312E81','#134E4A','#1F2937','#020617'], text: '#ffffff' },
    { name: '🔥 Уют и Тепло', colors: ['#3E2723','#4E342E','#78350F','#FEF3C7','#D6C28B','#7C2D12'], text: '#ffffff' },
    { name: '🎅 Праздничный Красно-Бордовый', colors: ['#4C0519','#7F1D1D','#881337','#DC2626'], text: '#ffffff' },
    { name: '💜 Неон и Футуризм', colors: ['#4C1D95','#14532D','#0284C7','#0E7490'], text: '#ffffff' },
    { name: '✨ Волшебные и Нежные', colors: ['#DDD6FE','#C4B5FD','#E0F2FE','#BAE6FD','#FBCFE8','#F9A8D4','#64748B'], text: '#172033' }
];

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
        index = Number.isInteger(Number(index)) ? Number(index) : 0;
        if (index < 0 || index >= themes.length) index = 0;
        const theme = themes[index];
        const brightness = getTimeBrightness();
        const darkening = (1 - brightness) * 0.55;
        const colors = theme.colors.map(color => lerpColor(color, '#000000', darkening));
        const stops = colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`).join(', ');
        document.body.style.background = `linear-gradient(135deg, ${stops})`;
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.color = theme.text;
        document.documentElement.style.setProperty('--text-color', theme.text);
        localStorage.setItem('selectedTheme', String(index));
        currentThemeIndex = index;
    } catch (error) { console.error('Ошибка применения темы:', error); }
}


function initThemeSwitcher() {
    const themeBtn = document.getElementById('theme-btn');
    const themeSwitcher = document.getElementById('theme-switcher');
    const themeList = document.getElementById('theme-list');
    if (!themeBtn || !themeSwitcher || !themeList) {
        console.warn('Переключатель тем: элементы не найдены');
        return;
    }

    const saved = Number.parseInt(localStorage.getItem('selectedTheme') || '0', 10);
    currentThemeIndex = Number.isInteger(saved) && saved >= 0 && saved < themes.length ? saved : 0;

    function render() {
        themeList.innerHTML = '';
        themes.forEach((theme, index) => {
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'switcher-option';
            option.innerHTML = `<span class="theme-preview" style="background: linear-gradient(135deg, ${theme.colors.slice(0, Math.min(3, theme.colors.length)).join(',')})"></span><span>${theme.name}</span>`;
            option.classList.toggle('active', index === currentThemeIndex);
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                applyTheme(index);
                render();
                themeSwitcher.classList.remove('visible');
                themeSwitcher.setAttribute('aria-hidden', 'true');
            });
            themeList.appendChild(option);
        });
    }

    themeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const open = !themeSwitcher.classList.contains('visible');
        themeSwitcher.classList.toggle('visible', open);
        themeSwitcher.setAttribute('aria-hidden', String(!open));
        const effectsPanel = document.getElementById('bg-effects-switcher');
        if (effectsPanel) effectsPanel.classList.remove('visible');
    });

    applyTheme(currentThemeIndex);
    render();
    setInterval(() => applyTheme(currentThemeIndex), 60000);
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
        const lineCount = 28;
        for (let i = 0; i < lineCount; i++) {
            const isHorizontal = Math.random() > 0.5;
            if (isHorizontal) {
                this.items.push({
                    x1: 0, y1: Math.random() * this.canvas.height,
                    x2: this.canvas.width, y2: Math.random() * this.canvas.height,
                    color: `hsl(${Math.random() * 60 + 240}, 100%, 60%)`,
                    speed: 0.3 + Math.random() * 0.5,
                    angle: 0, isHorizontal: true,
                    turnTimer: Math.random() * 300 + 200
                });
            } else {
                this.items.push({
                    x1: Math.random() * this.canvas.width, y1: 0,
                    x2: Math.random() * this.canvas.width, y2: this.canvas.height,
                    color: `hsl(${Math.random() * 60 + 240}, 100%, 60%)`,
                    speed: 0.3 + Math.random() * 0.5,
                    angle: Math.PI / 2, isHorizontal: false,
                    turnTimer: Math.random() * 300 + 200
                });
            }
        }
        this.animate('lines');
    }

    // Эффект 2: Летающие шары + звёзды
    startBalls() {
        this.items = [];
        const ballCount = 20;
        const starCount = 30;
        for (let i = 0; i < ballCount; i++) {
            this.items.push({
                type: 'ball',
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + Math.random() * 200,
                size: 10 + Math.random() * 30,
                color: `hsla(${Math.random() * 360}, 80%, 60%, 0.6)`,
                speed: 1 + Math.random() * 2,
                wobble: Math.random() * Math.PI * 2
            });
        }
        for (let i = 0; i < starCount; i++) {
            this.items.push({
                type: 'star',
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + Math.random() * 200,
                size: 3 + Math.random() * 8,
                color: `hsla(${Math.random() * 60 + 40}, 100%, 80%, 0.8)`,
                speed: 1.5 + Math.random() * 2.5,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
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

    // Эффект 4: Северное сияние + созвездия + падающие звёзды
    startAurora() {
        this.items = [];
        const starCount = Math.min(95, Math.max(45, Math.floor(window.innerWidth / 18)));
        for (let i = 0; i < starCount; i++) {
            this.items.push({
                type: 'aurora-star',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                r: 0.7 + Math.random() * 2.1,
                phase: Math.random() * Math.PI * 2,
                speed: 0.006 + Math.random() * 0.015
            });
        }
        for (let i = 0; i < 4; i++) {
            this.items.push({
                type: 'shooting-star',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.55,
                vx: 4 + Math.random() * 5,
                vy: 2 + Math.random() * 3,
                length: 60 + Math.random() * 100,
                alpha: 0,
                delay: Math.random() * 500
            });
        }
        this.animate('aurora');
    }

    // Эффект 5: Галактическая воронка — псевдо-3D спираль частиц
    startGalaxy() {
        this.items = [];
        const count = Math.min(260, Math.max(150, Math.floor((window.innerWidth * window.innerHeight) / 5200)));
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.pow(Math.random(), 0.72) * Math.max(this.canvas.width, this.canvas.height) * 0.72;
            this.items.push({
                type: 'galaxy-star',
                angle,
                radius,
                depth: 0.25 + Math.random() * 1.1,
                speed: 0.0015 + Math.random() * 0.004,
                size: 0.5 + Math.random() * 2.2,
                phase: Math.random() * Math.PI * 2,
                hue: 170 + Math.random() * 100
            });
        }
        this.animate('galaxy');
    }

    // Эффект 6: Снежный вихрь — частицы закручиваются вокруг центра
    startVortex() {
        this.items = [];
        const count = Math.min(190, Math.max(110, Math.floor(window.innerWidth / 7)));
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 30 + Math.random() * Math.max(this.canvas.width, this.canvas.height) * 0.65;
            this.items.push({
                type: 'vortex-snow',
                angle,
                radius,
                speed: 0.002 + Math.random() * 0.006,
                drift: (Math.random() - 0.5) * 0.35,
                size: 1 + Math.random() * 3.5,
                phase: Math.random() * Math.PI * 2,
                opacity: 0.25 + Math.random() * 0.7
            });
        }
        this.animate('vortex');
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
                if (line.isHorizontal) {
                    line.y1 += line.speed;
                    line.y2 += line.speed;
                    if (line.y1 > h && line.y2 > h) {
                        line.y1 = 0;
                        line.y2 = Math.random() * h * 0.3;
                    }
                } else {
                    line.x1 += line.speed;
                    line.x2 += line.speed;
                    if (line.x1 > w && line.x2 > w) {
                        line.x1 = 0;
                        line.x2 = Math.random() * w * 0.3;
                    }
                }

                line.turnTimer--;
                if (line.turnTimer <= 0) {
                    line.isHorizontal = !line.isHorizontal;
                    line.turnTimer = Math.random() * 300 + 200;
                    if (line.isHorizontal) {
                        line.x1 = 0; line.x2 = w;
                        line.y1 = Math.random() * h;
                        line.y2 = Math.random() * h;
                    } else {
                        line.y1 = 0; line.y2 = h;
                        line.x1 = Math.random() * w;
                        line.x2 = Math.random() * w;
                    }
                }

                ctx.shadowBlur = 40;
                ctx.shadowColor = line.color;
                ctx.strokeStyle = line.color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(line.x1, line.y1);
                ctx.lineTo(line.x2, line.y2);
                ctx.stroke();

                ctx.shadowBlur = 60;
                ctx.lineWidth = 1;
                ctx.stroke();
            });

        } else if (type === 'balls') {
            this.items.forEach(item => {
                if (item.type === 'ball') {
                    item.y -= item.speed;
                    item.wobble += 0.02;
                    item.x += Math.sin(item.wobble) * 0.5;
                    if (item.y < -50) {
                        item.y = h + 50;
                        item.x = Math.random() * w;
                    }
                    ctx.shadowBlur = 30;
                    ctx.shadowColor = item.color;
                    ctx.fillStyle = item.color;
                    ctx.beginPath();
                    ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
                    ctx.fill();

                } else if (item.type === 'star') {
                    item.y -= item.speed;
                    item.rotation += item.rotationSpeed;
                    if (item.y < -20) {
                        item.y = h + 20;
                        item.x = Math.random() * w;
                    }
                    ctx.save();
                    ctx.translate(item.x, item.y);
                    ctx.rotate(item.rotation);
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = item.color;
                    ctx.fillStyle = item.color;
                    ctx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                        const x = Math.cos(angle) * item.size;
                        const y = Math.sin(angle) * item.size;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                }
            });

        } else if (type === 'particles') {
            this.items.forEach(particle => {
                particle.phase += particle.pulseSpeed;
                const size = particle.size * (1 + Math.sin(particle.phase) * 0.5);
                ctx.shadowBlur = 15;
                ctx.shadowColor = particle.color;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
                ctx.fill();
            });
        } else if (type === 'aurora') {
            const t = performance.now() * 0.00018;

            // Мягкие полярные ленты
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            for (let band = 0; band < 5; band++) {
                const gradient = ctx.createLinearGradient(0, h * (0.10 + band * 0.11), w, h * (0.28 + band * 0.11));
                gradient.addColorStop(0, `hsla(${145 + band * 24}, 90%, 55%, 0)`);
                gradient.addColorStop(0.35, `hsla(${155 + band * 18}, 90%, 60%, 0.10)`);
                gradient.addColorStop(0.65, `hsla(${185 + band * 16}, 90%, 65%, 0.06)`);
                gradient.addColorStop(1, `hsla(${210 + band * 14}, 90%, 65%, 0)`);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(0, h * (0.10 + band * 0.10));
                for (let x = 0; x <= w; x += 24) {
                    const y = h * (0.13 + band * 0.105) +
                        Math.sin(x * 0.004 + t * 7 + band) * 38 +
                        Math.sin(x * 0.011 - t * 4) * 16;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(w, h * 0.48);
                ctx.lineTo(0, h * 0.48);
                ctx.closePath();
                ctx.fill();
            }

            const stars = this.items.filter(i => i.type === 'aurora-star');
            stars.forEach(star => {
                star.phase += star.speed;
                const alpha = 0.25 + (Math.sin(star.phase) + 1) * 0.30;
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(180,230,255,0.7)';
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                ctx.fill();
            });

            // Созвездия: соединяем только близкие звёзды
            ctx.lineWidth = 0.6;
            for (let i = 0; i < stars.length; i++) {
                for (let j = i + 1; j < stars.length; j++) {
                    const a = stars[i], b = stars[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < 10500) {
                        const alpha = (1 - Math.sqrt(d2) / 102) * 0.16;
                        ctx.strokeStyle = `rgba(190,230,255,${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            this.items.filter(i => i.type === 'shooting-star').forEach(star => {
                if (star.delay > 0) { star.delay -= 1; return; }
                star.x += star.vx;
                star.y += star.vy;
                star.alpha += 0.025;
                if (star.alpha > 1) star.alpha = 1;
                if (star.x > w + 120 || star.y > h * 0.72) {
                    star.x = Math.random() * w * 0.65;
                    star.y = Math.random() * h * 0.35;
                    star.alpha = 0;
                    star.delay = 180 + Math.random() * 420;
                }
                const grad = ctx.createLinearGradient(star.x, star.y, star.x - star.length, star.y - star.length * 0.55);
                grad.addColorStop(0, `rgba(255,255,255,${0.9 * star.alpha})`);
                grad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.strokeStyle = grad;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(star.x - star.length, star.y - star.length * 0.55);
                ctx.stroke();
            });
            ctx.restore();
        } else if (type === 'galaxy') {
            const t = performance.now() * 0.00035;
            const cx = w * 0.5;
            const cy = h * 0.5;
            const maxR = Math.max(w, h) * 0.58;

            // Две мягкие спиральные рукава
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            for (let arm = 0; arm < 2; arm++) {
                ctx.beginPath();
                for (let r = 10; r < maxR; r += 9) {
                    const a = r * 0.012 + arm * Math.PI + t;
                    const x = cx + Math.cos(a) * r * (w / Math.max(w, h));
                    const y = cy + Math.sin(a) * r * (h / Math.max(w, h));
                    if (r === 10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = arm ? 'rgba(130,190,255,0.09)' : 'rgba(120,255,210,0.10)';
                ctx.lineWidth = 28;
                ctx.shadowBlur = 35;
                ctx.shadowColor = arm ? 'rgba(100,150,255,0.35)' : 'rgba(80,255,190,0.35)';
                ctx.stroke();
            }

            this.items.forEach(star => {
                star.angle += star.speed * (1.1 - Math.min(star.radius / maxR, 1) * 0.35);
                const wobble = Math.sin(t * 2 + star.phase) * 5;
                const r = Math.max(4, star.radius + wobble);
                const x = cx + Math.cos(star.angle) * r * (w / Math.max(w, h));
                const y = cy + Math.sin(star.angle) * r * (h / Math.max(w, h));
                const perspective = 0.35 + star.depth * 0.65;
                const size = star.size * perspective;
                const alpha = Math.max(0.08, 1 - r / (maxR * 1.35));
                ctx.fillStyle = `hsla(${star.hue}, 95%, 75%, ${alpha})`;
                ctx.shadowBlur = 10 * perspective;
                ctx.shadowColor = `hsla(${star.hue}, 100%, 70%, 0.7)`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Ядро галактики
            const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.22);
            core.addColorStop(0, 'rgba(255,255,255,0.28)');
            core.addColorStop(0.12, 'rgba(180,255,235,0.12)');
            core.addColorStop(1, 'rgba(80,180,255,0)');
            ctx.fillStyle = core;
            ctx.beginPath();
            ctx.arc(cx, cy, Math.min(w, h) * 0.24, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

        } else if (type === 'vortex') {
            const t = performance.now() * 0.001;
            const cx = w * 0.5;
            const cy = h * 0.52;
            const maxR = Math.max(w, h) * 0.72;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            this.items.forEach(p => {
                p.angle += p.speed * (1 + (1 - Math.min(p.radius / maxR, 1)) * 2.4);
                p.radius -= p.drift;
                if (p.radius < 20) {
                    p.radius = maxR * (0.55 + Math.random() * 0.45);
                    p.angle = Math.random() * Math.PI * 2;
                }
                const wave = Math.sin(p.angle * 3 + t * 2 + p.phase) * 14;
                const r = p.radius + wave;
                const x = cx + Math.cos(p.angle) * r * (w / Math.max(w, h));
                const y = cy + Math.sin(p.angle) * r * (h / Math.max(w, h));
                const twinkle = 0.55 + 0.45 * Math.sin(t * 4 + p.phase);
                const alpha = p.opacity * twinkle * Math.min(1, r / 90);
                ctx.fillStyle = `rgba(220,245,255,${alpha})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = 'rgba(160,220,255,0.75)';
                ctx.beginPath();
                ctx.arc(x, y, p.size * (0.7 + twinkle * 0.5), 0, Math.PI * 2);
                ctx.fill();
            });

            // Светящийся центр и вращающиеся кольца
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.ellipse(cx, cy, 45 + i * 24, 18 + i * 12, t * (0.15 + i * 0.025), 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(150,220,255,${0.11 - i * 0.018})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150);
            glow.addColorStop(0, 'rgba(255,255,255,0.22)');
            glow.addColorStop(0.18, 'rgba(150,225,255,0.12)');
            glow.addColorStop(1, 'rgba(100,180,255,0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(cx, cy, 150, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.shadowBlur = 0;
        this.animId = requestAnimationFrame(() => this.animate(type));
    }
}

const bgEffects = new BackgroundEffects();

function initBackgroundEffects() {
    try {
        const btn = document.getElementById('bg-effects-btn');
        const panel = document.getElementById('bg-effects-switcher');
        const options = document.querySelectorAll('.switcher-option[data-effect]');

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
            if (effect === 'lines') bgEffects.startLines();
            else if (effect === 'balls') bgEffects.startBalls();
            else if (effect === 'particles') bgEffects.startParticles();
            else if (effect === 'aurora') bgEffects.startAurora();
            else if (effect === 'galaxy') bgEffects.startGalaxy();
            else if (effect === 'vortex') bgEffects.startVortex();
        }

        function updateActiveOption(activeEffect) {
            options.forEach(opt => {
                opt.classList.toggle('active', opt.dataset.effect === activeEffect);
            });
        }

        if (btn && panel) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                panel.classList.toggle('visible');
                const themePanel = document.getElementById('theme-switcher');
                if (themePanel) themePanel.classList.remove('visible');
            });
        }

        document.addEventListener('click', (e) => {
            const isPanel = e.target.closest('.switcher-panel');
            const isButton = e.target.closest('.floating-btn');
            if (!isPanel && !isButton) {
                document.querySelectorAll('.switcher-panel').forEach(p => p.classList.remove('visible'));
            }
        });

    } catch (error) {
        console.error('Ошибка инициализации эффектов:', error);
    }
}

// === ОБРАБОТКА ОШИБОК ===
window.addEventListener('error', (e) => console.error('🔴 Глобальная ошибка:', e.error));
window.addEventListener('unhandledrejection', (e) => console.error('🔴 Promise error:', e.reason));
