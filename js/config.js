// === КОНФИГУРАЦИЯ ПРОЕКТА ===

const TRACKS_COUNT = 12;

// Простые названия треков (без jsmediatags, который не работает с прокси)
const TRACKS = [
    { id: 0, title: 'Трек 1', artist: 'Исполнитель 1', file: '1.mp3' },
    { id: 1, title: 'Трек 2', artist: 'Исполнитель 2', file: '2.mp3' },
    { id: 2, title: 'Трек 3', artist: 'Исполнитель 3', file: '3.mp3' },
    { id: 3, title: 'Трек 4', artist: 'Исполнитель 4', file: '4.mp3' },
    { id: 4, title: 'Трек 5', artist: 'Исполнитель 5', file: '5.mp3' },
    { id: 5, title: 'Трек 6', artist: 'Исполнитель 6', file: '6.mp3' },
    { id: 6, title: 'Трек 7', artist: 'Исполнитель 7', file: '7.mp3' },
    { id: 7, title: 'Трек 8', artist: 'Исполнитель 8', file: '8.mp3' },
    { id: 8, title: 'Трек 9', artist: 'Исполнитель 9', file: '9.mp3' },
    { id: 9, title: 'Трек 10', artist: 'Исполнитель 10', file: '10.mp3' },
    { id: 10, title: 'Трек 11', artist: 'Исполнитель 11', file: '11.mp3' },
    { id: 11, title: 'Трек 12', artist: 'Исполнитель 12', file: '12.mp3' }
];

const PREDICTIONS = [
    "🎄 В новом году тебя ждет невероятный успех!",
    "❄️ Твое самое заветное желание сбудется!",
    "🎁 Тебя ждет приятный сюрприз уже в январе!",
    "✨ Код будет компилироваться с первого раза!",
    " Дед Мороз уже выехал к тебе с подарками!",
    "🌟 В этом году ты покоришь новую вершину!",
    "💫 Удача будет на твоей стороне каждый день!"
];

const THEMES = ['', 'theme-party', 'theme-winter'];

const PARTICLE_COLORS = ['#c9a227', '#8b0000', '#2d5a27', '#ffffff', '#1e3a5f', '#9333ea'];

const SNOWFLAKES_CHARS = ['❅', '✼', '❆', '✻', '❄', '•'];

const BULB_COLORS = ['#8b0000', '#2d5a27', '#1e3a5f', '#c9a227', '#9333ea'];

function getTrackUrl(filename) {
    return `/music/${filename}`;
}
