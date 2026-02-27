import { useLang } from '../utils/LangContext.jsx'

export default function StatusBar({ content, fileName, lastSaved }) {
  const { t } = useLang()
  const text = content || ''
  const words = text.trim() ? (text.match(/[\u4e00-\u9fa5]/g) || []).length + (text.match(/[a-zA-Z]+/g) || []).length : 0
  const chars = text.length
  const lines = text.split('\n').length
  const savedStr = lastSaved ? `${t('status.saved')} ${new Date(lastSaved).toLocaleTimeString()}` : ''

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <span>{fileName}</span>
        {savedStr && <span style={{ opacity: 0.6 }}>{savedStr}</span>}
      </div>
      <div className="status-bar-right">
        <span>{lines} {t('status.lines')}</span>
        <span>{words} {t('status.words')}</span>
        <span>{chars} {t('status.chars')}</span>
      </div>
    </div>
  )
}
