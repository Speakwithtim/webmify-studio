import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SubscribersPage() {
  const { data: subscribers } = await supabaseAdmin.from('subscribers').select('*').order('subscribed_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5' }}>
      <header style={{ borderBottom: '1px solid #e0e0d8', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/studio" style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 400, letterSpacing: '-0.5px', textDecoration: 'none', color: '#0c0c0a' }}>Webmify Studio</Link>
        <span style={{ fontSize: '13px', color: '#78786e' }}>{subscribers?.length || 0} subscribers</span>
      </header>
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 300, letterSpacing: '-1px', marginBottom: '32px' }}>Subscribers</h1>
        <div style={{ background: '#fff', border: '1px solid #e0e0d8', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', padding: '12px 20px', background: '#f8f8f5', borderBottom: '1px solid #e0e0d8' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#78786e' }}>Email</span>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#78786e' }}>Name</span>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#78786e' }}>Subscribed</span>
          </div>
          {!subscribers || subscribers.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#b4b4a8', fontSize: '13px' }}>No subscribers yet.</div>
          ) : subscribers.map((s: any, i: number) => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', padding: '14px 20px', borderBottom: i < subscribers.length - 1 ? '1px solid #e0e0d8' : 'none', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#0c0c0a' }}>{s.email}</span>
              <span style={{ fontSize: '13px', color: '#78786e' }}>{s.name || ''}</span>
              <span style={{ fontSize: '11px', color: '#b4b4a8' }}>{new Date(s.subscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
