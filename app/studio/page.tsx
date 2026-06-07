import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StudioDashboard() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('studio_auth')
  if (!auth || auth.value !== 'true') redirect('/studio/login')

  const [{ count: postCount }, { count: subscriberCount }, { count: newsletterCount }, { data: recentPosts }] = await Promise.all([
    supabaseAdmin.from('posts').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('active', true),
    supabaseAdmin.from('newsletters').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
    supabaseAdmin.from('posts').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5' }}>
      <header style={{ borderBottom: '1px solid #e0e0d8', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 400, letterSpacing: '-0.5px' }}>Webmify Studio</span>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/blog" target="_blank" style={{ fontSize: '12px', color: '#78786e', textDecoration: 'none' }}>View blog</Link>
          <form action="/api/studio/logout" method="POST">
            <button type="submit" style={{ fontSize: '12px', color: '#78786e', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
          </form>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 300, letterSpacing: '-1.5px', marginBottom: '6px' }}>Good to see you.</h1>
          <p style={{ fontSize: '13px', color: '#78786e', fontWeight: 300 }}>What would you like to work on today?</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'Total posts', value: postCount || 0 },
            { label: 'Subscribers', value: subscriberCount || 0 },
            { label: 'Newsletters sent', value: newsletterCount || 0 },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', border: '1px solid #e0e0d8', borderRadius: '12px', padding: '28px' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: 300, letterSpacing: '-2px', marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: '#78786e', letterSpacing: '0.5px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '48px' }}>
          {[
            { href: '/studio/posts/new', label: 'Write a new post', desc: 'Start with a blank editor' },
            { href: '/studio/newsletter', label: 'Send a newsletter', desc: 'Write and send to subscribers' },
            { href: '/studio/subscribers', label: 'View subscribers', desc: 'See who is following you' },
          ].map(action => (
            <Link key={action.href} href={action.href} style={{ display: 'block', background: '#fff', border: '1px solid #e0e0d8', borderRadius: '12px', padding: '24px', textDecoration: 'none' }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#0c0c0a', marginBottom: '4px' }}>{action.label}</div>
              <div style={{ fontSize: '12px', color: '#78786e', fontWeight: 300 }}>{action.desc}</div>
            </Link>
          ))}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px', color: '#0c0c0a' }}>Recent posts</h2>
            <Link href="/studio/posts" style={{ fontSize: '12px', color: '#78786e', textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e0e0d8', borderRadius: '12px', overflow: 'hidden' }}>
            {!recentPosts || recentPosts.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#b4b4a8', fontSize: '13px' }}>No posts yet. Write your first one.</div>
            ) : recentPosts.map((post: any, i: number) => (
              <Link key={post.id} href={`/studio/posts/${post.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: i < recentPosts.length - 1 ? '1px solid #e0e0d8' : 'none', textDecoration: 'none' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#0c0c0a' }}>{post.title}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '100px', background: post.status === 'published' ? '#dcfce7' : '#f1f1ec', color: post.status === 'published' ? '#166534' : '#78786e' }}>{post.status}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
