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
CREATE INDEX IF NOT EXISTS idx_reactions_message_nick ON reactions(message_id, nick);

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

-- V12: администрация, права команд и YouTube Stream
CREATE TABLE IF NOT EXISTS admin_users (
    nick TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    commands TEXT NOT NULL DEFAULT '[]',
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS admin_sessions (
    session_id TEXT PRIMARY KEY,
    nick TEXT NOT NULL,
    role TEXT NOT NULL,
    expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiry ON admin_sessions(expires_at);
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at INTEGER NOT NULL
);
