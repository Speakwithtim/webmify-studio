import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, slug, content, excerpt, category, seo_title, seo_description, cover_image, status, published_at } = body
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        title,
        slug: finalSlug,
        content: content || '',
        excerpt: excerpt || '',
        category: category || 'General',
        seo_title: seo_title || title,
        seo_description: seo_description || '',
        cover_image: cover_image || '',
        status: status || 'draft',
        published_at: published_at || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) {
      console.error('Supabase insert error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('POST error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
