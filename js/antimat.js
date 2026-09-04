// === АНТИ-МАТ СИСТЕМА ===

class AntiMat {
    constructor() {
        // Список запрещенных слов (можно расширять)
        this.bannedWords = [
            'мат', 'хуй', 'пизд', 'ебат', 'бляд', 'сука', 'говно', 'дерьмо',
            'хуе', 'пизд', 'ебал', 'блять', 'суки', 'мудак', 'пидор',
            'порно', 'porno', 'sex', 'xxx'
        ];
    }

    // Нормализация текста (приведение к нижнему регистру, удаление спецсимволов)
    normalize(text) {
        return text.toLowerCase()
            .replace(/[^\wа-яё\s]/gi, '')
            .replace(/\s+/g, ' ');
    }

    // Проверка на запрещенные слова
    check(text) {
        const normalized = this.normalize(text);
        const words = normalized.split(' ');
        
        for (let word of words) {
            for (let banned of this.bannedWords) {
                if (word.includes(banned)) {
                    return {
                        isBanned: true,
                        matchedWord: banned,
                        originalText: text
                    };
                }
            }
        }
        
        return { isBanned: false };
    }

    // Фильтрация текста (замена мата на звёздочки)
    filter(text) {
        const result = this.check(text);
        if (result.isBanned) {
            return text.replace(new RegExp(result.matchedWord, 'gi'), '*'.repeat(result.matchedWord.length));
        }
        return text;
    }

    // Добавление новых запрещенных слов
    addBannedWords(words) {
        this.bannedWords.push(...words);
    }
}

const antiMat = new AntiMat();
