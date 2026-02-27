import { useState, useRef, useCallback, useEffect } from 'react'
import DOMPurify from 'dompurify'
import { inlineStylesForWechat } from './utils/inlineStyles.js'
import Toolbar from './components/Toolbar.jsx'
import Editor from './components/Editor.jsx'
import Preview from './components/Preview.jsx'
import StatusBar from './components/StatusBar.jsx'
import Settings from './components/Settings.jsx'
import ImageModeHint, { shouldShowHint } from './components/ImageModeHint.jsx'
import GuidePanel from './components/GuidePanel.jsx'

const UPLOAD_CONFIG_KEY = 'md-editor-upload-config'
const AUTOSAVE_KEY = 'md-editor-autosave'

const DEFAULT_CONTENT = `# 欢迎使用 Markdown Editor

**Mac 风格** Markdown 编辑器，支持实时预览、可视化插入、数学公式、代码高亮等功能。

---

## 快速上手

### 视图模式

顶栏右侧三个按钮切换视图：

| 按钮 | 说明 |
|------|------|
| Edit | 仅显示编辑器 |
| Split | 左右分栏（默认），分割线可拖拽调整宽度 |
| Preview | 仅显示预览 |

### 快捷键

| 功能 | 快捷键 |
|------|--------|
| 保存文件 | Ctrl+S |
| 加粗 | Ctrl+B |
| 斜体 | Ctrl+I |

---

## 工具栏

编辑器上方工具栏提供常用格式按钮，**选中文字后点击**即可包裹格式，未选中则插入占位文字。

支持：H1 / H2 / H3、加粗、斜体、删除线、行内代码、引用、代码块、分割线、无序列表、有序列表、任务列表、链接、图片。

---

## ✦ 可视化插入（Word 风格）

点击工具栏 **✦ 可视化插入** 按钮，进入所见即所得编辑模式：

1. 首屏动画确认后进入编辑器
2. 像 Word 一样输入内容，**选中文字后点击格式按钮**应用样式
3. 支持插入表格（网格选择行列数）、图片（URL / 本地上传 / 直接粘贴截图）
4. 点击右下角 **确认插入 ✓**，内容自动转为 Markdown 并插入到编辑器光标处

---

## ⊞ 表格构建器

点击工具栏 **⊞ 表格** 按钮：

1. 在网格上悬停选择行列数，或手动输入
2. 点击「下一步」填写表头和内容
3. 点击「插入表格」生成 Markdown 表格

---

## ∑ 数学公式库

点击工具栏 **∑ 公式** 按钮，从希腊字母、运算符、常用表达式、公式模板中选择插入。

行内公式示例：$E = mc^2$

块级公式示例：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

---

## 图片插入

三种方式均支持：

- **粘贴截图**：在编辑器中直接 Ctrl+V，自动转为 Base64 内嵌
- **工具栏图片按钮**：插入图片 URL
- **⚙️ 设置**：可切换为本地文件引用模式（\`./images/xxx.png\`）

---

## 导出与复制

| 按钮 | 功能 |
|------|------|
| Export | 导出为独立 HTML 文件（含代码高亮样式） |
| Copy | 复制带样式富文本，可直接粘贴到微信公众号编辑器 |
| Save | 下载 .md 文件（Ctrl+S） |
| Open | 打开本地 .md / .txt 文件 |

---

## 其他功能

- **⊞ / ⊡ 专注模式**：隐藏工具栏，减少干扰
- **🌙 / ☀️ 主题切换**：亮色 / 暗色
- **自动保存**：内容每隔 1 秒自动保存到浏览器本地，刷新后自动恢复
- **Reset**：清空所有本地数据，恢复初始状态（操作前有确认提示）
- **Guide**：查看完整 Markdown 语法参考与功能说明

---

## 代码高亮示例

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`)
}
hello('World')
\`\`\`

> 开始编辑吧，左侧写 Markdown，右侧实时预览。
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
  const [showGuide, setShowGuide] = useState(false)
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

  const handleReset = useCallback(() => {
    if (!window.confirm('确定要清空所有本地数据并恢复初始状态吗？')) return
    localStorage.removeItem(AUTOSAVE_KEY)
    localStorage.removeItem(UPLOAD_CONFIG_KEY)
    localStorage.removeItem('md-editor-img-hint-dismissed')
    setContent(DEFAULT_CONTENT)
    setTheme('light')
    setFileName('Untitled.md')
    setUploadConfig({ service: 'base64' })
    setShowHint(true)
    setLastSaved(null)
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
          <button className="view-btn" onClick={handleReset} title="清空本地数据，恢复初始状态">Reset</button>
          <button className="view-btn" onClick={() => setShowGuide(true)} title="使用指南">Guide</button>
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

      {/* Guide Panel */}
      {showGuide && <GuidePanel onClose={() => setShowGuide(false)} />}

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
