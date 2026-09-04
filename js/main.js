// === ТОЧКА ВХОДА ===

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎄 НовыйГодЧат загружается...');
    
    // === ФОН ОТ ВРЕМЕНИ ПОЛЬЗОВАТЕЛЯ ===
    updateTimeBackground();
    setInterval(updateTimeBackground, 60000);
    
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
    initSparkWaterfall();
    initElementTransforms();
    initNameFirework();
    initPuzzle();
    
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

// === ФОН ОТ ВРЕМЕНИ ПОЛЬЗОВАТЕЛЯ (ИСПРАВЛЕНО) ===
// Теперь использует CSS-переменные вместо inline-стилей, чтобы не конфликтовать с темами
function updateTimeBackground() {
    const now = new Date();
    const hour = now.getHours();
    const root = document.documentElement;
    
    // Проверяем, не выбрана ли кастомная тема (не пустая)
    const currentTheme = document.body.className;
    if (currentTheme && currentTheme !== '') {
        // Если тема выбрана — не меняем фон по времени
        return;
    }
    
    // Настраиваем CSS-переменные в зависимости от времени суток
    if (hour >= 0 && hour < 6) {
        // Ночь - тёмный
        root.style.setProperty('--bg-dark', '#0a0a0f');
        root.style.setProperty('--bg-gradient-1', '#0a0a0f');
        root.style.setProperty('--bg-gradient-2', '#151525');
        root.style.setProperty('--bg-gradient-3', '#0a0a0f');
    } else if (hour >= 6 && hour < 12) {
        // Утро - светлеет
        const brightness = (hour - 6) / 6;
        const lightness1 = 5 + brightness * 15;
        const lightness2 = 15 + brightness * 20;
        root.style.setProperty('--bg-dark', `hsl(240, 20%, ${10 + brightness * 20}%)`);
        root.style.setProperty('--bg-gradient-1', `hsl(240, 20%, ${lightness1}%)`);
        root.style.setProperty('--bg-gradient-2', `hsl(240, 20%, ${lightness2}%)`);
        root.style.setProperty('--bg-gradient-3', `hsl(240, 20%, ${lightness1}%)`);
    } else if (hour >= 12 && hour < 18) {
        // День - светлый
        root.style.setProperty('--bg-dark', '#1a1a2e');
        root.style.setProperty('--bg-gradient-1', '#1a1a2e');
        root.style.setProperty('--bg-gradient-2', '#2a2a4e');
        root.style.setProperty('--bg-gradient-3', '#1a1a2e');
    } else {
        // Вечер - темнеет
        const darkness = (hour - 18) / 6;
        const lightness1 = 25 - darkness * 15;
        const lightness2 = 35 - darkness * 20;
        root.style.setProperty('--bg-dark', `hsl(240, 20%, ${30 - darkness * 20}%)`);
        root.style.setProperty('--bg-gradient-1', `hsl(240, 20%, ${lightness1}%)`);
        root.style.setProperty('--bg-gradient-2', `hsl(240, 20%, ${lightness2}%)`);
        root.style.setProperty('--bg-gradient-3', `hsl(240, 20%, ${lightness1}%)`);
    }
}

// === ОБРАБОТКА ОШИБОК ===
window.addEventListener('error', (e) => {
    console.error('Глобальная ошибка:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Необработанная ошибка Promise:', e.reason);
});
