import { useState, useRef, useCallback } from 'react'

// ── HTML → Markdown ──────────────────────────────────────────────
function nodeToMd(node) {
  if (node.nodeType === 3) return node.textContent
  if (node.nodeType !== 1) return ''
  const tag = node.tagName.toLowerCase()
  const inner = () => Array.from(node.childNodes).map(nodeToMd).join('')
  switch (tag) {
    case 'br': return '\n'
    case 'b': case 'strong': return `**${inner()}**`
    case 'i': case 'em': return `*${inner()}*`
    case 's': case 'del': case 'strike': return `~~${inner()}~~`
    case 'code': return `\`${inner()}\``
    case 'h1': return `# ${inner()}\n\n`
    case 'h2': return `## ${inner()}\n\n`
    case 'h3': return `### ${inner()}\n\n`
    case 'blockquote': {
      const t = inner().trim()
      return t.split('\n').map(l => `> ${l}`).join('\n') + '\n\n'
    }
    case 'ul':
      return Array.from(node.children).map(li => `- ${nodeToMd(li).trim()}`).join('\n') + '\n\n'
    case 'ol':
      return Array.from(node.children).map((li, i) => `${i + 1}. ${nodeToMd(li).trim()}`).join('\n') + '\n\n'
    case 'li': return inner()
    case 'img': return `![${node.getAttribute('alt') || ''}](${node.getAttribute('src') || ''})`
    case 'table': {
      const rows = Array.from(node.querySelectorAll('tr'))
      if (!rows.length) return ''
      const toRow = (tr) => '| ' + Array.from(tr.querySelectorAll('th,td'))
        .map(c => c.textContent.trim().replace(/\|/g, '\\|') || ' ').join(' | ') + ' |'
      const colCount = rows[0].querySelectorAll('th,td').length
      const sep = '| ' + Array(colCount).fill('---').join(' | ') + ' |'
      return [toRow(rows[0]), sep, ...rows.slice(1).map(toRow)].join('\n') + '\n\n'
    }
    case 'thead': case 'tbody': case 'tr': case 'th': case 'td': return inner()
    case 'a': return `[${inner()}](${node.getAttribute('href') || ''})`
    case 'p': case 'div': return inner() + '\n\n'
    default: return inner()
  }
}

function htmlToMarkdown(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  return Array.from(div.childNodes).map(nodeToMd).join('').replace(/\n{3,}/g, '\n\n').trim()
}

// ── Toolbar config ────────────────────────────────────────────────
const VIS_TOOLBAR = [
  { label: 'H1', cmd: 'formatBlock', val: 'h1', title: '一级标题' },
  { label: 'H2', cmd: 'formatBlock', val: 'h2', title: '二级标题' },
  { label: 'H3', cmd: 'formatBlock', val: 'h3', title: '三级标题' },
  null,
  { label: 'B',  cmd: 'bold',          title: '加粗',   cls: 'bold' },
  { label: 'I',  cmd: 'italic',        title: '斜体',   cls: 'italic' },
  { label: 'S',  cmd: 'strikeThrough', title: '删除线', cls: 'strike' },
  { label: '`',  cmd: 'code',          title: '行内代码', cls: 'code-btn', special: 'code' },
  null,
  { label: '❝',     cmd: 'formatBlock',          val: 'blockquote', title: '引用' },
  { label: '• 列表', cmd: 'insertUnorderedList',  title: '无序列表' },
  { label: '1. 列表',cmd: 'insertOrderedList',    title: '有序列表' },
  null,
  { label: '🔗 链接', cmd: 'createLink', title: '插入链接', special: 'link' },
  { label: '🔲 表格', cmd: '', title: '插入表格', special: 'table' },
  { label: '🖼 图片URL', cmd: '', title: '通过URL插入图片', special: 'image-url' },
  { label: '📁 上传图片', cmd: '', title: '从本地上传图片', special: 'image-upload' },
]

// ── Main component ────────────────────────────────────────────────
export default function VisualEditor({ editorViewRef, onClose }) {
  const [phase, setPhase] = useState('intro')
  const editRef = useRef(null)

  const execCmd = useCallback((item) => {
    if (item.special === 'link') {
      const url = window.prompt('输入链接地址：', 'https://')
      if (url) document.execCommand('createLink', false, url)
    } else if (item.special === 'image-url') {
      const url = window.prompt('输入图片地址：', 'https://')
      if (url) {
        document.execCommand('insertHTML', false, `<img src="${url}" alt="image" style="max-width:100%">`)
      }
    } else if (item.special === 'image-upload') {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
          editRef.current?.focus()
          document.execCommand('insertHTML', false, `<img src="${ev.target.result}" alt="${file.name}" style="max-width:100%">`)
        }
        reader.readAsDataURL(file)
      }
      input.click()
      return
    } else if (item.special === 'code') {
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0)
        const code = document.createElement('code')
        try { range.surroundContents(code) }
        catch {
          const frag = range.extractContents()
          code.appendChild(frag)
          range.insertNode(code)
        }
        sel.removeAllRanges()
      }
    } else if (item.val) {
      document.execCommand(item.cmd, false, item.val)
    } else {
      document.execCommand(item.cmd, false, null)
    }
    editRef.current?.focus()
  }, [])

  const handleInsert = useCallback(() => {
    const html = editRef.current?.innerHTML || ''
    const md = htmlToMarkdown(html)
    if (!md) { onClose(); return }
    const view = editorViewRef.current
    if (view) {
      const { from, to } = view.state.selection.main
      const insert = '\n' + md + '\n'
      view.dispatch({ changes: { from, to, insert }, selection: { anchor: from + insert.length } })
      view.focus()
    }
    onClose()
  }, [editorViewRef, onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="vis-modal" onClick={e => e.stopPropagation()}>
        {phase === 'intro'
          ? <IntroScreen onConfirm={() => setPhase('editor')} onClose={onClose} />
          : <EditorScreen editRef={editRef} execCmd={execCmd} onInsert={handleInsert} onClose={onClose} />
        }
      </div>
    </div>
  )
}

