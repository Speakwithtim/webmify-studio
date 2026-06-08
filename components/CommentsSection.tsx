'use client'
import { useState, useEffect } from 'react'

type Comment = {
  id: string
  name: string
  message: string
  reply: string | null
  created_at: string
}

export default function CommentsSection({ postId, postSlug }: { postId: string; postSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`/api/comments?slug=${postSlug}`)
      .then(r => r.json())
      .then(data => setComments(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [postSlug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, post_slug: postSlug, name, email, message }),
      })
      if (res.ok) {
        setSubmitted(true)
        setName(''); setEmail(''); setMessage('')
      }
    } catch {}
    setSubmitting(false)
  }

  return (
    <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #e0e0d8' }}>
      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, letterSpacing: '-0.5px', marginBottom: '28px', color: '#0c0c0a' }}>
        {comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? 's' : ''}` : 'Comments'}
      </h3>

      {/* Approved comments */}
      {comments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
          {comments.map(c => (
            <div key={c.id}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e1e1a', color: '#f8f8f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0c0c0a' }}>{c.name}</span>
                    <span style={{ fontSize: '11px', color: '#b4b4a8' }}>{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#1e1e1a', lineHeight: 1.75, margin: 0 }}>{c.message}</p>
                  {c.reply && (
                    <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f8f8f5', borderLeft: '3px solid #b8944a', borderRadius: '0 6px 6px 0' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#b8944a', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Webmify</div>
                      <p style={{ fontSize: '13px', color: '#1e1e1a', lineHeight: 1.75, margin: 0 }}>{c.reply}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <div style={{ background: '#fff', border: '1px solid #e0e0d8', borderRadius: '12px', padding: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0c0c0a', margin: '0 0 16px' }}>Leave a comment</h4>
        {submitted ? (
          <div style={{ padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '14px', color: '#166534' }}>
            Thank you for your comment. It will appear after review.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#78786e', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} required placeholder="Your name"
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #e0e0d8', borderRadius: '7px', outline: 'none', fontFamily: 'inherit', background: '#fafaf8' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#78786e', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email * <span style={{ fontWeight: 400, textTransform: 'none' }}>(not published)</span></label>
                <input value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="your@email.com"
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #e0e0d8', borderRadius: '7px', outline: 'none', fontFamily: 'inherit', background: '#fafaf8' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#78786e', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Comment *</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4} placeholder="Share your thoughts..."
                style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #e0e0d8', borderRadius: '7px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, background: '#fafaf8' }} />
            </div>
            <button type="submit" disabled={submitting}
              style={{ padding: '10px 22px', background: '#0c0c0a', color: '#f8f8f5', border: 'none', borderRadius: '100px', fontSize: '13px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', alignSelf: 'flex-start', opacity: submitting ? 0.6 : 1 }}>
              {submitting ? 'Posting...' : 'Post comment'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
