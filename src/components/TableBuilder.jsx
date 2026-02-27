import { useState, useCallback } from 'react'
import { useLang } from '../utils/LangContext.jsx'

export default function TableBuilder({ onInsert, onClose }) {
  const { t } = useLang()
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [hoveredRow, setHoveredRow] = useState(0)
  const [hoveredCol, setHoveredCol] = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const [headers, setHeaders] = useState([])
  const [cells, setCells] = useState([])

  const handleGridConfirm = useCallback(() => {
    setHeaders(Array(cols).fill(''))
    setCells(Array.from({ length: rows }, () => Array(cols).fill('')))
    setConfirmed(true)
  }, [rows, cols])

  const handleInsert = useCallback(() => {
    const headerRow = '| ' + headers.map(h => h || ' ').join(' | ') + ' |'
    const sepRow = '| ' + headers.map(() => '---').join(' | ') + ' |'
    const dataRows = cells.map(row => '| ' + row.map(c => c || ' ').join(' | ') + ' |')
    onInsert([headerRow, sepRow, ...dataRows].join('\n'))
  }, [headers, cells, onInsert])

  const GRID = 8

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: confirmed ? 560 : 360 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            {confirmed ? t('table.editTitle')(rows, cols) : t('table.selectTitle')}
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {!confirmed ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 12 }}
                onMouseLeave={() => { setHoveredRow(0); setHoveredCol(0) }}>
                {Array.from({ length: GRID }, (_, r) => (
                  <div key={r} style={{ display: 'flex', gap: 3 }}>
                    {Array.from({ length: GRID }, (_, c) => (
                      <div
                        key={c}
                        onMouseEnter={() => { setHoveredRow(r + 1); setHoveredCol(c + 1) }}
                        onClick={() => { setRows(r + 1); setCols(c + 1) }}
                        style={{
                          width: 24, height: 24, borderRadius: 3, cursor: 'pointer',
                          background: (r < hoveredRow && c < hoveredCol) ? 'var(--accent,#0071e3)' : 'var(--border-color,#ddd)',
                          border: (r < rows && c < cols) ? '2px solid var(--accent,#0071e3)' : '2px solid transparent',
                          boxSizing: 'border-box',
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {hoveredRow || rows} {t('table.rowLabel')} × {hoveredCol || cols} {t('table.colLabel')}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: 13 }}>{t('table.rowLabel')}</label>
                <input type="number" min={1} max={20} value={rows}
                  onChange={e => setRows(Math.max(1, Math.min(20, +e.target.value)))}
                  style={{ width: 60 }} />
                <label style={{ fontSize: 13 }}>{t('table.colLabel')}</label>
                <input type="number" min={1} max={10} value={cols}
                  onChange={e => setCols(Math.max(1, Math.min(10, +e.target.value)))}
                  style={{ width: 60 }} />
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>{t('table.headerHint')}</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr>
                      {headers.map((h, ci) => (
                        <th key={ci} style={{ padding: 4 }}>
                          <input
                            placeholder={`Col${ci + 1}`}
                            value={h}
                            onChange={e => setHeaders(prev => prev.map((v, i) => i === ci ? e.target.value : v))}
                            style={{ width: '100%', boxSizing: 'border-box' }}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cells.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci} style={{ padding: 4 }}>
                            <input
                              placeholder={`r${ri + 1}c${ci + 1}`}
                              value={cell}
                              onChange={e => setCells(prev => prev.map((r, i) =>
                                i === ri ? r.map((c, j) => j === ci ? e.target.value : c) : r
                              ))}
                              style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>{t('table.cancel')}</button>
          {!confirmed
            ? <button className="btn-save" onClick={handleGridConfirm}>{t('table.next')}</button>
            : <button className="btn-save" onClick={handleInsert}>{t('table.insert')}</button>
          }
        </div>
      </div>
    </div>
  )
}
