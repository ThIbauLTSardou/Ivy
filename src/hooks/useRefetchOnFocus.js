import { useEffect } from 'react'

/**
 * Appelle `fn` chaque fois que l'onglet redevient visible.
 * Utiliser dans les pages pour refetch les données au retour de l'app.
 */
export function useRefetchOnFocus(fn, opts = {}) {
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'visible') fn(opts)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [fn])
}
