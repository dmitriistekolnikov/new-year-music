// === ФЕЙЕРВЕРК ===

class Fireworks {
    constructor() {
        this.canvas = document.getElementById('fireworks-canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'fireworks-canvas';
            document.body.appendChild(this.canvas);
        }
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.rockets = [];
        this.confetti = [];
        this.isRunning = false;
        this.animationId = null;
        this.countdownRunning = false;
        this.lastHourlyKey = '';
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = Math.round(window.innerWidth * dpr);
        this.canvas.height = Math.round(window.innerHeight * dpr);
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    
    // Обычный фейерверк (каждый час)
    launchRegular() {
        this.clear();
        this.isRunning = true;
        
        // Запускаем 15 ракет
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.launchRocket();
            }, i * 200);
        }
        
        this.animate();
        
        // Останавливаем через 5 секунд
        setTimeout(() => {
            this.stop();
        }, 5000);
    }
    
    // МЕГА-ШОУ (Новый Год)
    launchMegaShow() {
        this.clear();
        this.isRunning = true;
        
        // Фаза 1: Обратный отсчёт (30 секунд)
        this.showCountdown(30, () => {
            // Фаза 2: Мега-фейерверк
            this.megaFireworks();
        });
    }
    
    showCountdown(seconds, callback) {
        const countdownEl = document.getElementById('countdown-overlay');
        const numberEl = document.getElementById('countdown-number');
        
        if (countdownEl && numberEl) {
            countdownEl.style.display = 'flex';
            let current = seconds;
            numberEl.textContent = current;
            
            const interval = setInterval(() => {
                current--;
                numberEl.textContent = current;
                
                // Пульсация
                numberEl.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    numberEl.style.transform = 'scale(1)';
                }, 200);
                
                if (current <= 0) {
                    clearInterval(interval);
                    countdownEl.style.display = 'none';
                    callback();
                }
            }, 1000);
        } else {
            // Не блокируем новогоднее шоу, если overlay не успел загрузиться.
            setTimeout(callback, Math.max(0, seconds * 1000));
        }
    }
    
    startFinalCountdown() {
        if (this.countdownRunning) return;
        this.countdownRunning = true;
        this.showCountdown(10, () => {
            this.countdownRunning = false;
            this.megaFireworks();
        });
    }

    megaFireworks() {
        // Запускаем 100 ракет за 10 секунд
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                this.launchRocket(true); // true = мега-частицы
            }, i * 100);
        }
        
        // Добавляем конфетти
        this.launchConfetti();
        
        // Вибрация на мобильных
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 500]);
        }
        
        // Системное сообщение в чат
        this.sendNewYearMessage();
        
        this.animate();
        
        // Останавливаем через 15 секунд
        setTimeout(() => {
            this.stop();
        }, 15000);
    }
    
    launchRocket(mega = false) {
        const x = Math.random() * this.canvas.width;
        const y = this.canvas.height;
        const targetY = Math.random() * (this.canvas.height * 0.5);
        
        this.rockets.push({
            x,
            y,
            targetY,
            speed: 8 + Math.random() * 4,
            color: this.getRandomColor(),
            mega
        });
    }
    
    explodeRocket(rocket) {
        const particleCount = rocket.mega ? 150 : 50;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = rocket.mega ? 8 + Math.random() * 6 : 3 + Math.random() * 3;
            
            this.particles.push({
                x: rocket.x,
                y: rocket.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: rocket.mega ? 0.008 : 0.015,
                color: rocket.color,
                size: rocket.mega ? 4 : 2
            });
        }
    }
    
    launchConfetti() {
        for (let i = 0; i < 200; i++) {
            this.confetti.push({
                x: Math.random() * this.canvas.width,
                y: -20,
                vx: (Math.random() - 0.5) * 4,
                vy: 2 + Math.random() * 3,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                color: this.getRandomColor(),
                size: 5 + Math.random() * 5
            });
        }
    }
    
    getRandomColor() {
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#FF1493'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Обновляем ракеты
        this.rockets = this.rockets.filter(rocket => {
            rocket.y -= rocket.speed;
            
            // Рисуем ракету
            this.ctx.fillStyle = rocket.color;
            this.ctx.beginPath();
            this.ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            if (rocket.y <= rocket.targetY) {
                this.explodeRocket(rocket);
                return false;
            }
            return true;
        });
        
        // Обновляем частицы
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // гравитация
            particle.life -= particle.decay;
            
            if (particle.life <= 0) return false;
            
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
            
            return true;
        });
        
        // Обновляем конфетти
        this.confetti = this.confetti.filter(conf => {
            conf.x += conf.vx;
            conf.y += conf.vy;
            conf.rotation += conf.rotationSpeed;
            
            if (conf.y > this.canvas.height) return false;
            
            this.ctx.save();
            this.ctx.translate(conf.x, conf.y);
            this.ctx.rotate((conf.rotation * Math.PI) / 180);
            this.ctx.fillStyle = conf.color;
            this.ctx.fillRect(-conf.size / 2, -conf.size / 2, conf.size, conf.size * 0.6);
            this.ctx.restore();
            
            return true;
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.clear();
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = [];
        this.rockets = [];
        this.confetti = [];
    }
    
    sendNewYearMessage() {
        if (typeof db !== 'undefined' && db.currentNick) {
            db.sendMessage('🎆 Система', '🎊 С НОВЫМ 2027 ГОДОМ! 🎉', null, null);
        }
    }
}

// Глобальный экземпляр
const fireworks = new Fireworks();
window.fireworks = fireworks;

// Проверка времени
function checkFireworksTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Каждый час (в 00 секунд)
    if (minutes === 0 && seconds === 0) {
        console.log('🎆 Запуск часового фейерверка!');
        fireworks.launchRegular();
    }
    
}

// Инициализация
function initFireworks() {
    console.log('🎆 Фейерверк инициализирован');
    
    // Проверяем время каждую секунду
    setInterval(checkFireworksTime, 1000);
    
}
