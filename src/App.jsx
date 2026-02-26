import { useState, useRef, useCallback, useEffect } from 'react'
import DOMPurify from 'dompurify'
import { inlineStylesForWechat } from './utils/inlineStyles.js'
import Toolbar from './components/Toolbar.jsx'
import Editor from './components/Editor.jsx'
import Preview from './components/Preview.jsx'
import StatusBar from './components/StatusBar.jsx'
import Settings from './components/Settings.jsx'
import ImageModeHint, { shouldShowHint } from './components/ImageModeHint.jsx'

const UPLOAD_CONFIG_KEY = 'md-editor-upload-config'
const AUTOSAVE_KEY = 'md-editor-autosave'

const DEFAULT_CONTENT = `# 欢迎使用 Markdown Editor

这是一个 **Mac 风格**的 Markdown 编辑器，支持实时预览。

## 功能特性

- ✅ 实时分栏预览
- ✅ 粘贴图片自动转为 Markdown 链接
- ✅ 代码语法高亮
- ✅ 数学公式支持（KaTeX）
- ✅ 暗色 / 亮色主题切换
- ✅ 文件导入 / 导出

## 代码示例

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`)
}
hello('World')
\`\`\`

## 数学公式

行内公式：$E = mc^2$

块级公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## 表格

| 功能 | 快捷键 |
|------|--------|
| 加粗 | Cmd+B |
| 斜体 | Cmd+I |
| 保存 | Cmd+S |

> 提示：直接粘贴图片即可自动插入 Markdown 图片链接！
`

