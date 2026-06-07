'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, supabaseAdmin } from '@/lib/supabase'

const CATEGORIES = ['General', 'Product', 'Development', 'Strategy', 'Design', 'SEO', 'Business']
function uid() { return Math.random().toString(36).slice(2, 9) }

const Icon = {
  bold: <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M2 1h5.5a3 3 0 010 6H2V1zM2 7h6a3 3 0 010 6H2V7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  italic: <svg width="11" height="14" viewBox="0 0 11 14" fill="none"><path d="M3 1h6M2 13h6M7.5 1L3.5 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  underline: <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M2 1v5a4 4 0 008 0V1M1 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  strike: <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M9 4a3 3 0 00-6 0c0 1.5 1 2.5 3 3M1 7h10M3 10c0 1.5 1.5 3 3 3s3-1 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  ul: <svg width="14" height="13" viewBox="0 0 14 13" fill="none"><circle cx="2" cy="2.5" r="1.2" fill="currentColor"/><circle cx="2" cy="6.5" r="1.2" fill="currentColor"/><circle cx="2" cy="10.5" r="1.2" fill="currentColor"/><path d="M5.5 2.5h7M5.5 6.5h7M5.5 10.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  ol: <svg width="14" height="13" viewBox="0 0 14 13" fill="none"><path d="M5.5 2.5h7M5.5 6.5h7M5.5 10.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M2 1.5v3M1.5 4.5H3M1.5 8a1 1 0 011-1 1 1 0 010 2 1 1 0 000 1.5H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  quote: <svg width="13" height="12" viewBox="0 0 13 12" fill="none"><path d="M1 1h4v4H1V1zM8 1h4v4H8V1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 5c0 2-1 3-2 4M12 5c0 2-1 3-2 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  link: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 8.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L6 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M8.5 5.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5L8 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  image: <svg width="14" height="13" viewBox="0 0 14 13" fill="none"><rect x="1" y="1.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="4.5" cy="5" r="1.2" fill="currentColor"/><path d="M1 9.5l3-3 2.5 2.5 2-2 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  hr: <svg width="14" height="13" viewBox="0 0 14 13" fill="none"><path d="M2 6.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  search: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  upload: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 12V3M6 6l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 13v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  trash: <svg width="13" height="14" viewBox="0 0 13 14" fill="none"><path d="M1.5 3.5h10M4.5 3.5V2a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1.5M5 6v5M8 6v5M2.5 3.5l.5 9h7l.5-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

function TBtn({ onClick, title, children, active }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean }) {
  return (
    <button type="button" title={title} onMouseDown={e => { e.preventDefault(); onClick() }}
      style={{ display:'flex', alignItems:'center', justifyContent:'center', minWidth:30, height:28, padding:'0 6px', border:'1px solid', borderColor:active?'#2271b1':'#dcdcde', borderRadius:3, background:active?'#2271b1':'#fff', color:active?'#fff':'#1e1e1e', cursor:'pointer', flexShrink:0 }}>
      {children}
    </button>
  )
}
function Sep() { return <span style={{ width:1, height:20, background:'#dcdcde', margin:'0 2px', flexShrink:0 }} /> }

type BlockType = 'paragraph'|'h1'|'h2'|'h3'|'quote'|'ul'|'ol'|'hr'|'image'
type Block = { id:string; type:BlockType; text:string; src?:string; alt?:string; caption?:string; align?:string }

