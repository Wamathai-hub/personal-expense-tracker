import { useEffect, useState } from 'react'
import { writeJSON } from '../utils/storage'

/**
 * State that is persisted to localStorage on every change and kept in sync between tabs.
 * `load` must return the initial value and is only called on first render or on a change
 * made in another tab. The third item is true when the browser refused the last write.
 */
export default function useLocalStorage(key, load) {
  const [value, setValue] = useState(load)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(!writeJSON(key, value))
  }, [key, value])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== key || event.newValue === null) return
      setValue(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, load])

  return [value, setValue, failed]
}
