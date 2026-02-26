import { ViewPlugin, Decoration, WidgetType } from '@codemirror/view'
import { RangeSetBuilder, StateField, StateEffect } from '@codemirror/state'

const BASE64_RE = /!\[([^\]]*)\]\((data:[^)]{20,})\)/g

// State: set of line numbers that are expanded
const toggleLine = StateEffect.define()
const expandedLines = StateField.define({
  create: () => new Set(),
  update(set, tr) {
    for (const e of tr.effects) {
      if (e.is(toggleLine)) {
        const next = new Set(set)
        if (next.has(e.value)) next.delete(e.value)
        else next.add(e.value)
        return next
      }
    }
    return set
  }
})

class CollapseWidget extends WidgetType {
  constructor(alt, prefix, dataUrl, lineNo, view) {
    super()
    this.alt = alt
    this.prefix = prefix
    this.dataUrl = dataUrl
    this.lineNo = lineNo
    this.view = view
  }
  toDOM() {
    const span = document.createElement('span')
    span.className = 'cm-base64-collapsed'
    span.style.cssText = 'cursor:context-menu;opacity:0.75;font-style:italic;position:relative'
    span.textContent = `![${this.alt}](${this.prefix}···)`

    const tip = document.createElement('span')
    tip.style.cssText = 'display:none;position:absolute;left:0;top:1.4em;background:var(--bg-secondary,#f5f5f5);border:1px solid #ccc;border-radius:4px;padding:2px 8px;font-size:11px;white-space:nowrap;z-index:999;pointer-events:none;font-style:normal;opacity:1;color:var(--text-secondary,#666)'
    tip.textContent = `${this.dataUrl.slice(0, 60)}… 共 ${this.dataUrl.length} 字符 · 右键展开`
    span.appendChild(tip)

    span.addEventListener('mouseenter', () => { tip.style.display = 'block' })
    span.addEventListener('mouseleave', () => { tip.style.display = 'none' })
    span.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      this.view.dispatch({ effects: toggleLine.of(this.lineNo) })
    })
    return span
  }
  ignoreEvent() { return false }
}

class CollapseButtonWidget extends WidgetType {
  constructor(lineNo, view) {
    super()
    this.lineNo = lineNo
    this.view = view
  }
  toDOM() {
    const btn = document.createElement('span')
    btn.textContent = '[收起]'
    btn.style.cssText = 'cursor:pointer;font-size:11px;opacity:0.6;margin-right:4px;font-style:normal;color:var(--accent,#0071e3)'
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault()
      this.view.dispatch({ effects: toggleLine.of(this.lineNo) })
    })
    return btn
  }
  ignoreEvent() { return false }
}

function iterVisibleLines(view) {
  const lines = []
  const { from, to } = view.viewport
  let pos = from
  while (pos <= to) {
    const line = view.state.doc.lineAt(pos)
    lines.push({ from: line.from, to: line.to, text: line.text, lineNo: line.number })
    pos = line.to + 1
  }
  return lines
}

function buildDecorations(view) {
  const builder = new RangeSetBuilder()
  const expanded = view.state.field(expandedLines)

  for (const { from, text, lineNo } of iterVisibleLines(view)) {
    if (expanded.has(lineNo)) {
      // Show [收起] button at line start if line contains base64
      if (BASE64_RE.test(text)) {
        BASE64_RE.lastIndex = 0
        builder.add(from, from, Decoration.widget({
          widget: new CollapseButtonWidget(lineNo, view),
          side: -1,
        }))
      }
      BASE64_RE.lastIndex = 0
      continue
    }
    let match
    BASE64_RE.lastIndex = 0
    while ((match = BASE64_RE.exec(text)) !== null) {
      const start = from + match.index
      const end = start + match[0].length
      const dataUrl = match[2]
      const prefixEnd = dataUrl.indexOf(',') + 1
      const prefix = dataUrl.slice(0, prefixEnd)
      builder.add(start, end, Decoration.replace({
        widget: new CollapseWidget(match[1], prefix, dataUrl, lineNo, view),
      }))
    }
  }
  return builder.finish()
}

export const base64CollapsePlugin = [
  expandedLines,
  ViewPlugin.fromClass(
    class {
      constructor(view) { this.decorations = buildDecorations(view) }
      update(update) {
        if (update.docChanged || update.viewportChanged ||
            update.transactions.some(tr => tr.effects.some(e => e.is(toggleLine)))) {
          this.decorations = buildDecorations(update.view)
        }
      }
    },
    { decorations: v => v.decorations }
  )
]
