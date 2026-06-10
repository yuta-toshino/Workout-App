import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import { getTurso } from './lib/store'
import { runSyncNow } from './lib/actions'

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
