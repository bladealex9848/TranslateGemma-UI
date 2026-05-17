/**
 * POST /api/auth/cedula360/challenge  { session_id, method }
 *
 * Dispara el envío del OTP de Cédula 360 (email/sms/whatsapp/push).
 * `totp` y `backup_code` no requieren challenge.
 */
import { NextResponse } from 'next/server';
import { c360Post } from '@/lib/server/cedula360';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const METHODS = ['totp', 'email_otp', 'sms_otp', 'whatsapp_otp', 'push', 'backup_code'];

export async function POST(req: Request) {
  let body: { session_id?: string; method?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  const sessionId = (body.session_id || '').trim();
  const method = (body.method || '').trim();
  if (!sessionId || sessionId.length < 4) {
    return NextResponse.json({ error: 'session_id inválido' }, { status: 400 });
  }
  if (!METHODS.includes(method)) {
    return NextResponse.json({ error: 'método no soportado' }, { status: 400 });
  }

  const { status, data } = await c360Post(
    '/api/auth/mfa/challenge',
    { session_id: sessionId, method },
    req
  );
  if (status !== 200 || data.ok === false) {
    const reason =
      (data.error as string) || (data.message as string) || 'no se pudo enviar el código';
    return NextResponse.json(
      { error: `Cédula 360: ${reason}` },
      { status: status !== 200 ? status : 400 }
    );
  }
  return NextResponse.json({ ok: true, sent_to: data.sent_to });
}
