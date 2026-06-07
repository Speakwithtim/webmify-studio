'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const CATEGORIES = ['General', 'Product', 'Development', 'Strategy', 'Design', 'SEO', 'Business']

const Icon = {
  bold: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2h5a2.5 2.5 0 010 5H3V2zM3 7h5.5a2.5 2.5 0 010 5H3V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  italic: <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M4 2h6M2 12h6M8 2L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  underline: <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M2 2v5a4 4 0 008 0V2M1 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  h1: <svg width="22" height="14" viewBox="0 0 22 14" fill="none"><path d="M1 2v10M1 7h7M8 2v10M14 12V5l-2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  h2: <svg width="24" height="14" viewBox="0 0 24 14" fill="none"><path d="M1 2v10M1 7h7M8 2v10M14 5a2.5 2.5 0 014 2c0 1.5-1.5 2.5-4 5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  h3: <svg width="24" height="14" viewBox="0 0 24 14" fill="none"><path d="M1 2v10M1 7h7M8 2v10M14 5a2 2 0 013.5 1.5 1.8 1.8 0 01-1.5 1.8A2 2 0 0118 10a2 2 0 01-3.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  quote: <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 1h5v5H1V1zM8 1h5v5H8V1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 6c0 2-1.5 3.5-2.5 4M13 6c0 2-1.5 3.5-2.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  ul: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="2" cy="3.5" r="1.2" fill="currentColor"/><circle cx="2" cy="7" r="1.2" fill="currentColor"/><circle cx="2" cy="10.5" r="1.2" fill="currentColor"/><path d="M5.5 3.5h7M5.5 7h7M5.5 10.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  ol: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 3.5h7M5.5 7h7M5.5 10.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 2v3M1.5 5h1.5M1.5 8.5a1 1 0 011-1 1 1 0 010 2 1 1 0 000 1.5H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  hr: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  link: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 8.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-4.95-4.95L6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8.5 5.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 004.95 4.95L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  image: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="4.5" cy="5.5" r="1.2" fill="currentColor"/><path d="M1.5 9.5l3-3 2.5 2.5 2-2 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M5.5 6.5v4M8.5 6.5v4M3.5 4l.5 8h6l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  eye: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.3"/><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  write: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2-7 7-2.5.5.5-2.5 7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  seo: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/><path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  plus: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  upload: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 13V4M7 7l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
}

function TB({ onClick, title, children, active }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean }) {
  return (
    <button type="button" title={title} onMouseDown={e => { e.preventDefault(); onClick() }}
      style={{ display:'flex', alignItems:'center', justifyContent:'center', width:32, height:32, border:'1px solid', borderColor: active ? '#0c0c0a' : '#e0e0d8', borderRadius:7, background: active ? '#0c0c0a' : '#fff', color: active ? '#fff' : '#3a3a36', cursor:'pointer', flexShrink:0 }}>
      {children}
    </button>
  )
}
function Sep() { return <span style={{ width:1, height:22, background:'#e8e8e2', flexShrink:0 }} /> }

type BlockType = 'paragraph'|'h1'|'h2'|'h3'|'quote'|'ul'|'ol'|'hr'|'image'
type Block = { id:string; type:BlockType; text:string; src?:string; alt?:string; caption?:string; align?:string }
function uid() { return Math.random().toString(36).slice(2,9) }

