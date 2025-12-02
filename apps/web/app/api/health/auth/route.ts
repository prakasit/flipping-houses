import { NextResponse } from 'next/server';

export async function GET() {
  const requiredEnvVars = [
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'DATABASE_URL',
  ];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  const authEnvOk = missing.length === 0;

  return NextResponse.json({
    auth_env_ok: authEnvOk,
    missing_env_vars: missing,
    has_nextauth_secret: !!process.env.NEXTAUTH_SECRET,
    has_google_client_id: !!process.env.GOOGLE_CLIENT_ID,
    has_google_client_secret: !!process.env.GOOGLE_CLIENT_SECRET,
    has_database_url: !!process.env.DATABASE_URL,
  });
}



