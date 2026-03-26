import { useState, useRef, useCallback, useEffect } from 'react'
import DOMPurify from 'dompurify'
import { useLang } from '../utils/LangContext.jsx'
import { fileToBase64, uploadImage } from '../utils/imageUpload.js'

const VISUAL_DRAFT_KEY = 'md-editor-visual-draft'
const VISUAL_ALLOWED_TAGS = [
  'a', 'b', 'blockquote', 'br', 'code', 'del', 'div', 'em', 'h1', 'h2', 'h3', 'i',
  'img', 'li', 'ol', 'p', 'pre', 's', 'span', 'strike', 'strong', 'table',
  'tbody', 'td', 'th', 'thead', 'tr', 'ul',
]
const VISUAL_ALLOWED_ATTR = ['alt', 'data-lang', 'data-uploading-id', 'href', 'src']

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitizeVisualHtml(html) {
  return DOMPurify.sanitize(html || '', {
    ALLOWED_TAGS: VISUAL_ALLOWED_TAGS,
    ALLOWED_ATTR: VISUAL_ALLOWED_ATTR,
  })
}

function applySanitizedEditorHtml(editRef, html) {
  if (!editRef.current) return ''
  const safeHtml = sanitizeVisualHtml(html)
  if (editRef.current.innerHTML !== safeHtml) {
    editRef.current.innerHTML = safeHtml
  }
  return safeHtml
}

function insertUploadPlaceholder(editRef, altText) {
  const placeholderId = `uploading-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const safeAlt = escapeHtml(altText || 'image')
  editRef.current?.focus()
  document.execCommand(
    'insertHTML',
    false,
    `<span data-uploading-id="${placeholderId}">Uploading ${safeAlt}...</span>`
  )
  return placeholderId
}

function replaceUploadPlaceholder(editRef, placeholderId, html) {
  const placeholder = editRef.current?.querySelector(`[data-uploading-id="${placeholderId}"]`)
  if (!placeholder) return
  placeholder.outerHTML = sanitizeVisualHtml(html)
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

function nodeToMd(node) {
  if (node.nodeType === 3) return node.textContent
  if (node.nodeType !== 1) return ''
  const tag = node.tagName.toLowerCase()
  const inner = () => Array.from(node.childNodes).map(nodeToMd).join('')
  switch (tag) {
    case 'br':
      return '\n'
    case 'pre': {
      const codeEl = node.querySelector('code')
      const lang = node.getAttribute('data-lang') || ''
      const text = (codeEl ? codeEl.textContent : node.textContent).trimEnd()
      return `\`\`\`${lang}\n${text}\n\`\`\`\n\n`
    }
    case 'b':
    case 'strong':
      return `**${inner()}**`
    case 'i':
    case 'em':
      return `*${inner()}*`
    case 's':
    case 'del':
    case 'strike':
      return `~~${inner()}~~`
    case 'code':
      return `\`${inner()}\``
    case 'h1':
      return `# ${inner()}\n\n`
    case 'h2':
      return `## ${inner()}\n\n`
    case 'h3':
      return `### ${inner()}\n\n`
    case 'blockquote': {
      const text = inner().trim()
      return text.split('\n').map(line => `> ${line}`).join('\n') + '\n\n'
    }
    case 'ul':
      return Array.from(node.children).map(li => `- ${nodeToMd(li).trim()}`).join('\n') + '\n\n'
    case 'ol':
      return Array.from(node.children).map((li, index) => `${index + 1}. ${nodeToMd(li).trim()}`).join('\n') + '\n\n'
    case 'li':
      return inner()
    case 'img':
      return `![${node.getAttribute('alt') || ''}](${node.getAttribute('src') || ''})`
    case 'table': {
      const rows = Array.from(node.querySelectorAll('tr'))
      if (!rows.length) return ''
      const toRow = (tr) => '| ' + Array.from(tr.querySelectorAll('th,td'))
        .map(cell => cell.textContent.trim().replace(/\|/g, '\\|') || ' ')
        .join(' | ') + ' |'
      const colCount = rows[0].querySelectorAll('th,td').length
      const separator = '| ' + Array(colCount).fill('---').join(' | ') + ' |'
      return [toRow(rows[0]), separator, ...rows.slice(1).map(toRow)].join('\n') + '\n\n'
    }
    case 'thead':
    case 'tbody':
    case 'tr':
    case 'th':
    case 'td':
      return inner()
    case 'a':
      return `[${inner()}](${node.getAttribute('href') || ''})`
    case 'p':
    case 'div':
      return inner() + '\n\n'
    default:
      return inner()
  }
}

function htmlToMarkdown(html) {
  const div = document.createElement('div')
  div.innerHTML = sanitizeVisualHtml(html)
  return Array.from(div.childNodes).map(nodeToMd).join('').replace(/\n{3,}/g, '\n\n').trim()
}

