'use client'
import { useRef, useEffect } from 'react'

interface Props {
  html: string
  onChange: (html: string) => void
  onFocus: () => void
  onEnter: () => void
  onBackspaceEmpty: () => void
  placeholder: string
  style?: React.CSSProperties
  tagName?: string
}

export default function EditableBlock({ html, onChange, onFocus, onEnter, onBackspaceEmpty, placeholder, style, tagName = 'p' }: Props) {
  const ref = useRef<HTMLElement>(null)
  const lastHtml = useRef(html)
  const isFocused = useRef(false)

  useEffect(() => {
    if (ref.current && !isFocused.current && html !== lastHtml.current) {
      ref.current.innerHTML = html
      lastHtml.current = html
    }
  }, [html])

  const Tag = tagName as any

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onFocus={() => { isFocused.current = true; onFocus() }}
      onBlur={() => { isFocused.current = false }}
      onInput={(e: any) => {
        const val = e.currentTarget.innerHTML
        lastHtml.current = val
        onChange(val)
      }}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEnter() }
        if (e.key === 'Backspace') {
          const el = ref.current
          if (el && (el.innerText === '' || el.innerText === '\n')) { e.preventDefault(); onBackspaceEmpty() }
        }
      }}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ outline: 'none', minHeight: 28, width: '100%', ...style }}
    />
  )
}