// ── Stable editable block - no re-render while typing ─────────────────────
function EditableBlock({ block, onInput, onFocus, onEnter, onBackspace, style }: {
  block: Block
  onInput: (id: string, html: string) => void
  onFocus: (id: string) => void
  onEnter: (id: string) => void
  onBackspace: (id: string) => void
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLElement>(null)
  const focused = useRef(false)
  const initialHtml = useRef(block.text)

  // Only set innerHTML on mount
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialHtml.current
  }, [])

  const tagStyles: Record<string, React.CSSProperties> = {
    h1: { fontFamily:'Georgia,serif', fontSize:26, fontWeight:400, letterSpacing:'-.5px', lineHeight:1.2 },
    h2: { fontSize:20, fontWeight:600, lineHeight:1.3 },
    h3: { fontSize:17, fontWeight:600, lineHeight:1.35 },
    quote: { borderLeft:'4px solid #dcdcde', paddingLeft:'1em', color:'#646970', fontStyle:'italic' },
    paragraph: { fontSize:15, lineHeight:1.8, color:'#1e1e1e' },
    ul: { fontSize:15, lineHeight:1.8, paddingLeft:'1.5em', listStyleType:'disc' as const },
    ol: { fontSize:15, lineHeight:1.8, paddingLeft:'1.5em', listStyleType:'decimal' as const },
  }

  const ph: Record<string,string> = { h1:'Heading 1', h2:'Heading 2', h3:'Heading 3', quote:'Quote...', ul:'List item...', ol:'List item...', paragraph:'Start writing...' }

  const Tag = (block.type === 'ul' ? 'ul' : block.type === 'ol' ? 'ol' : block.type === 'quote' ? 'blockquote' : block.type === 'paragraph' ? 'p' : block.type) as any

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={ph[block.type] || ''}
      onFocus={() => { focused.current = true; onFocus(block.id) }}
      onBlur={() => { focused.current = false }}
      onInput={(e: any) => onInput(block.id, e.currentTarget.innerHTML)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && block.type !== 'ul' && block.type !== 'ol') {
          e.preventDefault()
          onEnter(block.id)
        }
        if (e.key === 'Backspace') {
          const el = ref.current
          if (el && (el as any).innerText.trim() === '') {
            e.preventDefault()
            onBackspace(block.id)
          }
        }
      }}
      style={{ outline:'none', minHeight:28, width:'100%', margin:'4px 0', ...style, ...(tagStyles[block.type] || tagStyles.paragraph) }}
    />
  )
}

