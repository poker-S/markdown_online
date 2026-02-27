import { createContext, useContext } from 'react'
import { translations } from './i18n.js'

export const LangContext = createContext('zh')

export function useLang() {
  const lang = useContext(LangContext)
  const t = (path) => {
    const keys = path.split('.')
    let val = translations[lang]
    for (const k of keys) val = val?.[k]
    return val ?? path
  }
  return { lang, t }
}
