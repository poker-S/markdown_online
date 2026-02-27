import { useState } from 'react'
import { useLang } from '../utils/LangContext.jsx'

const MATH_CATEGORIES_DATA = [
  {
    key: 'greek',
    items: [
      { label: 'α', latex: '\\alpha' }, { label: 'β', latex: '\\beta' },
      { label: 'γ', latex: '\\gamma' }, { label: 'δ', latex: '\\delta' },
      { label: 'ε', latex: '\\epsilon' }, { label: 'θ', latex: '\\theta' },
      { label: 'λ', latex: '\\lambda' }, { label: 'μ', latex: '\\mu' },
      { label: 'π', latex: '\\pi' }, { label: 'σ', latex: '\\sigma' },
      { label: 'φ', latex: '\\phi' }, { label: 'ω', latex: '\\omega' },
      { label: 'Γ', latex: '\\Gamma' }, { label: 'Δ', latex: '\\Delta' },
      { label: 'Σ', latex: '\\Sigma' }, { label: 'Ω', latex: '\\Omega' },
    ]
  },
  {
    key: 'operators',
    items: [
      { label: '±', latex: '\\pm' }, { label: '×', latex: '\\times' },
      { label: '÷', latex: '\\div' }, { label: '·', latex: '\\cdot' },
      { label: '≠', latex: '\\neq' }, { label: '≈', latex: '\\approx' },
      { label: '≤', latex: '\\leq' }, { label: '≥', latex: '\\geq' },
      { label: '∞', latex: '\\infty' }, { label: '∑', latex: '\\sum' },
      { label: '∏', latex: '\\prod' }, { label: '∫', latex: '\\int' },
      { label: '∂', latex: '\\partial' }, { label: '∇', latex: '\\nabla' },
      { label: '√', latex: '\\sqrt{}' }, { label: '∈', latex: '\\in' },
      { label: '∉', latex: '\\notin' }, { label: '⊂', latex: '\\subset' },
      { label: '∪', latex: '\\cup' }, { label: '∩', latex: '\\cap' },
    ]
  },
  {
    key: 'expressions',
    items: [
      { label: 'xⁿ', latex: 'x^{n}' }, { label: 'xₙ', latex: 'x_{n}' },
      { label: 'a/b', latex: '\\frac{a}{b}' }, { label: '√x', latex: '\\sqrt{x}' },
      { label: '∑', latex: '\\sum_{i=1}^{n}' }, { label: '∫', latex: '\\int_{a}^{b}' },
      { label: 'lim', latex: '\\lim_{x \\to \\infty}' }, { label: 'log', latex: '\\log_{a}{x}' },
      { label: 'vec', latex: '\\vec{v}' }, { label: 'hat', latex: '\\hat{x}' },
      { label: 'bar', latex: '\\bar{x}' },
      { label: 'mat', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
    ]
  },
  {
    key: 'templates',
    items: [
      { label: 'Quadratic', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
      { label: "Euler's", latex: 'e^{i\\pi} + 1 = 0' },
      { label: 'Pythagorean', latex: 'a^2 + b^2 = c^2' },
      { label: 'Normal dist', latex: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}' },
      { label: 'Taylor', latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n' },
      { label: 'Fourier', latex: 'F(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t} dt' },
    ]
  },
]

export default function MathPanel({ onInsert, onClose }) {
  const { t } = useLang()
  const [activeTab, setActiveTab] = useState(0)
  const [mode, setMode] = useState('inline')

  const handleInsert = (latex) => {
    const text = mode === 'block' ? `$$\n${latex}\n$$` : `$${latex}$`
    onInsert(text)
  }

  const categoryNames = [t('math.greek'), t('math.operators'), t('math.expressions'), t('math.templates')]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{t('math.title')}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('math.insertMode')}</span>
            <button className={`view-btn ${mode === 'inline' ? 'active' : ''}`} onClick={() => setMode('inline')}>{t('math.inline')}</button>
            <button className={`view-btn ${mode === 'block' ? 'active' : ''}`} onClick={() => setMode('block')}>{t('math.block')}</button>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
            {MATH_CATEGORIES_DATA.map((cat, i) => (
              <button key={i} className={`view-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
                {categoryNames[i]}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {MATH_CATEGORIES_DATA[activeTab].items.map((item, i) => (
              <button key={i} className="tb-btn" title={item.latex} onClick={() => handleInsert(item.latex)} style={{ minWidth: 48, fontSize: 15 }}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
