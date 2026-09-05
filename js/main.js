// === ТОЧКА ВХОДА ===

document.addEventListener('DOMContentLoaded', async () => {
    console.log(' НовыйГодЧат загружается...');
    
    // === ФОН ОТ ВРЕМЕНИ ПОЛЬЗОВАТЕЛЯ ===
    updateBackgroundByTime();
    setInterval(updateBackgroundByTime, 60000);
    
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
    initThemeSwitcher();
    
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

// Конвертация HEX в HSL и обратно для плавного вращения по цветовому кругу
function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// Плавно меняем hue у цвета
function rotateHue(hex, degrees) {
    const hsl = hexToHsl(hex);
    hsl.h = (hsl.h + degrees) % 360;
    if (hsl.h < 0) hsl.h += 360;
    return hslToHex(hsl.h, hsl.s, hsl.l);
}

// Глобальный счётчик для плавного вращения
let hueRotation = 0;

function updateBackgroundByTime() {
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
    
    brightness = Math.max(0, Math.min(1, brightness));
    
    // Базовые цвета (ночь/день)
    const nightColors = ['#1a0000', '#0a1a0a', '#1a0f00', '#0f001a'];
    const dayColors = ['#dc2626', '#d9f99d', '#fb923c', '#a855f7'];
    
    // Плавно вращаем hue для эффекта переливания
    hueRotation = (hueRotation + 0.5) % 360;
    
    const c1 = lerpColor(nightColors[0], rotateHue(dayColors[0], hueRotation), brightness);
    const c2 = lerpColor(nightColors[1], rotateHue(dayColors[1], hueRotation), brightness);
    const c3 = lerpColor(nightColors[2], rotateHue(dayColors[2], hueRotation), brightness);
    const c4 = lerpColor(nightColors[3], rotateHue(dayColors[3], hueRotation), brightness);
    
    document.body.style.background = `linear-gradient(135deg, ${c1}, ${c2}, ${c3}, ${c4})`;
    
    const textColor = brightness > 0.6 ? '#1a1a1a' : '#e0e0e0';
    document.body.style.color = textColor;
    document.documentElement.style.setProperty('--text-color', textColor);
}

// Дополнительная анимация для плавного вращения цветов
setInterval(() => {
    updateBackgroundByTime();
}, 200); // Обновляем hue каждые 200мс для плавности

// === ОБРАБОТКА ОШИБОК ===
window.addEventListener('error', (e) => {
    console.error('Глобальная ошибка:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Необработанная ошибка Promise:', e.reason);
});
