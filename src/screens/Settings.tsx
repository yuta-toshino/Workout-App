import { useRef, useState } from 'react'
import type { Profile } from '../types'
import { useStore } from '../hooks/useStore'
import { Header } from '../components/ui'
import { Icon } from '../components/Icon'
import { exportAll, getProfile, getSyncMeta, getTurso, importAll, setTurso } from '../lib/store'
import { runSyncNow, saveProfile } from '../lib/actions'
import { normalizeUrl, testConnection } from '../lib/turso'

export function Settings() {
  useStore()
  return (
    <div className="screen">
      <Header eyebrow="設定" title="設定" />
      <ProfileCard />
      <TursoCard />
      <BackupCard />
      <AboutCard />
    </div>
  )
}

function ProfileCard() {
  const [p, setP] = useState<Profile>(getProfile())
  const [saved, setSaved] = useState(false)
  const upd = (patch: Partial<Profile>) => {
    setP((prev) => ({ ...prev, ...patch }))
    setSaved(false)
  }
  const save = () => {
    saveProfile(p)
    setSaved(true)
  }
  const num = (label: string, key: keyof Profile, suffix: string, step = 1) => (
    <div className="field" style={{ marginBottom: 10 }}>
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          type="number"
          inputMode="decimal"
          step={step}
          value={(p[key] as number) ?? ''}
          onChange={(e) => upd({ [key]: Number(e.target.value) } as Partial<Profile>)}
        />
        <span className="muted small" style={{ position: 'absolute', right: 14, top: 13 }}>
          {suffix}
        </span>
      </div>
    </div>
  )

  return (
    <div className="card">
      <h3 className="card-title">プロフィール / 目標</h3>
      <div className="field" style={{ marginBottom: 10 }}>
        <label>名前(任意)</label>
        <input className="input" value={p.name} onChange={(e) => upd({ name: e.target.value })} placeholder="—" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {num('開始体重', 'startWeightKg', 'kg', 0.1)}
        {num('目標体重', 'targetWeightKg', 'kg', 0.1)}
        {num('開始体脂肪', 'startBodyFatPct', '%', 0.1)}
        {num('目標体脂肪', 'targetBodyFatPct', '%', 0.1)}
        {num('開始HS', 'startHsMs', 'm/s', 0.1)}
        {num('目標HS', 'targetHsMs', 'm/s', 0.1)}
      </div>
      {num('タンパク質目標', 'proteinTargetG', 'g/日', 5)}
      <div className="field">
        <label>ジムの時間帯</label>
        <div className="segmented">
          <button className={p.gymMode === 'morning' ? 'active' : ''} onClick={() => upd({ gymMode: 'morning' })}>
            朝ジム型(推奨)
          </button>
          <button className={p.gymMode === 'night' ? 'active' : ''} onClick={() => upd({ gymMode: 'night' })}>
            夜ジム型
          </button>
        </div>
      </div>
      <button className="btn primary" onClick={save}>
        {saved ? '保存しました ✓' : '保存'}
      </button>
    </div>
  )
}

