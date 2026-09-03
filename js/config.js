// === КОНФИГУРАЦИЯ ПРОЕКТА ===

const TRACKS_COUNT = 12; // Сколько файлов 1.mp3, 2.mp3 и т.д. в папке music/

// ЗАПАСНОЙ ПЛЕЙЛИСТ: Если jsmediatags не сможет прочитать файл, будут использованы эти названия.
// Отредактируй их под свою музыку!
const FALLBACK_TRACKS = [
    { title: "Jingle Bells Phonk", artist: "wi$$$uri" },
    { title: "Last Christmas", artist: "Wham!" },
    { title: "All I Want for Christmas", artist: "Mariah Carey" },
    { title: "Snowman", artist: "Sia" },
    { title: "Let It Snow", artist: "Dean Martin" },
    { title: "Winter Wonderland", artist: "Michael Bublé" },
    { title: "Santa Tell Me", artist: "Ariana Grande" },
    { title: "Underneath the Tree", artist: "Kelly Clarkson" },
    { title: "Merry Christmas", artist: "Ed Sheeran" },
    { title: "Christmas Tree Farm", artist: "Taylor Swift" },
    { title: "White Christmas", artist: "Bing Crosby" },
    { title: "Happy New Year", artist: "ABBA" }
];

const PREDICTIONS = [
    "🎄 В новом году тебя ждет невероятный успех!",
    "❄️ Твое самое заветное желание сбудется!",
    "🎁 Тебя ждет приятный сюрприз уже в январе!",
    "✨ Код будет компилироваться с первого раза!",
    "🎅 Дед Мороз уже выехал к тебе с подарками!",
    "🏔️ В этом году ты покоришь новую вершину!",
    "💫 Удача будет на твоей стороне каждый день!",
    "🦉 Сова на скакалке тебе это о чем-нибудь говорит?"
];

const THEMES = ['', 'theme-party', 'theme-winter'];
const PARTICLE_COLORS = ['#fbbf24', '#ef4444', '#22c55e', '#ffffff', '#38bdf8', '#f472b6'];
const SNOWFLAKES_CHARS = ['❅', '❆', '✻', '•']; // Пустые строки удалены
const BULB_COLORS = ['#ef4444', '#22c55e', '#38bdf8', '#fbbf24', '#f472b6'];

let TRACKS = [];

function getTrackUrl(fileNumber) {
    return `/music/${fileNumber}.mp3`;
    }
