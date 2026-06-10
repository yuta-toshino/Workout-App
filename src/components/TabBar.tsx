import { Icon, type IconName } from './Icon'
import type { Tab } from '../App'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'today', label: '今日', icon: 'today' },
  { id: 'progress', label: '記録', icon: 'progress' },
  { id: 'plan', label: '計画', icon: 'plan' },
  { id: 'settings', label: '設定', icon: 'settings' },
]

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => onChange(t.id)}>
          <Icon name={t.icon} size={24} />
          {t.label}
        </button>
      ))}
    </nav>
  )
}