// ── Intro screen ──────────────────────────────────────────────────
function IntroScreen({ onConfirm, onClose }) {
  return (
    <div className="vis-intro">
      <button className="modal-close vis-intro-close" onClick={onClose}>✕</button>
      <div className="vis-intro-bg" />
      <div className="vis-intro-title">
        {'PokerS文档'.split('').map((ch, i) => (
          <span key={i} className="vis-char" style={{ animationDelay: `${i * 0.07}s` }}>{ch}</span>
        ))}
      </div>
      <p className="vis-intro-sub">可视化 Markdown 编辑器 · 所见即所得</p>
      <button className="btn-save vis-intro-btn" onClick={onConfirm}>开始使用 →</button>
    </div>
  )
}

// ── Editor screen ─────────────────────────────────────────────────
function EditorScreen({ editRef, execCmd, onInsert, onClose }) {
  const [showTablePicker, setShowTablePicker] = useState(false)

  const insertTable = useCallback((rows, cols) => {
    const thCells = Array.from({ length: cols }, (_, i) =>
      `<th style="border:1px solid var(--border-color,#ccc);padding:6px 10px;background:var(--bg-secondary,#f5f5f7);font-weight:600">列${i + 1}</th>`
    ).join('')
    const tdCells = Array.from({ length: cols }, () =>
      `<td style="border:1px solid var(--border-color,#ccc);padding:6px 10px"> </td>`
    ).join('')
    const dataRows = Array.from({ length: rows - 1 }, () => `<tr>${tdCells}</tr>`).join('')
    const html = `<table style="border-collapse:collapse;width:100%;margin:.6em 0"><thead><tr>${thCells}</tr></thead><tbody>${dataRows}</tbody></table><p><br></p>`
    editRef.current?.focus()
    document.execCommand('insertHTML', false, html)
    setShowTablePicker(false)
  }, [editRef])

  const handlePaste = useCallback((e) => {
    const items = Array.from(e.clipboardData?.items || [])
    const imageItem = items.find(item => item.type.startsWith('image/'))
    if (!imageItem) return
    e.preventDefault()
    const file = imageItem.getAsFile()
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      document.execCommand('insertHTML', false, `<img src="${ev.target.result}" alt="image" style="max-width:100%">`)
    }
    reader.readAsDataURL(file)
  }, [])
  return (
    <>
      <div className="vis-header">
        <span className="vis-header-title">PokerS文档 · 可视化插入</span>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="vis-toolbar">
        {VIS_TOOLBAR.map((item, i) =>
          item === null
            ? <span key={i} className="toolbar-sep" />
            : item.special === 'table'
              ? (
                <div key={i} style={{ position: 'relative' }}>
                  <button
                    className="tb-btn"
                    title={item.title}
                    onMouseDown={e => { e.preventDefault(); setShowTablePicker(v => !v) }}
                  >{item.label}</button>
                  {showTablePicker && (
                    <TablePicker
                      onInsert={insertTable}
                      onClose={() => setShowTablePicker(false)}
                    />
                  )}
                </div>
              )
              : (
                <button
                  key={i}
                  className={`tb-btn ${item.cls || ''}`}
                  title={item.title}
                  onMouseDown={e => { e.preventDefault(); execCmd(item) }}
                >{item.label}</button>
              )
        )}
      </div>
      <div
        ref={editRef}
        className="vis-content"
        contentEditable
        suppressContentEditableWarning
        onPaste={handlePaste}
        data-placeholder="在此输入内容，选中文字后点击上方按钮应用格式..."
      />
      <div className="vis-footer">
        <span className="vis-hint">选中文字 → 点击格式按钮 · 完成后点击右侧按钮插入到编辑器光标处</span>
        <button className="btn-save" onClick={onInsert}>确认插入 ✓</button>
      </div>
    </>
  )
}

// ── Mini table grid picker ────────────────────────────────────────
function TablePicker({ onInsert, onClose }) {
  const [hRow, setHRow] = useState(0)
  const [hCol, setHCol] = useState(0)
  const GRID = 8

  return (
    <div className="vis-table-picker" onMouseLeave={() => { setHRow(0); setHCol(0) }}>
      <div className="vis-table-grid">
        {Array.from({ length: GRID }, (_, r) => (
          <div key={r} style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: GRID }, (_, c) => (
              <div
                key={c}
                className="vis-table-cell"
                style={{ background: (r < hRow && c < hCol) ? 'var(--accent)' : 'var(--border-color)' }}
                onMouseEnter={() => { setHRow(r + 1); setHCol(c + 1) }}
                onClick={() => { if (hRow > 0 && hCol > 0) onInsert(hRow, hCol); else onClose() }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="vis-table-label">
        {hRow || 1} 行 × {hCol || 1} 列
      </div>
    </div>
  )
}
