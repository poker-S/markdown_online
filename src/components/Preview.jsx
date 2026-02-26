import { useMemo } from 'react'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import katex from 'katex'

// Configure marked with highlight.js
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language }).value
  }
}))

marked.use({
  gfm: true,
  breaks: true,
})

// Render KaTeX math expressions
function renderMath(html) {
  // Block math: $$...$$
  html = html.replace(/\$\$([^$]+)\$\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })
    } catch { return `<code>${expr}</code>` }
  })
  // Inline math: $...$
  html = html.replace(/\$([^$\n]+)\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false })
    } catch { return `<code>${expr}</code>` }
  })
  return html
}

export default function Preview({ content }) {
  const html = useMemo(() => {
    let rendered = marked.parse(content || '')
    rendered = renderMath(rendered)
    return rendered
  }, [content])

  return (
    <div className="preview-pane" style={{ flex: 1, overflowY: 'auto' }}>
      <div
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
