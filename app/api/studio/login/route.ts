import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password === process.env.STUDIO_PASSWORD) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('studio_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  }
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
}
