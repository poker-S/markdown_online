import { useCallback, useState } from 'react'
import MathPanel from './MathPanel.jsx'
import TableBuilder from './TableBuilder.jsx'
import VisualEditor from './VisualEditor.jsx'

const TOOLBAR_ITEMS = [
  {
    group: 'heading',
    items: [
      { label: 'H1', title: '一级标题', prefix: '# ', linePrefix: true },
      { label: 'H2', title: '二级标题', prefix: '## ', linePrefix: true },
      { label: 'H3', title: '三级标题', prefix: '### ', linePrefix: true },
    ]
  },
  {
    group: 'inline',
    items: [
      { label: 'B', title: '加粗 (Ctrl+B)', wrap: '**', cls: 'bold' },
      { label: 'I', title: '斜体 (Ctrl+I)', wrap: '*', cls: 'italic' },
      { label: 'S', title: '删除线', wrap: '~~', cls: 'strike' },
      { label: '`', title: '行内代码', wrap: '`', cls: 'code-btn' },
    ]
  },
  {
    group: 'block',
    items: [
      { label: '❝', title: '引用', prefix: '> ', linePrefix: true },
      { label: '```', title: '代码块', block: '```\n', blockEnd: '\n```', cls: 'code-btn' },
      { label: '—', title: '分割线', insert: '\n---\n' },
    ]
  },
  {
    group: 'list',
    items: [
      { label: '• 列表', title: '无序列表', prefix: '- ', linePrefix: true },
      { label: '1. 列表', title: '有序列表', prefix: '1. ', linePrefix: true },
      { label: '☑ 任务', title: '任务列表', prefix: '- [ ] ', linePrefix: true },
    ]
  },
  {
    group: 'insert',
    items: [
      { label: '🔗 链接', title: '插入链接', snippet: '[链接文字](https://example.com)' },
      { label: '🖼 图片', title: '插入图片 URL', snippet: '![图片描述](https://example.com/image.png)' },
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

export default function Toolbar({ editorViewRef }) {
  const [showMath, setShowMath] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [showVisual, setShowVisual] = useState(false)

  const handleAction = useCallback((item) => {
    const view = editorViewRef.current
    if (!view) return

    if (item.wrap) {
      wrapSelection(view, item.wrap)
    } else if (item.linePrefix) {
      prefixLine(view, item.prefix)
    } else if (item.block) {
      insertBlock(view, item.block, item.blockEnd)
    } else if (item.insert) {
      insertText(view, item.insert)
    } else if (item.snippet) {
      insertText(view, item.snippet)
    }
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
                title={item.title}
                onMouseDown={(e) => { e.preventDefault(); handleAction(item) }}
              >
                {item.label}
              </button>
            ))}
            {gi < TOOLBAR_ITEMS.length - 1 && <span className="toolbar-sep" />}
          </div>
        ))}
        <div className="toolbar-group">
          <span className="toolbar-sep" />
          <button className="tb-btn" title="插入表格" onMouseDown={(e) => { e.preventDefault(); setShowTable(true) }}>⊞ 表格</button>
          <button className="tb-btn" title="数学公式库" onMouseDown={(e) => { e.preventDefault(); setShowMath(true) }}>∑ 公式</button>
          <button className="tb-btn" title="可视化插入（Word 风格编辑）" onMouseDown={(e) => { e.preventDefault(); setShowVisual(true) }}>✦ 可视化插入</button>
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
          onClose={() => setShowVisual(false)}
        />
      )}
    </>
  )
}