function ImageCard({ block, onUpdate, onRemove }: { block:Block; onUpdate:(d:Partial<Block>)=>void; onRemove:()=>void }) {
  const [editing, setEditing] = useState(false)
  const [alt, setAlt] = useState(block.alt||'')
  const [cap, setCap] = useState(block.caption||'')
  const [align, setAlign] = useState(block.align||'center')
  const s: React.CSSProperties = align==='left' ? {float:'left',margin:'0 20px 16px 0',maxWidth:'45%'} : align==='right' ? {float:'right',margin:'0 0 16px 20px',maxWidth:'45%'} : align==='full' ? {width:'100%',margin:'16px 0'} : {display:'block',margin:'16px auto',maxWidth:'100%'}
  return (
    <div style={{ position:'relative', margin:'12px 0', ...s }} contentEditable={false}>
      <img src={block.src} alt={alt} style={{ width:'100%', borderRadius:10, display:'block' }} />
      {cap && <p style={{ textAlign:'center', fontSize:13, color:'#78786e', margin:'6px 0 0', fontStyle:'italic' }}>{cap}</p>}
      <div style={{ position:'absolute', top:8, right:8, display:'flex', gap:4 }}>
        <button type="button" onClick={() => setEditing(e=>!e)} style={{ padding:'4px 8px', fontSize:11, fontWeight:600, background:'rgba(12,12,10,.75)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', backdropFilter:'blur(4px)' }}>Edit</button>
        <button type="button" onClick={onRemove} style={{ padding:'4px 6px', background:'rgba(196,74,42,.8)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center' }}>{Icon.trash}</button>
      </div>
      {editing && (
        <div style={{ position:'absolute', top:0, left:0, right:0, background:'#fff', border:'1px solid #e0e0d8', borderRadius:10, padding:16, zIndex:20, boxShadow:'0 8px 32px rgba(0,0,0,.12)' }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#78786e', marginBottom:12 }}>Image settings</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div>
              <label style={{ fontSize:11, color:'#78786e', display:'block', marginBottom:4 }}>Alt text (SEO + accessibility)</label>
              <input value={alt} onChange={e=>setAlt(e.target.value)} placeholder="Describe the image..." style={{ width:'100%', padding:'7px 10px', fontSize:13, border:'1px solid #e0e0d8', borderRadius:7, outline:'none' }} />
            </div>
            <div>
              <label style={{ fontSize:11, color:'#78786e', display:'block', marginBottom:4 }}>Caption</label>
              <input value={cap} onChange={e=>setCap(e.target.value)} placeholder="Optional caption..." style={{ width:'100%', padding:'7px 10px', fontSize:13, border:'1px solid #e0e0d8', borderRadius:7, outline:'none' }} />
            </div>
            <div>
              <label style={{ fontSize:11, color:'#78786e', display:'block', marginBottom:6 }}>Position</label>
              <div style={{ display:'flex', gap:6 }}>
                {(['left','center','right','full'] as const).map(a => (
                  <button key={a} type="button" onClick={()=>setAlign(a)} style={{ padding:'5px 10px', fontSize:11, fontWeight:600, border:'1px solid', borderColor:align===a?'#0c0c0a':'#e0e0d8', borderRadius:6, background:align===a?'#0c0c0a':'#fff', color:align===a?'#fff':'#78786e', cursor:'pointer', textTransform:'capitalize' }}>{a}</button>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => { onUpdate({alt,caption:cap,align}); setEditing(false) }} style={{ padding:'8px', background:'#0c0c0a', color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>{Icon.check} Save</button>
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
  const [seoKeywords, setSeoKeywords] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [tab, setTab] = useState<'write'|'seo'|'preview'>('write')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [focusId, setFocusId] = useState<string|null>(null)
  const [floatMenu, setFloatMenu] = useState({show:false,mode:'format' as 'format'|'link',url:'',blockId:''})
  const [postPanel, setPostPanel] = useState(false)
  const [postQuery, setPostQuery] = useState('')
  const [postResults, setPostResults] = useState<any[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const refs = useRef<Record<string,HTMLElement|null>>({})

  function genSlug(t:string){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}
  function upd(id:string,d:Partial<Block>){setBlocks(bs=>bs.map(b=>b.id===id?{...b,...d}:b))}
  function rem(id:string){setBlocks(bs=>bs.length>1?bs.filter(b=>b.id!==id):bs)}
  function sync(id:string){const el=refs.current[id];if(el)upd(id,{text:el.innerHTML})}

  function ins(afterId:string,type:BlockType='paragraph'){
    const nb:Block={id:uid(),type,text:''}
    setBlocks(bs=>{const i=bs.findIndex(b=>b.id===afterId);const n=[...bs];n.splice(i+1,0,nb);return n})
    setTimeout(()=>refs.current[nb.id]?.focus(),50)
  }

  function handleSel(bid:string){
    const sel=window.getSelection()
    if(!sel||sel.isCollapsed||!sel.toString().trim()){setFloatMenu(m=>({...m,show:false}));return}
    setFloatMenu({show:true,mode:'format',url:'',blockId:bid})
  }

  function execLink(url:string,blockId:string){
    refs.current[blockId]?.focus()
    document.execCommand('createLink',false,url)
    sync(blockId)
    setFloatMenu(m=>({...m,show:false,mode:'format'}))
  }

  async function uploadImg(file:File,afterId?:string){
    setUploading(true)
    try{
      const ext=file.name.split('.').pop()
      const name=`${Date.now()}.${ext}`
      const {error}=await supabase.storage.from('post-images').upload(name,file)
      if(error)throw error
      const {data}=supabase.storage.from('post-images').getPublicUrl(name)
      const nb:Block={id:uid(),type:'image',text:'',src:data.publicUrl,alt:file.name.replace(/\.[^.]+$/,''),caption:'',align:'center'}
      setBlocks(bs=>{
        if(afterId){const i=bs.findIndex(b=>b.id===afterId);const n=[...bs];n.splice(i+1,0,nb);return n}
        return [...bs,nb]
      })
    }catch{alert('Upload failed. Make sure the post-images bucket exists in Supabase (public).')}
    finally{setUploading(false)}
  }

  async function searchPosts(q:string){
    if(!q.trim()){setPostResults([]);return}
    const {data}=await supabase.from('posts').select('id,title,slug').ilike('title',`%${q}%`).eq('status','published').limit(6)
    setPostResults(data||[])
  }

  function insertPostLink(s:string,t:string){
    const el=refs.current[focusId||'']
    if(el){el.focus();document.execCommand('insertHTML',false,`<a href="https://webmify-studio.vercel.app/blog/${s}" style="color:#b8944a;text-decoration:underline">${t}</a>`);sync(focusId||'')}
    setPostPanel(false);setPostQuery('');setPostResults([])
  }

  function toHTML(){
    return blocks.map(b=>{
      if(b.type==='image'&&b.src){const as=b.align==='left'?'float:left;margin:0 20px 16px 0;max-width:45%':b.align==='right'?'float:right;margin:0 0 16px 20px;max-width:45%':b.align==='full'?'width:100%;margin:16px 0':'display:block;margin:16px auto;max-width:100%';return `<figure style="margin:0"><img src="${b.src}" alt="${b.alt||''}" style="${as};border-radius:10px"/>${b.caption?`<figcaption style="text-align:center;font-size:13px;color:#78786e;margin-top:6px;font-style:italic">${b.caption}</figcaption>`:''}</figure>`}
      if(b.type==='hr')return '<hr style="border:none;border-top:1px solid #e0e0d8;margin:2em 0"/>'
      const tag=b.type==='quote'?'blockquote':b.type==='ul'?'ul':b.type==='ol'?'ol':b.type==='paragraph'?'p':b.type
      return `<${tag}>${b.text}</${tag}>`
    }).join('\n')
  }

  async function save(status:'draft'|'published'){
    if(!title.trim())return alert('Add a title.')
    const html=toHTML()
    if(!html.replace(/<[^>]+>/g,'').trim())return alert('Write some content.')
    setSaving(true)
    const res=await fetch('/api/posts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,slug:slug||genSlug(title),content:html,excerpt,category,seo_title:seoTitle||title,seo_description:seoDesc||excerpt,cover_image:ogImage,status,published_at:status==='published'?new Date().toISOString():null})})
    if(res.ok){const p=await res.json();router.push(`/studio/posts/${p.id}`)}
    else{alert('Error saving.');setSaving(false)}
  }

  const tagStyles:Record<string,React.CSSProperties>={
    h1:{fontFamily:'Georgia,serif',fontSize:'clamp(24px,5vw,38px)',fontWeight:400,letterSpacing:'-1.5px',lineHeight:1.15},
    h2:{fontSize:'clamp(18px,3vw,26px)',fontWeight:600,letterSpacing:'-.5px',lineHeight:1.25},
    h3:{fontSize:'clamp(15px,2.5vw,20px)',fontWeight:600,lineHeight:1.35},
    quote:{borderLeft:'3px solid #e0e0d8',paddingLeft:'1em',color:'#78786e',fontStyle:'italic'},
    paragraph:{fontSize:16,lineHeight:1.85},
    ul:{fontSize:16,lineHeight:1.85,paddingLeft:'1.5em',listStyleType:'disc' as const},
    ol:{fontSize:16,lineHeight:1.85,paddingLeft:'1.5em',listStyleType:'decimal' as const},
  }

  return (
    <div style={{minHeight:'100vh',background:'#f4f4f0',fontFamily:"'Geist',system-ui,sans-serif"}}>
      <header style={{position:'sticky',top:0,zIndex:200,background:'rgba(255,255,255,0.96)',backdropFilter:'blur(8px)',borderBottom:'1px solid #e8e8e2',padding:'0 20px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0}}>
          <a href="/studio/posts" style={{fontSize:12,color:'#78786e',textDecoration:'none',flexShrink:0}}>← Posts</a>
          <span style={{fontSize:12,color:'#b4b4a8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title||'New post'}</span>
        </div>
        <div style={{display:'flex',gap:6,flexShrink:0}}>
          <button onClick={()=>save('draft')} disabled={saving} style={{padding:'7px 14px',border:'1px solid #e0e0d8',borderRadius:100,fontSize:12,fontWeight:500,cursor:'pointer',background:'#fff',color:'#0c0c0a',whiteSpace:'nowrap'}}>Save draft</button>
          <button onClick={()=>save('published')} disabled={saving} style={{padding:'7px 16px',background:'#0c0c0a',color:'#f8f8f5',border:'none',borderRadius:100,fontSize:12,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>{saving?'Saving...':'Publish'}</button>
        </div>
      </header>

      <div style={{maxWidth:760,margin:'0 auto',padding:'0 16px 100px'}}>
        {/* Title */}
        <div style={{background:'#fff',borderRadius:'0 0 14px 14px',padding:'28px 28px 20px',marginBottom:2}}>
          <input value={title} onChange={e=>{setTitle(e.target.value);if(!slug)setSlug(genSlug(e.target.value))}} placeholder="Post title"
            style={{width:'100%',fontFamily:'Georgia,serif',fontSize:'clamp(26px,6vw,44px)',fontWeight:400,letterSpacing:'-2px',lineHeight:1.15,border:'none',outline:'none',background:'transparent',color:'#0c0c0a'}} />
          <div style={{display:'flex',gap:10,marginTop:14,flexWrap:'wrap',alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <span style={{fontSize:11,color:'#b4b4a8'}}>Slug</span>
              <input value={slug} onChange={e=>setSlug(e.target.value)} style={{fontSize:12,border:'1px solid #e8e8e2',borderRadius:6,padding:'3px 8px',outline:'none',background:'#f8f8f5',color:'#0c0c0a',width:140}} />
            </div>
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <span style={{fontSize:11,color:'#b4b4a8'}}>Category</span>
              <select value={category} onChange={e=>setCategory(e.target.value)} style={{fontSize:12,border:'1px solid #e8e8e2',borderRadius:6,padding:'3px 8px',outline:'none',background:'#f8f8f5',color:'#0c0c0a',cursor:'pointer'}}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{marginLeft:'auto',display:'flex',background:'#f4f4f0',borderRadius:10,padding:3,gap:2}}>
              {([['write',Icon.write,'Write'],['seo',Icon.seo,'SEO'],['preview',Icon.eye,'Preview']] as const).map(([k,ic,lb])=>(
                <button key={k} type="button" onClick={()=>setTab(k as any)}
                  style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',fontSize:11,fontWeight:600,border:'none',borderRadius:8,cursor:'pointer',background:tab===k?'#fff':'transparent',color:tab===k?'#0c0c0a':'#78786e',boxShadow:tab===k?'0 1px 4px rgba(0,0,0,.08)':'none',transition:'all .15s'}}>
                  {ic}{lb}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* WRITE */}
        {tab==='write'&&(
          <div style={{background:'#fff',borderRadius:14,overflow:'hidden'}}>
            {/* Toolbar */}
            <div style={{display:'flex',gap:4,padding:'8px 12px',borderBottom:'1px solid #f0f0ea',background:'#fafaf8',flexWrap:'wrap',alignItems:'center',position:'sticky',top:56,zIndex:100}}>
              <TB onClick={()=>{if(focusId){document.execCommand('bold');sync(focusId)}}} title="Bold">{Icon.bold}</TB>
              <TB onClick={()=>{if(focusId){document.execCommand('italic');sync(focusId)}}} title="Italic">{Icon.italic}</TB>
              <TB onClick={()=>{if(focusId){document.execCommand('underline');sync(focusId)}}} title="Underline">{Icon.underline}</TB>
              <Sep/>
              <TB onClick={()=>focusId&&upd(focusId,{type:'h1'})} title="Heading 1">{Icon.h1}</TB>
              <TB onClick={()=>focusId&&upd(focusId,{type:'h2'})} title="Heading 2">{Icon.h2}</TB>
              <TB onClick={()=>focusId&&upd(focusId,{type:'h3'})} title="Heading 3">{Icon.h3}</TB>
              <TB onClick={()=>focusId&&upd(focusId,{type:'quote'})} title="Quote">{Icon.quote}</TB>
              <Sep/>
              <TB onClick={()=>focusId&&upd(focusId,{type:'ul'})} title="Bullet list">{Icon.ul}</TB>
              <TB onClick={()=>focusId&&upd(focusId,{type:'ol'})} title="Numbered list">{Icon.ol}</TB>
              <Sep/>
              <TB onClick={()=>focusId&&ins(focusId,'hr')} title="Divider">{Icon.hr}</TB>
              <TB onClick={()=>{if(focusId){fileRef.current?.setAttribute('data-for',focusId);fileRef.current?.click()}}} title={uploading?'Uploading...':'Upload image'}>
                {uploading?<svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="8 4"><animateTransform attributeName="transform" type="rotate" from="0 7 7" to="360 7 7" dur=".8s" repeatCount="indefinite"/></circle></svg>:Icon.image}
              </TB>
              <TB onClick={()=>{if(focusId){const u=prompt('Paste URL:');if(u){refs.current[focusId]?.focus();document.execCommand('createLink',false,u);sync(focusId)}}}} title="Insert link">{Icon.link}</TB>
              <TB onClick={()=>setPostPanel(p=>!p)} title="Link to a post" active={postPanel}>{Icon.search}</TB>
            </div>

            {/* Post search */}
            {postPanel&&(
              <div style={{padding:'10px 16px',borderBottom:'1px solid #f0f0ea',background:'#fdfdf9'}}>
                <input autoFocus placeholder="Search published posts to link..." value={postQuery}
                  onChange={e=>{setPostQuery(e.target.value);searchPosts(e.target.value)}}
                  style={{width:'100%',padding:'8px 12px',fontSize:13,border:'1px solid #e0e0d8',borderRadius:8,outline:'none',background:'#fff'}} />
                {postResults.length>0&&<div style={{marginTop:6,display:'flex',flexDirection:'column',gap:3}}>{postResults.map(p=><button key={p.id} type="button" onClick={()=>insertPostLink(p.slug,p.title)} style={{padding:'7px 12px',fontSize:12,textAlign:'left',background:'#fff',border:'1px solid #e0e0d8',borderRadius:6,cursor:'pointer',color:'#0c0c0a'}}>{p.title}</button>)}</div>}
                {postQuery&&!postResults.length&&<p style={{fontSize:12,color:'#b4b4a8',margin:'6px 0 0'}}>No published posts found.</p>}
              </div>
            )}

            {/* Floating menu */}
            {floatMenu.show&&(
              <div style={{position:'fixed',top:110,left:'50%',transform:'translateX(-50%)',background:'#0c0c0a',borderRadius:9,padding:'5px 7px',display:'flex',gap:3,alignItems:'center',boxShadow:'0 4px 20px rgba(0,0,0,.3)',zIndex:999,flexWrap:'wrap',maxWidth:'90vw'}}>
                {floatMenu.mode==='format'?(<>
                  {[{i:Icon.bold,c:'bold'},{i:Icon.italic,c:'italic'},{i:Icon.underline,c:'underline'}].map(({i,c})=>(
                    <button key={c} type="button" onMouseDown={e=>{e.preventDefault();document.execCommand(c);sync(floatMenu.blockId);setFloatMenu(m=>({...m,show:false}))}}
                      style={{display:'flex',alignItems:'center',justifyContent:'center',width:30,height:30,border:'1px solid rgba(255,255,255,.15)',borderRadius:6,background:'transparent',color:'#fff',cursor:'pointer'}}>{i}</button>
                  ))}
                  <span style={{width:1,height:20,background:'rgba(255,255,255,.15)'}}/>
                  {[{i:Icon.h1,t:'h1'},{i:Icon.h2,t:'h2'},{i:Icon.h3,t:'h3'},{i:Icon.quote,t:'quote'}].map(({i,t})=>(
                    <button key={t} type="button" onMouseDown={e=>{e.preventDefault();upd(floatMenu.blockId,{type:t as any});setFloatMenu(m=>({...m,show:false}))}}
                      style={{display:'flex',alignItems:'center',justifyContent:'center',width:30,height:30,border:'1px solid rgba(255,255,255,.15)',borderRadius:6,background:'transparent',color:'#fff',cursor:'pointer'}}>{i}</button>
                  ))}
                  <span style={{width:1,height:20,background:'rgba(255,255,255,.15)'}}/>
                  <button type="button" onMouseDown={e=>{e.preventDefault();setFloatMenu(m=>({...m,mode:'link'}))}}
                    style={{display:'flex',alignItems:'center',justifyContent:'center',width:30,height:30,border:'1px solid rgba(255,255,255,.15)',borderRadius:6,background:'transparent',color:'#fff',cursor:'pointer'}}>{Icon.link}</button>
                </>):(
                  <div style={{display:'flex',gap:5,alignItems:'center'}}>
                    <input autoFocus placeholder="https://..." value={floatMenu.url} onChange={e=>setFloatMenu(m=>({...m,url:e.target.value}))}
                      onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();execLink(floatMenu.url,floatMenu.blockId)}if(e.key==='Escape')setFloatMenu(m=>({...m,mode:'format'}))}}
                      style={{padding:'5px 9px',fontSize:12,border:'1px solid rgba(255,255,255,.2)',borderRadius:6,background:'rgba(255,255,255,.1)',color:'#fff',outline:'none',width:180}} />
                    <button type="button" onMouseDown={e=>{e.preventDefault();execLink(floatMenu.url,floatMenu.blockId)}}
                      style={{padding:'5px 10px',fontSize:11,fontWeight:600,background:'#b8944a',border:'none',borderRadius:6,color:'#fff',cursor:'pointer'}}>Apply</button>
                  </div>
                )}
              </div>
            )}

            {/* Blocks */}
            <div style={{padding:'24px 28px 32px',minHeight:400}}>
              {blocks.map((b,idx)=>{
                if(b.type==='image'){
                  return b.src?(
                    <ImageCard key={b.id} block={b} onUpdate={d=>upd(b.id,d)} onRemove={()=>rem(b.id)} />
                  ):(
                    <div key={b.id} onClick={()=>{fileRef.current?.setAttribute('data-for',b.id);fileRef.current?.click()}}
                      style={{border:'2px dashed #e0e0d8',borderRadius:10,padding:'32px 20px',textAlign:'center',cursor:'pointer',background:'#fafaf8',margin:'8px 0'}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor='#b4b4a8'} onMouseLeave={e=>e.currentTarget.style.borderColor='#e0e0d8'}>
                      <div style={{color:'#b4b4a8',display:'flex',justifyContent:'center',marginBottom:8}}>{Icon.upload}</div>
                      <p style={{fontSize:13,fontWeight:600,color:'#78786e',margin:'0 0 4px'}}>Click to upload image</p>
                      <p style={{fontSize:12,color:'#b4b4a8',margin:0}}>From your computer, phone, or gallery</p>
                    </div>
                  )
                }
                if(b.type==='hr'){
                  return(
                    <div key={b.id} style={{position:'relative',margin:'8px 0'}} onFocus={()=>setFocusId(b.id)}>
                      <hr style={{border:'none',borderTop:'1px solid #e0e0d8',margin:'16px 0'}}/>
                      <button type="button" onClick={()=>rem(b.id)} style={{position:'absolute',right:0,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#c44a2a',opacity:.5,padding:4,display:'flex'}}>{Icon.trash}</button>
                    </div>
                  )
                }
                const Tag=(b.type==='ul'?'ul':b.type==='ol'?'ol':b.type==='quote'?'blockquote':b.type==='paragraph'?'p':b.type) as any
                const ph={h1:'Heading 1',h2:'Heading 2',h3:'Heading 3',quote:'Quote...',ul:'List item...',ol:'List item...',paragraph:'Write something...'} as any
                return(
                  <div key={b.id} style={{position:'relative',margin:'2px 0'}} onFocus={()=>setFocusId(b.id)}>
                    <Tag ref={(el:any)=>{refs.current[b.id]=el}} contentEditable suppressContentEditableWarning
                      data-placeholder={ph[b.type]||''}
                      onInput={(e:any)=>upd(b.id,{text:e.target.innerHTML})}
                      onMouseUp={()=>handleSel(b.id)} onKeyUp={()=>handleSel(b.id)}
                      onKeyDown={(e:any)=>{
                        if(e.key==='Enter'&&!e.shiftKey&&b.type!=='ul'&&b.type!=='ol'){e.preventDefault();ins(b.id)}
                        if(e.key==='Backspace'){const el=refs.current[b.id];if(el&&(el as any).innerText===''&&blocks.length>1){e.preventDefault();rem(b.id);const prev=blocks[idx-1]?.id;if(prev)setTimeout(()=>{const p=refs.current[prev];p?.focus();const r=document.createRange();const s=window.getSelection();r.selectNodeContents(p!);r.collapse(false);s?.removeAllRanges();s?.addRange(r)},10)}}
                      }}
                      dangerouslySetInnerHTML={{__html:b.text}}
                      style={{outline:'none',minHeight:28,width:'100%',...(tagStyles[b.type]||tagStyles.paragraph)}}
                    />
                  </div>
                )
              })}
              <button type="button" onClick={()=>ins(blocks[blocks.length-1].id)}
                style={{marginTop:12,display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#c0c0b8',background:'none',border:'1px dashed #e0e0d8',borderRadius:8,padding:'7px 14px',cursor:'pointer'}}
                onMouseEnter={e=>{e.currentTarget.style.color='#78786e';e.currentTarget.style.borderColor='#b4b4a8'}}
                onMouseLeave={e=>{e.currentTarget.style.color='#c0c0b8';e.currentTarget.style.borderColor='#e0e0d8'}}>
                {Icon.plus} Add block
              </button>
            </div>
          </div>
        )}

        {/* PREVIEW */}
        {tab==='preview'&&(
          <div style={{background:'#fff',borderRadius:14,padding:'36px 32px'}}>
            {ogImage&&<img src={ogImage} style={{width:'100%',borderRadius:12,marginBottom:28,objectFit:'cover',maxHeight:360}} alt=""/>}
            <span style={{fontSize:10,fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'#b8944a',background:'rgba(184,148,74,.08)',padding:'3px 10px',borderRadius:100,border:'1px solid rgba(184,148,74,.2)'}}>{category}</span>
            <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(24px,5vw,44px)',fontWeight:400,letterSpacing:'-2px',margin:'14px 0 16px',lineHeight:1.1}}>{title||'Your post title'}</h1>
            {excerpt&&<p style={{fontSize:17,color:'#78786e',lineHeight:1.8,marginBottom:28,paddingBottom:28,borderBottom:'1px solid #e0e0d8'}}>{excerpt}</p>}
            <div style={{fontSize:16,lineHeight:1.85,color:'#1e1e1a'}} dangerouslySetInnerHTML={{__html:toHTML()}}/>
          </div>
        )}

        {/* SEO */}
        {tab==='seo'&&(
          <div style={{display:'flex',flexDirection:'column',gap:12,paddingTop:12}}>
            <div style={{background:'#fff',borderRadius:14,padding:24}}>
              <p style={{fontSize:11,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'#78786e',marginBottom:18}}>Search Engine Optimization</p>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div>
                  <label style={{display:'block',fontSize:11,fontWeight:600,color:'#78786e',marginBottom:5,letterSpacing:'1px',textTransform:'uppercase'}}>Excerpt</label>
                  <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} placeholder="A short, compelling summary — 1 to 2 sentences." rows={2}
                    style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0d8',borderRadius:8,fontSize:13,outline:'none',background:'#fafaf8',resize:'vertical',fontFamily:'inherit',lineHeight:1.6}}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:11,fontWeight:600,color:'#78786e',marginBottom:5,letterSpacing:'1px',textTransform:'uppercase'}}>SEO Title</label>
                  <input value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} placeholder={title||'SEO optimized title...'}
                    style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0d8',borderRadius:8,fontSize:13,outline:'none',background:'#fafaf8'}}/>
                  <p style={{fontSize:11,color:(seoTitle||title).length>60?'#c44a2a':'#b4b4a8',marginTop:4}}>{(seoTitle||title).length}/60 characters ideal</p>
                </div>
                <div>
                  <label style={{display:'block',fontSize:11,fontWeight:600,color:'#78786e',marginBottom:5,letterSpacing:'1px',textTransform:'uppercase'}}>Meta Description</label>
                  <textarea value={seoDesc} onChange={e=>setSeoDesc(e.target.value)} placeholder="Describe what this post covers. Appears in Google search results." rows={3}
                    style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0d8',borderRadius:8,fontSize:13,outline:'none',background:'#fafaf8',resize:'vertical',fontFamily:'inherit',lineHeight:1.6}}/>
                  <p style={{fontSize:11,color:seoDesc.length>160?'#c44a2a':'#b4b4a8',marginTop:4}}>{seoDesc.length}/160 characters ideal</p>
                </div>
                <div>
                  <label style={{display:'block',fontSize:11,fontWeight:600,color:'#78786e',marginBottom:5,letterSpacing:'1px',textTransform:'uppercase'}}>Focus Keywords</label>
                  <input value={seoKeywords} onChange={e=>setSeoKeywords(e.target.value)} placeholder="web design Nigeria, SaaS development Africa..."
                    style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0d8',borderRadius:8,fontSize:13,outline:'none',background:'#fafaf8'}}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:11,fontWeight:600,color:'#78786e',marginBottom:5,letterSpacing:'1px',textTransform:'uppercase'}}>Cover / OG Image URL</label>
                  <input value={ogImage} onChange={e=>setOgImage(e.target.value)} placeholder="https://... shown when shared on social"
                    style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0d8',borderRadius:8,fontSize:13,outline:'none',background:'#fafaf8'}}/>
                  {ogImage&&<img src={ogImage} alt="" style={{marginTop:8,width:'100%',maxHeight:160,objectFit:'cover',borderRadius:8}}/>}
                </div>
              </div>
            </div>
            <div style={{background:'#fff',borderRadius:14,padding:24}}>
              <p style={{fontSize:11,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'#78786e',marginBottom:16}}>Google search preview</p>
              <p style={{fontSize:18,color:'#1a0dab',marginBottom:2,lineHeight:1.3}}>{seoTitle||title||'Your post title'}</p>
              <p style={{fontSize:13,color:'#006621',marginBottom:4}}>webmify-studio.vercel.app/blog/{slug||'post-slug'}</p>
              <p style={{fontSize:14,color:'#4d5156',lineHeight:1.55}}>{seoDesc||excerpt||'Your meta description appears here in Google search results.'}</p>
            </div>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}}
        onChange={e=>{const f=e.target.files?.[0];const forId=fileRef.current?.getAttribute('data-for')||focusId||undefined;if(f)uploadImg(f,forId);e.target.value=''}}/>

      <style>{`
        [contenteditable]:empty:before{content:attr(data-placeholder);color:#c8c8c0;pointer-events:none}
        [contenteditable] a{color:#b8944a;text-decoration:underline}
        [contenteditable] strong{font-weight:700}
        [contenteditable] em{font-style:italic}
        @media(max-width:640px){
          [contenteditable]{font-size:15px!important}
          header{padding:0 12px!important}
        }
      `}</style>
    </div>
  )
}
