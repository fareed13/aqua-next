'use client'

import { useEffect, useRef, useId } from 'react'

interface Props {
  value?: string
  contentFromLibrary?: string
  label?: string
  errorBorder?: boolean
  emailMode?: boolean
  onChange?: (html: string) => void
}

export function WYSIWYG({ value = '', contentFromLibrary, label, errorBorder = false, emailMode = false, onChange }: Props) {
  const id = useId().replace(/:/g, '')
  const editorId = `ql-${id}`
  const quillRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const [{ default: Quill }] = await Promise.all([
        import('quill'),
        import('quill/dist/quill.snow.css' as any),
      ])

      if (!mounted || !containerRef.current) return

      const modules: any = emailMode
        ? { toolbar: [['bold', 'italic', 'underline'], ['link'], ['clean']] }
        : {
            toolbar: [
              [{ font: [] }, { size: [] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ script: 'super' }, { script: 'sub' }],
              [{ header: [false, 1, 2, 3, 4, 5, 6] }, 'blockquote', 'code-block'],
              [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
              ['direction', { align: [] }],
              ['link'],
              ['clean'],
              [{ color: [] }, { background: [] }],
            ],
          }

      const Block = Quill.import('blots/block') as any
      Block.tagName = 'DIV'
      Quill.register(Block, true)

      quillRef.current = new Quill(`#${editorId}`, { theme: 'snow', modules })
      quillRef.current.root.innerHTML = value

      quillRef.current.on('text-change', () => {
        onChange?.(quillRef.current.root.innerHTML)
      })
    }

    init()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (quillRef.current && contentFromLibrary !== undefined) {
      quillRef.current.root.innerHTML = contentFromLibrary
    }
  }, [contentFromLibrary])

  return (
    <div className={errorBorder ? 'ring-1 ring-red-500 rounded' : ''}>
      {label && <label htmlFor={editorId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div ref={containerRef}>
        <div id={editorId} />
      </div>
      <style jsx global>{`
        .ql-editor { min-height: 150px; }
      `}</style>
    </div>
  )
}
