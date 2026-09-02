// === ЭФФЕКТ ЧАСТИЦ ПРИ КЛИКЕ + СЛЕД МЫШИ ===

function createClickParticles(x, y, count = 20, colors = PARTICLE_COLORS) {
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'click-particle';
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const velocity = 80 + Math.random() * 150;
        p.style.setProperty('--tx', `${Math.cos(angle) * velocity}px`);
        p.style.setProperty('--ty', `${Math.sin(angle) * velocity}px`);
        p.style.width = p.style.height = (5 + Math.random() * 10) + 'px';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
}

// Глобальный обработчик клика
document.addEventListener('click', (e) => {
    createClickParticles(e.clientX, e.clientY);
});

// === ВОЛШЕБНАЯ ПАЛОЧКА (СЛЕД МЫШИ) ===
const sparks = [];
const MAX_SPARKS = 40;

document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.3) return;
    const spark = document.createElement('div');
    spark.className = 'spark';
    spark.style.left = e.clientX + 'px';
    spark.style.top = e.clientY + 'px';
    spark.style.background = `hsl(${Math.random() * 60 + 30}, 100%, 70%)`;
    document.body.appendChild(spark);
    sparks.push(spark);
    
    let opacity = 1, scale = 1;
    const fade = () => {
        opacity -= 0.03;
        scale -= 0.03;
        spark.style.opacity = opacity;
        spark.style.transform = `scale(${Math.max(0, scale)})`;
        if (opacity <= 0) { spark.remove(); return; }
        requestAnimationFrame(fade);
    };
    requestAnimationFrame(fade);
    
    if (sparks.length > MAX_SPARKS) sparks.shift().remove();
});