function ImageBlock({ block, onUpdate, onRemove }: { block:Block; onUpdate:(d:Partial<Block>)=>void; onRemove:()=>void }) {
  const [editing, setEditing] = useState(false)
  const [alt, setAlt] = useState(block.alt||'')
  const [cap, setCap] = useState(block.caption||'')
  const [align, setAlign] = useState(block.align||'center')
  return (
    <div style={{ margin:'12px 0', position:'relative', border:'1px solid #dcdcde', borderRadius:4, overflow:'hidden' }}>
      <img src={block.src} alt={alt} style={{ width:'100%', display:'block', maxHeight:400, objectFit:'cover' }} />
      {cap && <p style={{ textAlign:'center', fontSize:13, color:'#646970', margin:'6px 0', fontStyle:'italic' }}>{cap}</p>}
      <div style={{ position:'absolute', top:8, right:8, display:'flex', gap:4 }}>
        <button type="button" onClick={() => setEditing(e=>!e)} style={{ padding:'4px 8px', fontSize:11, fontWeight:600, background:'rgba(0,0,0,.7)', color:'#fff', border:'none', borderRadius:3, cursor:'pointer' }}>Edit</button>
        <button type="button" onClick={onRemove} style={{ padding:'4px 6px', background:'rgba(196,74,42,.9)', color:'#fff', border:'none', borderRadius:3, cursor:'pointer', display:'flex' }}>{Icon.trash}</button>
      </div>
      {editing && (
        <div style={{ padding:16, background:'#f6f7f7', borderTop:'1px solid #dcdcde' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div><label style={{ fontSize:12, fontWeight:500, display:'block', marginBottom:4 }}>Alt text (SEO)</label>
              <input value={alt} onChange={e=>setAlt(e.target.value)} style={{ width:'100%', padding:'6px 8px', fontSize:13, border:'1px solid #dcdcde', borderRadius:3, outline:'none' }}/></div>
            <div><label style={{ fontSize:12, fontWeight:500, display:'block', marginBottom:4 }}>Caption</label>
              <input value={cap} onChange={e=>setCap(e.target.value)} style={{ width:'100%', padding:'6px 8px', fontSize:13, border:'1px solid #dcdcde', borderRadius:3, outline:'none' }}/></div>
            <div><label style={{ fontSize:12, fontWeight:500, display:'block', marginBottom:6 }}>Alignment</label>
              <div style={{ display:'flex', gap:4 }}>
                {(['left','center','right','full'] as const).map(a => (
                  <button key={a} type="button" onClick={()=>setAlign(a)} style={{ padding:'4px 10px', fontSize:11, fontWeight:600, border:'1px solid', borderColor:align===a?'#2271b1':'#dcdcde', borderRadius:3, background:align===a?'#2271b1':'#fff', color:align===a?'#fff':'#1e1e1e', cursor:'pointer', textTransform:'capitalize' }}>{a}</button>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => { onUpdate({alt,caption:cap,align}); setEditing(false) }} style={{ padding:'6px 14px', background:'#2271b1', color:'#fff', border:'none', borderRadius:3, fontSize:12, fontWeight:600, cursor:'pointer', alignSelf:'flex-start' }}>Save</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('General')
  const [blocks, setBlocks] = useState<Block[]>([{id:uid(),type:'paragraph',text:''}])
  const [excerpt, setExcerpt] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDesc, setSeoDesc] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [status, setStatus] = useState<'draft'|'published'>('draft')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [focusId, setFocusId] = useState<string|null>(null)
  const [postPanel, setPostPanel] = useState(false)
  const [postQuery, setPostQuery] = useState('')
  const [postResults, setPostResults] = useState<any[]>([])
  const [showSEO, setShowSEO] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const blockRefs = useRef<Record<string,HTMLElement|null>>({})
  const blocksRef = useRef(blocks)
  blocksRef.current = blocks

  function genSlug(t:string){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}

  function updText(id:string, text:string) {
    setBlocks(bs => bs.map(b => b.id===id ? {...b,text} : b))
  }
  function updBlock(id:string, d:Partial<Block>) {
    setBlocks(bs => bs.map(b => b.id===id ? {...b,...d} : b))
  }
  function remBlock(id:string) {
    setBlocks(bs => {
      if(bs.length<=1) return bs
      const idx = bs.findIndex(b=>b.id===id)
      const next = bs.filter(b=>b.id!==id)
      // focus previous block
      const prevId = bs[idx-1]?.id
      if(prevId) setTimeout(()=>blockRefs.current[prevId]?.focus(),50)
      return next
    })
  }
  function insBlock(afterId:string, type:BlockType='paragraph') {
    const nb:Block = {id:uid(),type,text:''}
    setBlocks(bs => {
      const i = bs.findIndex(b=>b.id===afterId)
      const n = [...bs]
      n.splice(i+1,0,nb)
      return n
    })
    setTimeout(()=>blockRefs.current[nb.id]?.focus(),50)
  }

  async function uploadImg(file:File,afterId?:string){
    setUploading(true)
    try{
      const ext=file.name.split('.').pop()
      const name=`${Date.now()}.${ext}`
      const {error}=await supabaseAdmin.storage.from('post-images').upload(name,file)
      if(error)throw error
      const {data}=supabaseAdmin.storage.from('post-images').getPublicUrl(name)
      const nb:Block={id:uid(),type:'image',text:'',src:data.publicUrl,alt:file.name.replace(/\.[^.]+$/,''),caption:'',align:'center'}
      setBlocks(bs=>{
        if(afterId){const i=bs.findIndex(b=>b.id===afterId);const n=[...bs];n.splice(i+1,0,nb);return n}
        return[...bs,nb]
      })
    }catch{alert('Upload failed. Make sure the post-images bucket exists in Supabase Storage (public).')}
    finally{setUploading(false)}
  }

  async function searchPosts(q:string){
    if(!q.trim()){setPostResults([]);return}
    const {data}=await supabase.from('posts').select('id,title,slug').ilike('title',`%${q}%`).eq('status','published').limit(6)
    setPostResults(data||[])
  }

  function insertPostLink(s:string,t:string){
    const el=blockRefs.current[focusId||'']
    if(el){el.focus();document.execCommand('insertHTML',false,`<a href="https://studio.webmify.site/blog/${s}" style="color:#2271b1">${t}</a>`)}
    setPostPanel(false);setPostQuery('');setPostResults([])
  }

  function toHTML(){
    return blocksRef.current.map(b=>{
      if(b.type==='image'&&b.src){
        const as=b.align==='left'?'float:left;margin:0 20px 16px 0;max-width:45%':b.align==='right'?'float:right;margin:0 0 16px 20px;max-width:45%':b.align==='full'?'width:100%;margin:16px 0':'display:block;margin:16px auto;max-width:100%'
        return`<figure style="margin:0"><img src="${b.src}" alt="${b.alt||''}" style="${as};border-radius:6px"/>${b.caption?`<figcaption style="text-align:center;font-size:13px;color:#646970;margin-top:6px;font-style:italic">${b.caption}</figcaption>`:''}</figure>`
      }
      if(b.type==='hr')return'<hr style="border:none;border-top:1px solid #dcdcde;margin:2em 0"/>'
      const tag=b.type==='quote'?'blockquote':b.type==='ul'?'ul':b.type==='ol'?'ol':b.type==='paragraph'?'p':b.type
      // get live content from DOM if available
      const liveEl = blockRefs.current[b.id]
      const content = liveEl ? liveEl.innerHTML : b.text
      return`<${tag}>${content}</${tag}>`
    }).join('\n')
  }

  async function save(s:'draft'|'published'){
    if(!title.trim())return alert('Add a title.')
    setSaving(true)
    const html=toHTML()
    const finalSlug=slug||genSlug(title)
    const res=await fetch('/api/posts',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({title,slug:finalSlug,content:html,excerpt,category,seo_title:seoTitle||title,seo_description:seoDesc||excerpt,cover_image:ogImage,status:s,published_at:s==='published'?new Date().toISOString():null})
    })
    if(res.ok){
      const p=await res.json()
      router.push(`/studio/posts/${p.id}`)
    } else {
      const err=await res.json().catch(()=>({error:'Unknown error'}))
      alert('Error: '+(err.error||'Could not save post'))
      setSaving(false)
    }
  }

  const wordCount = blocks.filter(b=>b.type!=='image'&&b.type!=='hr')
    .map(b=>(blockRefs.current[b.id] as any)?.innerText||b.text.replace(/<[^>]+>/g,'')||'')
    .join(' ').trim().split(/\s+/).filter(Boolean).length

  return(
    <div style={{minHeight:'100vh',background:'#f0f0f1',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'}}>
      <div style={{background:'#1d2327',height:32,display:'flex',alignItems:'center',padding:'0 20px',gap:16}}>
        <a href="/studio" style={{fontSize:12,color:'rgba(240,246,252,.7)',textDecoration:'none'}}>← Studio</a>
        <span style={{fontSize:12,color:'rgba(240,246,252,.4)'}}>New Post</span>
      </div>
      <div style={{background:'#fff',borderBottom:'1px solid #dcdcde',padding:'8px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
        <h2 style={{fontSize:14,fontWeight:600,color:'#1d2327',margin:0}}>Add New Post <span style={{fontSize:12,fontWeight:400,color:'#646970',marginLeft:8}}>Word count: {wordCount}</span></h2>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:20,padding:20,maxWidth:1200,margin:'0 auto'}}>
        <div>
          {/* Title */}
          <div style={{background:'#fff',border:'1px solid #dcdcde',borderRadius:4,marginBottom:16}}>
            <input value={title} onChange={e=>{setTitle(e.target.value);if(!slug)setSlug(genSlug(e.target.value))}} placeholder="Add title"
              style={{width:'100%',padding:'12px 16px',fontSize:22,fontWeight:600,border:'none',outline:'none',borderBottom:'1px solid #f0f0f1',color:'#1d2327',fontFamily:'inherit',borderRadius:'4px 4px 0 0'}}/>
            <div style={{padding:'6px 16px',display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:12,color:'#646970'}}>Permalink:</span>
              <span style={{fontSize:12,color:'#646970'}}>studio.webmify.site/blog/</span>
              <input value={slug} onChange={e=>setSlug(e.target.value)} style={{fontSize:12,border:'1px solid #dcdcde',borderRadius:3,padding:'2px 6px',outline:'none',color:'#2271b1',minWidth:100}}/>
            </div>
          </div>

          {/* Editor */}
          <div style={{background:'#fff',border:'1px solid #dcdcde',borderRadius:4,marginBottom:16}}>
            <div style={{padding:'8px 12px',borderBottom:'1px solid #f0f0f1',display:'flex',alignItems:'center',gap:8}}>
              <button type="button" onClick={()=>{if(focusId){fileRef.current?.setAttribute('data-for',focusId)};fileRef.current?.click()}}
                style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',fontSize:12,fontWeight:600,border:'1px solid #dcdcde',borderRadius:3,background:'#f6f7f7',color:'#1d2327',cursor:'pointer'}}>
                {uploading?'...':Icon.image} {uploading?'Uploading...':'Add Media'}
              </button>
              <span style={{fontSize:12,padding:'4px 8px',borderBottom:'2px solid #2271b1',color:'#1d2327',fontWeight:500,marginLeft:'auto'}}>Visual</span>
            </div>

            {/* Toolbar */}
            <div style={{padding:'6px 10px',borderBottom:'1px solid #f0f0f1',display:'flex',gap:3,flexWrap:'wrap',alignItems:'center',background:'#f6f7f7'}}>
              <select onChange={e=>{if(focusId)updBlock(focusId,{type:e.target.value as BlockType});e.target.value='paragraph'}} defaultValue="paragraph"
                style={{fontSize:12,border:'1px solid #dcdcde',borderRadius:3,padding:'3px 6px',background:'#fff',color:'#1e1e1e',cursor:'pointer',outline:'none',height:28}}>
                <option value="paragraph">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="quote">Quote</option>
              </select>
              <Sep/>
              <TBtn onClick={()=>{if(focusId){document.execCommand('bold')}}} title="Bold">{Icon.bold}</TBtn>
              <TBtn onClick={()=>{if(focusId){document.execCommand('italic')}}} title="Italic">{Icon.italic}</TBtn>
              <TBtn onClick={()=>{if(focusId){document.execCommand('underline')}}} title="Underline">{Icon.underline}</TBtn>
              <TBtn onClick={()=>{if(focusId){document.execCommand('strikeThrough')}}} title="Strike">{Icon.strike}</TBtn>
              <Sep/>
              <TBtn onClick={()=>focusId&&updBlock(focusId,{type:'ul'})} title="Bullet list">{Icon.ul}</TBtn>
              <TBtn onClick={()=>focusId&&updBlock(focusId,{type:'ol'})} title="Numbered list">{Icon.ol}</TBtn>
              <TBtn onClick={()=>focusId&&updBlock(focusId,{type:'quote'})} title="Quote">{Icon.quote}</TBtn>
              <Sep/>
              <TBtn onClick={()=>{if(focusId){const u=prompt('URL:');if(u){blockRefs.current[focusId]?.focus();document.execCommand('createLink',false,u)}}}} title="Link">{Icon.link}</TBtn>
              <TBtn onClick={()=>{if(focusId){document.execCommand('unlink')}}} title="Remove link">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 8.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L6 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".4"/><path d="M8.5 5.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5L8 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".4"/><path d="M2 2l10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </TBtn>
              <Sep/>
              <TBtn onClick={()=>focusId&&insBlock(focusId,'hr')} title="Divider">{Icon.hr}</TBtn>
              <TBtn onClick={()=>{if(focusId){document.execCommand('justifyLeft')}}} title="Align left">
                <svg width="13" height="12" viewBox="0 0 13 12" fill="none"><path d="M1 1h11M1 4.5h7M1 8h11M1 11.5h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </TBtn>
              <TBtn onClick={()=>{if(focusId){document.execCommand('justifyCenter')}}} title="Align center">
                <svg width="13" height="12" viewBox="0 0 13 12" fill="none"><path d="M1 1h11M3 4.5h7M1 8h11M3 11.5h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </TBtn>
              <Sep/>
              <TBtn onClick={()=>setPostPanel(p=>!p)} title="Link to post" active={postPanel}>{Icon.search}</TBtn>
            </div>

            {postPanel&&(
              <div style={{padding:'8px 12px',borderBottom:'1px solid #f0f0f1',background:'#f6f7f7'}}>
                <input autoFocus placeholder="Search published posts..." value={postQuery} onChange={e=>{setPostQuery(e.target.value);searchPosts(e.target.value)}}
                  style={{width:'100%',padding:'6px 10px',fontSize:13,border:'1px solid #dcdcde',borderRadius:3,outline:'none'}}/>
                {postResults.length>0&&<div style={{marginTop:6,display:'flex',flexDirection:'column',gap:2}}>{postResults.map(p=><button key={p.id} type="button" onClick={()=>insertPostLink(p.slug,p.title)} style={{padding:'6px 10px',fontSize:12,textAlign:'left',background:'#fff',border:'1px solid #dcdcde',borderRadius:3,cursor:'pointer',color:'#1e1e1e'}}>{p.title}</button>)}</div>}
                {postQuery&&!postResults.length&&<p style={{fontSize:12,color:'#646970',margin:'6px 0 0'}}>No posts found.</p>}
              </div>
            )}

            {/* Blocks */}
            <div style={{padding:'12px 16px',minHeight:400}}>
              {blocks.map((b,idx)=>{
                if(b.type==='image'){
                  return b.src?(
                    <ImageBlock key={b.id} block={b} onUpdate={d=>updBlock(b.id,d)} onRemove={()=>remBlock(b.id)}/>
                  ):(
                    <div key={b.id} onClick={()=>{fileRef.current?.setAttribute('data-for',b.id);fileRef.current?.click()}}
                      style={{border:'2px dashed #dcdcde',borderRadius:4,padding:'24px 20px',textAlign:'center',cursor:'pointer',margin:'8px 0',background:'#f6f7f7'}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor='#2271b1'} onMouseLeave={e=>e.currentTarget.style.borderColor='#dcdcde'}>
                      <div style={{color:'#646970',display:'flex',justifyContent:'center',marginBottom:6}}>{Icon.upload}</div>
                      <p style={{fontSize:13,color:'#646970',margin:0}}>Click to upload — from computer, phone, or gallery</p>
                    </div>
                  )
                }
                if(b.type==='hr'){
                  return(
                    <div key={b.id} style={{position:'relative',margin:'8px 0'}}>
                      <hr style={{border:'none',borderTop:'1px solid #dcdcde',margin:'12px 0'}}/>
                      <button type="button" onClick={()=>remBlock(b.id)} style={{position:'absolute',right:0,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#d63638',padding:4,display:'flex'}}>{Icon.trash}</button>
                    </div>
                  )
                }
                return(
                  <EditableBlock
                    key={b.id}
                    block={b}
                    onInput={(id,html)=>updText(id,html)}
                    onFocus={(id)=>{ setFocusId(id); blockRefs.current[b.id]=document.activeElement as HTMLElement }}
                    onEnter={(id)=>insBlock(id)}
                    onBackspace={(id)=>remBlock(id)}
                  />
                )
              })}
            </div>

            <div style={{padding:'6px 16px',borderTop:'1px solid #f0f0f1',background:'#f6f7f7',fontSize:12,color:'#646970'}}>
              Word count: {wordCount}
            </div>
          </div>

          {/* Excerpt */}
          <div style={{background:'#fff',border:'1px solid #dcdcde',borderRadius:4,padding:16,marginBottom:16}}>
            <h3 style={{fontSize:13,fontWeight:600,color:'#1d2327',margin:'0 0 8px'}}>Excerpt</h3>
            <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} placeholder="Short summary for blog listing and search results." rows={3}
              style={{width:'100%',padding:'8px 10px',fontSize:13,border:'1px solid #dcdcde',borderRadius:3,outline:'none',resize:'vertical',fontFamily:'inherit',lineHeight:1.6}}/>
          </div>

          {/* SEO */}
          <div style={{background:'#fff',border:'1px solid #dcdcde',borderRadius:4,marginBottom:16}}>
            <div onClick={()=>setShowSEO(s=>!s)} style={{padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}>
              <h3 style={{fontSize:13,fontWeight:600,color:'#1d2327',margin:0}}>SEO Settings</h3>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{transform:showSEO?'rotate(180deg)':'none',transition:'.2s'}}><path d="M1 1l5 5 5-5" stroke="#646970" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            {showSEO&&(
              <div style={{padding:'0 16px 16px',borderTop:'1px solid #f0f0f1',display:'flex',flexDirection:'column',gap:12}}>
                <div style={{paddingTop:12}}>
                  <label style={{display:'block',fontSize:12,fontWeight:600,color:'#1d2327',marginBottom:5}}>SEO Title <span style={{color:(seoTitle||title).length>60?'#d63638':'#646970',fontWeight:400}}>({(seoTitle||title).length}/60)</span></label>
                  <input value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} placeholder={title||'SEO title...'} style={{width:'100%',padding:'6px 10px',fontSize:13,border:'1px solid #dcdcde',borderRadius:3,outline:'none'}}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:12,fontWeight:600,color:'#1d2327',marginBottom:5}}>Meta Description <span style={{color:seoDesc.length>160?'#d63638':'#646970',fontWeight:400}}>({seoDesc.length}/160)</span></label>
                  <textarea value={seoDesc} onChange={e=>setSeoDesc(e.target.value)} placeholder="Describe this post..." rows={3} style={{width:'100%',padding:'6px 10px',fontSize:13,border:'1px solid #dcdcde',borderRadius:3,outline:'none',resize:'vertical',fontFamily:'inherit'}}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:12,fontWeight:600,color:'#1d2327',marginBottom:5}}>Cover / OG Image URL</label>
                  <input value={ogImage} onChange={e=>setOgImage(e.target.value)} placeholder="https://..." style={{width:'100%',padding:'6px 10px',fontSize:13,border:'1px solid #dcdcde',borderRadius:3,outline:'none'}}/>
                  {ogImage&&<img src={ogImage} alt="" style={{marginTop:8,width:'100%',maxHeight:120,objectFit:'cover',borderRadius:3}}/>}
                </div>
                <div style={{background:'#f6f7f7',border:'1px solid #dcdcde',borderRadius:4,padding:12}}>
                  <p style={{fontSize:11,fontWeight:600,color:'#646970',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.5px'}}>Google preview</p>
                  <p style={{fontSize:16,color:'#1a0dab',marginBottom:2}}>{seoTitle||title||'Post title'}</p>
                  <p style={{fontSize:12,color:'#006621',marginBottom:3}}>studio.webmify.site/blog/{slug||'post-slug'}</p>
                  <p style={{fontSize:13,color:'#4d5156'}}>{seoDesc||excerpt||'Meta description...'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{background:'#fff',border:'1px solid #dcdcde',borderRadius:4}}>
            <div style={{background:'#f6f7f7',padding:'8px 12px',borderBottom:'1px solid #dcdcde',borderRadius:'4px 4px 0 0'}}>
              <h3 style={{fontSize:13,fontWeight:600,color:'#1d2327',margin:0}}>Publish</h3>
            </div>
            <div style={{padding:12}}>
              <div style={{display:'flex',gap:6,marginBottom:12}}>
                <button onClick={()=>save('draft')} disabled={saving} style={{flex:1,padding:'6px 10px',fontSize:12,fontWeight:600,border:'1px solid #dcdcde',borderRadius:3,background:'#f6f7f7',color:'#1d2327',cursor:'pointer'}}>Save Draft</button>
                <button onClick={()=>setShowPreview(p=>!p)} style={{flex:1,padding:'6px 10px',fontSize:12,fontWeight:600,border:'1px solid #dcdcde',borderRadius:3,background:'#f6f7f7',color:'#1d2327',cursor:'pointer'}}>Preview</button>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12,fontSize:13}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="#646970" strokeWidth="1.2"/><path d="M6.5 4v3l2 1.5" stroke="#646970" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span style={{color:'#646970'}}>Status:</span>
                  <select value={status} onChange={e=>setStatus(e.target.value as any)} style={{fontSize:12,border:'1px solid #dcdcde',borderRadius:3,padding:'2px 6px',outline:'none',background:'#fff',cursor:'pointer'}}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="#646970" strokeWidth="1.2"/><path d="M4 6.5h5M6.5 4v5" stroke="#646970" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span style={{color:'#646970'}}>Visibility: Public</span>
                </div>
              </div>
              <div style={{borderTop:'1px solid #f0f0f1',paddingTop:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <button type="button" style={{fontSize:12,color:'#d63638',background:'none',border:'none',cursor:'pointer',padding:0}}>Move to Trash</button>
                <button onClick={()=>save('published')} disabled={saving} style={{padding:'6px 14px',background:'#2271b1',color:'#fff',border:'1px solid #135e96',borderRadius:3,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                  {saving?'Saving...':'Publish'}
                </button>
              </div>
            </div>
          </div>

          <div style={{background:'#fff',border:'1px solid #dcdcde',borderRadius:4}}>
            <div style={{background:'#f6f7f7',padding:'8px 12px',borderBottom:'1px solid #dcdcde',borderRadius:'4px 4px 0 0'}}>
              <h3 style={{fontSize:13,fontWeight:600,color:'#1d2327',margin:0}}>Category</h3>
            </div>
            <div style={{padding:'8px 12px'}}>
              {CATEGORIES.map(c=>(
                <label key={c} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',fontSize:13,color:'#1d2327',cursor:'pointer'}}>
                  <input type="radio" name="category" value={c} checked={category===c} onChange={()=>setCategory(c)} style={{cursor:'pointer'}}/>
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div style={{background:'#fff',border:'1px solid #dcdcde',borderRadius:4}}>
            <div style={{background:'#f6f7f7',padding:'8px 12px',borderBottom:'1px solid #dcdcde',borderRadius:'4px 4px 0 0'}}>
              <h3 style={{fontSize:13,fontWeight:600,color:'#1d2327',margin:0}}>Focus Keywords</h3>
            </div>
            <div style={{padding:'8px 12px'}}>
              <input placeholder="e.g. web design, Nigeria, SaaS..." style={{width:'100%',padding:'6px 10px',fontSize:12,border:'1px solid #dcdcde',borderRadius:3,outline:'none'}}/>
              <p style={{fontSize:11,color:'#646970',margin:'6px 0 0'}}>Separate with commas</p>
            </div>
          </div>
        </div>
      </div>

      {showPreview&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:1000,overflow:'auto'}}>
          <div style={{maxWidth:720,margin:'40px auto',background:'#fff',borderRadius:8,padding:'40px 36px 60px',position:'relative'}}>
            <button onClick={()=>setShowPreview(false)} style={{position:'absolute',top:16,right:16,background:'#1d2327',color:'#fff',border:'none',borderRadius:4,padding:'6px 12px',cursor:'pointer',fontSize:12}}>Close</button>
            {ogImage&&<img src={ogImage} style={{width:'100%',borderRadius:8,marginBottom:24,objectFit:'cover',maxHeight:320}} alt=""/>}
            <span style={{fontSize:10,fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'#b8944a',background:'rgba(184,148,74,.08)',padding:'3px 10px',borderRadius:100,border:'1px solid rgba(184,148,74,.2)'}}>{category}</span>
            <h1 style={{fontFamily:'Georgia,serif',fontSize:36,fontWeight:400,letterSpacing:'-1.5px',margin:'14px 0 16px',lineHeight:1.15}}>{title||'Your post title'}</h1>
            {excerpt&&<p style={{fontSize:16,color:'#646970',lineHeight:1.8,marginBottom:28,paddingBottom:28,borderBottom:'1px solid #dcdcde'}}>{excerpt}</p>}
            <div style={{fontSize:16,lineHeight:1.85}} dangerouslySetInnerHTML={{__html:toHTML()}}/>
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}}
        onChange={e=>{const f=e.target.files?.[0];const forId=fileRef.current?.getAttribute('data-for')||focusId||undefined;if(f)uploadImg(f,forId);e.target.value=''}}/>

      <style>{`
        [contenteditable]:empty:before{content:attr(data-placeholder);color:#c3c4c7;pointer-events:none}
        [contenteditable] a{color:#2271b1}
        [contenteditable] strong{font-weight:700}
        [contenteditable] em{font-style:italic}
        @media(max-width:768px){
          div[style*="grid-template-columns: 1fr 280px"]{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  )
}
