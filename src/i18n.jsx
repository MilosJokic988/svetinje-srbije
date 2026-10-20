import { createContext, useContext } from 'react'
import { toCyrillic } from './utils/script'

// Pismo cele aplikacije: 'cyr' (ćirilica) ili 'lat' (latinica)
export const ScriptContext = createContext('cyr')

export function useT() {
  const script = useContext(ScriptContext)
  return (text) => (script === 'cyr' ? toCyrillic(text) : text)
}
