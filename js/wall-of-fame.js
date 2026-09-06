// === СТЕНА СЛАВЫ 2026 ===

class WallOfFame {
    constructor() {
        this.stats = null;
    }
    
    async open() {
        const modal = document.getElementById('wall-of-fame-modal');
        if (!modal) return;
        
        modal.style.display = 'flex';
        
        // Показываем загрузку
        const container = document.getElementById('wall-of-fame-content');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 50px; color: #fff; font-size: 1.5rem;">⏳ Загружаем итоги года...</div>';
        }
        
        await this.loadStats();
        this.render();
    }
    
    close() {
        const modal = document.getElementById('wall-of-fame-modal');
        if (modal) modal.style.display = 'none';
    }
    
    async loadStats() {
        try {
            // Загружаем все сообщения из базы (большой лимит)
            const response = await fetch('/api/messages?limit=10000');
            if (!response.ok) {
                throw new Error('Не удалось загрузить сообщения');
            }
            
            const data = await response.json();
            const messages = data.messages || [];
            
            if (messages.length === 0) {
                this.stats = {
                    totalMessages: 0,
                    totalUsers: 0,
                    totalPhotos: 0,
                    topUsers: [],
                    topMessages: [],
                    peakHour: { hour: 0, messages: 0 },
                    firstMessage: null,
                    longestMessage: null,
                    isReal: false
                };
                return;
            }
            
            // Считаем статистику
            const userStats = {}; // { nick: { messages: 0, photos: 0 } }
            const hourStats = {}; // { hour: count }
            let totalPhotos = 0;
            let firstMessage = null;
            let longestMessage = null;
            
            messages.forEach(msg => {
                // Считаем пользователей
                if (msg.nick) {
                    if (!userStats[msg.nick]) {
                        userStats[msg.nick] = { messages: 0, photos: 0 };
                    }
                    userStats[msg.nick].messages++;
                    
                    if (msg.photo) {
                        userStats[msg.nick].photos++;
                        totalPhotos++;
                    }
                }
                
                // Считаем сообщения по часам
                if (msg.time) {
                    const hour = new Date(msg.time).getHours();
                    hourStats[hour] = (hourStats[hour] || 0) + 1;
                }
                
                // Первое сообщение
                if (!firstMessage || (msg.time && msg.time < firstMessage.time)) {
                    firstMessage = msg;
                }
                
                // Самое длинное сообщение
                if (msg.text && msg.text.length > 0) {
                    if (!longestMessage || msg.text.length > longestMessage.text.length) {
                        longestMessage = msg;
                    }
                }
            });
            
            // Топ пользователей по количеству сообщений
            const topUsers = Object.entries(userStats)
                .map(([nick, stats]) => ({ nick, ...stats }))
                .sort((a, b) => b.messages - a.messages)
                .slice(0, 5);
            
            // Топ сообщений (по длине — самые интересные)
            const topMessages = [...messages]
                .filter(m => m.text && m.text.length > 10)
                .sort((a, b) => b.text.length - a.text.length)
                .slice(0, 5);
            
            // Пиковый час
            const peakHour = Object.entries(hourStats)
                .sort((a, b) => b[1] - a[1])[0] || [0, 0];
            
            this.stats = {
                totalMessages: messages.length,
                totalUsers: Object.keys(userStats).length,
                totalPhotos: totalPhotos,
                topUsers: topUsers,
                topMessages: topMessages,
                peakHour: { hour: parseInt(peakHour[0]), messages: peakHour[1] },
                firstMessage: firstMessage,
                longestMessage: longestMessage,
                isReal: true
            };
            
        } catch (err) {
            console.error('Ошибка загрузки статистики:', err);
            this.stats = null;
        }
    }
    
    render() {
        const container = document.getElementById('wall-of-fame-content');
        if (!container) return;
        
        if (!this.stats) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: #fff;">
                    <h2>❌ Не удалось загрузить данные</h2>
                    <p>Проверь подключение к базе данных</p>
                    <button onclick="wallOfFame.close()" style="margin-top: 20px; padding: 12px 24px; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer;">Закрыть</button>
                </div>
            `;
            return;
        }
        
        const s = this.stats;
        
        if (s.totalMessages === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: #fff;">
                    <h2>📭 Пока пусто</h2>
                    <p>В 2026 году ещё не было сообщений</p>
                    <button onclick="wallOfFame.close()" style="margin-top: 20px; padding: 12px 24px; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer;">Закрыть</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <!-- Заголовок -->
            <div class="wof-section">
                <h2>🏆 Стена Славы 2026</h2>
                <p style="text-align: center; color: var(--text-secondary);">Реальные итоги уходящего года</p>
            </div>
            
            <!-- Общая статистика -->
            <div class="wof-stats-grid">
                <div class="wof-stat-card">
                    <div class="wof-stat-number">${s.totalMessages}</div>
                    <div class="wof-stat-label">Сообщений</div>
                </div>
                <div class="wof-stat-card">
                    <div class="wof-stat-number">${s.totalUsers}</div>
                    <div class="wof-stat-label">Участников</div>
                </div>
                <div class="wof-stat-card">
                    <div class="wof-stat-number">${s.totalPhotos}</div>
                    <div class="wof-stat-label">Фото</div>
                </div>
            </div>
            
            <!-- Топ пользователей -->
            <div class="wof-section">
                <h3>👑 Самые активные</h3>
                <div class="wof-users-list">
                    ${s.topUsers.map((user, i) => `
                        <div class="wof-user-item ${i === 0 ? 'winner' : ''}">
                            <div class="wof-user-rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</div>
                            <div class="wof-user-nick">${user.nick}</div>
                            <div class="wof-user-stats">
                                <span>💬 ${user.messages} сообщ.</span>
                                ${user.photos > 0 ? `<span>📸 ${user.photos} фото</span>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Самые длинные сообщения -->
            <div class="wof-section">
                <h3> Самые развёрнутые сообщения</h3>
                <div class="wof-messages-list">
                    ${s.topMessages.map((msg, i) => `
                        <div class="wof-message-item">
                            <div class="wof-message-rank">#${i + 1}</div>
                            <div class="wof-message-content">
                                <div class="wof-message-nick">${msg.nick}</div>
                                <div class="wof-message-text">${this.escapeHtml(msg.text)}</div>
                                <div class="wof-message-meta">
                                    <span>${new Date(msg.time).toLocaleString('ru-RU')}</span>
                                    <span>${msg.text.length} символов</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Интересные факты -->
            <div class="wof-section">
                <h3>🎯 Интересные факты</h3>
                <div class="wof-facts">
                    ${s.peakHour.messages > 0 ? `
                        <div class="wof-fact">
                            <div class="wof-fact-icon">⏰</div>
                            <div class="wof-fact-text">
                                <strong>Пик активности</strong>
                                В ${s.peakHour.hour}:00 было отправлено ${s.peakHour.messages} сообщений
                            </div>
                        </div>
                    ` : ''}
                    
                    ${s.firstMessage ? `
                        <div class="wof-fact">
                            <div class="wof-fact-icon">📜</div>
                            <div class="wof-fact-text">
                                <strong>Первое сообщение</strong>
                                ${s.firstMessage.nick}: "${this.escapeHtml(s.firstMessage.text.substring(0, 100))}${s.firstMessage.text.length > 100 ? '...' : ''}"
                                <br><small>${new Date(s.firstMessage.time).toLocaleString('ru-RU')}</small>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${s.longestMessage ? `
                        <div class="wof-fact">
                            <div class="wof-fact-icon">📏</div>
                            <div class="wof-fact-text">
                                <strong>Самое длинное сообщение</strong>
                                ${s.longestMessage.nick} написал ${s.longestMessage.text.length} символов
                                <br><small>"${this.escapeHtml(s.longestMessage.text.substring(0, 100))}${s.longestMessage.text.length > 100 ? '...' : ''}"</small>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Кнопка закрытия -->
            <div style="text-align: center; margin-top: 30px;">
                <button id="wof-close-btn" style="padding: 12px 32px; font-size: 16px; background: linear-gradient(135deg, #dc2626, #a855f7); color: white; border: none; border-radius: 8px; cursor: pointer;">
                    ✖ Закрыть
                </button>
            </div>
        `;
        
        // Обработчик закрытия
        document.getElementById('wof-close-btn')?.addEventListener('click', () => {
            this.close();
        });
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const wallOfFame = new WallOfFame();
window.wallOfFame = wallOfFame;

function initWallOfFame() {
    const btn = document.getElementById('wall-of-fame-btn');
    if (btn) {
        btn.addEventListener('click', () => wallOfFame.open());
    }
                                            }
