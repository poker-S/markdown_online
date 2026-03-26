import { useEffect, useMemo, useState } from 'react'
import './BootScreen.css'

function createDeterministicRandom(seed) {
  let value = seed
  return () => {
    value = Math.sin(value * 12.9898 + 78.233) * 43758.5453123
    return value - Math.floor(value)
  }
}

function createStars(count, seed, config) {
  const random = createDeterministicRandom(seed)
  return Array.from({ length: count }, (_, index) => ({
    id: `star-${seed}-${index}`,
    x: random() * 100,
    y: random() * 100,
    size: config.size[0] + random() * (config.size[1] - config.size[0]),
    opacity: config.opacity[0] + random() * (config.opacity[1] - config.opacity[0]),
    duration: config.duration[0] + random() * (config.duration[1] - config.duration[0]),
    delay: random() * config.delay,
  }))
}

function createShootingStars() {
  return [
    { id: 'meteor-1', x: 10, y: 22, duration: 3.8, delay: 0.4, length: 220, angle: -18 },
    { id: 'meteor-2', x: 62, y: 18, duration: 4.1, delay: 1.7, length: 190, angle: -24 },
    { id: 'meteor-3', x: 28, y: 58, duration: 3.6, delay: 2.8, length: 180, angle: -14 },
    { id: 'meteor-4', x: 74, y: 54, duration: 4.4, delay: 3.4, length: 210, angle: -20 },
  ]
}

function starStyle(star) {
  return {
    '--boot-x': `${star.x}%`,
    '--boot-y': `${star.y}%`,
    '--boot-size': `${star.size}px`,
    '--boot-opacity': `${star.opacity}`,
    '--boot-duration': `${star.duration}s`,
    '--boot-delay': `${star.delay}s`,
  }
}

function shootingStarStyle(star) {
  return {
    '--boot-x': `${star.x}%`,
    '--boot-y': `${star.y}%`,
    '--boot-duration': `${star.duration}s`,
    '--boot-delay': `${star.delay}s`,
    '--boot-length': `${star.length}px`,
    '--boot-angle': `${star.angle}deg`,
  }
}

export default function BootScreen({ onStart }) {
  const [isLeaving, setIsLeaving] = useState(false)
  const logoText = 'PokerS\u6587\u6863'
  const startLabel = '\u5f00\u59cb\u4f7f\u7528'
  const logoChars = useMemo(() => Array.from(logoText), [logoText])
  const farStars = useMemo(() => createStars(78, 11, {
    size: [1, 2.2],
    opacity: [0.22, 0.58],
    duration: [2.6, 6.4],
    delay: 4.2,
  }), [])
  const nearStars = useMemo(() => createStars(42, 29, {
    size: [1.8, 3.8],
    opacity: [0.3, 0.88],
    duration: [2.1, 4.4],
    delay: 3.6,
  }), [])
  const photoStars = useMemo(() => createStars(26, 47, {
    size: [1.2, 3.6],
    opacity: [0.2, 0.7],
    duration: [2.8, 5.8],
    delay: 3.1,
  }), [])
  const shootingStars = useMemo(() => createShootingStars(), [])

  useEffect(() => {
    if (!isLeaving) return undefined
    const timer = window.setTimeout(() => {
      onStart?.()
    }, 650)
    return () => window.clearTimeout(timer)
  }, [isLeaving, onStart])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setIsLeaving(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={`boot-screen ${isLeaving ? 'is-leaving' : ''}`}>
      <div className="boot-screen__gradient" />
      <div className="boot-screen__vignette" />
      <div className="boot-screen__aurora" />

      <div className="boot-screen__stars boot-screen__stars--far" aria-hidden="true">
        {farStars.map((star) => (
          <span key={star.id} className="boot-star" style={starStyle(star)} />
        ))}
      </div>

      <div className="boot-screen__stars boot-screen__stars--near" aria-hidden="true">
        {nearStars.map((star) => (
          <span key={star.id} className="boot-star" style={starStyle(star)} />
        ))}
      </div>

      <div className="boot-screen__meteors" aria-hidden="true">
        {shootingStars.map((star) => (
          <span key={star.id} className="boot-meteor" style={shootingStarStyle(star)} />
        ))}
      </div>

      <div className="boot-screen__content">
        <div className="boot-logo-stage">
          <div className="boot-photo-cloud" aria-hidden="true">
            <div className="boot-photo-cloud__glow" />
            <div className="boot-photo-cloud__shine" />
            <div className="boot-photo-cloud__stars">
              {photoStars.map((star) => (
                <span key={star.id} className="boot-photo-star" style={starStyle(star)} />
              ))}
            </div>
          </div>

          <h1 className="boot-logo" aria-label={logoText}>
            {logoChars.map((char, index) => (
              <span
                key={`${char}-${index}`}
                className="boot-logo-char-shell"
                style={{
                  '--boot-char-delay': `${0.14 + index * 0.34}s`,
                  '--boot-water-delay': `${-index * 0.42}s`,
                }}
              >
                <span className="boot-logo-char">{char}</span>
              </span>
            ))}
          </h1>
        </div>

        <button
          type="button"
          className="boot-start-btn"
          onClick={() => setIsLeaving(true)}
        >
          <span className="boot-start-btn__label">{startLabel}</span>
        </button>
      </div>
    </div>
  )
}
