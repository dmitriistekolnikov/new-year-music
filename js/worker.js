export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };
        
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers });
        }
        
        // === API ENDPOINTS ===
        if (path.startsWith('/api/')) {
            return handleApi(request, env, path, headers);
        }
        
        // === СТАТИКА ===
        return handleStatic(request, env, path, headers);
    }
};

async function handleApi(request, env, path, headers) {
    try {
        // Health check
        if (path === '/api/health') {
            return new Response(JSON.stringify({ status: 'ok' }), { 
                headers: { ...headers, 'Content-Type': 'application/json' } 
            });
        }
        
        // Получить сообщения
        if (path === '/api/messages' && request.method === 'GET') {
            const limit = parseInt(new URL(request.url).searchParams.get('limit') || '50');
            const messages = await env.DB.prepare(
                'SELECT * FROM messages ORDER BY time DESC LIMIT ?'
            ).bind(limit).all();
            
            return new Response(JSON.stringify({ messages: messages.results }), { 
                headers: { ...headers, 'Content-Type': 'application/json' } 
            });
        }
        
        // Отправить сообщение
        if (path === '/api/messages' && request.method === 'POST') {
            const body = await request.json();
            await env.DB.prepare(
                'INSERT INTO messages (nick, text, system, time, sticker, photo) VALUES (?, ?, ?, ?, ?, ?)'
            ).bind(body.nick, body.text, body.system || 0, body.time, body.sticker || null, body.photo || null).run();
            
            return new Response(JSON.stringify({ success: true }), { 
                headers: { ...headers, 'Content-Type': 'application/json' } 
            });
        }
        
        // Логин
        if (path === '/api/auth/login' && request.method === 'POST') {
            const body = await request.json();
            const sessionId = crypto.randomUUID();
            const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
            
            await env.DB.prepare(
                'INSERT INTO sessions (session_id, nick, expires_at) VALUES (?, ?, ?)'
            ).bind(sessionId, body.nick, expiresAt).run();
            
            return new Response(JSON.stringify({ session_id: sessionId, nick: body.nick }), { 
                headers: { ...headers, 'Content-Type': 'application/json' } 
            });
        }
        
        // Проверка сессии
        if (path === '/api/auth/check' && request.method === 'POST') {
            const body = await request.json();
            const session = await env.DB.prepare(
                'SELECT * FROM sessions WHERE session_id = ? AND expires_at > ?'
            ).bind(body.session_id, Date.now()).first();
            
            return new Response(JSON.stringify({ valid: !!session }), { 
                headers: { ...headers, 'Content-Type': 'application/json' } 
            });
        }
        
        return new Response(JSON.stringify({ error: 'Not found' }), { 
            status: 404, 
            headers: { ...headers, 'Content-Type': 'application/json' } 
        });
        
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...headers, 'Content-Type': 'application/json' }
        });
    }
}

async function handleStatic(request, env, path, headers) {
    // Корень - index.html
    if (path === '/' || path === '') {
        const index = await env.__STATIC_CONTENT__.get('index.html');
        return new Response(index, {
            headers: { ...headers, 'Content-Type': 'text/html;charset=UTF-8' }
        });
    }
    
    // CSS файлы
    if (path.endsWith('.css')) {
        const content = await env.__STATIC_CONTENT__.get(path.slice(1));
        return new Response(content, {
            headers: { ...headers, 'Content-Type': 'text/css;charset=UTF-8' }
        });
    }
    
    // JS файлы
    if (path.endsWith('.js')) {
        const content = await env.__STATIC_CONTENT__.get(path.slice(1));
        return new Response(content, {
            headers: { ...headers, 'Content-Type': 'application/javascript;charset=UTF-8' }
        });
    }
    
    // Картинки/музыка
    if (path.match(/\.(jpg|jpeg|png|gif|mp3|webp)$/)) {
        const content = await env.__STATIC_CONTENT__.get(path.slice(1));
        const contentType = getContentType(path);
        return new Response(content, {
            headers: { ...headers, 'Content-Type': contentType }
        });
    }
    
    return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404, 
        headers: { ...headers, 'Content-Type': 'application/json' } 
    });
}

function getContentType(path) {
    if (path.endsWith('.html')) return 'text/html;charset=UTF-8';
    if (path.endsWith('.css')) return 'text/css;charset=UTF-8';
    if (path.endsWith('.js')) return 'application/javascript;charset=UTF-8';
    if (path.match(/\.(jpg|jpeg)$/)) return 'image/jpeg';
    if (path.endsWith('.png')) return 'image/png';
    if (path.endsWith('.gif')) return 'image/gif';
    if (path.endsWith('.mp3')) return 'audio/mpeg';
    return 'application/octet-stream';
}
