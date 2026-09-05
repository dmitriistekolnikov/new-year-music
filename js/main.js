// === ТОЧКА ВХОДА ===

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎄 НовыйГодЧат загружается...');
    
    // === ФОН ОТ ВРЕМЕНИ ПОЛЬЗОВАТЕЛЯ ===
    updateBackgroundByTime();
    setInterval(updateBackgroundByTime, 60000); // Обновляем каждую минуту
    
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
        console.log('️ База данных недоступна. Чат работает в офлайн-режиме.');
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
    
    // МЯГКИЕ ПАСТЕЛЬНЫЕ ЦВЕТА вместо неоновых
    const nightColors = ['#1a1a2e', '#16213e', '#0f3460', '#1a1a40'];
    const dayColors = ['#a8d8ea', '#aa96da', '#fcbad3', '#ffffd2'];
    
    const c1 = lerpColor(nightColors[0], dayColors[0], brightness);
    const c2 = lerpColor(nightColors[1], dayColors[1], brightness);
    const c3 = lerpColor(nightColors[2], dayColors[2], brightness);
    const c4 = lerpColor(nightColors[3], dayColors[3], brightness);
    
    document.body.style.background = `linear-gradient(135deg, ${c1}, ${c2}, ${c3}, ${c4})`;
    
    const textColor = brightness > 0.6 ? '#2c3e50' : '#e0e0e0';
    document.body.style.color = textColor;
    document.documentElement.style.setProperty('--text-color', textColor);
}

// === ОБРАБОТКА ОШИБОК ===
window.addEventListener('error', (e) => {
    console.error('Глобальная ошибка:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Необработанная ошибка Promise:', e.reason);
});
