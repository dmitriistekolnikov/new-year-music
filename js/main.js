// === ТОЧКА ВХОДА ===

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

// === ТЕМЫ ФОНА ===
const themes = [
    // 🎄 Классика и Елка
    { name: 'Темный хвойный', colors: ['#0A3D2E', '#064E3B', '#065F46', '#047857'], text: '#fff' },
    { name: 'Изумрудный', colors: ['#14532D', '#166534', '#15803D', '#16A34A'], text: '#fff' },
    { name: 'Мятный градиент', colors: ['#A7F3D0', '#6EE7B7', '#34D399', '#10B981'], text: '#1a1a1a' },
    { name: 'Оливковый', colors: ['#4D5E37', '#556B2F', '#6B8E23', '#808000'], text: '#fff' },
    { name: 'Салатовый с дымкой', colors: ['#DCFCE7', '#86EFAC', '#4ADE80', '#22C55E'], text: '#1a1a1a' },
    { name: 'Морской зеленый', colors: ['#2E4F4F', '#365314', '#3F6212', '#4D7C0F'], text: '#fff' },
    
    // 🌌 Ночная зимняя магия
    { name: 'Полночь', colors: ['#0F172A', '#1E293B', '#334155', '#475569'], text: '#fff' },
    { name: 'Темный синий', colors: ['#1E3A8A', '#1E40AF', '#1D4ED8', '#2563EB'], text: '#fff' },
    { name: 'Глубокий фиолетовый', colors: ['#2E1065', '#4C1D95', '#5B21B6', '#6D28D9'], text: '#fff' },
    { name: 'Индиго', colors: ['#312E81', '#3730A3', '#4338CA', '#4F46E5'], text: '#fff' },
    { name: 'Темная бирюза', colors: ['#134E4A', '#115E59', '#0F766E', '#0D9488'], text: '#fff' },
    { name: 'Графит', colors: ['#1F2937', '#374151', '#4B5563', '#6B7280'], text: '#fff' },
    { name: 'Черный с синевой', colors: ['#020617', '#0F172A', '#1E293B', '#334155'], text: '#fff' },
    
    // 🔥 Уют и Тепло
    { name: 'Теплый шоколад', colors: ['#3E2723', '#4E342E', '#5D4037', '#6D4C41'], text: '#fff' },
    { name: 'Кофейный', colors: ['#4E342E', '#5D4037', '#6D4C41', '#795548'], text: '#fff' },
    { name: 'Янтарный', colors: ['#78350F', '#92400E', '#B45309', '#D97706'], text: '#fff' },
    { name: 'Кремовый', colors: ['#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24'], text: '#1a1a1a' },
    { name: 'Песочный', colors: ['#D6C28B', '#C9B037', '#B8860B', '#A0522D'], text: '#1a1a1a' },
    { name: 'Терракотовый', colors: ['#7C2D12', '#9A3412', '#C2410C', '#EA580C'], text: '#fff' },
    
    // 🎅 Праздничный Красно-Бордовый
    { name: 'Бордо', colors: ['#4C0519', '#701A75', '#831843', '#9D174D'], text: '#fff' },
    { name: 'Темно-красный', colors: ['#7F1D1D', '#991B1B', '#B91C1C', '#DC2626'], text: '#fff' },
    { name: 'Рубиновый', colors: ['#881337', '#9F1239', '#BE123C', '#E11D48'], text: '#fff' },
    { name: 'Ярко-красный', colors: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5'], text: '#fff' },
    
    // 💜 Неон и Футуризм
    { name: 'Неоновый фиолетовый', colors: ['#4C1D95', '#5B21B6', '#6D28D9', '#7C3AED'], text: '#fff' },
    { name: 'Кислотный зеленый', colors: ['#14532D', '#166534', '#15803D', '#16A34A'], text: '#fff' },
    { name: 'Небесно-голубой', colors: ['#0284C7', '#0369A1', '#075985', '#0C4A6E'], text: '#fff' },
    { name: 'Бирюзовый', colors: ['#0E7490', '#0891B2', '#06B6D4', '#22D3EE'], text: '#fff' },
    
    // ✨ Волшебные и Нежные
    { name: 'Светлая лаванда', colors: ['#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6'], text: '#1a1a1a' },
    { name: 'Морозное утро', colors: ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8'], text: '#1a1a1a' },
    { name: 'Розовый зефир', colors: ['#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899'], text: '#1a1a1a' },
    { name: 'Серо-голубой туман', colors: ['#64748B', '#475569', '#334155', '#1E293B'], text: '#fff' },
];

let currentThemeIndex = 0;

function applyTheme(index) {
    const theme = themes[index];
    const gradient = `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]}, ${theme.colors[2]}, ${theme.colors[3]})`;
    
    document.body.style.background = gradient;
    document.body.style.color = theme.text;
    document.documentElement.style.setProperty('--text-color', theme.text);
    
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
        applyTheme(currentThemeIndex);
    } else {
        // По умолчанию — первая тема (Темный хвойный)
        applyTheme(0);
    }
    
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
