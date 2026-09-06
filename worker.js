export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Range, X-Admin-Session',
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

async function sha256Hex(value) {
    const data = new TextEncoder().encode(String(value));
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

const MASTER_NICK = 'Ключник';
const MASTER_PASSWORD_HASH = '46d9a0648bba2cc5c9b1ac95585e82373346d5f36444b0fcbea6996e2939417c';
const ALL_ADMIN_COMMANDS = ['/snowstorm','/fireworks','/predict','/aurora','/galaxy','/vortex','/meteor','/night','/gift','/tree'];

async function getAdminSession(request, env) {
    const token = request.headers.get('X-Admin-Session') || '';
    if (!token) return null;
    return await env.DB.prepare('SELECT session_id,nick,role,expires_at FROM admin_sessions WHERE session_id=? AND expires_at>?').bind(token, Date.now()).first();
}

function json(data, headers, status=200) {
    return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}

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

        if (path === '/api/stream' && request.method === 'GET') {
            const row = await env.DB.prepare("SELECT value FROM site_settings WHERE key='youtube_stream'").first();
            return json({ url: row?.value || '' }, headers);
        }

        if (path === '/api/messages' && request.method === 'GET') {
            const limit = Math.min(200, Math.max(1, parseInt(new URL(request.url).searchParams.get('limit') || '50')));
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

            const inserted = await env.DB.prepare(
                'INSERT INTO messages (nick, text, system, time, sticker, photo) VALUES (?, ?, ?, ?, ?, ?)'
            ).bind(nick, text, body.system || 0, Number(body.time) || Date.now(), sticker, photo).run();

            return new Response(JSON.stringify({ success: true, id: inserted.meta?.last_row_id || null }), {
                headers: { ...headers, 'Content-Type': 'application/json' }
            });
        }


        /* === ГЛОБАЛЬНОЕ НОВОГОДНЕЕ СОБЫТИЕ === */
        if (path === '/api/celebration' && request.method === 'GET') {
            const year = Number(new URL(request.url).searchParams.get('year')) || new Date().getFullYear();
            const row = await env.DB.prepare('SELECT year,event,time FROM celebrations WHERE year=?').bind(year).first();
            return new Response(JSON.stringify({celebration:row||null}),{headers:{...headers,'Content-Type':'application/json'}});
        }
        if (path === '/api/celebration' && request.method === 'POST') {
            const body=await request.json(); const year=Number(body.year);
            if(!year)return new Response(JSON.stringify({error:'Год не указан'}),{status:400,headers:{...headers,'Content-Type':'application/json'}});
            await env.DB.prepare('INSERT OR IGNORE INTO celebrations (year,event,time) VALUES (?,?,?)').bind(year,'new-year-fireworks',Date.now()).run();
            const row=await env.DB.prepare('SELECT year,event,time FROM celebrations WHERE year=?').bind(year).first();
            return new Response(JSON.stringify({celebration:row}),{headers:{...headers,'Content-Type':'application/json'}});
        }

        /* === РЕАКЦИИ === */
        if (path.startsWith('/api/reactions/') && request.method === 'GET') {
            const messageId = Number(path.split('/').pop());
            const rows = await env.DB.prepare(
                'SELECT emoji, COUNT(*) AS count FROM reactions WHERE message_id = ? GROUP BY emoji ORDER BY count DESC'
            ).bind(messageId).all();
            return new Response(JSON.stringify({ reactions: rows.results || [] }), {
                headers: { ...headers, 'Content-Type': 'application/json' }
            });
        }

        if (path === '/api/reactions' && request.method === 'POST') {
            const body = await request.json();
            const messageId = Number(body.message_id);
            const nick = String(body.nick || '').trim().slice(0, 40);
            const emoji = String(body.emoji || '').trim();
            const allowed = ['❤️','🎄','😂','🔥','🎁','✨'];
            if (!messageId || !nick || !allowed.includes(emoji)) {
                return new Response(JSON.stringify({ error:'Некорректная реакция' }), {
                    status:400, headers:{...headers,'Content-Type':'application/json'}
                });
            }
            const existing = await env.DB.prepare(
                'SELECT id FROM reactions WHERE message_id = ? AND nick = ? AND emoji = ?'
            ).bind(messageId,nick,emoji).first();
            if (existing) {
                await env.DB.prepare('DELETE FROM reactions WHERE id = ?').bind(existing.id).run();
            } else {
                await env.DB.prepare(
                    'INSERT INTO reactions (message_id, nick, emoji, time) VALUES (?, ?, ?, ?)'
                ).bind(messageId,nick,emoji,Date.now()).run();
            }
            return new Response(JSON.stringify({success:true}), {headers:{...headers,'Content-Type':'application/json'}});
        }

        /* === КАРТОЧКА ПОЛЬЗОВАТЕЛЯ / ДОСТИЖЕНИЯ / STREAK === */
        if (path === '/api/profile' && request.method === 'GET') {
            const nick = String(new URL(request.url).searchParams.get('nick') || '').trim().slice(0,40);
            if (!nick) return new Response(JSON.stringify({error:'Ник не указан'}), {status:400,headers:{...headers,'Content-Type':'application/json'}});
            const rows = await env.DB.prepare('SELECT time, photo, text, sticker FROM messages WHERE nick = ? ORDER BY time DESC LIMIT 5000').bind(nick).all();
            const msgs = rows.results || [];
            const days = new Set(msgs.map(m => new Date(Number(m.time)).toISOString().slice(0,10)));
            let streak=0, cursor=new Date();
            cursor.setHours(0,0,0,0);
            while(days.has(cursor.toISOString().slice(0,10))){streak++;cursor.setDate(cursor.getDate()-1);}
            const achievements=[];
            const add=(name,icon,description)=>achievements.push({name,icon,description});
            if(msgs.length>=1)add('Первое слово','🌟','Ты написал своё первое сообщение');
            if(msgs.length>=10)add('Разговорчивый','💬','10 сообщений');
            if(msgs.length>=50)add('Душа компании','🏆','50 сообщений');
            if(msgs.filter(m=>m.photo).length>=1)add('Фотограф','📸','Отправлено фото');
            if(msgs.filter(m=>m.sticker).length>=5)add('Котолюб','🐱','5 стикеров');
            if(streak>=3)add('Огонёк','🔥','3 дня подряд');
            if(streak>=7)add('Новогодняя серия','🎆','7 дней подряд');
            return new Response(JSON.stringify({
                nick, messages:msgs.length, photos:msgs.filter(m=>m.photo).length, streak, achievements
            }),{headers:{...headers,'Content-Type':'application/json'}});
        }

        /* === ОБЩАЯ ЁЛКА === */
        if (path === '/api/tree' && request.method === 'GET') {
            const rows = await env.DB.prepare('SELECT nick,x,y,time FROM tree_stars ORDER BY id DESC LIMIT 300').all();
            return new Response(JSON.stringify({stars:rows.results||[],total:(rows.results||[]).length}),{headers:{...headers,'Content-Type':'application/json'}});
        }
        if (path === '/api/tree/star' && request.method === 'POST') {
            const body=await request.json();
            const nick=String(body.nick||'').trim().slice(0,40);
            if(!nick)return new Response(JSON.stringify({error:'Ник не указан'}),{status:400,headers:{...headers,'Content-Type':'application/json'}});
            const today=new Date().toISOString().slice(0,10);
            const already=await env.DB.prepare('SELECT id FROM tree_stars WHERE nick=? AND day=?').bind(nick,today).first();
            if(already)return new Response(JSON.stringify({error:'Сегодня ты уже добавил звезду'}),{status:409,headers:{...headers,'Content-Type':'application/json'}});
            const x=25+Math.random()*50, y=12+Math.random()*58;
            await env.DB.prepare('INSERT INTO tree_stars (nick,x,y,time,day) VALUES (?,?,?,?,?)').bind(nick,x,y,Date.now(),today).run();
            const rows=await env.DB.prepare('SELECT nick,x,y,time FROM tree_stars ORDER BY id DESC LIMIT 300').all();
            return new Response(JSON.stringify({stars:rows.results||[],total:(rows.results||[]).length}),{headers:{...headers,'Content-Type':'application/json'}});
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

        /* === АДМИНИСТРАЦИЯ === */
        if (path === '/api/admin/login' && request.method === 'POST') {
            const body = await request.json();
            const nick = String(body.nick || '').trim().slice(0, 40);
            const password = String(body.password || '');
            if (!nick || !password) return json({ error: 'Укажи ник и пароль' }, headers, 400);
            const hash = await sha256Hex(password);
            let role = null;
            let commands = ALL_ADMIN_COMMANDS;
            if (nick === MASTER_NICK && hash === (env.ADMIN_MASTER_PASSWORD_HASH || MASTER_PASSWORD_HASH)) {
                role = 'master';
            } else {
                const row = await env.DB.prepare('SELECT nick,role,commands,enabled,password_hash FROM admin_users WHERE nick=?').bind(nick).first();
                if (!row || !row.enabled || row.password_hash !== hash) return json({ error: 'Неверный ник или пароль' }, headers, 401);
                role = row.role || 'admin';
                try { commands = JSON.parse(row.commands || '[]'); } catch { commands = []; }
            }
            const sessionId = crypto.randomUUID();
            await env.DB.prepare('INSERT INTO admin_sessions(session_id,nick,role,expires_at) VALUES(?,?,?,?)').bind(sessionId,nick,role,Date.now()+7*24*60*60*1000).run();
            return json({ session_id: sessionId, nick, role, commands }, headers);
        }

        if (path === '/api/admin/me' && request.method === 'GET') {
            const session = await getAdminSession(request, env);
            if (!session) return json({ error:'Сессия администратора истекла' }, headers, 401);
            let commands = ALL_ADMIN_COMMANDS;
            if (session.role !== 'master') {
                const row = await env.DB.prepare('SELECT commands,enabled FROM admin_users WHERE nick=?').bind(session.nick).first();
                if (!row?.enabled) return json({ error:'Администратор отключён' }, headers, 403);
                try { commands = JSON.parse(row.commands || '[]'); } catch { commands=[]; }
            }
            return json({ nick:session.nick, role:session.role, commands }, headers);
        }

        if (path === '/api/admin/me' && request.method === 'PATCH') {
            const session = await getAdminSession(request, env);
            if (!session) return json({ error:'Нет доступа' }, headers, 401);
            const body=await request.json();
            const commands=[...new Set(Array.isArray(body.commands)?body.commands.filter(c=>ALL_ADMIN_COMMANDS.includes(c)):[])];
            if(session.role==='master') return json({nick:session.nick,role:session.role,commands:ALL_ADMIN_COMMANDS},headers);
            await env.DB.prepare('UPDATE admin_users SET commands=? WHERE nick=?').bind(JSON.stringify(commands),session.nick).run();
            return json({nick:session.nick,role:session.role,commands},headers);
        }

        if (path === '/api/admin/admins' && request.method === 'GET') {
            const session=await getAdminSession(request,env);
            if(!session || session.role!=='master') return json({error:'Только главный администратор'},headers,403);
            const rows=await env.DB.prepare('SELECT nick,role,commands,enabled,created_at FROM admin_users ORDER BY created_at DESC').all();
            return json({admins:(rows.results||[]).map(r=>({nick:r.nick,role:r.role,commands:JSON.parse(r.commands||'[]'),enabled:!!r.enabled,created_at:r.created_at}))},headers);
        }

        if (path === '/api/admin/admins' && request.method === 'POST') {
            const session=await getAdminSession(request,env);
            if(!session || session.role!=='master') return json({error:'Только главный администратор'},headers,403);
            const body=await request.json(); const nick=String(body.nick||'').trim().slice(0,40); const password=String(body.password||'');
            if(!nick||!password)return json({error:'Нужны ник и пароль'},headers,400);
            if(nick===MASTER_NICK)return json({error:'Нельзя переопределить главного администратора'},headers,400);
            const commands=[...new Set(Array.isArray(body.commands)?body.commands.filter(c=>ALL_ADMIN_COMMANDS.includes(c)):[])];
            await env.DB.prepare('INSERT INTO admin_users(nick,password_hash,role,commands,enabled,created_at) VALUES(?,?,?,?,1,?) ON CONFLICT(nick) DO UPDATE SET password_hash=excluded.password_hash,commands=excluded.commands,enabled=1').bind(nick,await sha256Hex(password),'admin',JSON.stringify(commands),Date.now()).run();
            return json({success:true},headers);
        }

        if (path === '/api/admin/admins' && request.method === 'DELETE') {
            const session=await getAdminSession(request,env);
            if(!session || session.role!=='master') return json({error:'Только главный администратор'},headers,403);
            const body=await request.json(); const nick=String(body.nick||'').trim();
            if(!nick || nick===MASTER_NICK)return json({error:'Нельзя удалить главного администратора'},headers,400);
            await env.DB.prepare('DELETE FROM admin_users WHERE nick=?').bind(nick).run();
            await env.DB.prepare('DELETE FROM admin_sessions WHERE nick=?').bind(nick).run();
            return json({success:true},headers);
        }

        if (path === '/api/admin/stream' && request.method === 'POST') {
            const session=await getAdminSession(request,env);
            if(!session)return json({error:'Нет доступа'},headers,401);
            const body=await request.json(); const url=String(body.url||'').trim();
            if(url){
                let u; try{u=new URL(url)}catch{return json({error:'Некорректная ссылка'},headers,400)}
                if(!['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(u.hostname)) return json({error:'Разрешены только ссылки YouTube'},headers,400);
            }
            await env.DB.prepare("INSERT INTO site_settings(key,value,updated_at) VALUES('youtube_stream',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(url,Date.now()).run();
            return json({success:true,url},headers);
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
