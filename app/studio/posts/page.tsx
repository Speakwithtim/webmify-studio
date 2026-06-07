import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('studio_auth')
  if (!auth || auth.value !== 'true') redirect('/studio/login')

  const { data: posts } = await supabaseAdmin
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5' }}>
      <header style={{ borderBottom: '1px solid #e0e0d8', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/studio" style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 400, letterSpacing: '-0.5px', textDecoration: 'none', color: '#0c0c0a' }}>Webmify Studio</Link>
        <Link href="/studio/posts/new" style={{ padding: '8px 20px', background: '#0c0c0a', color: '#f8f8f5', borderRadius: '100px', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}>New post</Link>
      </header>
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 300, letterSpacing: '-1px', marginBottom: '32px' }}>All posts</h1>
        <div style={{ background: '#fff', border: '1px solid #e0e0d8', borderRadius: '12px', overflow: 'hidden' }}>
          {!posts || posts.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#b4b4a8' }}>
              <p style={{ marginBottom: '16px', fontSize: '14px' }}>No posts yet.</p>
              <Link href="/studio/posts/new" style={{ fontSize: '13px', color: '#0c0c0a', fontWeight: 500 }}>Write your first post</Link>
            </div>
          ) : posts.map((post: any, i: number) => (
            <Link key={post.id} href={`/studio/posts/${post.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: i < posts.length - 1 ? '1px solid #e0e0d8' : 'none', textDecoration: 'none' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#0c0c0a', marginBottom: '3px' }}>{post.title}</div>
                <div style={{ fontSize: '11px', color: '#b4b4a8' }}>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '100px', background: post.status === 'published' ? '#dcfce7' : '#f1f1ec', color: post.status === 'published' ? '#166534' : '#78786e' }}>{post.status}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
