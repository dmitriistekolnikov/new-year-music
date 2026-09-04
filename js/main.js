// === ТОЧКА ВХОДА ===

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎄 НовыйГодЧат загружается...');
    
    // === ФОН ОТ ВРЕМЕНИ ПОЛЬЗОВАТЕЛЯ ===
    updateBackgroundByTime();
    setInterval(updateBackgroundByTime, 60000);
    
    // === БАЗОВЫЕ ЭФФЕКТЫ ===
    initSnow();
    initGarland();
    initTimer();
    initCandles();    // <-- ДОБАВЛЕНО
    initClock();      // <-- ДОБАВЛЕНО
    
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
    initPhotoFrame(); // <-- ДОБАВЛЕНО (теперь работает)
    initPuzzle();     // <-- ДОБАВЛЕНО (теперь работает)
    
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
            console.log('🔑 Клик по входу в шапке');
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

// === ФОН ОТ ВРЕМЕНИ ПОЛЬЗОВАТЕЛЯ ===
function updateBackgroundByTime() {
    const now = new Date();
    const hour = now.getHours();
    const root = document.documentElement;
    
    if (hour >= 0 && hour < 6) {
        root.style.setProperty('--bg-dark', '#0a0a0f');
        document.body.style.background = `linear-gradient(135deg, #0a0a0f 0%, #151525 50%, #0a0a0f 100%)`;
    } else if (hour >= 6 && hour < 12) {
        const brightness = (hour - 6) / 6;
        root.style.setProperty('--bg-dark', `hsl(240, 20%, ${10 + brightness * 20}%)`);
        document.body.style.background = `linear-gradient(135deg, hsl(240, 20%, ${5 + brightness * 15}%) 0%, hsl(240, 20%, ${15 + brightness * 20}%) 50%, hsl(240, 20%, ${5 + brightness * 15}%) 100%)`;
    } else if (hour >= 12 && hour < 18) {
        root.style.setProperty('--bg-dark', '#1a1a2e');
        document.body.style.background = `linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 50%, #1a1a2e 100%)`;
    } else {
        const darkness = (hour - 18) / 6;
        root.style.setProperty('--bg-dark', `hsl(240, 20%, ${30 - darkness * 20}%)`);
        document.body.style.background = `linear-gradient(135deg, hsl(240, 20%, ${25 - darkness * 15}%) 0%, hsl(240, 20%, ${35 - darkness * 20}%) 50%, hsl(240, 20%, ${25 - darkness * 15}%) 100%)`;
    }
}

// === ОБРАБОТКА ОШИБОК ===
window.addEventListener('error', (e) => {
    console.error('Глобальная ошибка:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Необработанная ошибка Promise:', e.reason);
}); 
