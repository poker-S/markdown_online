import html2canvas from 'html2canvas'

const STYLES = {
  h1: 'font-size:2em;font-weight:700;border-bottom:1px solid #eee;padding-bottom:.3em;margin:1em 0 .5em;line-height:1.3',
  h2: 'font-size:1.5em;font-weight:700;border-bottom:1px solid #eee;padding-bottom:.3em;margin:1em 0 .5em;line-height:1.3',
  h3: 'font-size:1.25em;font-weight:700;margin:1em 0 .5em;line-height:1.3',
  h4: 'font-size:1em;font-weight:700;margin:1em 0 .5em;line-height:1.3',
  h5: 'font-size:.875em;font-weight:700;margin:1em 0 .5em;line-height:1.3',
  h6: 'font-size:.85em;font-weight:700;margin:1em 0 .5em;line-height:1.3',
  p: 'margin:.8em 0',
  strong: 'font-weight:700',
  em: 'font-style:italic',
  code: 'font-family:ui-monospace,monospace;font-size:.875em;background:#f6f8fa;border:1px solid #e1e4e8;border-radius:3px;padding:.2em .4em;color:#e83e8c',
  pre: 'background:#f6f8fa;border:1px solid #e1e4e8;border-radius:6px;padding:1em;overflow-x:auto;margin:.8em 0;white-space:pre',
  blockquote: 'border-left:4px solid #d0d7de;margin:.8em 0;padding:.5em 1em;background:#f6f8fa;border-radius:0 4px 4px 0;color:#57606a',
  ul: 'padding-left:2em;margin:.8em 0',
  ol: 'padding-left:2em;margin:.8em 0',
  li: 'margin:.25em 0',
  table: 'width:100%;border-collapse:collapse;margin:.8em 0;font-size:.9em',
  th: 'border:1px solid #d0d7de;padding:.5em .75em;text-align:left;background:#f6f8fa;font-weight:700',
  td: 'border:1px solid #d0d7de;padding:.5em .75em;text-align:left',
  a: 'color:#0969da;text-decoration:none',
  img: 'max-width:100%;border-radius:4px',
}

async function katexToImages(liveEl, cloneEl) {
  const liveNodes = [...liveEl.querySelectorAll('.katex-display, .katex:not(.katex-display .katex)')]
  const cloneNodes = [...cloneEl.querySelectorAll('.katex-display, .katex:not(.katex-display .katex)')]
  await Promise.all(liveNodes.map(async (live, i) => {
    const clone = cloneNodes[i]
    if (!clone) return
    const isDisplay = live.classList.contains('katex-display')
    try {
      const canvas = await html2canvas(live, { backgroundColor: null, scale: 2, logging: false })
      const img = document.createElement('img')
      img.src = canvas.toDataURL('image/png')
      img.style.cssText = isDisplay
        ? 'display:block;margin:.8em auto;max-width:100%'
        : 'display:inline-block;vertical-align:middle;max-width:100%'
      clone.replaceWith(img)
    } catch {}
  }))
}

async function codeBlocksToImages(liveEl, cloneEl) {
  const liveNodes = [...liveEl.querySelectorAll('pre')]
  const cloneNodes = [...cloneEl.querySelectorAll('pre')]
  await Promise.all(liveNodes.map(async (live, i) => {
    const clone = cloneNodes[i]
    if (!clone) return
    try {
      const canvas = await html2canvas(live, { backgroundColor: '#f6f8fa', scale: 2, logging: false })
      const img = document.createElement('img')
      img.src = canvas.toDataURL('image/png')
      img.style.cssText = 'display:block;margin:.8em 0;max-width:100%;border-radius:6px'
      clone.replaceWith(img)
    } catch {}
  }))
}

export async function inlineStylesForWechat(el) {
  const clone = el.cloneNode(true)
  await katexToImages(el, clone)
  await codeBlocksToImages(el, clone)

  Object.entries(STYLES).forEach(([tag, css]) => {
    clone.querySelectorAll(tag).forEach(node => {
      node.style.cssText = (node.style.cssText ? node.style.cssText + ';' : '') + css
    })
  })
  return clone.innerHTML
}
