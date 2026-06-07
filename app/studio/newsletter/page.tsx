'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function NewsletterPage() {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('# Newsletter title\n\nWrite your newsletter here...')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [preview, setPreview] = useState(false)

  async function handleSend() {
    if (!subject || !content) return alert('Subject and content are required.')
    if (!confirm(`Send this newsletter to all subscribers?`)) return
    setSending(true)
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, content }),
    })
    if (res.ok) {
      setSent(true)
      setSending(false)
    } else {
      alert('Error sending newsletter.')
      setSending(false)
    }
  }

  if (sent) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f5' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 300, letterSpacing: '-1px', marginBottom: '8px' }}>Newsletter sent.</h2>
        <p style={{ fontSize: '13px', color: '#78786e', marginBottom: '24px' }}>Your subscribers have been notified.</p>
        <a href="/studio" style={{ fontSize: '13px', color: '#0c0c0a', fontWeight: 500 }}>Back to studio</a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5' }}>
      <header style={{ borderBottom: '1px solid #e0e0d8', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/studio" style={{ fontSize: '12px', color: '#78786e', textDecoration: 'none' }}>Studio</a>
          <span style={{ color: '#e0e0d8' }}>/</span>
          <span style={{ fontSize: '13px', color: '#0c0c0a', fontWeight: 500 }}>Newsletter</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setPreview(!preview)} style={{ padding: '8px 18px', border: '1px solid #e0e0d8', borderRadius: '100px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', background: '#fff', color: '#0c0c0a' }}>{preview ? 'Edit' : 'Preview'}</button>
          <button onClick={handleSend} disabled={sending} style={{ padding: '8px 20px', background: '#0c0c0a', color: '#f8f8f5', border: 'none', borderRadius: '100px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>{sending ? 'Sending...' : 'Send to all subscribers'}</button>
        </div>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject line..." style={{ width: '100%', fontSize: '20px', fontWeight: 500, letterSpacing: '-0.5px', border: 'none', outline: 'none', background: 'transparent', color: '#0c0c0a', marginBottom: '24px', borderBottom: '1px solid #e0e0d8', paddingBottom: '16px' }} />

        {!preview ? (
          <div data-color-mode="light">
            <MDEditor value={content} onChange={v => setContent(v || '')} height={500} preview="edit" />
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e0e0d8', borderRadius: '12px', padding: '40px' }}>
            <div style={{ borderBottom: '1px solid #e0e0d8', paddingBottom: '20px', marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', color: '#b4b4a8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>The Webmify Edit</p>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0c0c0a' }}>{subject}</h2>
            </div>
            <div className="prose" style={{ fontSize: '15px', lineHeight: 1.8, color: '#1e1e1a' }}>{content}</div>
          </div>
        )}
      </main>
    </div>
  )
}
