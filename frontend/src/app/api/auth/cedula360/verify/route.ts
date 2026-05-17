/**
 * POST /api/auth/cedula360/verify  { session_id, method, code }
 *
 * Verifica el código 2FA de Cédula 360. Si OK, crea/enlaza el `users`
 * de Translate y emite token de sesión de Translate vía impersonate.
 */
import { NextResponse } from 'next/server';
import { c360Post } from '@/lib/server/cedula360';
import { upsertAndIssueToken } from '@/lib/server/pb-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const METHODS = ['totp', 'email_otp', 'sms_otp', 'whatsapp_otp', 'push', 'backup_code'];

export async function POST(req: Request) {
  let body: { session_id?: string; method?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  const sessionId = (body.session_id || '').trim();
  const method = (body.method || '').trim();
  const code = (body.code || '').trim();
  if (!sessionId || sessionId.length < 4) {
    return NextResponse.json({ error: 'session_id inválido' }, { status: 400 });
  }
  if (!METHODS.includes(method)) {
    return NextResponse.json({ error: 'método no soportado' }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: 'código requerido' }, { status: 400 });
  }

  const { status, data } = await c360Post(
    '/api/auth/mfa/verify',
    { session_id: sessionId, method, code },
    req
  );
  if (status !== 200 || data.ok === false || !data.token) {
    const reason =
      (data.error as string) || (data.message as string) || 'código incorrecto';
    return NextResponse.json({ error: `Cédula 360: ${reason}` }, { status: 401 });
  }

  try {
    const { token, record } = await upsertAndIssueToken(
      (data.user as Record<string, string>) || {},
      ''
    );
    return NextResponse.json({
      ok: true,
      token,
      user: { email: record.email, name: record.name || '' },
      record,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
