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

        try {
            // API запросы
            if (path.startsWith('/api/')) {
                return await handleApi(request, env, path, corsHeaders);
            }

            // Статика и музыка
            return await serveStatic(path, corsHeaders);
            
        } catch (error) {
            console.error('Worker error:', error);
            return new Response(JSON.stringify({ 
                error: 'Internal Server Error',
                message: error.message 
            }), { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};

async function serveStatic(path, headers) {
    if (path === '/' || path === '') path = '/index.html';

    const githubUrl = GITHUB_RAW_BASE + path;

    try {
        const response = await fetch(githubUrl);
        
        if (!response.ok) {
            return new Response('404 Not Found: ' + path, { 
                status: 404, 
                headers 
            });
        }

        let contentType = 'text/plain';
        if (path.endsWith('.html')) contentType = 'text/html; charset=utf-8';
        else if (path.endsWith('.css')) contentType = 'text/css; charset=utf-8';
        else if (path.endsWith('.js')) contentType = 'application/javascript; charset=utf-8';
        else if (path.endsWith('.png')) contentType = 'image/png';
        else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (path.endsWith('.mp3')) {
            contentType = 'audio/mpeg';
            console.log('Serving MP3:', path);
        }

        return new Response(response.body, {
            status: response.status,
            headers: {
                ...headers,
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (error) {
        console.error('Static file error:', error);
        return new Response('Error: ' + error.message, { status: 500, headers });
    }
}

async function handleApi(request, env, path, headers) {
    try {
        // Health check
        if (path === '/api/health') {
            // Проверяем, подключена ли БД
            if (!env.DB) {
                return new Response(JSON.stringify({ 
                    status: 'error', 
                    message: 'Database not connected' 
                }), { 
                    status: 500,
                    headers: { ...headers, 'Content-Type': 'application/json' } 
                });
            }
            
            return new Response(JSON.stringify({ 
                status: 'ok', 
                time: Date.now(),
                db: 'connected'
            }), { 
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

        return new Response(JSON.stringify({ error: 'Not found' }), { 
            status: 404, 
            headers: { ...headers, 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        console.error('API error:', error);
        return new Response(JSON.stringify({ 
            error: 'API Error', 
            message: error.message 
        }), {
            status: 500,
            headers: { ...headers, 'Content-Type': 'application/json' }
        });
    }
}
