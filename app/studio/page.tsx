import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export default async function StudioPage() {
  const [{ count: postCount }, { count: subCount }, { count: nlCount }, { count: commentCount }] = await Promise.all([
    supabaseAdmin.from('posts').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('newsletters').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const { data: recentPosts } = await supabaseAdmin
    .from('posts').select('id, title, status, created_at')
    .order('created_at', { ascending: false }).limit(5)

  const pending = commentCount || 0

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5', fontFamily: "'Geist', system-ui, sans-serif" }}>
      <header style={{ borderBottom: '1px solid #e0e0d8', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
        <span style={{ fontWeight: 600, fontSize: '16px', color: '#0c0c0a', letterSpacing: '-.3px' }}>Webmify Studio</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="/blog" style={{ fontSize: '13px', color: '#78786e', textDecoration: 'none' }}>View blog</Link>
          <Link href="/api/studio/logout" style={{ fontSize: '13px', color: '#78786e', textDecoration: 'none' }}>Sign out</Link>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 400, letterSpacing: '-1.5px', marginBottom: '8px', color: '#0c0c0a' }}>Good to see you.</h1>
        <p style={{ fontSize: '14px', color: '#78786e', marginBottom: '40px' }}>What would you like to work on today?</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
          <Link href="/studio/posts" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: '1px solid #e0e0d8', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 400, letterSpacing: '-1.5px', color: '#0c0c0a', marginBottom: '6px' }}>{postCount || 0}</div>
              <div style={{ fontSize: '12px', color: '#78786e' }}>Total posts</div>
            </div>
          </Link>
          <Link href="/studio/subscribers" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: '1px solid #e0e0d8', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 400, letterSpacing: '-1.5px', color: '#0c0c0a', marginBottom: '6px' }}>{subCount || 0}</div>
              <div style={{ fontSize: '12px', color: '#78786e' }}>Subscribers</div>
            </div>
          </Link>
          <Link href="/studio/newsletter" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: '1px solid #e0e0d8', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 400, letterSpacing: '-1.5px', color: '#0c0c0a', marginBottom: '6px' }}>{nlCount || 0}</div>
              <div style={{ fontSize: '12px', color: '#78786e' }}>Newsletters sent</div>
            </div>
          </Link>
          <Link href="/studio/comments" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: `1px solid ${pending > 0 ? '#f0c33c' : '#e0e0d8'}`, borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 400, letterSpacing: '-1.5px', color: pending > 0 ? '#854d0e' : '#0c0c0a', marginBottom: '6px' }}>{pending}</div>
              <div style={{ fontSize: '12px', color: '#78786e' }}>Pending comments</div>
            </div>
          </Link>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
          <Link href="/studio/posts/new" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: '1px solid #e0e0d8', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#0c0c0a', marginBottom: '6px' }}>Write a new post</div>
              <div style={{ fontSize: '12px', color: '#78786e' }}>Start with a blank editor</div>
            </div>
          </Link>
          <Link href="/studio/newsletter" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: '1px solid #e0e0d8', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#0c0c0a', marginBottom: '6px' }}>Send a newsletter</div>
              <div style={{ fontSize: '12px', color: '#78786e' }}>Write and send to subscribers</div>
            </div>
          </Link>
          <Link href="/studio/comments" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: '1px solid #e0e0d8', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#0c0c0a', marginBottom: '6px' }}>Manage comments</div>
              <div style={{ fontSize: '12px', color: '#78786e' }}>{pending} pending approval</div>
            </div>
          </Link>
        </div>

        {/* Recent posts */}
        {recentPosts && recentPosts.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e0e0d8', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e0e0d8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0c0c0a', margin: 0 }}>Recent posts</h3>
              <Link href="/studio/posts" style={{ fontSize: '12px', color: '#78786e', textDecoration: 'none' }}>View all</Link>
            </div>
            {recentPosts.map((p, i) => (
              <Link key={p.id} href={`/studio/posts/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ padding: '14px 20px', borderBottom: i < recentPosts.length - 1 ? '1px solid #f0f0ea' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#0c0c0a' }}>{p.title}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase' as const, letterSpacing: '0.5px', background: p.status === 'published' ? '#dcfce7' : '#f1f1ec', color: p.status === 'published' ? '#166534' : '#78786e' }}>{p.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
