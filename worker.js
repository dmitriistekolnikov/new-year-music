export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Range',
            'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        // API запросы
        if (path.startsWith('/api/')) {
            return handleApi(request, env, path, corsHeaders);
        }

        // Статика (HTML, CSS, JS, MP3)
        try {
            const response = await env.ASSETS.fetch(request);
            
            // Для MP3 добавляем CORS и обрабатываем Range-запросы
            if (path.endsWith('.mp3') && response.ok) {
                const newHeaders = new Headers(response.headers);
                newHeaders.set('Access-Control-Allow-Origin', '*');
                newHeaders.set('Access-Control-Allow-Headers', 'Range');
                newHeaders.set('Accept-Ranges', 'bytes');
                newHeaders.set('Content-Type', 'audio/mpeg');
                
                // Обработка Range-запросов для jsmediatags
                const rangeHeader = request.headers.get('Range');
                if (rangeHeader) {
                    const body = await response.arrayBuffer();
                    const totalSize = body.byteLength;
                    
                    // Парсим Range: bytes=start-end
                    const match = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
                    if (match) {
                        const start = parseInt(match[1]);
                        const end = match[2] ? parseInt(match[2]) : totalSize - 1;
                        
                        if (start >= totalSize) {
                            return new Response(null, {
                                status: 416,
                                headers: {
                                    ...newHeaders,
                                    'Content-Range': `bytes */${totalSize}`
                                }
                            });
                        }
                        
                        const slice = body.slice(start, end + 1);
                        newHeaders.set('Content-Range', `bytes ${start}-${end}/${totalSize}`);
                        newHeaders.set('Content-Length', slice.byteLength.toString());
                        
                        return new Response(slice, {
                            status: 206,
                            headers: newHeaders
                        });
                    }
                }
                
                return new Response(response.body, {
                    status: response.status,
                    headers: newHeaders
                });
            }
            
            return response;
        } catch (err) {
            return new Response('Not found: ' + path, { status: 404 });
        }
    }
};

// === АВТО-СОЗДАНИЕ ТАБЛИЦ ===
async function ensureTables(env) {
    if (!env.DB) return;
    try {
        await env.DB.exec(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nick TEXT NOT NULL,
                text TEXT NOT NULL,
                system INTEGER DEFAULT 0,
                time INTEGER NOT NULL,
                sticker TEXT,
                photo TEXT
            );
        `);
        await env.DB.exec(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL UNIQUE,
                nick TEXT NOT NULL,
                expires_at INTEGER NOT NULL
            );
        `);
    } catch (e) {
        console.error('ensureTables error:', e);
    }
}

async function handleApi(request, env, path, headers) {
    try {
        await ensureTables(env);

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
            let body;
            try {
                body = await request.json();
            } catch (e) {
                return new Response(JSON.stringify({ error: 'Invalid JSON' }), { 
                    status: 400, 
                    headers: { ...headers, 'Content-Type': 'application/json' } 
                });
            }
            
            if (!body.nick || !body.text) {
                return new Response(JSON.stringify({ error: 'nick and text required' }), { 
                    status: 400, 
                    headers: { ...headers, 'Content-Type': 'application/json' } 
                });
            }

            await env.DB.prepare(
                'INSERT INTO messages (nick, text, system, time, sticker, photo) VALUES (?, ?, ?, ?, ?, ?)'
            ).bind(
                body.nick, 
                body.text, 
                body.system || 0, 
                body.time || Date.now(), 
                body.sticker || null, 
                body.photo || null
            ).run();
            
            return new Response(JSON.stringify({ success: true }), { 
                headers: { ...headers, 'Content-Type': 'application/json' } 
            });
        }

        if (path === '/api/auth/login' && request.method === 'POST') {
            let body;
            try {
                body = await request.json();
            } catch (e) {
                return new Response(JSON.stringify({ error: 'Invalid JSON' }), { 
                    status: 400, 
                    headers: { ...headers, 'Content-Type': 'application/json' } 
                });
            }

            if (!body.nick) {
                return new Response(JSON.stringify({ error: 'nick required' }), { 
                    status: 400, 
                    headers: { ...headers, 'Content-Type': 'application/json' } 
                });
            }

            const sessionId = crypto.randomUUID();
            const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
            
            await env.DB.prepare(
                'INSERT OR REPLACE INTO sessions (session_id, nick, expires_at) VALUES (?, ?, ?)'
            ).bind(sessionId, body.nick, expiresAt).run();
            
            return new Response(JSON.stringify({ session_id: sessionId, nick: body.nick }), { 
                headers: { ...headers, 'Content-Type': 'application/json' } 
            });
        }

        if (path === '/api/auth/check' && request.method === 'POST') {
            let body;
            try {
                body = await request.json();
            } catch (e) {
                return new Response(JSON.stringify({ valid: false }), { 
                    headers: { ...headers, 'Content-Type': 'application/json' } 
                });
            }

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
