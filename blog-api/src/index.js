const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.map(v => String(v).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return [];

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map(v => String(v).trim()).filter(Boolean);
      }
    } catch {
      // ignore and fall back below
    }

    if (text.includes(',')) {
      return text.split(',').map(v => v.trim()).filter(Boolean);
    }

    return [text];
  }

  return [];
}

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return normalizeArray(value);
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return normalizeArray(parsed);
  } catch {
    return normalizeArray(value);
  }
}

function serializeArray(value) {
  return JSON.stringify(normalizeArray(value));
}

function toPostSummary(row) {
  const categories = parseJsonArray(row.categories);
  const tags = parseJsonArray(row.tags);

  return {
    slug: row.slug,
    title: row.title,
    date: row.date,
    categories,
    tags,
    author: row.author || 'Miss Kim',
    created_at: row.created_at,
    updated_at: row.updated_at,
    excerpt: row.excerpt || '',
    category: categories[0] || 'other',
  };
}

function toPostDetail(row) {
  return {
    slug: row.slug,
    title: row.title,
    date: row.date,
    content: row.content,
    categories: parseJsonArray(row.categories),
    tags: parseJsonArray(row.tags),
    author: row.author || 'Miss Kim',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function extractToken(request) {
  const auth = request.headers.get('Authorization') || '';
  if (auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }

  const apiKey = request.headers.get('X-API-Key');
  return apiKey ? apiKey.trim() : '';
}

function isAuthorized(request, env) {
  if (!env.API_TOKEN) return false;
  return extractToken(request) === env.API_TOKEN;
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function getPath(url) {
  if (url.pathname === '/') return '/';
  return url.pathname.replace(/\/+$/, '');
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);
    const path = getPath(url);

    try {
      if (request.method === 'GET' && path === '/health') {
        await env.DB.prepare('SELECT 1 as ok').first();
        return jsonResponse({ ok: true, service: 'blog-api', time: new Date().toISOString() });
      }

      if (request.method === 'GET' && path === '/api/posts/search') {
        const q = (url.searchParams.get('q') || '').trim();
        const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 1), 100);

        if (!q) {
          return jsonResponse({ error: 'Missing query parameter: q' }, 400);
        }

        const like = `%${q}%`;
        const countRow = await env.DB.prepare(
          `SELECT COUNT(*) as total
           FROM posts
           WHERE title LIKE ? OR content LIKE ? OR tags LIKE ? OR categories LIKE ?`
        ).bind(like, like, like, like).first();

        const { results } = await env.DB.prepare(
          `SELECT slug, title, date, categories, tags, author, created_at, updated_at,
                  SUBSTR(content, 1, 220) as excerpt
           FROM posts
           WHERE title LIKE ? OR content LIKE ? OR tags LIKE ? OR categories LIKE ?
           ORDER BY date DESC
           LIMIT ?`
        ).bind(like, like, like, like, limit).all();

        return jsonResponse({
          query: q,
          total: Number(countRow?.total || 0),
          posts: (results || []).map(toPostSummary),
        });
      }

      if (request.method === 'GET' && path === '/api/posts') {
        const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 1), 200);
        const offset = (page - 1) * limit;
        const category = (url.searchParams.get('category') || '').trim().toLowerCase();

        let whereClause = '';
        const whereBinds = [];

        if (category) {
          whereClause = 'WHERE LOWER(categories) LIKE ?';
          whereBinds.push(`%${category}%`);
        }

        const countRow = await env.DB.prepare(
          `SELECT COUNT(*) as total FROM posts ${whereClause}`
        ).bind(...whereBinds).first();

        const listSql = `
          SELECT slug, title, date, categories, tags, author, created_at, updated_at,
                 SUBSTR(content, 1, 220) as excerpt
          FROM posts
          ${whereClause}
          ORDER BY date DESC
          LIMIT ? OFFSET ?
        `;

        const { results } = await env.DB.prepare(listSql)
          .bind(...whereBinds, limit, offset)
          .all();

        return jsonResponse({
          page,
          limit,
          total: Number(countRow?.total || 0),
          posts: (results || []).map(toPostSummary),
        });
      }

      const postPathMatch = path.match(/^\/api\/posts\/([^/]+)$/);
      if (request.method === 'GET' && postPathMatch) {
        const slug = decodeURIComponent(postPathMatch[1]);
        const row = await env.DB.prepare(
          `SELECT slug, title, date, content, categories, tags, author, created_at, updated_at
           FROM posts
           WHERE slug = ?`
        ).bind(slug).first();

        if (!row) {
          return jsonResponse({ error: 'Post not found' }, 404);
        }

        return jsonResponse(toPostDetail(row));
      }

      if (request.method === 'POST' && path === '/api/posts') {
        if (!isAuthorized(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }

        const body = await parseBody(request);
        if (!body) {
          return jsonResponse({ error: 'Invalid JSON body' }, 400);
        }

        const slug = String(body.slug || '').trim();
        const title = String(body.title || '').trim();
        const date = String(body.date || '').trim() || new Date().toISOString();
        const content = String(body.content || '');
        const author = String(body.author || 'Miss Kim').trim() || 'Miss Kim';

        if (!slug || !title || !content) {
          return jsonResponse({ error: 'slug, title, and content are required' }, 400);
        }

        try {
          await env.DB.prepare(
            `INSERT INTO posts (slug, title, date, content, categories, tags, author, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
          )
            .bind(
              slug,
              title,
              date,
              content,
              serializeArray(body.categories),
              serializeArray(body.tags),
              author
            )
            .run();
        } catch (error) {
          const message = String(error?.message || '');
          if (message.includes('UNIQUE constraint failed')) {
            return jsonResponse({ error: 'Duplicate slug', slug }, 409);
          }
          throw error;
        }

        const created = await env.DB.prepare(
          `SELECT slug, title, date, content, categories, tags, author, created_at, updated_at
           FROM posts
           WHERE slug = ?`
        ).bind(slug).first();

        return jsonResponse({ ok: true, post: toPostDetail(created) }, 201);
      }

      if (request.method === 'PUT' && postPathMatch) {
        if (!isAuthorized(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }

        const originalSlug = decodeURIComponent(postPathMatch[1]);
        const body = await parseBody(request);
        if (!body) {
          return jsonResponse({ error: 'Invalid JSON body' }, 400);
        }

        const existing = await env.DB.prepare('SELECT * FROM posts WHERE slug = ?')
          .bind(originalSlug)
          .first();

        if (!existing) {
          return jsonResponse({ error: 'Post not found' }, 404);
        }

        const newSlug = String(body.slug || existing.slug).trim();
        const title = String(body.title || existing.title).trim();
        const date = String(body.date || existing.date).trim();
        const content = typeof body.content === 'string' ? body.content : existing.content;
        const author = String(body.author || existing.author || 'Miss Kim').trim() || 'Miss Kim';
        const categories = body.categories === undefined ? existing.categories : serializeArray(body.categories);
        const tags = body.tags === undefined ? existing.tags : serializeArray(body.tags);

        if (!newSlug || !title || !content) {
          return jsonResponse({ error: 'slug, title, and content are required' }, 400);
        }

        try {
          await env.DB.prepare(
            `UPDATE posts
             SET slug = ?, title = ?, date = ?, content = ?, categories = ?, tags = ?, author = ?, updated_at = datetime('now')
             WHERE slug = ?`
          )
            .bind(newSlug, title, date, content, categories, tags, author, originalSlug)
            .run();
        } catch (error) {
          const message = String(error?.message || '');
          if (message.includes('UNIQUE constraint failed')) {
            return jsonResponse({ error: 'Duplicate slug', slug: newSlug }, 409);
          }
          throw error;
        }

        const updated = await env.DB.prepare(
          `SELECT slug, title, date, content, categories, tags, author, created_at, updated_at
           FROM posts
           WHERE slug = ?`
        ).bind(newSlug).first();

        return jsonResponse({ ok: true, post: toPostDetail(updated) });
      }

      if (request.method === 'DELETE' && postPathMatch) {
        if (!isAuthorized(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }

        const slug = decodeURIComponent(postPathMatch[1]);
        const result = await env.DB.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run();
        const changes = Number(result?.meta?.changes || 0);

        if (changes === 0) {
          return jsonResponse({ error: 'Post not found' }, 404);
        }

        return jsonResponse({ ok: true, deleted: slug });
      }

      return jsonResponse({ error: 'Not found' }, 404);
    } catch (error) {
      return jsonResponse(
        {
          error: 'Internal Server Error',
          detail: String(error?.message || error),
        },
        500
      );
    }
  },
};