export default function App() {
  const saved = (() => { try { return JSON.parse(localStorage.getItem(AUTOSAVE_KEY)) || {} } catch { return {} } })()
  const [content, setContent] = useState(saved.content ?? DEFAULT_CONTENT)
  const [theme, setTheme] = useState(saved.theme ?? 'light')
  const [viewMode, setViewMode] = useState('split')
  const [fileName, setFileName] = useState(saved.fileName ?? 'Untitled.md')
  const [splitRatio, setSplitRatio] = useState(50)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [showRename, setShowRename] = useState(false)
  const [renameInput, setRenameInput] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showHint, setShowHint] = useState(() => shouldShowHint())
  const [lastSaved, setLastSaved] = useState(saved.content != null ? Date.now() : null)
  const [uploadConfig, setUploadConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem(UPLOAD_CONFIG_KEY)) || { service: 'base64' } }
    catch { return { service: 'base64' } }
  })
  const editorViewRef = useRef(null)
  const containerRef = useRef(null)
  const isDragging = useRef(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const hljsTheme = document.getElementById('hljs-theme')
    if (hljsTheme) {
      hljsTheme.href = theme === 'dark'
        ? 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css'
        : 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css'
    }
  }, [theme])

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ content, fileName, theme }))
      setLastSaved(Date.now())
    }, 1000)
    return () => clearTimeout(timer)
  }, [content, fileName, theme])

  const handleDividerMouseDown = useCallback((e) => {
    e.preventDefault()
    isDragging.current = true
    const startX = e.clientX
    const startRatio = splitRatio

    const handleMouseMove = (e) => {
      if (!isDragging.current || !containerRef.current) return
      const delta = e.clientX - startX
      const containerWidth = containerRef.current.offsetWidth
      const newRatio = startRatio + (delta / containerWidth) * 100
      setSplitRatio(Math.max(20, Math.min(80, newRatio)))
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [splitRatio])

  const handleSaveUploadConfig = useCallback((config) => {
    setUploadConfig(config)
    localStorage.setItem(UPLOAD_CONFIG_KEY, JSON.stringify(config))
  }, [])

  const handleSave = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }, [content, fileName])

  const handleOpen = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.txt'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => setContent(e.target.result)
      reader.readAsText(file)
    }
    input.click()
  }, [])

  const handleCopyRich = useCallback(async () => {
    const previewEl = document.querySelector('.preview-content')
    if (!previewEl) return
    const html = await inlineStylesForWechat(previewEl)
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }) })
      ])
      alert('已复制富文本，可粘贴到微信公众号编辑器')
    } catch (e) {
      // Fallback: use execCommand via a temporary contenteditable
      const div = document.createElement('div')
      div.contentEditable = 'true'
      div.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
      div.innerHTML = html
      document.body.appendChild(div)
      const sel = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(div)
      sel.removeAllRanges()
      sel.addRange(range)
      document.execCommand('copy')
      sel.removeAllRanges()
      document.body.removeChild(div)
      alert('已复制富文本，可粘贴到微信公众号编辑器')
    }
  }, [])

  const handleExportHtml = useCallback(() => {
    import('./components/Preview.jsx').then(() => {
      const previewEl = document.querySelector('.preview-content')
      if (!previewEl) return
      const safeBody = DOMPurify.sanitize(previewEl.innerHTML)
      const safeTitle = fileName.replace('.md', '').replace(/[<>"&]/g, c => ({'<':'&lt;','>':'&gt;','"':'&quot;','&':'&amp;'}[c]))
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${safeTitle}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css">
<style>body{max-width:800px;margin:40px auto;padding:0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#1d1d1f}</style>
</head>
<body>${safeBody}</body>
</html>`
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName.replace(/\.md$/, '.html')
      a.click()
      URL.revokeObjectURL(url)
    })
  }, [fileName])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  return (
    <div className={`app ${isFocusMode ? 'focus-mode' : ''}`}>
      {/* Title Bar */}
      <div className="title-bar">
        <div className="traffic-lights">
          <span className="traffic-light red" />
          <span className="traffic-light yellow" />
          <span className="traffic-light green" />
        </div>
        <div className="title-bar-center">
          <span className="file-name">{fileName}</span>
          <button
            className="rename-btn"
            title="重命名"
            onClick={() => {
              const lastDot = fileName.lastIndexOf('.')
              setRenameInput(lastDot === -1 ? fileName : fileName.slice(0, lastDot))
              setShowRename(true)
            }}
          >✎</button>
        </div>
        <div className="title-bar-actions">
          <button className="view-btn" onClick={handleOpen} title="打开文件">Open</button>
          <button className="view-btn" onClick={handleSave} title="保存 (Cmd+S)">Save</button>
          <button className="view-btn" onClick={handleExportHtml} title="导出 HTML">Export</button>
          <button className="view-btn" onClick={handleCopyRich} title="复制富文本（微信公众号）">Copy</button>
          <div className="view-mode-group">
            <button className={`view-btn ${viewMode === 'editor' ? 'active' : ''}`} onClick={() => setViewMode('editor')} title="仅编辑">Edit</button>
            <button className={`view-btn ${viewMode === 'split' ? 'active' : ''}`} onClick={() => setViewMode('split')} title="分栏">Split</button>
            <button className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`} onClick={() => setViewMode('preview')} title="仅预览">Preview</button>
          </div>
          <button className="view-btn icon-btn" onClick={() => setShowSettings(true)} title="图片上传设置">⚙️</button>
          <button className="view-btn icon-btn" onClick={() => setIsFocusMode(f => !f)} title="专注模式">
            {isFocusMode ? '⊡' : '⊞'}
          </button>
          <button className="view-btn icon-btn" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} title="切换主题">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {!isFocusMode && (
        <Toolbar editorViewRef={editorViewRef} theme={theme} />
      )}

      {/* Main Content */}
      <div className="main-content" ref={containerRef}>
        {viewMode !== 'preview' && (
          <div className="editor-pane" style={{ width: viewMode === 'split' ? `${splitRatio}%` : '100%' }}>
            <Editor
              content={content}
              onChange={setContent}
              theme={theme}
              editorViewRef={editorViewRef}
              uploadConfig={uploadConfig}
            />
          </div>
        )}

        {viewMode === 'split' && (
          <div className="divider" onMouseDown={handleDividerMouseDown} />
        )}

        {viewMode !== 'editor' && (
          <div className="preview-pane" style={{ width: viewMode === 'split' ? `${100 - splitRatio}%` : '100%' }}>
            <Preview content={content} theme={theme} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar content={content} fileName={fileName} lastSaved={lastSaved} />

      {/* Settings Modal */}
      {showSettings && (
        <Settings
          config={uploadConfig}
          onSave={handleSaveUploadConfig}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Image Mode Hint */}
      {showHint && <ImageModeHint onClose={() => setShowHint(false)} />}

      {/* Rename Modal */}
      {showRename && (() => {
        const lastDot = fileName.lastIndexOf('.')
        const ext = lastDot === -1 ? '' : fileName.slice(lastDot)
        const handleConfirm = () => {
          const trimmed = renameInput.trim()
          if (trimmed) setFileName(trimmed + ext)
          setShowRename(false)
        }
        return (
          <div className="modal-overlay" onClick={() => setShowRename(false)}>
            <div className="modal" style={{ width: 360 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">重命名文件</span>
                <button className="modal-close" onClick={() => setShowRename(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>文件名</label>
                  <div className="rename-input-row">
                    <input
                      type="text"
                      value={renameInput}
                      autoFocus
                      onChange={e => setRenameInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') setShowRename(false) }}
                    />
                    {ext && <span className="rename-ext">{ext}</span>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowRename(false)}>取消</button>
                <button className="btn-save" onClick={handleConfirm}>确认</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
