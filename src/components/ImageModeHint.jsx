import { useLang } from '../utils/LangContext.jsx'

const HINT_KEY = 'md-editor-img-hint-dismissed'

export default function ImageModeHint({ onClose }) {
  const { t } = useLang()

  const handleDismiss = () => {
    localStorage.setItem(HINT_KEY, '1')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{t('hint.title')}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: 16, lineHeight: 1.8 }}>{t('hint.intro')}</p>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: '12px 16px', marginBottom: 12, background: 'var(--bg-secondary)' }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t('hint.base64Title')}</div>
            <p style={{ margin: '4px 0', lineHeight: 1.7 }}>{t('hint.base64Desc')}</p>
            <p style={{ margin: '4px 0', color: '#e53e3e', fontWeight: 600 }}>{t('hint.base64Warn')}</p>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: '12px 16px', background: 'var(--bg-secondary)' }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t('hint.localTitle')}</div>
            <p style={{ margin: '4px 0', lineHeight: 1.7 }}>{t('hint.localDesc')}</p>
            <p style={{ margin: '4px 0', color: '#e53e3e', fontWeight: 600 }}>{t('hint.localWarn')}</p>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: '12px 16px', marginTop: 12, background: 'var(--bg-secondary)' }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t('hint.r2Title')}</div>
            <p style={{ margin: '4px 0', lineHeight: 1.7 }}>{t('hint.r2Desc')}</p>
            <p style={{ margin: '4px 0', color: '#e53e3e', fontWeight: 600 }}>{t('hint.r2Warn')}</p>
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
