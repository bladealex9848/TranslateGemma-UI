/**
 * Proxy same-origin hacia el servidor Ollama.
 *
 * Por qué: el navegador NO puede hablar directo con Ollama
 *  - `NEXT_PUBLIC_OLLAMA_HOST` apuntaría a un host privado / mixed-content
 *    (http:// desde una página https:// → bloqueado por el navegador).
 *  - Caddy sólo expone Next.js (3003) y PocketBase; no hay ruta pública
 *    a Ollama.
 *
 * Solución aditiva (sin tocar Caddy/DNS): el navegador llama
 * `/ollama/...` (mismo origen) y este Route Handler lo reenvía al
 * `OLLAMA_HOST` server-side. Soporta streaming (NDJSON de Ollama).
 *
 * Rutas permitidas (whitelist): sólo `api/tags` y `api/chat`. Cualquier
 * otra → 403. No es un proxy abierto.
 */
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OLLAMA_HOST = (
  process.env.OLLAMA_HOST ||
  process.env.NEXT_PUBLIC_OLLAMA_HOST ||
  'http://127.0.0.1:11434'
).replace(/\/$/, '');

const ALLOWED = new Set(['api/tags', 'api/chat', 'api/version']);

function resolvePath(parts: string[]): string | null {
  const p = parts.join('/');
  return ALLOWED.has(p) ? p : null;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const sub = resolvePath(path);
  if (!sub) {
    return NextResponse.json({ error: 'ruta no permitida' }, { status: 403 });
  }
  try {
    const r = await fetch(`${OLLAMA_HOST}/${sub}`, { cache: 'no-store' });
    const body = await r.text();
    return new NextResponse(body, {
      status: r.status,
      headers: { 'Content-Type': r.headers.get('content-type') || 'application/json' },
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Ollama no disponible: ${(e as Error).message}` },
      { status: 502 }
    );
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const sub = resolvePath(path);
  if (!sub) {
    return NextResponse.json({ error: 'ruta no permitida' }, { status: 403 });
  }
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${OLLAMA_HOST}/${sub}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    // Stream tal cual (Ollama emite NDJSON cuando stream:true)
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type':
          upstream.headers.get('content-type') || 'application/x-ndjson',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Ollama no disponible: ${(e as Error).message}` },
      { status: 502 }
    );
  }
}
