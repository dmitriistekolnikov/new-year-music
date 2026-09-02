// === КОНФИГУРАЦИЯ ПРОЕКТА ===

const TRACKS = [
    { id: 0, title: 'Happy New Year', artist: 'ABBA', file: 'ABBA_-_Happy_New_Year_4783.mp3' },
    { id: 1, title: "Rockin' Around The Christmas Tree", artist: 'Brenda Lee', file: 'Brenda_Lee_-_Rockin_Around_T.mp3' },
    { id: 2, title: 'Let It Snow', artist: 'Dean Martin', file: 'Dean_Martin_-_Let_It_Snow_Let.mp3' },
    { id: 3, title: 'Новогодняя', artist: 'Дискотека Авария', file: 'Diskoteka_Avariya_-_Novogodny.mp3' },
    { id: 4, title: 'Снег идёт', artist: 'ГлюкoZa', file: 'GlyukoZa_-_Cneg_idet_8115190.mp3' },
    { id: 5, title: 'Снег идёт (remastered)', artist: 'ГлюкoZa', file: 'GlyukoZa_-_Sneg_idjot_4805135.mp3' },
    { id: 6, title: 'Jingle Bells', artist: 'Gwen Stefani', file: 'Gwen_Stefani_-_Jingle_Bells_49.mp3' },
    { id: 7, title: 'Christmas Tree', artist: 'Lady Gaga', file: 'Lady_Gaga_-_Christmas_Tree_4.mp3' },
    { id: 8, title: 'SCARY CHRISTMAS', artist: 'Thezobochin', file: 'Thezobochin_-_SCARY_CHRISTM.mp3' },
    { id: 9, title: 'Xmas Phonk', artist: 'Gotei Ruzaru', file: 'Xmas-Phonk-Gotei-Ruzaru.mp3' },
    { id: 10, title: 'новый годик', artist: 'allsinthfuw', file: 'allsinthfuw_-_новый_годик.mp3' },
    { id: 11, title: 'Christmas Phonk', artist: 'wi$$$uri', file: 'wi$$$uri_-_Christmas_Phonk.mp3' }
];

const PREDICTIONS = [
    "🎄 В новом году тебя ждет невероятный успех!",
    "❄️ Твое самое заветное желание сбудется!",
    " Тебя ждет приятный сюрприз уже в январе!",
    "✨ Код будет компилироваться с первого раза!",
    "🎅 Дед Мороз уже выехал к тебе с подарками!",
    " В этом году ты покорешь новую вершину!",
    "💫 Удача будет на твоей стороне каждый день!",
    "Сова на скакалке тебе это о чем-нибудь говорит?"
];

const THEMES = ['', 'theme-party', 'theme-winter'];

const PARTICLE_COLORS = ['#fbbf24', '#ef4444', '#22c55e', '#ffffff', '#38bdf8', '#f472b6'];

const SNOWFLAKES_CHARS = ['❅', '✼', '❆', '✻', '❄', '•'];

const BULB_COLORS = ['#ef4444', '#22c55e', '#38bdf8', '#fbbf24', '#f472b6'];

// Базовый URL для медиа (через наш Воркер-прокси, а не напрямую с GitHub)
const MEDIA_BASE_URL = '/music';

function getTrackUrl(filename) {
    return `${MEDIA_BASE_URL}/${filename}`;
}
