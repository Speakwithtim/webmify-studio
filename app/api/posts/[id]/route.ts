import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: cors })
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabaseAdmin.from('posts').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: cors })
  return NextResponse.json(data, { headers: cors })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from('posts')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('PATCH error:', error)
      return NextResponse.json({ error: error.message }, { status: 500, headers: cors })
    }
    return NextResponse.json(data, { headers: cors })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: cors })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await supabaseAdmin.from('posts').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: cors })
    return NextResponse.json({ ok: true }, { headers: cors })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: cors })
  }
}
