import { useState, useRef, useCallback, useEffect } from 'react'
import { LangContext } from './utils/LangContext.jsx'
import { translations } from './utils/i18n.js'
import Toolbar from './components/Toolbar.jsx'
import Editor from './components/Editor.jsx'
import Preview from './components/Preview.jsx'
import StatusBar from './components/StatusBar.jsx'
import Settings from './components/Settings.jsx'
import ImageModeHint, { shouldShowHint } from './components/ImageModeHint.jsx'
import GuidePanel from './components/GuidePanel.jsx'
import BootScreen from './components/BootScreen.jsx'
import { getDefaultUploadConfig, normalizeUploadConfig } from './utils/imageUpload.js'

const UPLOAD_CONFIG_KEY = 'md-editor-upload-config'
const AUTOSAVE_KEY = 'md-editor-autosave'
const LANG_KEY = 'md-editor-lang'

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'zh')
  const tr = translations[lang]
  const t = (path) => {
    const keys = path.split('.')
    let val = tr
    for (const k of keys) val = val?.[k]
    return val ?? path
  }

  const saved = (() => { try { return JSON.parse(localStorage.getItem(AUTOSAVE_KEY)) || {} } catch { return {} } })()
  const [content, setContent] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(AUTOSAVE_KEY)) || {}
      if (s.content != null) return s.content
    } catch {}
    return translations[localStorage.getItem(LANG_KEY) || 'zh'].defaultContent
  })
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
  const [showBootScreen, setShowBootScreen] = useState(true)
  const [uploadConfig, setUploadConfig] = useState(() => {
    try {
      return normalizeUploadConfig(JSON.parse(localStorage.getItem(UPLOAD_CONFIG_KEY)) || getDefaultUploadConfig())
    } catch {
      return getDefaultUploadConfig()
    }
  })
  const [showCopyMenu, setShowCopyMenu] = useState(false)
  const editorViewRef = useRef(null)
  const containerRef = useRef(null)
  const copyMenuRef = useRef(null)
  const isDragging = useRef(false)
  const previewScrollRef = useRef(null)
  const isSyncingRef = useRef(null)
  const viewModeRef = useRef(viewMode)
  useEffect(() => { viewModeRef.current = viewMode }, [viewMode])

  const prevLangRef = useRef(lang)

  const syncScrollPosition = useCallback((source, target, sourceType) => {
    if (!source || !target) return
    if (viewModeRef.current !== 'split') return
    if (isSyncingRef.current && isSyncingRef.current !== sourceType) return

    const sourceMax = source.scrollHeight - source.clientHeight
    const targetMax = target.scrollHeight - target.clientHeight

    if (sourceMax <= 0 || targetMax <= 0) {
      target.scrollTop = 0
      return
    }

    isSyncingRef.current = sourceType
    target.scrollTop = (source.scrollTop / sourceMax) * targetMax
    requestAnimationFrame(() => {
      if (isSyncingRef.current === sourceType) {
        isSyncingRef.current = null
      }
    })
  }, [])

  const handleEditorScroll = useCallback((scrollDOM) => {
    const preview = previewScrollRef.current
    syncScrollPosition(scrollDOM, preview, 'editor')
  }, [syncScrollPosition])

  const handlePreviewScroll = useCallback((preview) => {
    const editorView = editorViewRef.current
    syncScrollPosition(preview, editorView?.scrollDOM, 'preview')
  }, [syncScrollPosition])

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang)
    const prevLang = prevLangRef.current
    if (prevLang !== lang) {
      const firstLine = content.split('\n')[0]
      const isDefault = Object.values(translations).some(tr =>
        tr.defaultContent.split('\n')[0] === firstLine
      )
      if (isDefault) setContent(translations[lang].defaultContent)
      prevLangRef.current = lang
    }
  }, [lang])

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
    const normalized = normalizeUploadConfig(config)
    setUploadConfig(normalized)
    localStorage.setItem(UPLOAD_CONFIG_KEY, JSON.stringify(normalized))
  }, [])

  const handleReset = useCallback(() => {
    if (!window.confirm(t('app.resetConfirm'))) return
    localStorage.removeItem(AUTOSAVE_KEY)
    localStorage.removeItem(UPLOAD_CONFIG_KEY)
    localStorage.removeItem(LANG_KEY)
    localStorage.removeItem('md-editor-img-hint-dismissed')
    setLang('zh')
    setContent(translations.zh.defaultContent)
    setTheme('light')
    setViewMode('split')
    setSplitRatio(50)
    setIsFocusMode(false)
    setFileName('Untitled.md')
    setShowRename(false)
    setRenameInput('')
    setShowSettings(false)
    setShowGuide(false)
    setShowCopyMenu(false)
    setUploadConfig(getDefaultUploadConfig())
    setShowHint(true)
    setLastSaved(null)
  }, [t])

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
    const { inlineStylesForWechat } = await import('./utils/inlineStyles.js')
    const html = await inlineStylesForWechat(previewEl)
    const msg = t('app.copySuccess')
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }) })
      ])
      alert(msg)
    } catch (e) {
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
      alert(msg)
    }
  }, [t])

  const handleCopy52pojie = useCallback(async () => {
    const previewEl = document.querySelector('.preview-content')
    if (!previewEl) return
    const { htmlToBBCode } = await import('./utils/bbcode.js')
    const bbcode = htmlToBBCode(previewEl.innerHTML)
    const msg = t('app.copy52pojieSuccess')
    try {
      await navigator.clipboard.writeText(bbcode)
      alert(msg)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = bbcode
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      alert(msg)
    }
  }, [t])

  const handleExportHtml = useCallback(async () => {
    const previewEl = document.querySelector('.preview-content')
    if (!previewEl) return
    const { default: DOMPurify } = await import('dompurify')
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
  }, [fileName])

  useEffect(() => {
    const handler = (e) => {
      if (copyMenuRef.current && !copyMenuRef.current.contains(e.target))
        setShowCopyMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
    <LangContext.Provider value={lang}>
      <>
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
              title={t('app.rename.title')}
              onClick={() => {
                const lastDot = fileName.lastIndexOf('.')
                setRenameInput(lastDot === -1 ? fileName : fileName.slice(0, lastDot))
                setShowRename(true)
              }}
            >✎</button>
          </div>
          <div className="title-bar-actions">
            <button className="view-btn" onClick={handleReset} title={t('app.resetTitle')}>{t('app.reset')}</button>
            <button className="view-btn" onClick={() => setShowGuide(true)} title={t('app.guideTitle')}>{t('app.guide')}</button>
            <button className="view-btn" onClick={handleOpen} title={t('app.openTitle')}>{t('app.open')}</button>
            <button className="view-btn" onClick={handleSave} title={t('app.saveTitle')}>{t('app.save')}</button>
            <button className="view-btn" onClick={handleExportHtml} title={t('app.exportTitle')}>{t('app.export')}</button>
            <div className="copy-dropdown" ref={copyMenuRef}>
              <button
                className="view-btn"
                title={t('app.copyTitle')}
                onClick={() => setShowCopyMenu(v => !v)}
              >
                {t('app.copy')} ▾
              </button>
              {showCopyMenu && (
                <div className="copy-menu">
                  <button className="copy-menu-item" onClick={() => { handleCopyRich(); setShowCopyMenu(false) }}>
                    {t('app.copyWechat')}
                  </button>
                  <button className="copy-menu-item" onClick={() => { handleCopy52pojie(); setShowCopyMenu(false) }}>
                    {t('app.copy52pojie')}
                  </button>
                </div>
              )}
            </div>
            <div className="view-mode-group">
              <button className={`view-btn ${viewMode === 'editor' ? 'active' : ''}`} onClick={() => setViewMode('editor')}>{t('app.edit')}</button>
              <button className={`view-btn ${viewMode === 'split' ? 'active' : ''}`} onClick={() => setViewMode('split')}>{t('app.split')}</button>
              <button className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`} onClick={() => setViewMode('preview')}>{t('app.preview')}</button>
            </div>
            <button className="view-btn icon-btn" onClick={() => setShowSettings(true)} title={t('app.settingsTitle')}>⚙️</button>
            <button className="view-btn icon-btn" onClick={() => setIsFocusMode(f => !f)} title={isFocusMode ? t('app.focusExit') : t('app.focusEnter')}>
              {isFocusMode ? '⊡' : '⊞'}
            </button>
            <button className="view-btn icon-btn" onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} title="Theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        {!isFocusMode && (
          <Toolbar editorViewRef={editorViewRef} theme={theme} uploadConfig={uploadConfig} />
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
                onScroll={handleEditorScroll}
              />
            </div>
          )}

          {viewMode === 'split' && (
            <div className="divider" onMouseDown={handleDividerMouseDown} />
          )}

          {viewMode !== 'editor' && (
            <Preview
              content={content}
              theme={theme}
              scrollRef={previewScrollRef}
              onScroll={handlePreviewScroll}
              paneStyle={{ width: viewMode === 'split' ? `${100 - splitRatio}%` : '100%' }}
            />
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
            lang={lang}
            setLang={setLang}
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
                  <span className="modal-title">{t('app.rename.title')}</span>
                  <button className="modal-close" onClick={() => setShowRename(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>{t('app.rename.label')}</label>
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
                  <button className="btn-cancel" onClick={() => setShowRename(false)}>{t('app.rename.cancel')}</button>
                  <button className="btn-save" onClick={handleConfirm}>{t('app.rename.confirm')}</button>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
      {showBootScreen && <BootScreen onStart={() => setShowBootScreen(false)} />}
      </>
    </LangContext.Provider>
  )
}
