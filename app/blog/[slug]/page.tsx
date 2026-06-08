import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CommentsSection from '@/components/CommentsSection'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: post } = await supabase.from('posts').select('*').eq('slug', slug).single()
  if (!post) return {}
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: post.cover_image ? [{ url: post.cover_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (!post) notFound()

  const postUrl = `https://studio.webmify.site/blog/${slug}`
  const encodedUrl = encodeURIComponent(postUrl)
  const encodedTitle = encodeURIComponent(post.title)

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5', fontFamily: "'Geist', system-ui, sans-serif" }}>
      <header style={{ borderBottom: '1px solid #e0e0d8', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(248,248,245,0.97)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(8px)' }}>
        <Link href="https://webmify.site" style={{ fontWeight: 600, fontSize: '16px', color: '#0c0c0a', textDecoration: 'none', letterSpacing: '-.3px' }}>Webmify</Link>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link href="https://webmify.site" style={{ fontSize: '13px', color: '#78786e', textDecoration: 'none' }}>Home</Link>
          <Link href="https://webmify.site/#services" style={{ fontSize: '13px', color: '#78786e', textDecoration: 'none' }}>Services</Link>
          <Link href="/blog" style={{ fontSize: '13px', color: '#0c0c0a', textDecoration: 'none', fontWeight: 500 }}>Blog</Link>
        </div>
      </header>

      {post.cover_image && (
        <div style={{ width: '100%', maxHeight: '480px', overflow: 'hidden', background: '#1e1e1a' }}>
          <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '480px', objectFit: 'cover', display: 'block', opacity: 0.92 }} />
        </div>
      )}

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 20px 100px' }}>
        <Link href="/blog" style={{ fontSize: '12px', color: '#b4b4a8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: '28px' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          All posts
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#b8944a', background: 'rgba(184,148,74,.08)', padding: '3px 10px', borderRadius: '100px', border: '1px solid rgba(184,148,74,.2)' }}>{post.category}</span>
          <span style={{ fontSize: '11px', color: '#b4b4a8' }}>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
        </div>

        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 400, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: '20px', color: '#0c0c0a' }}>{post.title}</h1>

        {post.excerpt && (
          <p style={{ fontSize: '17px', color: '#78786e', lineHeight: 1.8, marginBottom: '36px', paddingBottom: '36px', borderBottom: '1px solid #e0e0d8', fontWeight: 300 }}>{post.excerpt}</p>
        )}

        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #e0e0d8' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#b4b4a8', marginBottom: '14px' }}>Share this post</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '12px', fontWeight: 500, border: '1px solid #e0e0d8', borderRadius: '100px', textDecoration: 'none', color: '#1e1e1a', background: '#fff' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '12px', fontWeight: 500, border: '1px solid #e0e0d8', borderRadius: '100px', textDecoration: 'none', color: '#1e1e1a', background: '#fff' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
              X (Twitter)
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '12px', fontWeight: 500, border: '1px solid #e0e0d8', borderRadius: '100px', textDecoration: 'none', color: '#1e1e1a', background: '#fff' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '12px', fontWeight: 500, border: '1px solid #e0e0d8', borderRadius: '100px', textDecoration: 'none', color: '#1e1e1a', background: '#fff' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
            <button onClick={() => { navigator.clipboard.writeText(postUrl) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '12px', fontWeight: 500, border: '1px solid #e0e0d8', borderRadius: '100px', color: '#1e1e1a', background: '#fff', cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              Copy link
            </button>
          </div>
        </div>

        <CommentsSection postId={post.id} postSlug={slug} />

        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #e0e0d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/blog" style={{ fontSize: '13px', color: '#78786e', textDecoration: 'none' }}>← More posts</Link>
          <span style={{ fontSize: '12px', color: '#b4b4a8' }}>Webmify Editorial</span>
        </div>
      </main>

      <style>{`
        .post-content p { font-size: 17px; line-height: 1.85; color: #1e1e1a; margin-bottom: 20px; }
        .post-content strong { font-weight: 700; }
        .post-content a { color: #b8944a; text-decoration: underline; }
        .post-content h1, .post-content h2, .post-content h3 { font-family: Georgia, serif; font-weight: 400; letter-spacing: -0.5px; margin: 32px 0 12px; color: #0c0c0a; }
      `}</style>
    </div>
  )
}
