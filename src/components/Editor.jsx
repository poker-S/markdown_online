import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { uploadImage, fileToBase64 } from '../utils/imageUpload.js'
import { base64CollapsePlugin } from '../utils/base64Collapse.js'

const lightTheme = EditorView.theme({
  '&': { background: 'var(--bg-primary)', color: 'var(--text-primary)', height: '100%' },
  '.cm-scroller': { fontFamily: "var(--font-mono, 'SF Mono', Consolas, monospace)", fontSize: '14px', lineHeight: '1.7' },
  '.cm-gutters': { background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-light)', color: 'var(--text-muted)' },
  '.cm-activeLineGutter': { background: 'var(--bg-toolbar)' },
  '.cm-activeLine': { background: 'rgba(0,113,227,0.04)' },
  '.cm-cursor': { borderLeftColor: 'var(--accent)' },
  '.cm-selectionBackground': { background: 'rgba(0,113,227,0.15) !important' },
  '.cm-focused .cm-selectionBackground': { background: 'rgba(0,113,227,0.2) !important' },
})

export default function Editor({ content, onChange, theme, editorViewRef, uploadConfig }) {
  const containerRef = useRef(null)
  const viewRef = useRef(null)
  const isExternalUpdate = useRef(false)
  const uploadConfigRef = useRef(uploadConfig)
  const onChangeRef = useRef(onChange)

  useEffect(() => { uploadConfigRef.current = uploadConfig }, [uploadConfig])
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  useEffect(() => {
    if (!containerRef.current) return

    const imagePasteHandler = EditorView.domEventHandlers({
      paste(event, view) {
        const items = Array.from(event.clipboardData?.items || [])
        const imageItem = items.find(item => item.type.startsWith('image/'))
        if (!imageItem) return false

        event.preventDefault()
        const file = imageItem.getAsFile()
        if (!file) return false

        // Insert placeholder
        const placeholderId = `uploading-${Date.now()}`
        const placeholder = `![上传中...](${placeholderId})`
        const { from, to } = view.state.selection.main
        view.dispatch({
          changes: { from, to, insert: placeholder },
          selection: { anchor: from + placeholder.length },
        })

        uploadImage(file, uploadConfigRef.current)
          .then(url => {
            const doc = view.state.doc.toString()
            const idx = doc.indexOf(placeholder)
            if (idx !== -1) {
              const mdText = `![image](${url})`
              view.dispatch({ changes: { from: idx, to: idx + placeholder.length, insert: mdText } })
              onChangeRef.current(view.state.doc.toString())
            }
          })
          .catch(() => {
            fileToBase64(file).then(base64 => {
              const doc = view.state.doc.toString()
              const idx = doc.indexOf(placeholder)
              if (idx !== -1) {
                const mdText = `![image](${base64})`
                view.dispatch({ changes: { from: idx, to: idx + placeholder.length, insert: mdText } })
                onChangeRef.current(view.state.doc.toString())
              }
            }).catch(() => {
              const doc = view.state.doc.toString()
              const idx = doc.indexOf(placeholder)
              if (idx !== -1) {
                view.dispatch({ changes: { from: idx, to: idx + placeholder.length, insert: '' } })
                onChangeRef.current(view.state.doc.toString())
              }
            })
          })

        return true
      },
    })

    const extensions = [
      basicSetup,
      markdown(),
      EditorView.lineWrapping,
      imagePasteHandler,
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !isExternalUpdate.current) {
          onChangeRef.current(update.state.doc.toString())
        }
      }),
      theme === 'dark' ? oneDark : lightTheme,
      ...base64CollapsePlugin,
    ]

    const state = EditorState.create({ doc: content, extensions })
    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view
    editorViewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
      editorViewRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== content) {
      isExternalUpdate.current = true
      view.dispatch({ changes: { from: 0, to: current.length, insert: content } })
      isExternalUpdate.current = false
    }
  }, [content])

  return <div ref={containerRef} style={{ height: '100%', overflow: 'hidden' }} />
}
