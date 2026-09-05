-- Создание таблиц для НовыйГодЧат
-- Запусти в терминале:
-- wrangler d1 execute new-year-music --file=init-db.sql

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nick TEXT NOT NULL,
    text TEXT,
    system INTEGER DEFAULT 0,
    time INTEGER,
    sticker TEXT,
    photo TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    nick TEXT NOT NULL,
    expires_at INTEGER NOT NULL
);

-- Проверка: посмотреть таблицы
-- wrangler d1 execute new-year-music --command="SELECT name FROM sqlite_master WHERE type='table';"
