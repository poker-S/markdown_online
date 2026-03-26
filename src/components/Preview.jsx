import { useMemo } from 'react'
import { Marked } from 'marked'
import hljs from 'highlight.js'
import katex from 'katex'
import DOMPurify from 'dompurify'

const katexTags = ['math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'msubsup', 'mover', 'munder', 'munderover', 'mtable', 'mtr', 'mtd', 'annotation']
const katexAttrs = ['xmlns', 'encoding']
const markdown = new Marked()

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderKatex(expr, displayMode) {
  try {
    return katex.renderToString(expr.trim(), { displayMode, throwOnError: false })
  } catch {
    const escaped = escapeHtml(expr)
    return displayMode
      ? `<pre><code>${escaped}</code></pre>`
      : `<code>${escaped}</code>`
  }
}

function decodeHtmlEntities(value) {
  if (typeof document === 'undefined') return value
  const textarea = document.createElement('textarea')
  textarea.innerHTML = value
  return textarea.value
}

function normalizeHighlightedCopy(code) {
  let normalized = `${code || ''}`.replace(/\r\n?/g, '\n')

  for (let index = 0; index < 3; index += 1) {
    const decoded = decodeHtmlEntities(normalized)
    if (decoded === normalized) break
    normalized = decoded
  }

  const looksLikeHighlightedHtml = /(?:<span\b[^>]*\bhljs-|class=(?:"|')[^"']*\bhljs(?:-[^"']*)?)/i.test(normalized)
  if (!looksLikeHighlightedHtml) return normalized

  if (typeof document === 'undefined') {
    return normalized.replace(/<[^>]+>/g, '')
  }

  const container = document.createElement('div')
  container.innerHTML = normalized
  return container.textContent || normalized
}

function renderCodeBlock(code, infoString = '') {
  const normalizedCode = normalizeHighlightedCopy(code)
  const languageToken = `${infoString || ''}`.trim().split(/\s+/)[0]
  const language = hljs.getLanguage(languageToken)
    ? languageToken
    : hljs.getLanguage(languageToken.toLowerCase())
      ? languageToken.toLowerCase()
      : ''

  if (!language) {
    return {
      className: 'hljs',
      html: escapeHtml(normalizedCode),
    }
  }

  try {
    return {
      className: `hljs language-${language}`,
      html: hljs.highlight(normalizedCode, { language }).value,
    }
  } catch {
    return {
      className: `hljs language-${language}`,
      html: escapeHtml(normalizedCode),
    }
  }
}

markdown.use({
  gfm: true,
  breaks: true,
  renderer: {
    code(code, infoString) {
      const { className, html } = renderCodeBlock(code, infoString)
      return `<pre><code class="${className}">${html}</code></pre>`
    },
  },
  extensions: [
    {
      name: 'blockMath',
      level: 'block',
      start(src) {
        return src.indexOf('$$')
      },
      tokenizer(src) {
        const match = src.match(/^\$\$([\s\S]+?)\$\$(?:\n|$)/)
        if (!match) return undefined
        return {
          type: 'blockMath',
          raw: match[0],
          text: match[1],
        }
      },
      renderer(token) {
        return renderKatex(token.text, true)
      },
    },
    {
      name: 'inlineMath',
      level: 'inline',
      start(src) {
        return src.indexOf('$')
      },
      tokenizer(src) {
        if (src.startsWith('$$')) return undefined
        const match = src.match(/^\$([^\$\n]+?)\$/)
        if (!match) return undefined
        return {
          type: 'inlineMath',
          raw: match[0],
          text: match[1],
        }
      },
      renderer(token) {
        return renderKatex(token.text, false)
      },
    },
  ],
})

export default function Preview({ content, scrollRef, onScroll, paneStyle }) {
  const html = useMemo(() => {
    const rendered = markdown.parse(content || '')
    return DOMPurify.sanitize(rendered, { ADD_TAGS: katexTags, ADD_ATTR: katexAttrs })
  }, [content])

  return (
    <div
      ref={scrollRef}
      onScroll={(event) => onScroll?.(event.currentTarget)}
      className="preview-pane"
      style={{ ...paneStyle, height: '100%' }}
    >
      <div
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
