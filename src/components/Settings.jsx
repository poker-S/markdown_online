import { useState } from 'react'
import { useLang } from '../utils/LangContext.jsx'

export default function Settings({ config, onSave, onClose, lang, setLang }) {
  const { t } = useLang()
  const [service, setService] = useState(config?.service || 'base64')
  const [localLang, setLocalLang] = useState(lang)

  const handleSave = () => {
    if (localLang !== lang) setLang(localLang)
    onSave({ service })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{t('settings.title')}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>{t('settings.langLabel')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={`view-btn ${localLang === 'zh' ? 'active' : ''}`}
                onClick={() => setLocalLang('zh')}
              >{t('settings.langZh')}</button>
              <button
                className={`view-btn ${localLang === 'en' ? 'active' : ''}`}
                onClick={() => setLocalLang('en')}
              >{t('settings.langEn')}</button>
            </div>
          </div>

          <div className="form-group">
            <label>{t('settings.storageLabel')}</label>
            <select value={service} onChange={e => setService(e.target.value)}>
              <option value="r2">{t('settings.r2Option')}</option>
              <option value="base64">{t('settings.base64Option')}</option>
              <option value="local">{t('settings.localOption')}</option>
            </select>
          </div>

          {service === 'base64' && (
            <div style={{ borderRadius: 8, padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '4px 0', lineHeight: 1.7 }}>{t('settings.base64Desc')}</p>
              <p style={{ margin: '6px 0 0', color: '#e53e3e', fontWeight: 600 }}>{t('settings.base64Warn')}</p>
            </div>
          )}

          {service === 'local' && (
            <div style={{ borderRadius: 8, padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '4px 0', lineHeight: 1.7 }}>{t('settings.localDesc')}</p>
              <p style={{ margin: '6px 0 0', color: '#e53e3e', fontWeight: 600 }}>{t('settings.localWarn')}</p>
            </div>
          )}

          {service === 'r2' && (
            <div style={{ borderRadius: 8, padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '4px 0', lineHeight: 1.7 }}>{t('settings.r2Desc')}</p>
              <p style={{ margin: '6px 0 0', color: '#e53e3e', fontWeight: 600 }}>{t('settings.r2Warn')}</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>{t('settings.cancel')}</button>
          <button className="btn-save" onClick={handleSave}>{t('settings.save')}</button>
        </div>
      </div>
    </div>
  )
}
