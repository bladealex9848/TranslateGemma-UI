/**
 * POST /api/auth/cedula360
 *
 * Login alianza: valida email+password contra la API REAL de
 * Cédula 360 (:3081). NO requiere sesión previa de Translate (es un
 * login). Aditivo: el login normal por PocketBase sigue intacto.
 *
 *  - Cédula 360 pide 2FA → { ok:true, mfa_required:true, session_id,
 *    methods, email } (NO se crea user/sesión todavía).
 *  - Cédula 360 devuelve token → se crea/enlaza el `users` de Translate
 *    (rol normal, SIN admin) y se emite token de sesión de Translate
 *    vía impersonate.
 *  - Credenciales inválidas → 401 con la razón real de Cédula 360.
 *    Un 429 (rate limit) se propaga tal cual.
 */
import { NextResponse } from 'next/server';
import { c360Post, clientIp, verifyRecaptcha } from '@/lib/server/cedula360';
import { upsertAndIssueToken } from '@/lib/server/pb-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { email?: string; password?: string; recaptcha_token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  const email = (body.email || '').trim();
  const password = body.password || '';
  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
  }

  // reCAPTCHA v3 (fail-open sin token/secret/red)
  const ok = await verifyRecaptcha(body.recaptcha_token, clientIp(req));
  if (!ok) {
    return NextResponse.json(
      { error: 'Verificación de seguridad fallida. Intenta de nuevo.' },
      { status: 400 }
    );
  }

  const { status, data } = await c360Post('/api/auth/login', { email, password }, req);

  if (status !== 200) {
    const reason =
      (data.error as string) || (data.message as string) || 'error desconocido';
    return NextResponse.json(
      { error: `Cédula 360: ${reason} (HTTP ${status})` },
      { status }
    );
  }

  if (data.mfa_required) {
    return NextResponse.json({
      ok: true,
      mfa_required: true,
      provider: 'cedula360',
      session_id: data.session_id,
      methods: data.methods || [],
      email: data.email || email.toLowerCase(),
    });
  }

  if (!data.token) {
    return NextResponse.json(
      { error: 'Cédula 360 no devolvió token ni MFA' },
      { status: 502 }
    );
  }

  try {
    const { token, record } = await upsertAndIssueToken(
      (data.user as Record<string, string>) || {},
      email
    );
    return NextResponse.json({
      token,
      user: { email: record.email, name: record.name || '' },
      record,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
