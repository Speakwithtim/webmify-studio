import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

export async function OPTIONS() { return NextResponse.json({}, { headers: cors }) }

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data, error } = await supabaseAdmin.from('posts').select('*').eq('slug', slug).eq('status', 'published').single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: cors })
  return NextResponse.json(data, { headers: cors })
}
