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
          <section className="guide-section">
            <h3 className="guide-section-title">{t('guide.changelogTitle')}</h3>
            {t('guide.changelog').map((entry, i) => (
              <div key={i} className="guide-changelog-version">
                <div className="guide-changelog-header">
                  <span className="guide-changelog-ver">{entry.ver}</span>
                  <span className="guide-changelog-date">{entry.date}</span>
                </div>
                <ul className="guide-changelog-list">
                  {entry.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </div>
            ))}
          </section>

          <section className="guide-section guide-about">
            <h3 className="guide-section-title">{t('guide.aboutTitle')}</h3>
            <div className="guide-about-links">
              <a href="https://github.com/poker-S/markdown_online" target="_blank" rel="noopener noreferrer" className="guide-about-link">
                <span className="guide-about-icon">⭐</span> {t('guide.aboutGithubLabel')}
              </a>
              <span className="guide-about-link guide-about-wechat">
                <span className="guide-about-icon">📱</span> {t('guide.aboutWechatLabel')}
              </span>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
