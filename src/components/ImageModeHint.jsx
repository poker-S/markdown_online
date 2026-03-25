import { useLang } from '../utils/LangContext.jsx'

const HINT_KEY = 'md-editor-img-hint-dismissed'

export default function ImageModeHint({ onClose }) {
  const { t } = useLang()

  const handleDismiss = () => {
    localStorage.setItem(HINT_KEY, '1')
    onClose()
  }

  return (
    <div className="modal-overlay hint-overlay" onClick={onClose}>
      <div className="modal hint-modal-anim" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
        <div className="hint-deco">
          <div className="hint-deco-line" />
          <div className="hint-deco-line" />
          <div className="hint-deco-line" />
        </div>
        <div className="modal-header">
          <span className="modal-title">{t('hint.title')}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 13 }}>{t('hint.intro')}</p>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: '12px 16px', background: 'var(--bg-secondary)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{t('hint.base64Title')}</div>
            <p style={{ margin: 0, lineHeight: 1.7, fontSize: 13 }}>{t('hint.base64Desc')}</p>
            <p style={{ margin: '4px 0 0', color: '#e53e3e', fontSize: 12 }}>{t('hint.base64Warn')}</p>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: '12px 16px', background: 'var(--bg-secondary)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{t('hint.localTitle')}</div>
            <p style={{ margin: 0, lineHeight: 1.7, fontSize: 13 }}>{t('hint.localDesc')}</p>
            <p style={{ margin: '4px 0 0', color: '#e53e3e', fontSize: 12 }}>{t('hint.localWarn')}</p>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: '12px 16px', background: 'var(--bg-secondary)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{t('hint.r2Title')}</div>
            <p style={{ margin: 0, lineHeight: 1.7, fontSize: 13 }}>{t('hint.r2Desc')}</p>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 12 }}>{t('hint.r2Warn')}</p>
          </div>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn-cancel" onClick={handleDismiss}>{t('hint.dismiss')}</button>
          <button className="btn-save" onClick={onClose}>{t('hint.close')}</button>
        </div>
      </div>
    </div>
  )
}

export function shouldShowHint() {
  return !localStorage.getItem(HINT_KEY)
}
