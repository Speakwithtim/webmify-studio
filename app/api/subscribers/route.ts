import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin.from('subscribers').select('*').order('subscribed_at', { ascending: false })
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''
  let email = '', name = ''
  if (contentType.includes('application/json')) {
    const body = await req.json()
    email = body.email
    name = body.name || ''
  } else {
    const form = await req.formData()
    email = form.get('email') as string
    name = form.get('name') as string || ''
  }
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
  const { error } = await supabaseAdmin.from('subscribers').upsert({ email, name }, { onConflict: 'email' })
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.redirect(new URL('/blog?subscribed=true', req.url))
}
