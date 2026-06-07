'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StudioLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/studio/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/studio')
    } else {
      setError('Wrong password.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 300, letterSpacing: '-1.5px', marginBottom: '8px' }}>Webmify Studio</h1>
          <p style={{ fontSize: '13px', color: '#78786e', fontWeight: 300 }}>Your private creative workspace</p>
        </div>
        <form onSubmit={handleLogin} style={{ background: '#fff', border: '1px solid #e0e0d8', borderRadius: '14px', padding: '32px' }}>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#78786e', marginBottom: '6px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your studio password"
            required
            style={{ width: '100%', padding: '11px 14px', border: '1px solid #e0e0d8', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8f8f5', marginBottom: '16px', color: '#0c0c0a' }}
          />
          {error && <p style={{ fontSize: '12px', color: '#c44a2a', marginBottom: '12px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#0c0c0a', color: '#f8f8f5', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
            {loading ? 'Entering...' : 'Enter Studio'}
          </button>
        </form>
      </div>
    </div>
  )
}
