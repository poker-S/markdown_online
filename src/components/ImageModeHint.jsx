const HINT_KEY = 'md-editor-img-hint-dismissed'

export default function ImageModeHint({ onClose }) {
  const handleDismiss = () => {
    localStorage.setItem(HINT_KEY, '1')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">图片存储方式说明</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: 16, lineHeight: 1.8 }}>
            粘贴图片时，编辑器提供两种存储方式，可在右上角 <strong>⚙️ 设置</strong> 中随时切换。
          </p>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: '12px 16px', marginBottom: 12, background: 'var(--bg-secondary)' }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>✅ 方案一：内嵌 Base64（默认推荐）</div>
            <p style={{ margin: '4px 0', lineHeight: 1.7 }}>图片数据直接嵌入 .md 文件，无需任何网络服务，文件可在任何地方打开并正常显示图片。</p>
            <p style={{ margin: '4px 0', color: '#e53e3e', fontWeight: 600 }}>⚠️ 注意：图片会被转为很长的字符串存入文件，图片越多文件体积越大，不适合图片密集型文档。</p>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: '12px 16px', background: 'var(--bg-secondary)' }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>📁 方案二：本地文件引用</div>
            <p style={{ margin: '4px 0', lineHeight: 1.7 }}>图片以相对路径引用（如 <code>./images/xxx.png</code>），.md 文件体积小，与 VSCode 方式一致。</p>
            <p style={{ margin: '4px 0', color: '#e53e3e', fontWeight: 600 }}>⚠️ 注意：图片文件必须和 .md 文件放在一起，单独移动 .md 文件会导致图片无法显示。此方案在在线版中无法使用。</p>
          </div>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn-cancel" onClick={handleDismiss}>知道了，不再提示</button>
          <button className="btn-save" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  )
}

export function shouldShowHint() {
  return !localStorage.getItem(HINT_KEY)
}
