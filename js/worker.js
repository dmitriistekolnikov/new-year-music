const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/dmitriistekolnikov/new-year-music/main";

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // === 1. API ДЛЯ БАЗЫ ДАННЫХ ===
        if (path.startsWith('/api/')) {
            return handleApi(request, env, path, corsHeaders);
        }

        // === 2. ОТДАЧА СТАТИКИ С GITHUB ===
        return serveStaticFile(path, corsHeaders);
    }
};

async function serveStaticFile(path, headers) {
    // Если запросили корень, отдаём index.html
    if (path === '/' || path === '') {
        path = '/index.html';
    }

    const githubUrl = GITHUB_RAW_BASE + path;

    try {
        const response = await fetch(githubUrl);
        
        if (!response.ok) {
            return new Response('404 Not Found', { status: 404, headers });
        }

        // Определяем Content-Type по расширению файла
        let contentType = 'text/plain';
        if (path.endsWith('.html')) contentType = 'text/html; charset=utf-8';
        else if (path.endsWith('.css')) contentType = 'text/css; charset=utf-8';
        else if (path.endsWith('.js')) contentType = 'application/javascript; charset=utf-8';
        else if (path.endsWith('.png')) contentType = 'image/png';
        else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (path.endsWith('.mp3')) contentType = 'audio/mpeg';
        else if (path.endsWith('.json')) contentType = 'application/json';

        // Отдаём файл с правильным заголовком и кэшированием
        return new Response(response.body, {
            status: response.status,
            headers: {
                ...headers,
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600' // Кэшируем на 1 час для скорости
            }
        });
    } catch (error) {
        return new Response('Error fetching file: ' + error.message, { 
            status: 500, 
            headers 
        });
    }
}

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