export default function VisualEditor({ editorViewRef, uploadConfig, onClose }) {
  const { t } = useLang()
  const [phase, setPhase] = useState('intro')
  const editRef = useRef(null)

  const VIS_TOOLBAR = [
    { label: t('visual.tb.h1'), cmd: 'formatBlock', val: 'h1', title: t('visual.tb.h1t') },
    { label: t('visual.tb.h2'), cmd: 'formatBlock', val: 'h2', title: t('visual.tb.h2t') },
    { label: t('visual.tb.h3'), cmd: 'formatBlock', val: 'h3', title: t('visual.tb.h3t') },
    null,
    { label: t('visual.tb.bold'), cmd: 'bold', title: t('visual.tb.boldt'), cls: 'bold' },
    { label: t('visual.tb.italic'), cmd: 'italic', title: t('visual.tb.italict'), cls: 'italic' },
    { label: t('visual.tb.strike'), cmd: 'strikeThrough', title: t('visual.tb.striket'), cls: 'strike' },
    { label: t('visual.tb.code'), cmd: 'code', title: t('visual.tb.codet'), cls: 'code-btn', special: 'code' },
    null,
    { label: t('visual.tb.quote'), cmd: 'formatBlock', val: 'blockquote', title: t('visual.tb.quotet') },
    { label: t('visual.tb.ul'), cmd: 'insertUnorderedList', title: t('visual.tb.ult') },
    { label: t('visual.tb.ol'), cmd: 'insertOrderedList', title: t('visual.tb.olt') },
    null,
    { label: t('visual.tb.link'), cmd: 'createLink', title: t('visual.tb.linkt'), special: 'link' },
    { label: t('visual.tb.table'), cmd: '', title: t('visual.tb.tablet'), special: 'table' },
    { label: t('visual.tb.imageUrl'), cmd: '', title: t('visual.tb.imageUrlt'), special: 'image-url' },
    { label: t('visual.tb.imageUpload'), cmd: '', title: t('visual.tb.imageUploadt'), special: 'image-upload' },
  ]

  const execCmd = useCallback((item) => {
    if (item.special === 'link') {
      const url = window.prompt(t('visual.linkPrompt'), 'https://')
      if (url) document.execCommand('createLink', false, url)
    } else if (item.special === 'image-url') {
      const url = window.prompt(t('visual.imageUrlPrompt'), 'https://')
      if (url) {
        document.execCommand('insertHTML', false, `<img src="${escapeHtml(url)}" alt="image">`)
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
              `<img src="${escapeHtml(src)}" alt="${escapeHtml(file.name)}">`
            )
          })
          .catch(() => removeUploadPlaceholder(editRef, placeholderId))
      }
      input.click()
      return
    } else if (item.special === 'code') {
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) {
        editRef.current?.focus()
        return
      }
      const range = sel.getRangeAt(0)
      let current = range.commonAncestorContainer
      if (current.nodeType === 3) current = current.parentNode
      let codeEl = null
      while (current && current !== editRef.current) {
        if (current.nodeName === 'CODE') {
          codeEl = current
          break
        }
        current = current.parentNode
      }
      if (codeEl) {
        const parent = codeEl.parentNode
        while (codeEl.firstChild) parent.insertBefore(codeEl.firstChild, codeEl)
        parent.removeChild(codeEl)
      } else if (!sel.isCollapsed) {
        const code = document.createElement('code')
        try {
          range.surroundContents(code)
        } catch {
          const frag = range.extractContents()
          code.appendChild(frag)
          range.insertNode(code)
        }
        sel.removeAllRanges()
      }
    } else if (item.val === 'blockquote') {
      const blockVal = `${document.queryCommandValue('formatBlock') || ''}`.toLowerCase()
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
    const html = sanitizeVisualHtml(editRef.current?.innerHTML || '')
    const md = htmlToMarkdown(html)
    if (!md) {
      onClose()
      return
    }
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
          : (
            <EditorScreen
              editRef={editRef}
              execCmd={execCmd}
              visToolbar={VIS_TOOLBAR}
              onInsert={handleInsert}
              onClose={onClose}
              uploadConfig={uploadConfig}
            />
          )}
      </div>
    </div>
  )
}

function IntroScreen({ onConfirm, onClose }) {
  const { t } = useLang()
  return (
    <div className="vis-intro">
      <button className="modal-close vis-intro-close" onClick={onClose}>✕</button>
      <div className="vis-intro-bg" />
      <div className="vis-intro-title">
        {'PokerS文档'.split('').map((ch, index) => (
          <span key={index} className="vis-char" style={{ animationDelay: `${index * 0.07}s` }}>{ch}</span>
        ))}
      </div>
      <p className="vis-intro-sub">{t('visual.introSub')}</p>
      <button className="btn-save vis-intro-btn" onClick={onConfirm}>{t('visual.start')}</button>
    </div>
  )
}

