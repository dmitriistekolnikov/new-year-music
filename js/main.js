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
        if (typeof initStickers === 'function') initStickers();
        if (typeof initThemeSwitcher === 'function') initThemeSwitcher();

        // === КАСТОМНЫЙ КУРСОР ===
        if (typeof initCustomCursor === 'function') initCustomCursor();

        // === ФЕЙЕРВЕРК И СТЕНА СЛАВЫ ===
        if (typeof initFireworks === 'function') initFireworks();
        if (typeof initWallOfFame === 'function') initWallOfFame();

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

        // === ОБРАБОТЧИК ЗАГРУЗКИ ФОТО (ИСПРАВЛЕНО) ===
        const photoUpload = document.getElementById('photo-upload');
        if (photoUpload) {
            photoUpload.addEventListener('click', () => {
                console.log('📸 Загрузка фото инициирована');
                // Инициируем клик по скрытому input файла из initPhotoFrame
                const hiddenInput = document.querySelector('#photo-frame input[type="file"]');
                if (hiddenInput) {
                    hiddenInput.click();
                } else {
                    // Fallback: создаем input на лету, если initPhotoFrame еще не отработал
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            console.log('📸 Фото выбрано:', file.name);
                            alert('Фото выбрано: ' + file.name + '\n(Функция отправки в чат будет реализована при наличии бэкенда для загрузки файлов)');
                        }
                    };
                    input.click();
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
        colors: ['#0A3D2E', '#14532D', '#A7F3D0', '#4D5E37', '#DCFCE7', '#2E4F4F'],
        text: '#ffffff'
    },
    {
        name: '🌌 Ночная зимняя магия',
        colors: ['#0F172A', '#1E3A8A', '#2E1065', '#312E81', '#134E4A', '#1F2937', '#020617'],
        text: '#ffffff'
    },
    {
        name: '🔥 Уют и Тепло',
        colors: ['#3E2723', '#4E342E', '#78350F', '#FEF3C7', '#D6C28B', '#7C2D12'],
        text: '#ffffff'
    },
    {
        name: '🎅 Праздничный Красно-Бордовый',
        colors: ['#4C0519', '#7F1D1D', '#881337', '#DC2626'],
        text: '#ffffff'
    },
    {
        name: '💜 Неон и Футуризм',
        colors: ['#4C1D95', '#14532D', '#0284C7', '#0E7490'],
        text: '#ffffff'
    },
    {
        name: '✨ Волшебные и Нежные',
        colors: ['#DDD6FE', '#E0F2FE', '#FBCFE8', '#64748B'],
        text: '#1a1a1a'
    }
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
        index = Number(index);
        if (!Number.isInteger(index) || index < 0 || index >= themes.length) index = 0;

        const theme = themes[index];
        const brightness = getTimeBrightness();
        // Ночью фон становится темнее, но порядок и цвета выбранной темы не меняются.
        const darkening = (1 - brightness) * 0.7;
        const colors = theme.colors.map(color => lerpColor(color, '#000000', darkening));
        const gradient = `linear-gradient(135deg, ${colors.join(', ')})`;

        document.body.style.background = gradient;
        document.body.style.color = brightness < 0.5 ? '#e0e0e0' : theme.text;
        document.documentElement.style.setProperty('--text-color', brightness < 0.5 ? '#e0e0e0' : theme.text);
        document.documentElement.style.setProperty('--theme-color-1', colors[0]);
        document.documentElement.style.setProperty('--theme-color-2', colors[colors.length - 1]);

        currentThemeIndex = index;
        localStorage.setItem('selectedTheme', String(index));
    } catch (error) {
        console.error('Ошибка применения темы:', error);
    }
}

function initThemeSwitcher() {
    try {
        const themeBtn = document.getElementById('theme-btn');
        const themeSwitcher = document.getElementById('theme-switcher');
        const themeList = document.getElementById('theme-list');

        if (!themeBtn || !themeSwitcher || !themeList) {
            console.warn('Переключатель тем: элементы не найдены');
            return;
        }

        const saved = Number(localStorage.getItem('selectedTheme'));
        currentThemeIndex = Number.isInteger(saved) && saved >= 0 && saved < themes.length ? saved : 0;
        applyTheme(currentThemeIndex);

        themeList.innerHTML = '';
        themes.forEach((theme, index) => {
            const option = document.createElement('div');
            option.className = 'switcher-option';
            option.dataset.themeIndex = String(index);

            const preview = document.createElement('div');
            preview.className = 'theme-preview';
            preview.style.background = `linear-gradient(135deg, ${theme.colors.join(', ')})`;

            const label = document.createElement('span');
            label.textContent = theme.name;

            option.append(preview, label);
            option.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                applyTheme(index);
                themeList.querySelectorAll('.switcher-option').forEach(el => {
                    el.classList.toggle('active', el === option);
                });
                themeSwitcher.classList.remove('visible');
            });
            themeList.appendChild(option);
        });

        const updateActive = () => {
            themeList.querySelectorAll('.switcher-option').forEach(el => {
                el.classList.toggle('active', Number(el.dataset.themeIndex) === currentThemeIndex);
            });
        };
        updateActive();

        themeBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            themeSwitcher.classList.toggle('visible');
            const effects = document.getElementById('bg-effects-switcher');
            if (effects) effects.classList.remove('visible');
        });

        // Только затемнение/осветление в течение суток. Тема от времени не переключается.
        setInterval(() => applyTheme(currentThemeIndex), 60000);
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
                document.getElementById('theme-switcher').classList.remove('visible');
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
