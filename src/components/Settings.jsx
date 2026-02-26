import { useState } from 'react'

export default function Settings({ config, onSave, onClose }) {
  const [service, setService] = useState(config?.service || 'base64')

  const handleSave = () => {
    onSave({ service })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">图片存储设置</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>存储方式</label>
            <select value={service} onChange={e => setService(e.target.value)}>
              <option value="base64">方案一：内嵌 Base64（推荐）</option>
              <option value="local">方案二：本地文件引用</option>
            </select>
          </div>

          {service === 'base64' && (
            <div style={{ borderRadius: 8, padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '4px 0', lineHeight: 1.7 }}>图片数据直接嵌入 .md 文件，无需网络，文件可在任何地方打开并正常显示图片。</p>
              <p style={{ margin: '6px 0 0', color: '#e53e3e', fontWeight: 600 }}>⚠️ 图片越多文件体积越大，不适合图片密集型文档。</p>
            </div>
          )}

          {service === 'local' && (
            <div style={{ borderRadius: 8, padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '4px 0', lineHeight: 1.7 }}>图片以相对路径引用（<code>./images/xxx.png</code>），文件体积小，与 VSCode 方式一致。</p>
              <p style={{ margin: '6px 0 0', color: '#e53e3e', fontWeight: 600 }}>⚠️ 图片文件必须与 .md 文件放在同一目录，单独移动 .md 文件会导致图片无法显示。在线版不支持此方案。</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>取消</button>
          <button className="btn-save" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  )
}
