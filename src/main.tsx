import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import { getTurso } from './lib/store'
import { runSyncNow, syncOnForeground } from './lib/actions'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// 起動時に Turso 設定があればバックグラウンド同期
if (getTurso()) {
  runSyncNow().catch(() => {
    /* syncMeta に記録 */
  })
}

// 別端末での更新を、アプリが前面に戻った時に取り込む(リロード不要にする)。
// syncOnForeground 内で Turso 未設定なら無視されるので、登録は常に行う。
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') syncOnForeground()
})
window.addEventListener('focus', syncOnForeground)
window.addEventListener('online', syncOnForeground)

// 低頻度ポーリング: 前面表示中のみ一定間隔で pull し、両端末を開いたままでも
// 別端末の更新が自動反映されるようにする。バックグラウンド中は無駄打ちを避けて停止
// (復帰時は上の visibilitychange が拾う)。syncOnForeground の 3 秒スロットルで
// フォアグラウンド同期との二重実行も防がれる。
const SYNC_POLL_MS = 60_000
setInterval(() => {
  if (document.visibilityState === 'visible') syncOnForeground()
}, SYNC_POLL_MS)
