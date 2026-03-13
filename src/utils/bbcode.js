/**
 * HTML → BBCode converter for 52pojie (Discuz! forum)
 */

function processNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const tag = node.tagName.toLowerCase()

  // Skip math (KaTeX)
  if (node.classList.contains('katex') || node.classList.contains('katex-display')) {
    return '[数学公式]'
  }

  const inner = () => Array.from(node.childNodes).map(processNode).join('')

  switch (tag) {
    case 'b':
    case 'strong':
      return `[b]${inner()}[/b]`

    case 'i':
    case 'em':
      return `[i]${inner()}[/i]`

    case 's':
    case 'del':
      return `[s]${inner()}[/s]`

    case 'pre': {
      const codeEl = node.querySelector('code')
      const text = codeEl ? codeEl.textContent : node.textContent
      let lang = 'text'
      if (codeEl) {
        const m = codeEl.className.match(/language-(\w+)/)
        if (m) lang = m[1]
      }
      return `[mw_shl_code=${lang},true]\n${text}\n[/mw_shl_code]\n`
    }

    case 'code':
      // inline code (not inside pre)
      return `[font=Courier New]${node.textContent}[/font]`

    case 'h1':
      return `[size=6][b]${inner()}[/b][/size]\n`
    case 'h2':
      return `[size=5][b]${inner()}[/b][/size]\n`
    case 'h3':
      return `[size=4][b]${inner()}[/b][/size]\n`

    case 'blockquote':
      return `[quote]${inner()}[/quote]`

    case 'a': {
      const href = node.getAttribute('href') || ''
      return `[url=${href}]${inner()}[/url]`
    }

    case 'img': {
      const src = node.getAttribute('src') || ''
      return `[img]${src}[/img]`
    }

    case 'ul': {
      const items = Array.from(node.querySelectorAll(':scope > li'))
      return items.map(li => `\u2022 ${processChildren(li)}\n`).join('') + '\n'
    }

    case 'ol': {
      const items = Array.from(node.querySelectorAll(':scope > li'))
      return items.map((li, i) => `${i + 1}. ${processChildren(li)}\n`).join('') + '\n'
    }

    case 'li':
      return inner()

    case 'p':
    case 'div':
      return `${inner()}\n\n`

    case 'br':
      return '\n'

    case 'hr':
      return '\n────────\n'

    case 'table':
      return convertTable(node)

    case 'thead':
    case 'tbody':
    case 'tfoot':
      return inner()

    case 'tr': {
      const cells = Array.from(node.querySelectorAll('th, td'))
      return cells.map(c => processChildren(c)).join(' | ') + '\n'
    }

    case 'th':
    case 'td':
      return inner()

    default:
      return inner()
  }
}

function processChildren(node) {
  return Array.from(node.childNodes).map(processNode).join('')
}

function convertTable(tableNode) {
  const rows = Array.from(tableNode.querySelectorAll('tr'))
  if (!rows.length) return ''

  const lines = rows.map(row => {
    const cells = Array.from(row.querySelectorAll('th, td'))
    return '[tr]' + cells.map(cell => `[td]${processChildren(cell).trim()}[/td]`).join('') + '[/tr]'
  })

  return '\n[table]\n' + lines.join('\n') + '\n[/table]\n\n'
}

/**
 * Convert an HTML string to BBCode text.
 * @param {string} html
 * @returns {string}
 */
export function htmlToBBCode(html) {
  const div = document.createElement('div')
  div.innerHTML = html

  // Remove script/style nodes
  div.querySelectorAll('script, style').forEach(el => el.remove())

  const result = processChildren(div)
  // Collapse 3+ consecutive newlines to 2
  return result.replace(/\n{3,}/g, '\n\n').trim()
}
