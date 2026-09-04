// === МОДУЛЬ РАБОТЫ С CLOUDFLARE D1 БАЗОЙ ===

class Database {
    constructor() {
        this.API_URL = '/api';
        this.sessionId = localStorage.getItem('sessionId') || null;
        this.currentNick = localStorage.getItem('currentNick') || null;
    }

    async getMessages(limit = 50) {
        try {
            const response = await fetch(`${this.API_URL}/messages?limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            return data.messages || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    async sendMessage(nick, text, sticker = null, photo = null) {
        try {
            const response = await fetch(`${this.API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nick,
                    text,
                    sticker,
                    photo,
                    time: Date.now()
                })
            });
            if (!response.ok) throw new Error('Failed to send message');
            return await response.json();
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
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Login failed: ' + errorText);
            }
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
            return data.valid || false;
        } catch {
            return false;
        }
    }

    async checkConnection() {
        try {
            const response = await fetch(`${this.API_URL}/health`);
            return response.ok;
        } catch {
            return false;
        }
    }
}

const db = new Database();
