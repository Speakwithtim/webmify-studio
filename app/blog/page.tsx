import Link from 'next/link'

export const revalidate = 60

async function getPosts() {
  try {
    const res = await fetch('https://studio.webmify.site/api/posts', { next: { revalidate: 60 } })
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5', fontFamily: "'Geist', system-ui, sans-serif" }}>
      <header style={{ borderBottom: '1px solid #e0e0d8', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(248,248,245,0.97)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="https://webmify.site" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <img src="/favicon.png" alt="Webmify" style={{ height: '36px', width: 'auto' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0c0c0a', letterSpacing: '-0.3px' }}>Webmify</span>
        </Link>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="https://webmify.site" style={{ fontSize: '13px', color: '#78786e', textDecoration: 'none' }}>Home</Link>
          <Link href="https://webmify.site/#services" style={{ fontSize: '13px', color: '#78786e', textDecoration: 'none' }}>Services</Link>
          <Link href="/blog" style={{ fontSize: '13px', color: '#0c0c0a', textDecoration: 'none', fontWeight: 500 }}>Blog</Link>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 20px 100px' }}>
        <div style={{ marginBottom: '56px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#b4b4a8', marginBottom: '16px' }}>The Webmify Edit</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px,6vw,64px)', fontWeight: 300, letterSpacing: '-3px', lineHeight: 1, marginBottom: '16px', color: '#0c0c0a' }}>
            On building,<br /><em style={{ color: '#78786e' }}>business, and the web.</em>
          </h1>
          <p style={{ fontSize: '15px', color: '#78786e', maxWidth: '480px', lineHeight: 1.75, fontWeight: 300 }}>
            Clear thinking on digital products, development, and what it takes to scale a business online.
          </p>
        </div>

        {!posts || posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#b4b4a8' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 300, marginBottom: '8px' }}>First post coming soon.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#e0e0d8' }}>
            {posts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'center', background: '#f8f8f5', padding: '28px 0', textDecoration: 'none' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#b8944a', background: 'rgba(184,148,74,.08)', padding: '3px 8px', borderRadius: '100px', border: '1px solid rgba(184,148,74,.2)' }}>{post.category}</span>
                    <span style={{ fontSize: '11px', color: '#b4b4a8' }}>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
                  </div>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(18px,3vw,26px)', fontWeight: 400, letterSpacing: '-0.5px', lineHeight: 1.2, color: '#0c0c0a', margin: '0 0 8px' }}>{post.title}</h2>
                  {post.excerpt && <p style={{ fontSize: '14px', color: '#78786e', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{post.excerpt}</p>}
                </div>
                {post.cover_image && (
                  <img src={post.cover_image} alt={post.title} style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
