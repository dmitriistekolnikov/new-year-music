// === ТОЧКА ВХОДА ===

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎄 НовыйГодЧат загружается...');
    
    // === ИНИЦИАЛИЗАЦИЯ ТЕМ ===
    initThemeSwitcher();
    
    // === БАЗОВЫЕ ЭФФЕКТЫ ===
    initSnow();
    initGarland();
    initTimer();
    
    // === ПЛЕЕР ===
    initPlayer();
    
    // === ИНТЕРАКТИВНЫЕ ЭФФЕКТЫ ===
    initFreeze();
    initGift();
    initLetter();
    
    // === ДОПОЛНИТЕЛЬНЫЕ ЭФФЕКТЫ ===
    initCustomCursor();
    initParallax();
    initTreeCounter();
    initSparkWaterfall();
    initElementTransforms();
    initNameFirework();
    
    // === ПРОВЕРКА БД ===
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
    
    // === ЗАГЛУШКИ ===
    const headerLoginBtn = document.getElementById('header-login-btn');
    if (headerLoginBtn) {
        headerLoginBtn.addEventListener('click', () => {
            console.log(' Клик по входу в шапке');
        });
    }
    
    const photoUpload = document.getElementById('photo-upload');
    if (photoUpload) {
        photoUpload.addEventListener('click', () => {
            console.log('📸 Загрузка фото');
        });
    }
    
    console.log('✨ Все системы активны!');
});

// === ТЕМЫ ФОНА (группы по 4 цвета из твоего списка) ===
const themes = [
    // 🎄 Классика и Елка
    { 
        name: '🎄 Классика и Елка', 
        colors: ['#0A3D2E', '#14532D', '#A7F3D0', '#4D5E37'],
        text: '#fff'
    },
    // 🌌 Ночная зимняя магия
    { 
        name: ' Ночная магия', 
        colors: ['#0F172A', '#1E3A8A', '#2E1065', '#312E81'],
        text: '#fff'
    },
    // 🔥 Уют и Тепло
    { 
        name: '🔥 Уют и Тепло', 
        colors: ['#3E2723', '#4E342E', '#78350F', '#FEF3C7'],
        text: '#fff'
    },
    // 🎅 Праздничный Красно-Бордовый
    { 
        name: '🎅 Праздничный', 
        colors: ['#4C0519', '#7F1D1D', '#881337', '#DC2626'],
        text: '#fff'
    },
    // 💜 Неон и Футуризм
    { 
        name: '💜 Неон', 
        colors: ['#4C1D95', '#14532D', '#0284C7', '#0E7490'],
        text: '#fff'
    },
    // ✨ Волшебные и Нежные
    { 
        name: '✨ Нежные', 
        colors: ['#DDD6FE', '#E0F2FE', '#FBCFE8', '#64748B'],
        text: '#1a1a1a'
    },
    //  Морские оттенки
    { 
        name: '🌊 Морские', 
        colors: ['#2E4F4F', '#134E4A', '#0284C7', '#0E7490'],
        text: '#fff'
    },
    // 🌙 Глубокая ночь
    { 
        name: '🌙 Глубокая ночь', 
        colors: ['#020617', '#0F172A', '#1F2937', '#1E293B'],
        text: '#fff'
    },
];

let currentThemeIndex = 0;

// Интерполяция между двумя HEX-цветами
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

// Затемнение цвета (mix с чёрным)
function darkenColor(hex, amount) {
    // amount: 0 = оригинал, 1 = полностью чёрный
    return lerpColor(hex, '#000000', amount);
}

// Вычисление яркости времени суток (0 = ночь, 1 = день)
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

// Применение темы с учётом времени суток
function applyTheme(index) {
    const theme = themes[index];
    const brightness = getTimeBrightness();
    
    // Ночью затемняем цвета (brightness=0 → mix с чёрным на 70%)
    // Днём оставляем оригинальные (brightness=1 → mix с чёрным на 0%)
    const darkening = 1 - brightness; // 1 ночью, 0 днём
    const nightDarkenAmount = 0.7; // Насколько сильно затемнять ночью (0.7 = 70% чёрного)
    const actualDarken = darkening * nightDarkenAmount;
    
    const darkenedColors = theme.colors.map(color => darkenColor(color, actualDarken));
    const gradient = `linear-gradient(135deg, ${darkenedColors[0]}, ${darkenedColors[1]}, ${darkenedColors[2]}, ${darkenedColors[3]})`;
    
    document.body.style.background = gradient;
    
    // Цвет текста: ночью всегда светлый, днём зависит от темы
    const textColor = brightness < 0.5 ? '#e0e0e0' : theme.text;
    document.body.style.color = textColor;
    document.documentElement.style.setProperty('--text-color', textColor);
    
    // Сохраняем выбор
    localStorage.setItem('selectedTheme', index);
    currentThemeIndex = index;
}

function initThemeSwitcher() {
    const themeBtn = document.getElementById('theme-btn');
    const themeSwitcher = document.getElementById('theme-switcher');
    const themeList = document.getElementById('theme-list');
    
    // Загружаем сохраненную тему
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme !== null) {
        currentThemeIndex = parseInt(savedTheme);
    }
    
    // Применяем тему (с учётом времени суток)
    applyTheme(currentThemeIndex);
    
    // Обновляем фон каждую минуту (для плавной смены дня/ночи)
    setInterval(() => {
        applyTheme(currentThemeIndex);
    }, 60000);
    
    // Создаем список тем
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
                themeSwitcher.classList.remove('visible');
            });
            themeList.appendChild(option);
        });
    }
    
    // Клик по кнопке 🎨
    if (themeBtn) {
        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeSwitcher.classList.toggle('visible');
        });
    }
    
    // Закрытие при клике вне переключателя
    document.addEventListener('click', (e) => {
        if (themeSwitcher && !themeSwitcher.contains(e.target) && e.target !== themeBtn) {
            themeSwitcher.classList.remove('visible');
        }
    });
}

// === ОБРАБОТКА ОШИБОК ===
window.addEventListener('error', (e) => {
    console.error('Глобальная ошибка:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Необработанная ошибка Promise:', e.reason);
});
