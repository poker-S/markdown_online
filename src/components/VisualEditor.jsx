import { useState, useRef, useCallback, useEffect } from 'react'
import { useLang } from '../utils/LangContext.jsx'
import { fileToBase64, uploadImage } from '../utils/imageUpload.js'

const VISUAL_DRAFT_KEY = 'md-editor-visual-draft'

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function insertUploadPlaceholder(editRef, altText) {
  const placeholderId = `uploading-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const safeAlt = escapeHtml(altText || 'image')
  editRef.current?.focus()
  document.execCommand(
    'insertHTML',
    false,
    `<span data-uploading-id="${placeholderId}" style="display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;background:var(--bg-secondary,#f5f5f7);border:1px solid var(--border-color,#d0d7de);font-size:12px;color:var(--text-secondary,#57606a)">Uploading ${safeAlt}...</span>`
  )
  return placeholderId
}

function replaceUploadPlaceholder(editRef, placeholderId, html) {
  const placeholder = editRef.current?.querySelector(`[data-uploading-id="${placeholderId}"]`)
  if (!placeholder) return
  placeholder.outerHTML = html
}

function removeUploadPlaceholder(editRef, placeholderId) {
  const placeholder = editRef.current?.querySelector(`[data-uploading-id="${placeholderId}"]`)
  placeholder?.remove()
}

async function uploadVisualImage(file, uploadConfig) {
  try {
    return await uploadImage(file, uploadConfig)
  } catch {
    return await fileToBase64(file)
  }
}

// HTML -> Markdown
function nodeToMd(node) {
  if (node.nodeType === 3) return node.textContent
  if (node.nodeType !== 1) return ''
  const tag = node.tagName.toLowerCase()
  const inner = () => Array.from(node.childNodes).map(nodeToMd).join('')
  switch (tag) {
    case 'br': return '\n'
    case 'pre': {
      const codeEl = node.querySelector('code')
      const lang = node.getAttribute('data-lang') || ''
      const text = (codeEl ? codeEl.textContent : node.textContent).trimEnd()
      return `\`\`\`${lang}\n${text}\n\`\`\`\n\n`
    }
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

// Main component
export default function VisualEditor({ editorViewRef, uploadConfig, onClose }) {
  const { t } = useLang()
  const [phase, setPhase] = useState('intro')
  const editRef = useRef(null)

  const VIS_TOOLBAR = [
    { label: t('visual.tb.h1'), cmd: 'formatBlock', val: 'h1', title: t('visual.tb.h1t') },
    { label: t('visual.tb.h2'), cmd: 'formatBlock', val: 'h2', title: t('visual.tb.h2t') },
    { label: t('visual.tb.h3'), cmd: 'formatBlock', val: 'h3', title: t('visual.tb.h3t') },
    null,
    { label: t('visual.tb.bold'),   cmd: 'bold',          title: t('visual.tb.boldt'),   cls: 'bold' },
    { label: t('visual.tb.italic'), cmd: 'italic',        title: t('visual.tb.italict'), cls: 'italic' },
    { label: t('visual.tb.strike'), cmd: 'strikeThrough', title: t('visual.tb.striket'), cls: 'strike' },
    { label: t('visual.tb.code'),   cmd: 'code',          title: t('visual.tb.codet'),   cls: 'code-btn', special: 'code' },
    null,
    { label: t('visual.tb.quote'), cmd: 'formatBlock',         val: 'blockquote', title: t('visual.tb.quotet') },
    { label: t('visual.tb.ul'),    cmd: 'insertUnorderedList',                    title: t('visual.tb.ult') },
    { label: t('visual.tb.ol'),    cmd: 'insertOrderedList',                      title: t('visual.tb.olt') },
    null,
    { label: t('visual.tb.link'),        cmd: 'createLink', title: t('visual.tb.linkt'),        special: 'link' },
    { label: t('visual.tb.table'),       cmd: '',           title: t('visual.tb.tablet'),        special: 'table' },
    { label: t('visual.tb.imageUrl'),    cmd: '',           title: t('visual.tb.imageUrlt'),     special: 'image-url' },
    { label: t('visual.tb.imageUpload'), cmd: '',           title: t('visual.tb.imageUploadt'),  special: 'image-upload' },
  ]

  const execCmd = useCallback((item) => {
    if (item.special === 'link') {
      const url = window.prompt(t('visual.linkPrompt'), 'https://')
      if (url) document.execCommand('createLink', false, url)
    } else if (item.special === 'image-url') {
      const url = window.prompt(t('visual.imageUrlPrompt'), 'https://')
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
        const placeholderId = insertUploadPlaceholder(editRef, file.name)
        uploadVisualImage(file, uploadConfig)
          .then((src) => {
            replaceUploadPlaceholder(
              editRef,
              placeholderId,
              `<img src="${escapeHtml(src)}" alt="${escapeHtml(file.name)}" style="max-width:100%">`
            )
          })
          .catch(() => removeUploadPlaceholder(editRef, placeholderId))
      }
      input.click()
      return
    } else if (item.special === 'code') {
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) { editRef.current?.focus(); return }
      const range = sel.getRangeAt(0)
      // Walk up to find enclosing <code>
      let cur = range.commonAncestorContainer
      if (cur.nodeType === 3) cur = cur.parentNode
      let codeEl = null
      while (cur && cur !== editRef.current) {
        if (cur.nodeName === 'CODE') { codeEl = cur; break }
        cur = cur.parentNode
      }
      if (codeEl) {
        // Toggle off: unwrap
        const parent = codeEl.parentNode
        while (codeEl.firstChild) parent.insertBefore(codeEl.firstChild, codeEl)
        parent.removeChild(codeEl)
      } else if (!sel.isCollapsed) {
        // Toggle on: wrap selection
        const code = document.createElement('code')
        try { range.surroundContents(code) }
        catch {
          const frag = range.extractContents()
          code.appendChild(frag)
          range.insertNode(code)
        }
        sel.removeAllRanges()
      }
    } else if (item.val === 'blockquote') {
      const blockVal = document.queryCommandValue('formatBlock').toLowerCase()
      if (blockVal === 'blockquote') {
        document.execCommand('formatBlock', false, 'p')
      } else {
        document.execCommand('formatBlock', false, 'blockquote')
      }
    } else if (item.val) {
      document.execCommand(item.cmd, false, item.val)
    } else {
      document.execCommand(item.cmd, false, null)
    }
    editRef.current?.focus()
  }, [t, uploadConfig])

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
    localStorage.removeItem(VISUAL_DRAFT_KEY)
    onClose()
  }, [editorViewRef, onClose])

  return (
    <div className="modal-overlay">
      <div className="vis-modal">
        {phase === 'intro'
          ? <IntroScreen onConfirm={() => setPhase('editor')} onClose={onClose} />
          : <EditorScreen editRef={editRef} execCmd={execCmd} visToolbar={VIS_TOOLBAR} onInsert={handleInsert} onClose={onClose} />
        }
      </div>
    </div>
  )
}

