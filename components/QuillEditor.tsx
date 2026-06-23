'use client'

import { useEffect, useRef, useId, forwardRef, useImperativeHandle } from 'react'

export interface QuillEditorHandle {
  getQuill: () => any
  getEditor: () => any
  getContents: (...a: any[]) => any
  setContents: (...a: any[]) => any
  getHTML: () => string
  setHTML: (html: string) => void
  getText: (...a: any[]) => string
  setText: (...a: any[]) => void
  pasteHTML: (html: string) => void
  focus: () => void
  reinit: () => void
}

interface Props {
  content?: string
  'onUpdate:content'?: (html: string) => void
  theme?: string
  toolbar?: string
  contentType?: string
  modules?: any
  onDrop?: (e: DragEvent) => void
  onDragover?: (e: DragEvent) => void
}

export const QuillEditor = forwardRef<QuillEditorHandle, Props>(function QuillEditor(props, ref) {
  const { content = '', 'onUpdate:content': onUpdateContent } = props
  const id = useId().replace(/:/g, '')
  const editorId = `qe-${id}`
  const quillRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    getQuill: () => quillRef.current,
    getEditor: () => quillRef.current,
    getContents: (...a) => quillRef.current?.getContents(...a),
    setContents: (...a) => quillRef.current?.setContents(...a),
    getHTML: () => quillRef.current?.root.innerHTML ?? '',
    setHTML: (html: string) => { if (quillRef.current) quillRef.current.root.innerHTML = html },
    getText: (...a) => quillRef.current?.getText(...a) ?? '',
    setText: (...a) => quillRef.current?.setText(...a),
    pasteHTML: (html: string) => { if (quillRef.current) quillRef.current.root.innerHTML = html },
    focus: () => quillRef.current?.focus(),
    reinit: () => {},
  }))

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const [{ default: Quill }] = await Promise.all([
        import('quill'),
        import('quill/dist/quill.snow.css' as any),
      ])

      if (!mounted) return

      const Block = Quill.import('blots/block') as any
      Block.tagName = 'DIV'
      Quill.register(Block, true)

      const modules = props.modules ?? {
        toolbar: [
          [{ font: [] }, { size: [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ header: [false, 1, 2, 3, 4, 5, 6] }, 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['direction', { align: [] }],
          ['link'], ['clean'],
          [{ color: [] }, { background: [] }],
        ],
      }

      quillRef.current = new Quill(`#${editorId}`, { theme: 'snow', modules })
      quillRef.current.root.innerHTML = content

      quillRef.current.on('text-change', () => {
        onUpdateContent?.(quillRef.current.root.innerHTML)
      })

      if (props.onDrop) {
        quillRef.current.root.addEventListener('drop', props.onDrop)
      }
      if (props.onDragover) {
        quillRef.current.root.addEventListener('dragover', props.onDragover)
      }
    }

    init()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (quillRef.current && content !== undefined) {
      const current = quillRef.current.root.innerHTML
      if (current !== content) quillRef.current.root.innerHTML = content
    }
  }, [content])

  return (
    <>
      <div id={editorId} />
      <style jsx global>{`
        .ql-editor { min-height: 150px; }
      `}</style>
    </>
  )
})
