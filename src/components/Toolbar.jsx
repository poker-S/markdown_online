import { useCallback, useState } from 'react'
import { useLang } from '../utils/LangContext.jsx'
import MathPanel from './MathPanel.jsx'
import TableBuilder from './TableBuilder.jsx'
import VisualEditor from './VisualEditor.jsx'

const TOOLBAR_ITEMS = [
  {
    group: 'heading',
    items: [
      { key: 'h1', prefix: '# ', linePrefix: true },
      { key: 'h2', prefix: '## ', linePrefix: true },
      { key: 'h3', prefix: '### ', linePrefix: true },
    ]
  },
  {
    group: 'inline',
    items: [
      { key: 'bold',   wrap: '**', cls: 'bold' },
      { key: 'italic', wrap: '*',  cls: 'italic' },
      { key: 'strike', wrap: '~~', cls: 'strike' },
      { key: 'code',   wrap: '`',  cls: 'code-btn' },
    ]
  },
  {
    group: 'block',
    items: [
      { key: 'quote',     prefix: '> ', linePrefix: true },
      { key: 'codeBlock', block: '```\n', blockEnd: '\n```', cls: 'code-btn' },
      { key: 'hr',        insert: '\n---\n' },
    ]
  },
  {
    group: 'list',
    items: [
      { key: 'ul',   prefix: '- ',      linePrefix: true },
      { key: 'ol',   prefix: '1. ',     linePrefix: true },
      { key: 'task', prefix: '- [ ] ',  linePrefix: true },
    ]
  },
  {
    group: 'insert',
    items: [
      { key: 'link',  snippet: '[链接文字](https://example.com)' },
      { key: 'image', snippet: '![图片描述](https://example.com/image.png)' },
    ]
  },
]

function insertText(view, text) {
  const { from, to } = view.state.selection.main
  view.dispatch({ changes: { from, to, insert: text }, selection: { anchor: from + text.length } })
  view.focus()
}

function wrapSelection(view, wrap) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  const wrapped = selected ? `${wrap}${selected}${wrap}` : `${wrap}文字${wrap}`
  const cursor = selected ? from + wrapped.length : from + wrap.length
  view.dispatch({ changes: { from, to, insert: wrapped }, selection: { anchor: cursor } })
  view.focus()
}

function prefixLine(view, prefix) {
  const { from } = view.state.selection.main
  const line = view.state.doc.lineAt(from)
  const already = line.text.startsWith(prefix)
  if (already) {
    view.dispatch({ changes: { from: line.from, to: line.from + prefix.length, insert: '' } })
  } else {
    view.dispatch({ changes: { from: line.from, insert: prefix } })
  }
  view.focus()
}

function insertBlock(view, start, end) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  const text = selected ? `${start}${selected}${end}` : `${start}代码${end}`
  view.dispatch({ changes: { from, to, insert: text } })
  view.focus()
}

export default function Toolbar({ editorViewRef, uploadConfig }) {
  const { t } = useLang()
  const [showMath, setShowMath] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [showVisual, setShowVisual] = useState(false)

  const handleAction = useCallback((item) => {
    const view = editorViewRef.current
    if (!view) return
    if (item.wrap)        wrapSelection(view, item.wrap)
    else if (item.linePrefix) prefixLine(view, item.prefix)
    else if (item.block)  insertBlock(view, item.block, item.blockEnd)
    else if (item.insert) insertText(view, item.insert)
    else if (item.snippet) insertText(view, item.snippet)
  }, [editorViewRef])

  return (
    <>
      <div className="toolbar">
        {TOOLBAR_ITEMS.map((group, gi) => (
          <div key={gi} className="toolbar-group">
            {group.items.map((item, ii) => (
              <button
                key={ii}
                className={`tb-btn ${item.cls || ''}`}
                title={t(`toolbar.${item.key}Title`)}
                onMouseDown={(e) => { e.preventDefault(); handleAction(item) }}
              >
                {t(`toolbar.${item.key}`)}
              </button>
            ))}
            {gi < TOOLBAR_ITEMS.length - 1 && <span className="toolbar-sep" />}
          </div>
        ))}
        <div className="toolbar-group">
          <span className="toolbar-sep" />
          <button className="tb-btn" title={t('toolbar.tableTitle')} onMouseDown={(e) => { e.preventDefault(); setShowTable(true) }}>{t('toolbar.table')}</button>
          <button className="tb-btn" title={t('toolbar.mathTitle')} onMouseDown={(e) => { e.preventDefault(); setShowMath(true) }}>{t('toolbar.math')}</button>
          <button className="tb-btn" title={t('toolbar.visualTitle')} onMouseDown={(e) => { e.preventDefault(); setShowVisual(true) }}>{t('toolbar.visual')}</button>
        </div>
      </div>
      {showMath && (
        <MathPanel
          onInsert={(text) => { insertText(editorViewRef.current, text); setShowMath(false) }}
          onClose={() => setShowMath(false)}
        />
      )}
      {showTable && (
        <TableBuilder
          onInsert={(text) => { insertText(editorViewRef.current, text); setShowTable(false) }}
          onClose={() => setShowTable(false)}
        />
      )}
      {showVisual && (
        <VisualEditor
          editorViewRef={editorViewRef}
          uploadConfig={uploadConfig}
          onClose={() => setShowVisual(false)}
        />
      )}
    </>
  )
}
