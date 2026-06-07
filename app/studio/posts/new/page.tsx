'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const CATEGORIES = ['General', 'Product', 'Development', 'Strategy', 'Design', 'SEO', 'Business']

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('# Your post title here\n\nStart writing your post...')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('General')
  const [coverImage, setCoverImage] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDesc, setSeoDesc] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'write' | 'seo'>('write')

  function generateSlug(t: string) {
    return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  async function handleSave(s: 'draft' | 'published') {
    if (!title || !content) return alert('Title and content are required.')
    setSaving(true)
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug: slug || generateSlug(title),
        content,
        excerpt,
        category,
        cover_image: coverImage,
        seo_title: seoTitle,
        seo_description: seoDesc,
        status: s,
        published_at: s === 'published' ? new Date().toISOString() : null,
      }),
    })
    if (res.ok) {
      const post = await res.json()
      router.push(`/studio/posts/${post.id}`)
    } else {
      alert('Error saving post.')
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5' }}>
      <header style={{ borderBottom: '1px solid #e0e0d8', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/studio/posts" style={{ fontSize: '12px', color: '#78786e', textDecoration: 'none' }}>Posts</a>
          <span style={{ color: '#e0e0d8' }}>/</span>
          <span style={{ fontSize: '13px', color: '#0c0c0a', fontWeight: 500 }}>New post</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleSave('draft')} disabled={saving} style={{ padding: '8px 18px', border: '1px solid #e0e0d8', borderRadius: '100px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', background: '#fff', color: '#0c0c0a' }}>Save draft</button>
          <button onClick={() => handleSave('published')} disabled={saving} style={{ padding: '8px 20px', background: '#0c0c0a', color: '#f8f8f5', border: 'none', borderRadius: '100px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>Publish</button>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        <input value={title} onChange={e => { setTitle(e.target.value); if (!slug) setSlug(generateSlug(e.target.value)) }} placeholder="Post title" style={{ width: '100%', fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 400, letterSpacing: '-1.5px', border: 'none', outline: 'none', background: 'transparent', color: '#0c0c0a', marginBottom: '8px' }} />

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: '#78786e', fontWeight: 500 }}>Slug:</label>
            <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="post-url-slug" style={{ fontSize: '12px', border: '1px solid #e0e0d8', borderRadius: '6px', padding: '4px 10px', outline: 'none', background: '#f8f8f5', color: '#0c0c0a', width: '200px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: '#78786e', fontWeight: 500 }}>Category:</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ fontSize: '12px', border: '1px solid #e0e0d8', borderRadius: '6px', padding: '4px 10px', outline: 'none', background: '#f8f8f5', color: '#0c0c0a' }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderBottom: '1px solid #e0e0d8' }}>
          {(['write', 'seo'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', fontSize: '12px', fontWeight: 500, background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #0c0c0a' : '2px solid transparent', cursor: 'pointer', color: tab === t ? '#0c0c0a' : '#78786e', textTransform: 'capitalize' }}>{t === 'write' ? 'Write' : 'SEO'}</button>
          ))}
        </div>

        {tab === 'write' && (
          <div>
            <div data-color-mode="light" style={{ marginBottom: '20px' }}>
              <MDEditor value={content} onChange={v => setContent(v || '')} height={500} preview="live" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#78786e', marginBottom: '6px' }}>Excerpt</label>
              <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="A short summary shown on the blog listing..." rows={3} style={{ width: '100%', padding: '11px 14px', border: '1px solid #e0e0d8', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', resize: 'vertical', fontFamily: 'inherit', marginBottom: '16px' }} />
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#78786e', marginBottom: '6px' }}>Cover image URL</label>
              <input value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '11px 14px', border: '1px solid #e0e0d8', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff' }} />
            </div>
          </div>
        )}

        {tab === 'seo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#78786e', marginBottom: '6px' }}>SEO Title</label>
              <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={title || 'SEO optimised title...'} style={{ width: '100%', padding: '11px 14px', border: '1px solid #e0e0d8', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#78786e', marginBottom: '6px' }}>SEO Description</label>
              <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="What this post is about (150 characters ideal)..." rows={3} style={{ width: '100%', padding: '11px 14px', border: '1px solid #e0e0d8', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div style={{ background: '#f1f1ec', border: '1px solid #e0e0d8', borderRadius: '10px', padding: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#78786e', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>Google preview</p>
              <p style={{ fontSize: '16px', color: '#1a0dab', marginBottom: '4px' }}>{seoTitle || title || 'Your post title'}</p>
              <p style={{ fontSize: '12px', color: '#006621', marginBottom: '4px' }}>webmify.site/blog/{slug || 'post-slug'}</p>
              <p style={{ fontSize: '13px', color: '#545454' }}>{seoDesc || excerpt || 'Your meta description will appear here...'}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
