// === ТОЧКА ВХОДА: ИНИЦИАЛИЗАЦИЯ ВСЕХ МОДУЛЕЙ ===

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎄 НовыйГодЧат загружается...');
    
    // Инициализация всех модулей
    initSnow();
    initGarland();
    initPlayer();
    initEqualizer();
    initFreeze();
    initGift();
    initLetter();
    initThemeSwitcher();
    initTimer();
    
    // Заглушки для кнопок
    document.getElementById('header-login-btn').addEventListener('click', () => {
        console.log('🔑 Клик по входу');
    });
    
    document.getElementById('photo-upload').addEventListener('click', () => {
        console.log('📸 Загрузка фото');
    });
    
    console.log('✨ Все эффекты активированы!');
});
