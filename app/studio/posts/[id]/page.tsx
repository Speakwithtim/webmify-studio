'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'

const CATEGORIES = ['General', 'Product', 'Development', 'Strategy', 'Design', 'SEO', 'Business']

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [post, setPost] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('General')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDesc, setSeoDesc] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [status, setStatus] = useState('draft')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showSEO, setShowSEO] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<string>('')

  useEffect(() => {
    fetch(`/api/posts/${id}`).then(r => r.json()).then(p => {
      if (!p || p.error) return
      setPost(p)
      setTitle(p.title || '')
      setSlug(p.slug || '')
      setExcerpt(p.excerpt || '')
      setCategory(p.category || 'General')
      setSeoTitle(p.seo_title || '')
      setSeoDesc(p.seo_description || '')
      setOgImage(p.cover_image || '')
      setStatus(p.status || 'draft')
      contentRef.current = p.content || ''
      setLoaded(true)
    })
  }, [id])

  // Set editor content after load - only once
  useEffect(() => {
    if (loaded && editorRef.current && contentRef.current) {
      editorRef.current.innerHTML = contentRef.current
    }
  }, [loaded])

  function getContent() {
    const live = editorRef.current?.innerHTML || ''
    // Never save empty content if we had content before
    if (!live || live === '<br>' || live.trim() === '') {
      return contentRef.current
    }
    return live
  }

  async function handleSave(s: string) {
    setSaving(true)
    const content = getContent()
    if (!content || content.trim() === '') {
      alert('Content is empty. Save cancelled to prevent data loss.')
      setSaving(false)
      return
    }
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, slug, content, excerpt, category,
        cover_image: ogImage,
        seo_title: seoTitle || title,
        seo_description: seoDesc || excerpt,
        status: s,
        published_at: s === 'published' && !post?.published_at ? new Date().toISOString() : post?.published_at,
        updated_at: new Date().toISOString(),
      }),
    })
    if (res.ok) {
      contentRef.current = content
      setPost((p: any) => ({ ...p, status: s }))
      setSaving(false)
      alert('Saved successfully.')
    } else {
      alert('Error saving.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post permanently? This cannot be undone.')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    router.push('/studio/posts')
  }

  async function uploadImg(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      if (!ogImage) setOgImage(json.url)
      if (editorRef.current) {
        editorRef.current.focus()
        document.execCommand('insertHTML', false, `<figure style="margin:16px 0;text-align:center"><img src="${json.url}" alt="" style="max-width:100%;border-radius:8px"/></figure>`)
        contentRef.current = editorRef.current.innerHTML
      }
    } catch (e: any) { alert('Upload failed: ' + e.message) }
    finally { setUploading(false) }
  }

  if (!loaded) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78786e', fontSize: 14, fontFamily: 'system-ui', background: '#f0f0f1' }}>
      Loading post...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f1', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ background: '#1d2327', height: 32, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>
        <a href="/studio/posts" style={{ fontSize: 12, color: 'rgba(240,246,252,.7)', textDecoration: 'none' }}>← Posts</a>
        <span style={{ fontSize: 12, color: 'rgba(240,246,252,.4)' }}>Edit Post</span>
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid #dcdcde', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#1d2327', margin: 0 }}>Edit Post</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {post?.status === 'published' && (
            <a href={`/blog/${slug}`} target="_blank" style={{ fontSize: 12, color: '#2271b1', textDecoration: 'none', padding: '6px 10px', border: '1px solid #dcdcde', borderRadius: 3, background: '#fff' }}>View live</a>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, padding: 20, maxWidth: 1200, margin: '0 auto' }}>
        <div>
          {/* Title */}
          <div style={{ background: '#fff', border: '1px solid #dcdcde', borderRadius: 4, marginBottom: 16 }}>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title"
              style={{ width: '100%', padding: '12px 16px', fontSize: 22, fontWeight: 600, border: 'none', outline: 'none', borderBottom: '1px solid #f0f0f1', color: '#1d2327', fontFamily: 'inherit', borderRadius: '4px 4px 0 0' }} />
            <div style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#646970' }}>Permalink: studio.webmify.site/blog/</span>
              <input value={slug} onChange={e => setSlug(e.target.value)} style={{ fontSize: 12, border: '1px solid #dcdcde', borderRadius: 3, padding: '2px 6px', outline: 'none', color: '#2271b1', minWidth: 100 }} />
            </div>
          </div>

          {/* Editor */}
          <div style={{ background: '#fff', border: '1px solid #dcdcde', borderRadius: 4, marginBottom: 16 }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f1', display: 'flex', alignItems: 'center', gap: 8 }}>
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, border: '1px solid #dcdcde', borderRadius: 3, background: '#f6f7f7', color: '#1d2327', cursor: 'pointer' }}>
                {uploading ? 'Uploading...' : '+ Add Media'}
              </button>
            </div>

            {/* Toolbar */}
            <div style={{ padding: '6px 10px', borderBottom: '1px solid #f0f0f1', display: 'flex', gap: 3, flexWrap: 'wrap', background: '#f6f7f7' }}>
              {[
                { label: 'B', cmd: 'bold', style: { fontWeight: 700 } },
                { label: 'I', cmd: 'italic', style: { fontStyle: 'italic' } },
                { label: 'U', cmd: 'underline', style: { textDecoration: 'underline' } },
              ].map(b => (
                <button key={b.cmd} type="button" onMouseDown={e => { e.preventDefault(); document.execCommand(b.cmd); if(editorRef.current) contentRef.current = editorRef.current.innerHTML }}
                  style={{ ...b.style, minWidth: 30, height: 28, padding: '0 8px', border: '1px solid #dcdcde', borderRadius: 3, background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                  {b.label}
                </button>
              ))}
              <span style={{ width: 1, height: 20, background: '#dcdcde', margin: '4px 2px' }} />
              {['h1','h2','h3'].map(tag => (
                <button key={tag} type="button" onMouseDown={e => { e.preventDefault(); document.execCommand('formatBlock', false, tag); if(editorRef.current) contentRef.current = editorRef.current.innerHTML }}
                  style={{ minWidth: 30, height: 28, padding: '0 8px', border: '1px solid #dcdcde', borderRadius: 3, background: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                  {tag}
                </button>
              ))}
              <span style={{ width: 1, height: 20, background: '#dcdcde', margin: '4px 2px' }} />
              <button type="button" onMouseDown={e => { e.preventDefault(); const u = prompt('URL:'); if (u) { document.execCommand('createLink', false, u); if(editorRef.current) contentRef.current = editorRef.current.innerHTML } }}
                style={{ minWidth: 30, height: 28, padding: '0 8px', border: '1px solid #dcdcde', borderRadius: 3, background: '#fff', cursor: 'pointer', fontSize: 11 }}>
                Link
              </button>
              <button type="button" onMouseDown={e => { e.preventDefault(); document.execCommand('insertUnorderedList'); if(editorRef.current) contentRef.current = editorRef.current.innerHTML }}
                style={{ minWidth: 30, height: 28, padding: '0 8px', border: '1px solid #dcdcde', borderRadius: 3, background: '#fff', cursor: 'pointer', fontSize: 11 }}>
                UL
              </button>
            </div>

            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={() => { if(editorRef.current) contentRef.current = editorRef.current.innerHTML }}
              data-placeholder="Start writing..."
              style={{ padding: '16px', minHeight: 400, fontSize: 15, lineHeight: 1.8, color: '#1e1e1e', outline: 'none' }}
            />

            <div style={{ padding: '6px 16px', borderTop: '1px solid #f0f0f1', background: '#f6f7f7', fontSize: 12, color: '#646970' }}>
              Last saved: {post?.updated_at ? new Date(post.updated_at).toLocaleString() : 'Not yet'}
            </div>
          </div>

          {/* Excerpt */}
          <div style={{ background: '#fff', border: '1px solid #dcdcde', borderRadius: 4, padding: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1d2327', margin: '0 0 8px' }}>Excerpt</h3>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3}
              style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #dcdcde', borderRadius: 3, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
          </div>

          {/* SEO */}
          <div style={{ background: '#fff', border: '1px solid #dcdcde', borderRadius: 4, marginBottom: 16 }}>
            <div onClick={() => setShowSEO(s => !s)} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1d2327', margin: 0 }}>SEO Settings</h3>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ transform: showSEO ? 'rotate(180deg)' : 'none', transition: '.2s' }}><path d="M1 1l5 5 5-5" stroke="#646970" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            {showSEO && (
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f0f0f1', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ paddingTop: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1d2327', marginBottom: 5 }}>SEO Title</label>
                  <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={title} style={{ width: '100%', padding: '6px 10px', fontSize: 13, border: '1px solid #dcdcde', borderRadius: 3, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1d2327', marginBottom: 5 }}>Meta Description</label>
                  <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} rows={3} style={{ width: '100%', padding: '6px 10px', fontSize: 13, border: '1px solid #dcdcde', borderRadius: 3, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1d2327', marginBottom: 5 }}>Cover / OG Image URL</label>
                  <input value={ogImage} onChange={e => setOgImage(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '6px 10px', fontSize: 13, border: '1px solid #dcdcde', borderRadius: 3, outline: 'none' }} />
                  {ogImage && <img src={ogImage} alt="" style={{ marginTop: 8, width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 4 }} />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #dcdcde', borderRadius: 4 }}>
            <div style={{ background: '#f6f7f7', padding: '8px 12px', borderBottom: '1px solid #dcdcde', borderRadius: '4px 4px 0 0' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1d2327', margin: 0 }}>Publish</h3>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <button onClick={() => handleSave('draft')} disabled={saving} style={{ flex: 1, padding: '6px 10px', fontSize: 12, fontWeight: 600, border: '1px solid #dcdcde', borderRadius: 3, background: '#f6f7f7', color: '#1d2327', cursor: 'pointer' }}>Save Draft</button>
                <button onClick={() => setShowPreview(p => !p)} style={{ flex: 1, padding: '6px 10px', fontSize: 12, fontWeight: 600, border: '1px solid #dcdcde', borderRadius: 3, background: '#f6f7f7', color: '#1d2327', cursor: 'pointer' }}>Preview</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#646970' }}>Status:</span>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: post?.status === 'published' ? '#dcfce7' : '#f1f1ec', color: post?.status === 'published' ? '#166534' : '#78786e' }}>{post?.status}</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f0f0f1', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={handleDelete} style={{ fontSize: 12, color: '#d63638', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                <button onClick={() => handleSave('published')} disabled={saving} style={{ padding: '6px 14px', background: '#2271b1', color: '#fff', border: '1px solid #135e96', borderRadius: 3, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'Saving...' : post?.status === 'published' ? 'Update' : 'Publish'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #dcdcde', borderRadius: 4 }}>
            <div style={{ background: '#f6f7f7', padding: '8px 12px', borderBottom: '1px solid #dcdcde', borderRadius: '4px 4px 0 0' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1d2327', margin: 0 }}>Category</h3>
            </div>
            <div style={{ padding: '8px 12px' }}>
              {CATEGORIES.map(c => (
                <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13, color: '#1d2327', cursor: 'pointer' }}>
                  <input type="radio" name="category" value={c} checked={category === c} onChange={() => setCategory(c)} />
                  {c}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, overflow: 'auto' }}>
          <div style={{ maxWidth: 720, margin: '40px auto', background: '#fff', borderRadius: 8, padding: '40px 36px 60px', position: 'relative' }}>
            <button onClick={() => setShowPreview(false)} style={{ position: 'absolute', top: 16, right: 16, background: '#1d2327', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}>Close</button>
            {ogImage && <img src={ogImage} style={{ width: '100%', borderRadius: 8, marginBottom: 24, objectFit: 'cover', maxHeight: 320 }} alt="" />}
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 400, letterSpacing: '-1.5px', margin: '0 0 16px', lineHeight: 1.15 }}>{title}</h1>
            {excerpt && <p style={{ fontSize: 16, color: '#646970', lineHeight: 1.8, marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid #e0e0d8' }}>{excerpt}</p>}
            <div style={{ fontSize: 16, lineHeight: 1.85 }} dangerouslySetInnerHTML={{ __html: contentRef.current }} />
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImg(f); e.target.value = '' }} />

      <style>{`
        [contenteditable]:empty:before{content:attr(data-placeholder);color:#c3c4c7;pointer-events:none}
        [contenteditable] h1{font-family:Georgia,serif;font-size:26px;font-weight:400;margin:12px 0 6px}
        [contenteditable] h2{font-size:20px;font-weight:600;margin:10px 0 5px}
        [contenteditable] h3{font-size:17px;font-weight:600;margin:8px 0 4px}
        [contenteditable] a{color:#2271b1}
        [contenteditable] ul{padding-left:1.5em}
        [contenteditable] img{max-width:100%;border-radius:8px}
        [contenteditable] strong{font-weight:700}
        [contenteditable] em{font-style:italic}
      `}</style>
    </div>
  )
}
