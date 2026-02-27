import { useLang } from '../utils/LangContext.jsx'

export default function GuidePanel({ onClose }) {
  const { t } = useLang()
  const sections = t('guide.sections')
  const features = t('guide.features')

  return (
    <>
      <div className="guide-overlay" onClick={onClose} />
      <div className="guide-panel">
        <div className="guide-header">
          <span className="guide-title">{t('guide.title')}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="guide-body">
          <section className="guide-section">
            <h3 className="guide-section-title">{t('guide.syntaxTitle')}</h3>
            {sections.map((sec, i) => (
              <div key={i} className="guide-group">
                <div className="guide-group-label">{sec.title}</div>
                {sec.items.map((item, j) => (
                  <div key={j} className="guide-item">
                    <pre className="guide-syntax">{item.syntax}</pre>
                    <span className="guide-desc">{item.desc}</span>
                  </div>
                ))}
              </div>
            ))}
          </section>

          <section className="guide-section">
            <h3 className="guide-section-title">{t('guide.featuresTitle')}</h3>
            {features.map((f, i) => (
              <div key={i} className="guide-feature">
                <div className="guide-feature-title">{f.title}</div>
                <div className="guide-feature-desc">{f.desc}</div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  )
}
