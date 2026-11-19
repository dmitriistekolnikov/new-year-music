// === КОНФИГУРАЦИЯ ПРОЕКТА ===
const API_BASE_URL = 'https://new-year-music.novogodniysait.workers.dev/api';

// Все старые вызовы fetch('/api/...') автоматически направляются
// на действующий Cloudflare Worker. Остальные запросы не меняются.
(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
        let target = input;
        if (typeof input === 'string' && input.startsWith('/api')) {
            target = API_BASE_URL + input.slice(4);
        } else if (input instanceof URL && input.pathname.startsWith('/api')) {
            target = new URL(input.pathname.slice(4) + input.search + input.hash, API_BASE_URL).href;
        }
        return originalFetch(target, init);
    };

    // Абсолютный путь к этому изображению не работает на project GitHub Pages.
    const srcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (srcDescriptor && srcDescriptor.set && srcDescriptor.get) {
        Object.defineProperty(HTMLImageElement.prototype, 'src', {
            configurable: true,
            enumerable: srcDescriptor.enumerable,
            get() { return srcDescriptor.get.call(this); },
            set(value) {
                if (value === '/santa-flight.png') {
                    value = new URL('santa-flight.png', document.baseURI).href;
                }
                return srcDescriptor.set.call(this, value);
            }
        });
    }
})();

const TRACKS_COUNT = 12;

const PREDICTIONS = [
    "🎄 В новом году тебя ждет невероятный успех!",
    "❄️ Твое самое заветное желание сбудется!",
    "🎁 Тебя ждет приятный сюрприз уже в январе!",
    "✨ Код будет компилироваться с первого раза!",
    "🎅 Дед Мороз уже выехал к тебе с подарками!",
    "🌟 В этом году ты покоришь новую вершину!",
    "💫 Удача будет на твоей стороне каждый день!"
];

const THEMES = ['', 'theme-party', 'theme-winter'];
const PARTICLE_COLORS = ['#c9a227', '#8b0000', '#2d5a27', '#ffffff', '#1e3a5f', '#9333ea'];
const SNOWFLAKES_CHARS = ['❅', '✼', '❆', '✻', '❄', '•'];
const BULB_COLORS = ['#8b0000', '#2d5a27', '#1e3a5f', '#c9a227', '#9333ea'];

// === СТИКЕРЫ ===
const STICKERS_CATS_RANGE = { start: 66959, end: 67006 };

function getTrackUrl(trackNumber) {
    return new URL(`music/${trackNumber}.mp3`, document.baseURI).href;
}
