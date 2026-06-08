import Link from 'next/link'
import { notFound } from 'next/navigation'
import CommentsSection from '@/components/CommentsSection'
import ShareButtons from '@/components/ShareButtons'
import { supabaseAdmin } from '@/lib/supabase'

export const revalidate = 60

async function getPost(slug: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    if (error || !data) return null
    return data
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  const rawImage = post.cover_image || ''
  const ogImage = rawImage ? `https://studio.webmify.site/api/image?url=${encodeURIComponent(rawImage)}` : 'https://studio.webmify.site/og-default.png'
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      url: `https://studio.webmify.site/blog/${slug}`,
      type: 'article',
      siteName: 'Webmify',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: [ogImage],
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const postUrl = `https://studio.webmify.site/blog/${slug}`
  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5', fontFamily: "'Geist', system-ui, sans-serif" }}>
      <header style={{ borderBottom: '1px solid #e0e0d8', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(248,248,245,0.97)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="https://webmify.site" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <img src="/favicon.png" alt="Webmify" style={{ height: '36px', width: 'auto' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0c0c0a', letterSpacing: '-0.3px' }}>Webmify</span>
        </Link>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="https://webmify.site" style={{ fontSize: '13px', color: '#78786e', textDecoration: 'none' }}>Home</Link>
          <Link href="/blog" style={{ fontSize: '13px', color: '#0c0c0a', textDecoration: 'none', fontWeight: 500 }}>Blog</Link>
        </div>
      </header>
      {post.cover_image && (
        <div style={{ width: '100%', height: 'clamp(200px, 40vw, 480px)', overflow: 'hidden', background: '#1e1e1a' }}>
          <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      )}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 20px 100px' }}>
        <Link href="/blog" style={{ fontSize: '12px', color: '#b4b4a8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: '28px' }}>← All posts</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#b8944a', background: 'rgba(184,148,74,.08)', padding: '3px 10px', borderRadius: '100px', border: '1px solid rgba(184,148,74,.2)' }}>{post.category}</span>
          <span style={{ fontSize: '11px', color: '#b4b4a8' }}>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 400, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: '20px', color: '#0c0c0a' }}>{post.title}</h1>
        {post.excerpt && <p style={{ fontSize: '17px', color: '#78786e', lineHeight: 1.8, marginBottom: '36px', paddingBottom: '36px', borderBottom: '1px solid #e0e0d8', fontWeight: 300 }}>{post.excerpt}</p>}
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        <ShareButtons url={postUrl} title={post.title} />
        <CommentsSection postId={post.id} postSlug={slug} />
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #e0e0d8', display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/blog" style={{ fontSize: '13px', color: '#78786e', textDecoration: 'none' }}>← More posts</Link>
          <span style={{ fontSize: '12px', color: '#b4b4a8' }}>Webmify Editorial</span>
        </div>
      </main>
      <style>{`.post-content p{font-size:17px;line-height:1.85;color:#1e1e1a;margin-bottom:20px}.post-content strong{font-weight:700;color:#0c0c0a}.post-content a{color:#b8944a;text-decoration:underline}.post-content h1,.post-content h2,.post-content h3{font-family:Georgia,serif;font-weight:400;letter-spacing:-0.5px;margin:32px 0 12px;color:#0c0c0a}.post-content ul,.post-content ol{padding-left:1.5em;margin-bottom:20px}.post-content li{font-size:17px;line-height:1.85;color:#1e1e1a;margin-bottom:6px}.post-content img{max-width:100%;border-radius:8px;margin:24px 0}`}</style>
    </div>
  )
}
