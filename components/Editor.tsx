'use client'
import { useRef, useCallback } from 'react'

interface EditorProps {
  value: string
  onChange: (val: string) => void
  height?: number
}

export default function Editor({ value, onChange, height = 500 }: EditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const insert = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end) || placeholder
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end)
    onChange(newVal)
    setTimeout(() => {
      el.focus()
      const newPos = start + before.length + selected.length + after.length
      el.setSelectionRange(newPos, newPos)
    }, 0)
  }, [value, onChange])

  const insertLine = useCallback((prefix: string) => {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const newVal = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    onChange(newVal)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, start + prefix.length)
    }, 0)
  }, [value, onChange])

  const tools = [
    { label: 'B', title: 'Bold', action: () => insert('**', '**', 'bold text'), style: { fontWeight: 700 } as React.CSSProperties },
    { label: 'I', title: 'Italic', action: () => insert('*', '*', 'italic text'), style: { fontStyle: 'italic' } as React.CSSProperties },
    { label: 'H1', title: 'Heading 1', action: () => insertLine('# '), style: {} as React.CSSProperties },
    { label: 'H2', title: 'Heading 2', action: () => insertLine('## '), style: {} as React.CSSProperties },
    { label: 'H3', title: 'Heading 3', action: () => insertLine('### '), style: {} as React.CSSProperties },
    { label: '—', title: 'Divider', action: () => insert('\n\n---\n\n'), style: {} as React.CSSProperties },
    { label: '"', title: 'Quote', action: () => insertLine('> '), style: {} as React.CSSProperties },
    { label: '•', title: 'Bullet list', action: () => insertLine('- '), style: {} as React.CSSProperties },
    { label: '1.', title: 'Numbered list', action: () => insertLine('1. '), style: {} as React.CSSProperties },
    { label: '<>', title: 'Inline code', action: () => insert('`', '`', 'code'), style: { fontFamily: 'monospace' } as React.CSSProperties },
    { label: '🔗', title: 'Link', action: () => insert('[', '](https://)', 'link text'), style: {} as React.CSSProperties },
    { label: '🖼', title: 'Image', action: () => insert('![', '](https://)', 'alt text'), style: {} as React.CSSProperties },
  ]

  const renderPreview = (text: string) => {
    return text
      .replace(/^### (.+)/gm, '<h3 style="font-size:1.1rem;font-weight:600;margin:1rem 0 0.5rem">$1</h3>')
      .replace(/^## (.+)/gm, '<h2 style="font-size:1.3rem;font-weight:600;margin:1.2rem 0 0.5rem">$1</h2>')
      .replace(/^# (.+)/gm, '<h1 style="font-size:1.6rem;font-weight:400;letter-spacing:-0.5px;margin:1.2rem 0 0.5rem;font-family:Georgia,serif">$1</h1>')
      .replace(/^> (.+)/gm, '<blockquote style="border-left:3px solid #e0e0d8;padding-left:1rem;color:#78786e;margin:0.75rem 0">$1</blockquote>')
      .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e0e0d8;margin:1.5rem 0"/>')
      .replace(/^- (.+)/gm, '<li style="margin:0.25rem 0;margin-left:1.5rem;list-style:disc">$1</li>')
      .replace(/^\d+\. (.+)/gm, '<li style="margin:0.25rem 0;margin-left:1.5rem;list-style:decimal">$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:#f1f1ec;padding:0.1rem 0.3rem;border-radius:4px;font-size:0.875rem">$1</code>')
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:0.5rem 0"/>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#b8944a;text-decoration:underline">$1</a>')
      .replace(/\n\n/g, '</p><p style="margin:0.75rem 0;line-height:1.8">')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div style={{ border: '1px solid #e0e0d8', borderRadius: '10px', overflow: 'hidden', background: '#fff' }}>
      <div style={{ display: 'flex', gap: '4px', padding: '8px 10px', borderBottom: '1px solid #e0e0d8', background: '#f8f8f5', flexWrap: 'wrap' }}>
        {tools.map((tool) => (
          <button key={tool.label} title={tool.title} type="button" onClick={tool.action}
            style={{ padding: '6px 10px', fontSize: '12px', fontWeight: 500, background: '#fff', border: '1px solid #e0e0d8', borderRadius: '6px', cursor: 'pointer', color: '#0c0c0a', minWidth: '34px', textAlign: 'center' as const, ...tool.style }}>
            {tool.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)}
          placeholder="Start writing..."
          style={{ width: '100%', minHeight: `${height}px`, padding: '20px', fontSize: '14px', lineHeight: '1.75', fontFamily: 'ui-monospace,monospace', border: 'none', outline: 'none', resize: 'vertical', background: '#fff', color: '#0c0c0a', borderRight: '1px solid #e0e0d8' }} />
        <div style={{ padding: '20px', fontSize: '14px', lineHeight: '1.75', color: '#1e1e1a', overflowY: 'auto', minHeight: `${height}px`, background: '#fafaf8' }}
          dangerouslySetInnerHTML={{ __html: '<p style="margin:0;line-height:1.8">' + renderPreview(value) + '</p>' }} />
      </div>
      <style>{`@media(max-width:768px){.editor-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