// Intro screen
function IntroScreen({ onConfirm, onClose }) {
  const { t } = useLang()
  return (
    <div className="vis-intro">
      <button className="modal-close vis-intro-close" onClick={onClose}>✕</button>
      <div className="vis-intro-bg" />
      <div className="vis-intro-title">
        {'PokerS文档'.split('').map((ch, i) => (
          <span key={i} className="vis-char" style={{ animationDelay: `${i * 0.07}s` }}>{ch}</span>
        ))}
      </div>
      <p className="vis-intro-sub">{t('visual.introSub')}</p>
      <button className="btn-save vis-intro-btn" onClick={onConfirm}>{t('visual.start')}</button>
    </div>
  )
}

// Editor screen
function EditorScreen({ editRef, execCmd, visToolbar, onInsert, onClose }) {
  const { t } = useLang()
  const [showTablePicker, setShowTablePicker] = useState(false)
  const [showCodePicker, setShowCodePicker] = useState(false)
  const [activeFormats, setActiveFormats] = useState({})

  useEffect(() => {
    const draft = localStorage.getItem(VISUAL_DRAFT_KEY)
    if (draft && editRef.current) editRef.current.innerHTML = draft
  }, [editRef])

  const handleInput = useCallback(() => {
    localStorage.setItem(VISUAL_DRAFT_KEY, editRef.current?.innerHTML || '')
  }, [editRef])

  const handleClear = useCallback(() => {
    if (!window.confirm(t('visual.clearConfirm'))) return
    if (editRef.current) editRef.current.innerHTML = ''
    localStorage.removeItem(VISUAL_DRAFT_KEY)
    editRef.current?.focus()
  }, [editRef, t])

  const updateFormats = useCallback(() => {
    try {
      const blockVal = document.queryCommandValue('formatBlock').toLowerCase()
      const sel = window.getSelection()
      let inCode = false
      if (sel && sel.rangeCount > 0) {
        let node = sel.getRangeAt(0).commonAncestorContainer
        while (node && node !== editRef.current) {
          if (node.nodeName === 'CODE') { inCode = true; break }
          node = node.parentNode
        }
      }
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
        h1: blockVal === 'h1', h2: blockVal === 'h2', h3: blockVal === 'h3',
        blockquote: blockVal === 'blockquote',
        code: inCode,
      })
    } catch {}
  }, [editRef])

  useEffect(() => {
    document.addEventListener('selectionchange', updateFormats)
    return () => document.removeEventListener('selectionchange', updateFormats)
  }, [updateFormats])

  const isActive = (item) => {
    if (!item) return false
    if (item.special === 'code') return !!activeFormats.code
    if (item.cmd === 'formatBlock') return !!activeFormats[item.val]
    return !!activeFormats[item.cmd]
  }

  const insertCodeBlock = useCallback((lang, code) => {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    const html = `<pre data-lang="${lang}"><code>${escaped}</code></pre><p><br></p>`
    editRef.current?.focus()
    document.execCommand('insertHTML', false, html)
    setShowCodePicker(false)
  }, [editRef])

  const insertTable = useCallback((rows, cols) => {
    const thCells = Array.from({ length: cols }, (_, i) =>
      `<th style="border:1px solid var(--border-color,#ccc);padding:6px 10px;background:var(--bg-secondary,#f5f5f7);font-weight:600">Col${i + 1}</th>`
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
    const placeholderId = insertUploadPlaceholder(editRef, file.name || 'image')
    uploadVisualImage(file, uploadConfig)
      .then((src) => {
        replaceUploadPlaceholder(
          editRef,
          placeholderId,
          `<img src="${escapeHtml(src)}" alt="${escapeHtml(file.name || 'image')}" style="max-width:100%">`
        )
      })
      .catch(() => removeUploadPlaceholder(editRef, placeholderId))
  }, [editRef, uploadConfig])

  return (
    <>
      <div className="vis-header">
        <span className="vis-header-title">{t('visual.headerTitle')}</span>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="vis-toolbar">
        {visToolbar.map((item, i) =>
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
              : item.special === 'code'
              ? (
                <div key={i} style={{ position: 'relative' }}>
                  <button
                    className={`tb-btn ${item.cls || ''} ${isActive(item) ? 'active' : ''}`}
                    title={item.title}
                    onMouseDown={e => {
                      e.preventDefault()
                      const sel = window.getSelection()
                      if (sel && !sel.isCollapsed) {
                        execCmd(item)
                        setTimeout(updateFormats, 0)
                      } else {
                        setShowCodePicker(v => !v)
                      }
                    }}
                  >{item.label}</button>
                  {showCodePicker && (
                    <CodeBlockPicker
                      onInsert={insertCodeBlock}
                      onClose={() => setShowCodePicker(false)}
                    />
                  )}
                </div>
              )
              : (
                <button
                  key={i}
                  className={`tb-btn ${item.cls || ''} ${isActive(item) ? 'active' : ''}`}
                  title={item.title}
                  onMouseDown={e => { e.preventDefault(); execCmd(item); setTimeout(updateFormats, 0) }}
                >{item.label}</button>
              )
        )}
      </div>
      <div
        ref={editRef}
        className="vis-content"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={t('visual.placeholder')}
      />
      <div className="vis-footer">
        <span className="vis-hint">{t('visual.hint')}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-cancel" onClick={handleClear}>{t('visual.clear')}</button>
          <button className="btn-save" onClick={onInsert}>{t('visual.confirm')}</button>
        </div>
      </div>
    </>
  )
}

