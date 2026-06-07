import { supabase } from '@/lib/supabase'
import { Post } from '@/lib/types'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { notFound } from 'next/navigation'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: post } = await supabase.from('posts').select('*').eq('slug', params.slug).single()
  if (!post) return {}
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const { data: post } = await supabase.from('posts').select('*').eq('slug', params.slug).eq('status', 'published').single()
  if (!post) notFound()

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5' }}>
      <header style={{ borderBottom: '1px solid #e0e0d8', padding: '0 52px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(248,248,245,0.95)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="https://webmify.site" style={{ fontWeight: 600, fontSize: '16px', color: '#0c0c0a', textDecoration: 'none' }}>Webmify</Link>
        <Link href="/blog" style={{ fontSize: '13px', color: '#78786e', textDecoration: 'none' }}>All posts</Link>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 24px 100px' }}>
        <Link href="/blog" style={{ fontSize: '12px', color: '#b4b4a8', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '40px' }}>
          Back to blog
        </Link>

        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#b8944a', background: 'rgba(184,148,74,0.08)', padding: '3px 10px', borderRadius: '100px', border: '1px solid rgba(184,148,74,0.2)' }}>{post.category}</span>
          <span style={{ fontSize: '11px', color: '#b4b4a8' }}>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
        </div>

        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 400, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: '24px', color: '#0c0c0a' }}>{post.title}</h1>

        {post.excerpt && <p style={{ fontSize: '16px', color: '#78786e', lineHeight: 1.8, fontWeight: 300, marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid #e0e0d8' }}>{post.excerpt}</p>}

        {post.cover_image && <img src={post.cover_image} alt={post.title} style={{ width: '100%', borderRadius: '12px', marginBottom: '40px', objectFit: 'cover', maxHeight: '400px' }} />}

        <article className="prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </article>

        <div style={{ marginTop: '64px', paddingTop: '40px', borderTop: '1px solid #e0e0d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/blog" style={{ fontSize: '13px', color: '#78786e', textDecoration: 'none' }}>More posts</Link>
          <span style={{ fontSize: '12px', color: '#b4b4a8' }}>Webmify Editorial</span>
        </div>
      </main>
    </div>
  )
}