function TursoCard() {
  const cfg = getTurso()
  const meta = getSyncMeta()
  const [url, setUrl] = useState(cfg?.url ?? '')
  const [token, setToken] = useState(cfg?.token ?? '')
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const saveCfg = async () => {
    if (!url || !token) return
    setTurso({ url: normalizeUrl(url), token: token.trim() })
    setStatus('保存しました。同期中…')
    setBusy(true)
    try {
      const r = await runSyncNow()
      setStatus(r ? `✅ 保存して同期完了(↑${r.pushed} / ↓${r.pulled})` : '保存しました')
    } catch (e) {
      setStatus('保存しましたが同期に失敗: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setBusy(false)
    }
  }
  const test = async () => {
    setBusy(true)
    setStatus('接続テスト中…')
    try {
      await testConnection({ url: normalizeUrl(url), token: token.trim() })
      setStatus('✅ 接続成功')
    } catch (e) {
      setStatus('❌ ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setBusy(false)
    }
  }
  const syncNow = async () => {
    setBusy(true)
    setStatus('同期中…')
    try {
      const r = await runSyncNow()
      setStatus(r ? `✅ 同期完了(↑${r.pushed} / ↓${r.pulled})` : '未接続')
    } catch (e) {
      setStatus('❌ ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setBusy(false)
    }
  }
  const disconnect = () => {
    setTurso(null)
    setUrl('')
    setToken('')
    setStatus('切断しました')
  }

  return (
    <div className="card">
      <h3 className="card-title">クラウド同期(Turso)</h3>
      <p className="small muted" style={{ marginTop: 0 }}>
        端末内に保存したデータを Turso にバックアップ・複数端末で同期できます。<b>URL とトークンはこの端末内だけに保存</b>され、アプリの公開ファイルには含まれません。
      </p>
      <div className="field" style={{ marginBottom: 10 }}>
        <label>Database URL</label>
        <input
          className="input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="libsql://your-db-xxx.turso.io"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
      <div className="field">
        <label>Auth Token</label>
        <input
          className="input"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGci…"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button className="btn ghost sm" style={{ width: '100%' }} onClick={test} disabled={busy || !url || !token}>
          接続テスト
        </button>
        <button className="btn sm" style={{ width: '100%' }} onClick={saveCfg} disabled={busy || !url || !token}>
          保存
        </button>
      </div>
      <button className="btn primary mt" onClick={syncNow} disabled={busy || !cfg}>
        <Icon name="sync" size={16} /> 今すぐ同期
      </button>
      {cfg && (
        <button className="btn danger mt" onClick={disconnect}>
          切断
        </button>
      )}
      {status && <p className="small mt" style={{ marginBottom: 0 }}>{status}</p>}
      {meta.lastSync && (
        <p className="tiny faint" style={{ marginBottom: 0 }}>
          最終同期: {new Date(meta.lastSync).toLocaleString('ja-JP')}
        </p>
      )}
      <details style={{ marginTop: 10 }}>
        <summary className="small" style={{ color: 'var(--accent)', cursor: 'pointer' }}>
          Turso の準備方法
        </summary>
        <ol className="tiny muted" style={{ paddingLeft: 18, marginBottom: 0 }}>
          <li>turso.tech で無料アカウント作成(Hobby プラン)</li>
          <li>
            CLI で <code>turso db create coach</code> → <code>turso db show coach --url</code> で URL を取得
          </li>
          <li>
            <code>turso db tokens create coach</code> でトークンを発行し、上に貼り付け
          </li>
          <li>「保存」→「今すぐ同期」。テーブルは自動作成されます</li>
        </ol>
      </details>
    </div>
  )
}

function BackupCard() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const doExport = () => {
    const data = exportAll()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coach-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = async (file: File) => {
    try {
      const text = await file.text()
      importAll(text)
      setMsg('✅ インポートしました')
    } catch (e) {
      setMsg('❌ ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  return (
    <div className="card">
      <h3 className="card-title">バックアップ</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button className="btn sm" style={{ width: '100%' }} onClick={doExport}>
          エクスポート
        </button>
        <button className="btn ghost sm" style={{ width: '100%' }} onClick={() => fileRef.current?.click()}>
          インポート
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) doImport(f)
          e.target.value = ''
        }}
      />
      {msg && <p className="small mt" style={{ marginBottom: 0 }}>{msg}</p>}
    </div>
  )
}

function AboutCard() {
  const reset = () => {
    if (!confirm('この端末のすべての記録を削除します。よろしいですか?(Turso 接続中なら次回同期で復元される場合があります)')) return
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith('rgc:')) localStorage.removeItem(k)
    }
    location.reload()
  }
  return (
    <div className="card">
      <h3 className="card-title">このアプリについて</h3>
      <p className="small muted" style={{ marginTop: 0 }}>
        体脂肪25%→13% × 飛距離330yd / HS55m/s を同時に狙う、26歳・フルリモート向けのパーソナルコーチ。データは端末内(オフライン可)に保存。
      </p>
      <button className="btn danger" onClick={reset}>
        全データを削除
      </button>
    </div>
  )
}
