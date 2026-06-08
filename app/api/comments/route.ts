import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: cors })
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json([], { headers: cors })
  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('id, name, message, reply, created_at')
    .eq('post_slug', slug)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json([], { headers: cors })
  return NextResponse.json(data, { headers: cors })
}

export async function POST(req: NextRequest) {
  try {
    const { post_id, post_slug, name, email, message } = await req.json()
    if (!name || !email || !message || !post_slug) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400, headers: cors })
    }
    const { error } = await supabaseAdmin.from('comments').insert({
      post_id, post_slug, name, email, message, status: 'pending'
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: cors })
    return NextResponse.json({ ok: true }, { headers: cors })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: cors })
  }
}
