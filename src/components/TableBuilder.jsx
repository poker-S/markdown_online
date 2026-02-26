import { useState, useCallback } from 'react'

export default function TableBuilder({ onInsert, onClose }) {
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
          <span className="modal-title">{confirmed ? `编辑表格（${rows} 行 × ${cols} 列）` : '选择表格大小'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {!confirmed ? (
            <>
              {/* Grid picker */}
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
                {hoveredRow || rows} 行 × {hoveredCol || cols} 列
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: 13 }}>行</label>
                <input type="number" min={1} max={20} value={rows}
                  onChange={e => setRows(Math.max(1, Math.min(20, +e.target.value)))}
                  style={{ width: 60 }} />
                <label style={{ fontSize: 13 }}>列</label>
                <input type="number" min={1} max={10} value={cols}
                  onChange={e => setCols(Math.max(1, Math.min(10, +e.target.value)))}
                  style={{ width: 60 }} />
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>第一行为表头，其余为内容</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr>
                      {headers.map((h, ci) => (
                        <th key={ci} style={{ padding: 4 }}>
                          <input
                            placeholder={`列${ci + 1}`}
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
          <button className="btn-cancel" onClick={onClose}>取消</button>
          {!confirmed
            ? <button className="btn-save" onClick={handleGridConfirm}>下一步</button>
            : <button className="btn-save" onClick={handleInsert}>插入表格</button>
          }
        </div>
      </div>
    </div>
  )
}
