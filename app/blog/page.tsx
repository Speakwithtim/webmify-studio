import { supabase } from '@/lib/supabase'
import { Post } from '@/lib/types'
import Link from 'next/link'

export const revalidate = 60

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5' }}>
      <header style={{ borderBottom: '1px solid #e0e0d8', padding: '0 52px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(248,248,245,0.95)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="https://webmify.site" style={{ fontWeight: 600, fontSize: '16px', letterSpacing: '-0.3px', color: '#0c0c0a', textDecoration: 'none' }}>
          Webmify
        </Link>
        <nav style={{ display: 'flex', gap: '28px' }}>
          <Link href="https://webmify.site" style={{ fontSize: '13px', color: '#78786e', textDecoration: 'none' }}>Home</Link>
          <Link href="https://webmify.site/#services" style={{ fontSize: '13px', color: '#78786e', textDecoration: 'none' }}>Services</Link>
          <Link href="/blog" style={{ fontSize: '13px', color: '#0c0c0a', textDecoration: 'none', fontWeight: 500 }}>Blog</Link>
        </nav>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ marginBottom: '56px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#b4b4a8', marginBottom: '16px' }}>The Webmify Edit</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 300, letterSpacing: '-3px', lineHeight: 0.95, marginBottom: '16px' }}>
            On building,<br /><em style={{ color: '#78786e' }}>business, and the web.</em>
          </h1>
          <p style={{ fontSize: '15px', color: '#78786e', fontWeight: 300, lineHeight: 1.8 }}>
            Clear thinking on digital products, development, and what it takes to scale a business online.
          </p>
        </div>

        {!posts || posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#b4b4a8' }}>
            <p style={{ fontSize: '18px', fontFamily: 'Georgia, serif', fontWeight: 300 }}>First post coming soon.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {posts.map((post: Post, i: number) => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block', padding: '36px 0', borderBottom: '1px solid #e0e0d8', transition: 'padding-left 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.paddingLeft = '8px')}
                onMouseLeave={e => (e.currentTarget.style.paddingLeft = '0')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#b8944a', background: 'rgba(184,148,74,0.08)', padding: '3px 10px', borderRadius: '100px', border: '1px solid rgba(184,148,74,0.2)' }}>{post.category}</span>
                  <span style={{ fontSize: '11px', color: '#b4b4a8' }}>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
                </div>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 400, letterSpacing: '-1px', lineHeight: 1.2, color: '#0c0c0a', marginBottom: '10px' }}>{post.title}</h2>
                {post.excerpt && <p style={{ fontSize: '14px', color: '#78786e', lineHeight: 1.75, fontWeight: 300 }}>{post.excerpt}</p>}
                <p style={{ fontSize: '12px', color: '#b8944a', marginTop: '14px', fontWeight: 500 }}>Read post</p>
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginTop: '80px', background: '#f1f1ec', border: '1px solid #e0e0d8', borderRadius: '14px', padding: '44px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 300, letterSpacing: '-1px', marginBottom: '8px' }}>Get new posts first.</h3>
          <p style={{ fontSize: '13px', color: '#78786e', fontWeight: 300, marginBottom: '24px' }}>No noise. Just useful writing on building and growing online.</p>
          <form action="/api/subscribers" method="POST" style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input name="email" type="email" placeholder="your@email.com" required style={{ padding: '11px 18px', border: '1px solid #c8c8bc', borderRadius: '100px', fontSize: '13px', outline: 'none', width: '240px', background: '#f8f8f5' }} />
            <button type="submit" style={{ padding: '11px 24px', background: '#0c0c0a', color: '#f8f8f5', border: 'none', borderRadius: '100px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Subscribe</button>
          </form>
        </div>
      </main>
    </div>
  )
}
