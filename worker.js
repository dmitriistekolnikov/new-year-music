export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Range',
            'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // API запросы
        if (path.startsWith('/api/')) {
            return handleApi(request, env, path, corsHeaders);
        }

        // Мемы больше не являются частью публичных стикеров.
        if (path.startsWith('/stickers/memes/')) {
            return new Response('Not found', { status: 404 });
        }

        // Статика (HTML, CSS, JS, MP3, изображения стикеров)
        const response = await env.ASSETS.fetch(request);
        const newHeaders = new Headers(response.headers);
        const isAudio = /\.mp3$/i.test(path);
        const isSticker = /^\/stickers\//i.test(path);

        if (isAudio || isSticker) {
            newHeaders.set('Cache-Control', 'public, max-age=86400');
            newHeaders.set('Access-Control-Allow-Origin', '*');
            newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
            newHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type');
            newHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Type');
            newHeaders.set('Accept-Ranges', 'bytes');
            if (isAudio) newHeaders.set('Content-Type', 'audio/mpeg');
        }

        return new Response(response.body, { status: response.status, headers: newHeaders });
    }
};

async function handleApi(request, env, path, headers) {
    try {
        if (path === '/api/health') {
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

        if (path === '/api/messages' && request.method === 'GET') {
            const limit = parseInt(new URL(request.url).searchParams.get('limit') || '50');
            const messages = await env.DB.prepare(
                'SELECT * FROM messages ORDER BY time DESC LIMIT ?'
            ).bind(limit).all();
            
            return new Response(JSON.stringify({ messages: messages.results }), { 
                headers: { ...headers, 'Content-Type': 'application/json' } 
            });
        }

        if (path === '/api/messages' && request.method === 'POST') {
            const body = await request.json();
            const nick = String(body.nick || '').trim();
            const text = String(body.text || '').trim();
            const sticker = body.sticker ? String(body.sticker) : null;
            const photo = body.photo ? String(body.photo) : null;

            if (!nick) {
                return new Response(JSON.stringify({ success: false, error: 'Ник не указан' }), {
                    status: 400,
                    headers: { ...headers, 'Content-Type': 'application/json' }
                });
            }

            // Пустой текст разрешён, если это стикер или фото.
            if (!text && !sticker && !photo) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Сообщение не заполнено',
                    message: 'Добавьте текст, стикер или изображение'
                }), {
                    status: 400,
                    headers: { ...headers, 'Content-Type': 'application/json' }
                });
            }

            if (photo && photo.length > 4_500_000) {
                return new Response(JSON.stringify({ success: false, error: 'Изображение слишком большое' }), {
                    status: 413,
                    headers: { ...headers, 'Content-Type': 'application/json' }
                });
            }

            await env.DB.prepare(
                'INSERT INTO messages (nick, text, system, time, sticker, photo) VALUES (?, ?, ?, ?, ?, ?)'
            ).bind(nick, text, body.system || 0, Number(body.time) || Date.now(), sticker, photo).run();

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...headers, 'Content-Type': 'application/json' }
            });
        }

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
