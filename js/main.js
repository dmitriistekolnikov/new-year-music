// === ТОЧКА ВХОДА ===

document.addEventListener('DOMContentLoaded', async () => {
    console.log(' НовыйГодЧат загружается...');
    
    // Инициализация эффектов
    initSnow();
    initGarland();
    initPlayer();
    initEqualizer();
    initFreeze();
    initGift();
    initLetter();
    initThemeSwitcher();
    initTimer();
    
    // Проверка БД
    const isConnected = await db.checkConnection();
    if (isConnected) {
        console.log('✅ База данных подключена');
        
        // Проверка сессии
        const hasSession = await db.checkSession();
        if (hasSession) {
            console.log('✅ Сессия активна:', db.currentNick);
        }
    } else {
        console.log('⚠️ База данных недоступна');
    }
    
    // Заглушки
    document.getElementById('header-login-btn').addEventListener('click', () => {
        console.log('🔑 Клик по входу');
    });
    
    document.getElementById('photo-upload').addEventListener('click', () => {
        console.log('📸 Загрузка фото');
    });
    
    console.log('✨ Все системы активны!');
});