function EditorScreen({ editRef, execCmd, visToolbar, onInsert, onClose, uploadConfig }) {
  const { t } = useLang()
  const [showTablePicker, setShowTablePicker] = useState(false)
  const [showCodePicker, setShowCodePicker] = useState(false)
  const [activeFormats, setActiveFormats] = useState({})

  useEffect(() => {
    const draft = localStorage.getItem(VISUAL_DRAFT_KEY)
    if (!draft || !editRef.current) return
    const safeDraft = applySanitizedEditorHtml(editRef, draft)
    if (safeDraft) {
      localStorage.setItem(VISUAL_DRAFT_KEY, safeDraft)
    } else {
      localStorage.removeItem(VISUAL_DRAFT_KEY)
    }
  }, [editRef])

  const handleInput = useCallback(() => {
    if (!editRef.current) return
    const safeHtml = applySanitizedEditorHtml(editRef, editRef.current.innerHTML)
    if (safeHtml) {
      localStorage.setItem(VISUAL_DRAFT_KEY, safeHtml)
    } else {
      localStorage.removeItem(VISUAL_DRAFT_KEY)
    }
  }, [editRef])

  const handleClear = useCallback(() => {
    if (!window.confirm(t('visual.clearConfirm'))) return
    if (editRef.current) editRef.current.innerHTML = ''
    localStorage.removeItem(VISUAL_DRAFT_KEY)
    editRef.current?.focus()
  }, [editRef, t])

  const updateFormats = useCallback(() => {
    try {
      const blockVal = `${document.queryCommandValue('formatBlock') || ''}`.toLowerCase()
      const sel = window.getSelection()
      let inCode = false
      if (sel && sel.rangeCount > 0) {
        let node = sel.getRangeAt(0).commonAncestorContainer
        while (node && node !== editRef.current) {
          if (node.nodeName === 'CODE') {
            inCode = true
            break
          }
          node = node.parentNode
        }
      }
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
        h1: blockVal === 'h1',
        h2: blockVal === 'h2',
        h3: blockVal === 'h3',
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
    const html = `<pre data-lang="${escapeHtml(lang)}"><code>${escaped}</code></pre><p><br></p>`
    editRef.current?.focus()
    document.execCommand('insertHTML', false, html)
    setShowCodePicker(false)
  }, [editRef])

  const insertTable = useCallback((rows, cols) => {
    const thCells = Array.from({ length: cols }, (_, index) => `<th>Col${index + 1}</th>`).join('')
    const tdCells = Array.from({ length: cols }, () => '<td> </td>').join('')
    const dataRows = Array.from({ length: rows - 1 }, () => `<tr>${tdCells}</tr>`).join('')
    const html = `<table><thead><tr>${thCells}</tr></thead><tbody>${dataRows}</tbody></table><p><br></p>`
    editRef.current?.focus()
    document.execCommand('insertHTML', false, html)
    setShowTablePicker(false)
  }, [editRef])

  const handlePaste = useCallback((e) => {
    const items = Array.from(e.clipboardData?.items || [])
    const imageItem = items.find(item => item.type.startsWith('image/'))
    if (imageItem) {
      e.preventDefault()
      const file = imageItem.getAsFile()
      if (!file) return
      const placeholderId = insertUploadPlaceholder(editRef, file.name || 'image')
      uploadVisualImage(file, uploadConfig)
        .then((src) => {
          replaceUploadPlaceholder(
            editRef,
            placeholderId,
            `<img src="${escapeHtml(src)}" alt="${escapeHtml(file.name || 'image')}">`
          )
        })
        .catch(() => removeUploadPlaceholder(editRef, placeholderId))
      return
    }

    const html = e.clipboardData?.getData('text/html')
    if (html) {
      e.preventDefault()
      const safeHtml = sanitizeVisualHtml(html)
      if (safeHtml) document.execCommand('insertHTML', false, safeHtml)
      return
    }

    const text = e.clipboardData?.getData('text/plain')
    if (text) {
      e.preventDefault()
      document.execCommand('insertText', false, text)
    }
  }, [editRef, uploadConfig])

  return (
    <>
      <div className="vis-header">
        <span className="vis-header-title">{t('visual.headerTitle')}</span>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="vis-toolbar">
        {visToolbar.map((item, index) =>
          item === null
            ? <span key={index} className="toolbar-sep" />
            : item.special === 'table'
              ? (
                <div key={index} style={{ position: 'relative' }}>
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
                  <div key={index} style={{ position: 'relative' }}>
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
                    key={index}
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

function CodeBlockPicker({ onInsert, onClose }) {
  const { t } = useLang()
  const [lang, setLang] = useState('javascript')
  const [code, setCode] = useState('')
  const taRef = useRef(null)

  useEffect(() => {
    taRef.current?.focus()
  }, [])

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

function TablePicker({ onInsert, onClose }) {
  const { t } = useLang()
  const [hRow, setHRow] = useState(0)
  const [hCol, setHCol] = useState(0)
  const GRID = 8

  return (
    <div className="vis-table-picker" onMouseLeave={() => { setHRow(0); setHCol(0) }}>
      <div className="vis-table-grid">
        {Array.from({ length: GRID }, (_, row) => (
          <div key={row} style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: GRID }, (_, col) => (
              <div
                key={col}
                className="vis-table-cell"
                style={{ background: (row < hRow && col < hCol) ? 'var(--accent)' : 'var(--border-color)' }}
                onMouseEnter={() => { setHRow(row + 1); setHCol(col + 1) }}
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
