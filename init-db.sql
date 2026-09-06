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


-- V9: реакции и общая новогодняя ёлка
CREATE TABLE IF NOT EXISTS reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    nick TEXT NOT NULL,
    emoji TEXT NOT NULL,
    time INTEGER NOT NULL,
    UNIQUE(message_id, nick, emoji)
);
CREATE INDEX IF NOT EXISTS idx_reactions_message ON reactions(message_id);

CREATE TABLE IF NOT EXISTS tree_stars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nick TEXT NOT NULL,
    x REAL NOT NULL,
    y REAL NOT NULL,
    time INTEGER NOT NULL,
    day TEXT NOT NULL,
    UNIQUE(nick, day)
);
CREATE INDEX IF NOT EXISTS idx_tree_stars_time ON tree_stars(time);

CREATE TABLE IF NOT EXISTS celebrations (
    year INTEGER PRIMARY KEY,
    event TEXT NOT NULL,
    time INTEGER NOT NULL
);
