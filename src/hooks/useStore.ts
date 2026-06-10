import { useSyncExternalStore } from 'react'
import { getVersion, subscribe } from '../lib/store'

/** ストアの変更で再レンダリングをトリガーする。返り値はバージョン番号。 */
export function useStore(): number {
  return useSyncExternalStore(subscribe, getVersion, getVersion)
}
