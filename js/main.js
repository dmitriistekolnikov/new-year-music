// === ТОЧКА ВХОДА: ИНИЦИАЛИЗАЦИЯ ВСЕХ МОДУЛЕЙ ===

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎄 НовыйГодЧат загружается...');
    
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
        
        // Проверяем сохраненную сессию
        const hasSession = await db.checkSession();
        if (hasSession) {
            console.log('✅ Сессия активна:', db.currentNick);
            // Автоматически показываем интерфейс чата
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
    
    // === ЗАГЛУШКИ ДЛЯ КНОПОК ===
    const headerLoginBtn = document.getElementById('header-login-btn');
    if (headerLoginBtn) {
        headerLoginBtn.addEventListener('click', () => {
            console.log('🔑 Клик по входу в шапке');
            // Можно добавить модальное окно или редирект
        });
    }
    
    const photoUpload = document.getElementById('photo-upload');
    if (photoUpload) {
        photoUpload.addEventListener('click', () => {
            console.log('📸 Загрузка фото');
            // Можно добавить input type="file"
        });
    }
    
    console.log('✨ Все системы активны!');
    console.log('📊 Загружено треков:', TRACKS_COUNT);
    console.log('🎨 Доступно тем:', THEMES.length);
});

// === ОБРАБОТКА ОШИБОК ===
window.addEventListener('error', (e) => {
    console.error('Глобальная ошибка:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Необработанная ошибка Promise:', e.reason);
});
