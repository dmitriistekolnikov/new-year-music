// === МОДУЛЬ РАБОТЫ С CLOUDFLARE D1 ===
class Database {
    constructor() {
        this.API_URL = '/api';
        this.sessionId = localStorage.getItem('sessionId') || null;
        this.currentNick = localStorage.getItem('currentNick') || null;
    }

    async getMessages(limit = 50) {
        try {
            const response = await fetch(`${this.API_URL}/messages?limit=${limit}`, { cache: 'no-store' });
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            return data.messages || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    async sendMessage(nick, text = '', sticker = null, photo = null) {
        try {
            const safeNick = String(nick || '').trim();
            const safeText = String(text || '').trim();
            const safeSticker = sticker ? String(sticker) : null;
            const safePhoto = photo ? String(photo) : null;

            if (!safeNick) throw new Error('Не указан ник');
            if (!safeText && !safeSticker && !safePhoto) {
                throw new Error('Сообщение не содержит текста, стикера или изображения');
            }

            const response = await fetch(`${this.API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nick: safeNick,
                    text: safeText,
                    sticker: safeSticker,
                    photo: safePhoto,
                    time: Date.now()
                })
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.success) {
                throw new Error(data.message || data.error || 'Failed to send message');
            }
            return data;
        } catch (error) {
            console.error('Error sending message:', error);
            return null;
        }
    }

    async login(nick) {
        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nick })
            });
            if (!response.ok) throw new Error('Login failed: ' + await response.text());
            const data = await response.json();
            this.sessionId = data.session_id;
            this.currentNick = nick;
            localStorage.setItem('sessionId', data.session_id);
            localStorage.setItem('currentNick', nick);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            return null;
        }
    }

    async checkSession() {
        if (!this.sessionId) return false;
        try {
            const response = await fetch(`${this.API_URL}/auth/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: this.sessionId })
            });
            const data = await response.json();
            if (!data.valid) {
                this.sessionId = null;
                this.currentNick = null;
                localStorage.removeItem('sessionId');
                localStorage.removeItem('currentNick');
            }
            return !!data.valid;
        } catch {
            return false;
        }
    }

    async checkConnection() {
        try {
            const r = await fetch(`${this.API_URL}/health`, { cache: 'no-store' });
            const d = await r.json();
            return d.status === 'ok';
        } catch {
            return false;
        }
    }
}
const db = new Database();