// Code block picker
function CodeBlockPicker({ onInsert, onClose }) {
  const { t } = useLang()
  const [lang, setLang] = useState('javascript')
  const [code, setCode] = useState('')
  const taRef = useRef(null)

  useEffect(() => { taRef.current?.focus() }, [])

  return (
    <div className="vis-code-picker" onMouseDown={e => e.stopPropagation()}>
      <input
        className="vis-code-lang"
        value={lang}
        onChange={e => setLang(e.target.value)}
        placeholder={t('visual.tb.codeLang')}
        spellCheck={false}
      />
      <textarea
        ref={taRef}
        className="vis-code-textarea"
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder={t('visual.tb.codePlaceholder')}
        onKeyDown={e => { if (e.key === 'Escape') onClose() }}
        spellCheck={false}
      />
      <div className="vis-code-actions">
        <button className="btn-cancel" onMouseDown={e => { e.preventDefault(); onClose() }}>✕</button>
        <button className="btn-save" onMouseDown={e => { e.preventDefault(); if (code.trim()) onInsert(lang.trim(), code) }}>
          {t('visual.confirm')}
        </button>
      </div>
    </div>
  )
}

// Mini table grid picker
function TablePicker({ onInsert, onClose }) {
  const { t } = useLang()
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
        {hRow || 1} {t('table.rowLabel')} × {hCol || 1} {t('table.colLabel')}
      </div>
    </div>
  )
}


