'use client'
import { useRef, useCallback } from 'react'

interface EditorProps {
  value: string
  onChange: (val: string) => void
  height?: number
}

export default function Editor({ value, onChange, height = 420 }: EditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const wrap = (before: string, after: string = '', placeholder: string = 'text') => {
    const el = ref.current
    if (!el) return
    const s = el.selectionStart
    const e = el.selectionEnd
    const sel = value.slice(s, e) || placeholder
    const next = value.slice(0, s) + before + sel + after + value.slice(e)
    onChange(next)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(s + before.length, s + before.length + sel.length)
    }, 10)
  }

  const line = (prefix: string) => {
    const el = ref.current
    if (!el) return
    const s = el.selectionStart
    const ls = value.lastIndexOf('\n', s - 1) + 1
    const next = value.slice(0, ls) + prefix + value.slice(ls)
    onChange(next)
    setTimeout(() => { el.focus(); el.setSelectionRange(s + prefix.length, s + prefix.length) }, 10)
  }

  const preview = (t: string) => t
    .replace(/^### (.+)/gm, '<h3 style="font-size:1.1em;font-weight:600;margin:1em 0 0.4em">$1</h3>')
    .replace(/^## (.+)/gm, '<h2 style="font-size:1.3em;font-weight:600;margin:1em 0 0.4em">$1</h2>')
    .replace(/^# (.+)/gm, '<h1 style="font-size:1.7em;font-weight:400;font-family:Georgia,serif;letter-spacing:-0.5px;margin:1em 0 0.4em">$1</h1>')
    .replace(/^> (.+)/gm, '<blockquote style="border-left:3px solid #e0e0d8;padding-left:1em;color:#78786e;margin:0.5em 0">$1</blockquote>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e0e0d8;margin:1.5em 0"/>')
    .replace(/^- (.+)/gm, '<li style="margin:0.2em 0;padding-left:1em;list-style:disc inside">$1</li>')
    .replace(/^\d+\. (.+)/gm, '<li style="margin:0.2em 0;padding-left:1em;list-style:decimal inside">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#f1f1ec;padding:0.1em 0.3em;border-radius:4px;font-size:0.9em;font-family:monospace">$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:0.5em 0;display:block"/>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#b8944a;text-decoration:underline">$1</a>')
    .split('\n\n').map(p => p.startsWith('<') ? p : `<p style="margin:0 0 0.75em;line-height:1.8">${p.replace(/\n/g, '<br/>')}</p>`).join('')

  const btnStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: '5px 9px', fontSize: '12px', fontWeight: 600,
    background: '#fff', border: '1px solid #e0e0d8', borderRadius: '6px',
    cursor: 'pointer', color: '#0c0c0a', lineHeight: 1,
    ...extra
  })

  return (
    <div style={{ border: '1px solid #e0e0d8', borderRadius: '10px', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '3px', padding: '8px', borderBottom: '1px solid #e0e0d8', background: '#f8f8f5', flexWrap: 'wrap' }}>
        <button type="button" style={btnStyle({ fontWeight: 900 })} onClick={() => wrap('**', '**', 'bold')}>B</button>
        <button type="button" style={btnStyle({ fontStyle: 'italic' })} onClick={() => wrap('*', '*', 'italic')}>I</button>
        <button type="button" style={btnStyle()} onClick={() => line('# ')}>H1</button>
        <button type="button" style={btnStyle()} onClick={() => line('## ')}>H2</button>
        <button type="button" style={btnStyle()} onClick={() => line('### ')}>H3</button>
        <span style={{ width: 1, background: '#e0e0d8', margin: '0 3px' }} />
        <button type="button" style={btnStyle()} onClick={() => line('> ')} title="Quote">❝</button>
        <button type="button" style={btnStyle()} onClick={() => line('- ')} title="Bullet">•</button>
        <button type="button" style={btnStyle()} onClick={() => line('1. ')} title="Numbered">1.</button>
        <span style={{ width: 1, background: '#e0e0d8', margin: '0 3px' }} />
        <button type="button" style={btnStyle({ fontFamily: 'monospace' })} onClick={() => wrap('`', '`', 'code')}>&lt;/&gt;</button>
        <button type="button" style={btnStyle()} onClick={() => wrap('[', '](https://)', 'link text')} title="Link">🔗</button>
        <button type="button" style={btnStyle()} onClick={() => wrap('![alt](', ')', 'https://image-url')} title="Image">🖼</button>
        <span style={{ width: 1, background: '#e0e0d8', margin: '0 3px' }} />
        <button type="button" style={btnStyle()} onClick={() => onChange(value + '\n\n---\n\n')} title="Divider">—</button>
      </div>

      {/* Editor + Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: height }}>
        <textarea
          ref={ref}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Start writing here..."
          spellCheck
          style={{
            width: '100%', minHeight: height, padding: '18px',
            fontSize: '14px', lineHeight: 1.75,
            fontFamily: 'ui-monospace, "Cascadia Code", monospace',
            border: 'none', outline: 'none', resize: 'vertical',
            background: '#fff', color: '#0c0c0a',
            borderRight: '1px solid #e0e0d8',
          }}
        />
        <div
          style={{ padding: '18px', fontSize: '14px', lineHeight: 1.75, color: '#1e1e1a', overflowY: 'auto', minHeight: height, background: '#fafaf8' }}
          dangerouslySetInnerHTML={{ __html: value ? preview(value) : '<p style="color:#b4b4a8">Preview appears here...</p>' }}
        />
      </div>

      <style>{`
        @media(max-width:640px){
          .editor-split{grid-template-columns:1fr!important}
          .editor-split textarea{border-right:none!important;border-bottom:1px solid #e0e0d8}
        }
      `}</style>
    </div>
  )
}
