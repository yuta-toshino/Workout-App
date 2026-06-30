import type { Profile } from '../types'

export interface Phase {
  id: 1 | 2 | 3 | 4
  name: string
  period: string
  /** 開始日(含む)・終了日(含む) YYYY-MM-DD */
  start: string
  end: string
  focus: string
  diet: string
  milestone: string
  /** マイルストーン目安(チャートの基準線にも使用) */
  targetWeight?: number
  targetBodyFat?: number
  targetHs?: number
}

// 統合プラン H. フェーズ分けロードマップ(2026年7月〜12月)
// ※トレ開始が2026年6月末のため、Phase1を7月始まりに後ろ倒し。仕上げ期は12月のみに圧縮。
export const PHASES: Phase[] = [
  {
    id: 1,
    name: 'Phase 1 基礎習得期',
    period: '2026年7月(4週)',
    start: '2026-07-01',
    end: '2026-07-31',
    focus: 'フォーム習得、軽〜中負荷、モビリティ確立、オーバースピード開始',
    diet: '軽い赤字スタート(維持 -15%)',
    milestone: '体重76〜77kg / 全種目フォーム確立',
    targetWeight: 76.5,
  },
  {
    id: 2,
    name: 'Phase 2 筋力向上期',
    period: '2026年8〜9月(8週)',
    start: '2026-08-01',
    end: '2026-09-30',
    focus: '線形漸進で筋力ベース構築、回旋パワー追加、バイク有酸素で減量加速',
    diet: '赤字継続、タンパク高め',
    milestone: '体重73〜75kg / 体脂肪20%前後 / HS49〜50',
    targetWeight: 74,
    targetBodyFat: 20,
    targetHs: 49.5,
  },
  {
    id: 3,
    name: 'Phase 3 パワー特化期',
    period: '2026年10〜11月(8週)',
    start: '2026-10-01',
    end: '2026-11-30',
    focus: '複合トレ・プライオ・オーバースピード強化、速度転写',
    diet: '維持〜軽い赤字(必要ならダイエットブレイク1週)',
    milestone: '体重72〜74kg / 体脂肪16〜18% / HS50〜52',
    targetWeight: 73,
    targetBodyFat: 17,
    targetHs: 51,
  },
  {
    id: 4,
    name: 'Phase 4 仕上げ期',
    period: '2026年12月(4週)',
    start: '2026-12-01',
    end: '2026-12-31',
    focus: 'パワー維持+最終カットで腹筋を出す、クラブフィッティング',
    diet: 'やや強めの赤字で脂肪を絞る',
    milestone: '体重71〜73kg / 体脂肪13〜15%(腹筋見える) / HS52〜53(ストレッチ55)',
    targetWeight: 72,
    targetBodyFat: 14,
    targetHs: 52.5,
  },
]

export function phaseForDate(date: Date): Phase {
  const ymd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
  for (const p of PHASES) {
    if (ymd >= p.start && ymd <= p.end) return p
  }
  // 期間外:7月より前(開始前の6月など)は Phase1、12月より後は Phase4 を返す
  if (ymd < PHASES[0].start) return PHASES[0]
  return PHASES[PHASES.length - 1]
}

export const DEFAULT_PROFILE: Profile = {
  name: '',
  startWeightKg: 78,
  startBodyFatPct: 25,
  startHsMs: 48,
  targetWeightKg: 72,
  targetBodyFatPct: 13,
  targetHsMs: 55,
  proteinTargetG: 160,
  gymMode: 'morning',
}
