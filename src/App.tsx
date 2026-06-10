import { useState } from 'react'
import type { DayType } from './types'
import { TabBar } from './components/TabBar'
import { Today } from './screens/Today'
import { Progress } from './screens/Progress'
import { Plan } from './screens/Plan'
import { Settings } from './screens/Settings'
import { Workout } from './screens/Workout'

export type Tab = 'today' | 'progress' | 'plan' | 'settings'

export interface WorkoutTarget {
  date: string
  dayType: DayType
}

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [workout, setWorkout] = useState<WorkoutTarget | null>(null)

  const startWorkout = (t: WorkoutTarget) => setWorkout(t)

  return (
    <div className="app">
      {tab === 'today' && <Today onStartWorkout={startWorkout} goToTab={setTab} />}
      {tab === 'progress' && <Progress />}
      {tab === 'plan' && <Plan onStartWorkout={startWorkout} />}
      {tab === 'settings' && <Settings />}

      <TabBar tab={tab} onChange={setTab} />

      {workout && (
        <Workout date={workout.date} dayType={workout.dayType} onClose={() => setWorkout(null)} />
      )}
    </div>
  )
}
