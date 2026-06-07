'use client'
import { useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface EditorProps {
  value: string
  onChange: (val: string) => void
}

const B = ({ onClick, title, children, active }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean }) => (
  <button type="button" title={title} onMouseDown={e => { e.preventDefault(); onClick() }}
    style={{ display:'flex', alignItems:'center', justifyContent:'center', width:30, height:30, border:'1px solid #e0e0d8', borderRadius:6, background: active ? '#0c0c0a' : '#fff', color: active ? '#fff' : '#0c0c0a', cursor:'pointer', flexShrink:0 }}>
    {children}
  </button>
)

const Div = () => <span style={{ width:1, height:20, background:'#e0e0d8', flexShrink:0 }} />

export default function Editor({ value, onChange }: EditorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [floatMenu, setFloatMenu] = useState<{ show:boolean; x:number; y:number; mode:'format'|'link'; url:string }>({ show:false, x:0, y:0, mode:'format', url:'' })
  const [postPanel, setPostPanel] = useState(false)
  const [postQuery, setPostQuery] = useState('')
  const [postResults, setPostResults] = useState<any[]>([])
  const savedRange = useRef<Range | null>(null)

  const sync = () => { if (ref.current) onChange(ref.current.innerHTML) }
  const exec = (cmd: string, val?: string) => { ref.current?.focus(); document.execCommand(cmd, false, val); sync() }
  const block = (tag: string) => { ref.current?.focus(); document.execCommand('formatBlock', false, tag); sync() }

  const saveRange = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount) savedRange.current = sel.getRangeAt(0).cloneRange()
  }

  const restoreRange = () => {
    if (savedRange.current) {
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(savedRange.current)
    }
  }

  const handleSelect = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) { setFloatMenu(m => ({ ...m, show:false })); return }
    const rect = sel.getRangeAt(0).getBoundingClientRect()
    const ed = ref.current?.getBoundingClientRect()
    if (!ed) return
    saveRange()
    setFloatMenu({ show:true, x: rect.left - ed.left + rect.width/2, y: rect.top - ed.top - 52, mode:'format', url:'' })
  }, [])

  const applyLink = (url: string) => {
    restoreRange()
    ref.current?.focus()
    document.execCommand('createLink', false, url)
    // style the link
    const links = ref.current?.querySelectorAll('a:not([style])')
    links?.forEach(a => (a as HTMLElement).style.cssText = 'color:#b8944a;text-decoration:underline')
    sync()
    setFloatMenu(m => ({ ...m, show:false, mode:'format' }))
  }

  const searchPosts = async (q: string) => {
    if (!q.trim()) { setPostResults([]); return }
    const { data } = await supabase.from('posts').select('id,title,slug').ilike('title', `%${q}%`).eq('status','published').limit(6)
    setPostResults(data || [])
  }

  const insertPostLink = (slug: string, title: string) => {
    restoreRange()
    ref.current?.focus()
    document.execCommand('insertHTML', false, `<a href="https://webmify-studio.vercel.app/blog/${slug}" style="color:#b8944a;text-decoration:underline">${title}</a>`)
    sync()
    setPostPanel(false)
    setPostQuery('')
    setPostResults([])
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const name = `${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('post-images').upload(name, file)
      if (error) throw error
      const { data } = supabase.storage.from('post-images').getPublicUrl(name)
      ref.current?.focus()
      document.execCommand('insertHTML', false,
        `<figure style="margin:24px 0;text-align:center"><img src="${data.publicUrl}" style="max-width:100%;border-radius:8px;cursor:pointer" alt="" /><figcaption contenteditable="true" style="font-size:13px;color:#78786e;margin-top:8px;outline:none" data-placeholder="Caption..."></figcaption></figure><p><br></p>`
      )
      sync()
    } catch { alert('Upload failed. Make sure the post-images bucket exists in Supabase Storage.') }
    finally { setUploading(false) }
  }

  const svgB = <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M2 1h5.5a3.5 3.5 0 010 7H2V1zM2 8h6a3.5 3.5 0 010 7H2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
  const svgI = <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M4 1h6M2 13h6M8 1L4 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  const svgU = <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M2 1v5a4 4 0 008 0V1M1 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  const svgS = <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M9 4a3 3 0 00-6 0c0 2 6 2.5 6 5a3 3 0 01-6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M1 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  const svgH1 = <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><path d="M1 1v12M1 7h7M8 1v12M14 12V4l-2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  const svgH2 = <svg width="22" height="14" viewBox="0 0 22 14" fill="none"><path d="M1 1v12M1 7h7M8 1v12M14 4.5a2.5 2.5 0 014 2c0 1.5-1.5 2.5-4 5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  const svgH3 = <svg width="22" height="14" viewBox="0 0 22 14" fill="none"><path d="M1 1v12M1 7h7M8 1v12M14 4a2 2 0 013.5 1.5 1.8 1.8 0 01-1.5 2A2 2 0 0118 9.5 2.2 2.2 0 0114 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  const svgQ = <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="8" y="4" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M6 8c0 2-1 3-2 3.5M13 8c0 2-1 3-2 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
  const svgUL = <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="2" cy="3" r="1.2" fill="currentColor"/><circle cx="2" cy="7" r="1.2" fill="currentColor"/><circle cx="2" cy="11" r="1.2" fill="currentColor"/><path d="M5.5 3h7M5.5 7h7M5.5 11h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  const svgOL = <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 3h7M5.5 7h7M5.5 11h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 1.5v3M1.5 4.5H3M1.5 8a1 1 0 011-1 1 1 0 010 2 1 1 0 000 1.5H3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
  const svgHR = <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 4h3M10 4h3M5 7h4M1 10h3M10 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 7h0M12 7h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  const svgImg = <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="4.5" cy="5.5" r="1.2" fill="currentColor"/><path d="M1 9.5l3.5-3.5 2.5 2.5 2-2L13 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  const svgLink = <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 8.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-4.95L6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8.5 5.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 4.95L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  const svgSearch = <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h7M2 5h5M2 8h7M2 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="11" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.3"/><path d="M12.6 12.6l1.4 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>

  return (
    <div style={{ border:'1px solid #e0e0d8', borderRadius:12, overflow:'hidden', background:'#fff', position:'relative' }}>
      {/* Main toolbar */}
      <div style={{ display:'flex', gap:3, padding:'8px 10px', borderBottom:'1px solid #e0e0d8', background:'#f8f8f5', flexWrap:'wrap', alignItems:'center' }}>
        <B onClick={() => exec('bold')} title="Bold">{svgB}</B>
        <B onClick={() => exec('italic')} title="Italic">{svgI}</B>
        <B onClick={() => exec('underline')} title="Underline">{svgU}</B>
        <B onClick={() => exec('strikeThrough')} title="Strikethrough">{svgS}</B>
        <Div/>
        <B onClick={() => block('h1')} title="Heading 1">{svgH1}</B>
        <B onClick={() => block('h2')} title="Heading 2">{svgH2}</B>
        <B onClick={() => block('h3')} title="Heading 3">{svgH3}</B>
        <B onClick={() => block('blockquote')} title="Quote">{svgQ}</B>
        <Div/>
        <B onClick={() => exec('insertUnorderedList')} title="Bullet list">{svgUL}</B>
        <B onClick={() => exec('insertOrderedList')} title="Numbered list">{svgOL}</B>
        <Div/>
        <B onClick={() => { ref.current?.focus(); document.execCommand('insertHorizontalRule'); sync() }} title="Divider">{svgHR}</B>
        <B onClick={() => fileRef.current?.click()} title={uploading ? 'Uploading...' : 'Upload image'}>{uploading ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 4"><animateTransform attributeName="transform" type="rotate" from="0 7 7" to="360 7 7" dur="0.8s" repeatCount="indefinite"/></circle></svg> : svgImg}</B>
        <B onClick={() => { saveRange(); const url = prompt('Paste a URL:'); if (url) applyLink(url) }} title="Insert link">{svgLink}</B>
        <B onClick={() => { saveRange(); setPostPanel(p => !p) }} title="Link to a post" active={postPanel}>{svgSearch}</B>
      </div>

      {/* Post link search panel */}
      {postPanel && (
        <div style={{ padding:'10px 12px', borderBottom:'1px solid #e0e0d8', background:'#fafaf8' }}>
          <input autoFocus placeholder="Search published posts..." value={postQuery}
            onChange={e => { setPostQuery(e.target.value); searchPosts(e.target.value) }}
            style={{ width:'100%', padding:'8px 12px', fontSize:13, border:'1px solid #e0e0d8', borderRadius:8, outline:'none', background:'#fff' }} />
          {postResults.length > 0 && (
            <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:3 }}>
              {postResults.map(p => (
                <button key={p.id} type="button" onClick={() => insertPostLink(p.slug, p.title)}
                  style={{ padding:'7px 12px', fontSize:12, textAlign:'left', background:'#fff', border:'1px solid #e0e0d8', borderRadius:6, cursor:'pointer', color:'#0c0c0a' }}>
                  {p.title}
                </button>
              ))}
            </div>
          )}
          {postQuery && !postResults.length && <p style={{ fontSize:12, color:'#b4b4a8', marginTop:6 }}>No published posts found.</p>}
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value='' }} />

      {/* Floating selection menu */}
      {floatMenu.show && (
        <div style={{ position:'absolute', top:floatMenu.y, left:floatMenu.x, transform:'translateX(-50%)', background:'#0c0c0a', borderRadius:8, padding:'5px 6px', display:'flex', gap:3, alignItems:'center', zIndex:100, boxShadow:'0 4px 20px rgba(0,0,0,0.35)', flexWrap:'wrap', maxWidth:300 }}>
          {floatMenu.mode === 'format' ? (<>
            {[
              { svg: svgB, cmd: 'bold', title: 'Bold' },
              { svg: svgI, cmd: 'italic', title: 'Italic' },
              { svg: svgU, cmd: 'underline', title: 'Underline' },
            ].map(item => (
              <button key={item.cmd} type="button" title={item.title} onMouseDown={e => { e.preventDefault(); exec(item.cmd) }}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', width:28, height:28, border:'1px solid rgba(255,255,255,0.15)', borderRadius:5, background:'transparent', color:'#fff', cursor:'pointer' }}>
                {item.svg}
              </button>
            ))}
            <Div/>
            {[
              { svg: svgH1, tag: 'h1', title: 'H1' },
              { svg: svgH2, tag: 'h2', title: 'H2' },
              { svg: svgH3, tag: 'h3', title: 'H3' },
              { svg: svgQ, tag: 'blockquote', title: 'Quote' },
            ].map(item => (
              <button key={item.tag} type="button" title={item.title} onMouseDown={e => { e.preventDefault(); block(item.tag) }}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', width:28, height:28, border:'1px solid rgba(255,255,255,0.15)', borderRadius:5, background:'transparent', color:'#fff', cursor:'pointer' }}>
                {item.svg}
              </button>
            ))}
            <Div/>
            <button type="button" title="Link" onMouseDown={e => { e.preventDefault(); setFloatMenu(m => ({ ...m, mode:'link' })) }}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', width:28, height:28, border:'1px solid rgba(255,255,255,0.15)', borderRadius:5, background:'transparent', color:'#fff', cursor:'pointer' }}>
              {svgLink}
            </button>
          </>) : (
            <div style={{ display:'flex', gap:4, alignItems:'center' }}>
              <input autoFocus placeholder="https://..." value={floatMenu.url}
                onChange={e => setFloatMenu(m => ({ ...m, url: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyLink(floatMenu.url) } if (e.key === 'Escape') setFloatMenu(m => ({ ...m, mode:'format' })) }}
                style={{ padding:'5px 8px', fontSize:12, border:'1px solid rgba(255,255,255,0.2)', borderRadius:5, background:'rgba(255,255,255,0.1)', color:'#fff', outline:'none', width:180 }} />
              <button type="button" onMouseDown={e => { e.preventDefault(); applyLink(floatMenu.url) }}
                style={{ padding:'5px 10px', fontSize:12, fontWeight:600, background:'#b8944a', border:'none', borderRadius:5, color:'#fff', cursor:'pointer' }}>
                Apply
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content editable area */}
      <div ref={ref} contentEditable suppressContentEditableWarning
        onInput={sync} onMouseUp={handleSelect} onKeyUp={handleSelect}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            const sel = window.getSelection()
            const block = sel?.anchorNode?.parentElement?.closest('h1,h2,h3,blockquote')
            if (block) { e.preventDefault(); document.execCommand('insertParagraph'); document.execCommand('formatBlock', false, 'p'); sync() }
          }
        }}
        data-placeholder="Start writing..."
        style={{ minHeight:480, padding:'28px 32px', fontSize:16, lineHeight:1.85, fontFamily:"'Geist',system-ui,sans-serif", color:'#0c0c0a', outline:'none', background:'#fff' }}
      />

      <style>{`
        [contenteditable][data-placeholder]:empty:before{content:attr(data-placeholder);color:#c0c0b8;pointer-events:none}
        [contenteditable] h1{font-family:Georgia,serif;font-size:2.2rem;font-weight:400;letter-spacing:-1.5px;margin:1.4em 0 0.4em;line-height:1.1}
        [contenteditable] h2{font-size:1.5rem;font-weight:600;margin:1.2em 0 0.4em;letter-spacing:-.5px}
        [contenteditable] h3{font-size:1.2rem;font-weight:600;margin:1em 0 0.3em}
        [contenteditable] p{margin:0 0 .8em}
        [contenteditable] blockquote{border-left:3px solid #e0e0d8;padding:2px 0 2px 1em;color:#78786e;margin:1em 0;font-style:italic}
        [contenteditable] pre{background:#1e1e1a;color:#f8f8f5;padding:1em 1.2em;border-radius:8px;font-family:monospace;font-size:.9rem;overflow-x:auto;margin:1em 0}
        [contenteditable] ul{padding-left:1.4em;margin:.5em 0}
        [contenteditable] ol{padding-left:1.4em;margin:.5em 0}
        [contenteditable] li{margin:.2em 0}
        [contenteditable] a{color:#b8944a;text-decoration:underline}
        [contenteditable] hr{border:none;border-top:1px solid #e0e0d8;margin:2em 0}
        [contenteditable] img{max-width:100%;border-radius:8px}
        [contenteditable] figcaption:empty:before{content:'Add a caption...';color:#b4b4a8}
        @media(max-width:640px){
          [contenteditable]{padding:16px!important;font-size:15px!important;min-height:320px!important}
          [contenteditable] h1{font-size:1.7rem}
        }
      `}</style>
    </div>
  )
}
