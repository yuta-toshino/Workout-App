// ===== ドメインモデル =====
// すべてのレコードは id(UUID)と updatedAt(epoch ms)を持ち、
// Turso との last-write-wins 同期に使う。deleted はソフト削除フラグ。

export type DayType =
  | 'lower_a' // 月: 下半身A(筋力)
  | 'upper_a' // 火: 上半身A(プッシュ)+有酸素
  | 'power'   // 水: パワー/ゴルフ特化日
  | 'lower_b' // 木: 下半身B(ヒンジ)
  | 'upper_b' // 金: 上半身B(プル)+有酸素
  | 'range'   // 土: 打ちっぱなし(HS計測)
  | 'rest'    // 日: 完全休養 or ラウンド

export type ExerciseKind =
  | 'main'      // コンパウンド主役(漸進性過負荷で重量を記録)
  | 'accessory' // 補助(筋肥大)
  | 'power'     // 爆発系(速度重視・速度低下で終了)
  | 'core'      // 体幹
  | 'cardio'    // 有酸素(時間)
  | 'mobility'  // モビリティ/ストレッチ

export interface ExerciseDef {
  id: string
  name: string
  kind: ExerciseKind
  /** 目標セット数(数値 or フェーズ依存) */
  sets: number
  /** 表示用レップ目標(例: "5", "8", "45秒", "20分") */
  reps: string
  /** レスト秒(主3分=180 等)。cardio/mobility は省略 */
  restSec?: number
  /** 使用設備・補足 */
  equipment?: string
  /** ワンポイント */
  tip?: string
  /** 左右別(片側種目) */
  unilateral?: boolean
  /** 重量を記録する種目か(漸進性過負荷の対象) */
  trackWeight?: boolean
  /** 重量の推奨刻み(kg)。主種目=2.5、上半身は停滞時1.25等 */
  stepKg?: number
  /** 混雑時の代替種目(⇄) */
  alt?: string
  /** ガイド上の開始オフセット(分)。フォロー再生の目安 */
  atMin?: number
}

export interface DayProgram {
  type: DayType
  /** 例: "下半身A" */
  title: string
  /** 例: "筋力" */
  subtitle: string
  emoji: string
  /** 想定所要(分) */
  durationMin: number
  exercises: ExerciseDef[]
  /** 概要メモ(画面上部の注意書き) */
  note?: string
}

// ===== ログ系レコード =====

export interface SetLog {
  id: string
  sessionId: string
  exerciseId: string
  setIndex: number // 0始まり
  weightKg: number | null
  reps: number | null
  done: boolean
  updatedAt: number
  deleted?: boolean
}

export interface WorkoutSession {
  id: string
  /** YYYY-MM-DD(ローカル日付) */
  date: string
  dayType: DayType
  startedAt: number
  completedAt: number | null
  /** チェック済みのモビリティ/体幹など(exerciseId の配列) */
  doneChecks: string[]
  /** 有酸素やパワー等の任意メモ */
  note: string
  updatedAt: number
  deleted?: boolean
}

export interface BodyMetric {
  id: string
  date: string // YYYY-MM-DD
  weightKg: number | null
  bodyFatPct: number | null
  waistCm: number | null
  updatedAt: number
  deleted?: boolean
}

export interface HsLog {
  id: string
  date: string // YYYY-MM-DD(原則土曜)
  headSpeedMs: number | null
  ballSpeedMs: number | null
  carryYd: number | null
  note: string
  updatedAt: number
  deleted?: boolean
}

export interface RangeSession {
  id: string
  date: string // YYYY-MM-DD
  kind: 'range' | 'round' // 打ちっぱなし / ラウンド
  balls: number | null
  overspeedMin: number | null // オーバースピード素振り(分)
  note: string
  updatedAt: number
  deleted?: boolean
}

/** 1日の栄養・生活チェック(日付ごとに1件) */
export interface DailyCheck {
  id: string // = date
  date: string // YYYY-MM-DD
  proteinBreakfast: boolean
  proteinLunch: boolean
  proteinDinner: boolean
  shake: boolean // プロテイン1回
  creatine: boolean // クレアチン 3-5g
  vegFirst: boolean // 野菜・汁物を先に
  sleep: boolean // 7.5h睡眠
  alcohol: boolean // 飲酒した(週1-2回管理用)
  updatedAt: number
  deleted?: boolean
}

export interface Profile {
  name: string
  startWeightKg: number
  startBodyFatPct: number
  startHsMs: number
  targetWeightKg: number
  targetBodyFatPct: number
  targetHsMs: number
  proteinTargetG: number
  /** 朝ジム型 or 夜ジム型 */
  gymMode: 'morning' | 'night'
}

export interface TursoConfig {
  url: string
  token: string
}
