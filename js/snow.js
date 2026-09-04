// === СНЕГ ===

function initSnow() {
    const container = document.getElementById('snow-container');
    if (!container) return;
    
    for (let i = 0; i < 60; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.textContent = SNOWFLAKES_CHARS[Math.floor(Math.random() * SNOWFLAKES_CHARS.length)];
        flake.style.left = Math.random() * 100 + 'vw';
        flake.style.animationDuration = (Math.random() * 5 + 5) + 's, ' + (Math.random() * 3 + 2) + 's';
        flake.style.animationDelay = Math.random() * 5 + 's, 0s';
        flake.style.opacity = Math.random() * 0.6 + 0.2;
        flake.style.fontSize = (Math.random() * 1.2 + 0.4) + 'rem';
        container.appendChild(flake);
    }
}
