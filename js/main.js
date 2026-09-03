document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎄 НовыйГодЧат загружается...');
    
    // 1. Базовые эффекты
    if (typeof initSnow === 'function') initSnow();
    initGarland();
    initFreeze();
    initThemeSwitcher();
    initTimer();
    
    // 2. Плеер и эквалайзер (Чёлка)
    initPlayer();
    initEqualizer();
    initReflection();
    
    // 3. Интерактив и чат
    initGift();
    initLetter();
    
    // 4. Новые крутые эффекты
    initCandles();
    initPhotoFrame();
    initCuckooClock();
    initPuzzle();
    initCustomCursor();
    initParallax();
    initTreeCounter();
    initSparkWaterfall();
    initNameFirework();
    
    // 5. Проверка БД
    const isConnected = await db.checkConnection();
    if (isConnected) {
        console.log('✅ База данных подключена');
        const hasSession = await db.checkSession();
        if (hasSession) console.log('✅ Сессия активна:', db.currentNick);
    } else {
        console.log('⚠️ База данных недоступна (работаем в демо-режиме)');
    }
    
    console.log('✨ Все системы активны!');
});

// В конце DOMContentLoaded, после всех init:
initBottomPanel();
