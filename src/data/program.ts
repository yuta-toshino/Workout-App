import type { DayProgram, DayType, ExerciseDef } from '../types'

// 全ジム日共通:入場〜トレ開始まで(動線ガイド v2 の 0:00〜0:13)
export const COMMON_WARMUP: ExerciseDef[] = [
  {
    id: 'wu-cardio',
    name: '心拍上げ(3分)',
    kind: 'cardio',
    sets: 1,
    reps: '3分',
    atMin: 5,
    equipment: 'アップライトバイク or トレッドミル早歩き',
    tip: 'アセントトレーナーは有酸素本番用に温存',
  },
  {
    id: 'wu-mobility',
    name: 'モビリティ(5分)',
    kind: 'mobility',
    sets: 1,
    reps: '5分',
    atMin: 8,
    tip: 'ワールドグレイテストストレッチ 左右5回 → 90/90股関節 左右8回 → オープンブック 左右8回。狭ければベンチに座って胸椎回旋でも可',
  },
]

// 月曜:下半身A(筋力)— 約85分
const LOWER_A: ExerciseDef[] = [
  {
    id: 'squat',
    name: 'スクワット',
    kind: 'main',
    sets: 3,
    reps: '5',
    restSec: 180,
    atMin: 13,
    trackWeight: true,
    stepKg: 2.5,
    equipment: 'パワーラック / セーフティバーを必ず膝上の高さに',
    tip: 'ウォームアップ:空バー×10→50%×5→70%×3。1セット目を横から撮影',
    alt: 'ラック2台とも埋まっていたら45度レッグプレスから先に',
  },
  {
    id: 'rdl',
    name: 'ルーマニアンデッドリフト',
    kind: 'main',
    sets: 3,
    reps: '8',
    restSec: 120,
    atMin: 33,
    trackWeight: true,
    stepKg: 2.5,
    equipment: '同じラック内でバーを使えば移動ゼロ',
    tip: '背中フラット・ハムのストレッチ感',
  },
  {
    id: 'leg-press',
    name: '45度レッグプレス',
    kind: 'accessory',
    sets: 3,
    reps: '10',
    restSec: 90,
    atMin: 46,
    trackWeight: true,
    stepKg: 5,
    equipment: 'プレートロード式',
    tip: '深く下ろしすぎて腰が浮かない範囲で',
  },
  {
    id: 'calf-raise',
    name: 'カーフレイズ',
    kind: 'accessory',
    sets: 3,
    reps: '12',
    restSec: 60,
    atMin: 55,
    trackWeight: true,
    stepKg: 2.5,
    equipment: 'スミスマシンで立位 or レッグプレス台',
  },
  {
    id: 'plank',
    name: 'プランク',
    kind: 'core',
    sets: 3,
    reps: '45秒',
    atMin: 61,
    alt: '床が取れない日はクランチ台3×12+アブドミナル3×12',
  },
  {
    id: 'deadbug',
    name: 'デッドバグ',
    kind: 'core',
    sets: 3,
    reps: '10',
    atMin: 65,
  },
  {
    id: 'cooldown-bike-la',
    name: 'クールダウン(リカンベントバイク)',
    kind: 'cardio',
    sets: 1,
    reps: '5分',
    atMin: 70,
  },
]

// 火曜:上半身A(プッシュ)+ 有酸素 — 約85分
const UPPER_A: ExerciseDef[] = [
  {
    id: 'bench',
    name: 'ベンチプレス',
    kind: 'main',
    sets: 3,
    reps: '5',
    restSec: 180,
    atMin: 13,
    trackWeight: true,
    stepKg: 1.25,
    equipment: 'パワーラック+スパインベンチ / セーフティバーを胸の高さ直下に必ずセット',
    tip: 'ウォームアップ:空バー×10→50%×5→70%×3。深夜は補助者なし=安全バー必須',
    alt: 'ラック満員時はチェストプレスマシン3×8で代替',
  },
  {
    id: 'ohp',
    name: 'オーバーヘッドプレス',
    kind: 'main',
    sets: 3,
    reps: '5',
    restSec: 150,
    atMin: 33,
    trackWeight: true,
    stepKg: 1.25,
    equipment: '同じラック内で',
    alt: 'ラックを長く占有したくない日はショルダープレスマシン3×8',
  },
  {
    id: 'db-incline',
    name: 'ダンベルインクラインプレス',
    kind: 'accessory',
    sets: 3,
    reps: '8',
    restSec: 90,
    atMin: 45,
    trackWeight: true,
    stepKg: 2,
    equipment: 'アジャスタブルベンチを30〜45度に',
  },
  {
    id: 'pushdown',
    name: 'ケーブルプレスダウン',
    kind: 'accessory',
    sets: 3,
    reps: '10',
    restSec: 60,
    atMin: 55,
    trackWeight: true,
    equipment: 'サイドレイズと交互でレスト60秒・時短',
  },
  {
    id: 'side-raise',
    name: 'サイドレイズ',
    kind: 'accessory',
    sets: 3,
    reps: '12',
    restSec: 60,
    atMin: 58,
    trackWeight: true,
    stepKg: 1,
    equipment: 'ダンベル / プレスダウンとスーパーセット',
  },
  {
    id: 'zone2-ua',
    name: 'Zone2有酸素',
    kind: 'cardio',
    sets: 1,
    reps: '20分',
    atMin: 65,
    equipment: 'アセントトレーナー → アップライトバイク → 傾斜10%早歩き(走らない)',
    tip: '会話できる強度。筋トレ後の有酸素で減量を後押し',
  },
]

// 水曜:パワー/ゴルフ特化日 — 約75分(メディシンボール代替版)
const POWER: ExerciseDef[] = [
  {
    id: 'mobility-tspine',
    name: '追加モビリティ',
    kind: 'mobility',
    sets: 1,
    reps: '5分',
    atMin: 13,
    tip: 'ヒールシットT-spine回旋 左右8回 → ピジョン 各30秒。回旋の日は胸椎・股関節を入念に',
  },
  {
    id: 'cmj',
    name: 'カウンタームーブメントジャンプ (CMJ)',
    kind: 'power',
    sets: 4,
    reps: '4',
    restSec: 120,
    atMin: 18,
    equipment: 'フリーウエイトエリアの空きスペース',
    tip: '全力で跳び、着地は静かに。速度が落ちたら終了',
  },
  {
    id: 'db-jump-squat',
    name: 'ダンベルジャンプスクワット',
    kind: 'power',
    sets: 3,
    reps: '4',
    restSec: 120,
    atMin: 26,
    trackWeight: true,
    stepKg: 2,
    equipment: '片手に体重の5〜10%(4〜8kg)×2',
    tip: 'ボックスジャンプの代替。着地が乱れたら自重に戻す',
  },
  {
    id: 'cable-chop',
    name: 'ケーブル爆発回旋チョップ(高→低)',
    kind: 'power',
    sets: 3,
    reps: '8',
    restSec: 90,
    atMin: 34,
    unilateral: true,
    trackWeight: true,
    equipment: 'ケーブルマシン',
    tip: 'ダウンスイングをイメージ。引く局面だけ全速力・戻しはゆっくり',
  },
  {
    id: 'cable-lift',
    name: 'ケーブル爆発リフト(低→高)',
    kind: 'power',
    sets: 3,
    reps: '8',
    restSec: 90,
    atMin: 46,
    unilateral: true,
    trackWeight: true,
    equipment: 'ケーブルマシン',
    tip: 'フォロースルー方向のパワー。骨盤を固定し胸郭と股関節を分離',
  },
  {
    id: 'torso-rotation',
    name: 'トーソローテーション(マシン)',
    kind: 'power',
    sets: 2,
    reps: '10',
    restSec: 60,
    atMin: 56,
    unilateral: true,
    trackWeight: true,
    equipment: '2台あり待ちなし',
    tip: '軽め重量で「速く回して、ゆっくり戻す」',
  },
  {
    id: 'pallof',
    name: 'パロフプレス',
    kind: 'core',
    sets: 3,
    reps: '10',
    restSec: 60,
    atMin: 64,
    unilateral: true,
    equipment: 'ケーブルマシン / 抗回旋で体幹仕上げ',
  },
  {
    id: 'plyo-pushup',
    name: 'プライオプッシュアップ(オプション)',
    kind: 'power',
    sets: 2,
    reps: '5',
    restSec: 90,
    atMin: 70,
    tip: '上半身の爆発力。余裕がある日だけ',
  },
]

// 木曜:下半身B(ヒンジ)— 約80分
const LOWER_B: ExerciseDef[] = [
  {
    id: 'hex-deadlift',
    name: 'ヘックスバーデッドリフト',
    kind: 'main',
    sets: 1, // 最初の2ヶ月は1×5で十分(8月以降は3×5へ:resolveSetsで自動切替)
    reps: '5',
    restSec: 180,
    atMin: 13,
    trackWeight: true,
    stepKg: 2.5,
    equipment: 'ヘックスバー(設置あり!最初からこれを使う)',
    tip: '通常バーより腰に優しくHS相関も高い。鏡 or 撮影で背中フラット確認。最初の2ヶ月は1セットで十分',
    alt: '1台のみ。埋まっていたらヒップスラストから先に',
  },
  {
    id: 'hip-thrust',
    name: 'ヒップスラスト',
    kind: 'main',
    sets: 3,
    reps: '8',
    restSec: 120,
    atMin: 32,
    trackWeight: true,
    stepKg: 2.5,
    equipment: 'フラットベンチ+バーベル / バーが当たるならタオル',
    alt: '混雑時はスミスマシンでヒップスラストでも可',
  },
  {
    id: 'bulgarian',
    name: 'ブルガリアンスクワット',
    kind: 'accessory',
    sets: 3,
    reps: '8',
    restSec: 90,
    atMin: 44,
    unilateral: true,
    trackWeight: true,
    stepKg: 2,
    equipment: 'ダンベル+アジャスタブルベンチ',
    tip: '片脚バランスはスイングの土台',
  },
  {
    id: 'leg-curl',
    name: 'レッグカール',
    kind: 'accessory',
    sets: 3,
    reps: '10',
    restSec: 60,
    atMin: 56,
    trackWeight: true,
    equipment: 'マシン',
  },
  {
    id: 'back-ext',
    name: 'バックエクステンション',
    kind: 'accessory',
    sets: 3,
    reps: '10',
    atMin: 63,
    equipment: '専用台 / 自重→慣れたらプレート抱えて',
    tip: 'ゴルフの後鎖(脊柱起立筋・臀部)強化に最適',
  },
  {
    id: 'hanging-leg-raise',
    name: 'ハンギングレッグレイズ',
    kind: 'core',
    sets: 3,
    reps: '8',
    atMin: 69,
    equipment: 'パワーラックの懸垂バー or アシストチンの台',
  },
  {
    id: 'side-plank',
    name: 'サイドプランク',
    kind: 'core',
    sets: 2,
    reps: '左右30秒',
    atMin: 72,
  },
  {
    id: 'cooldown-bike-lb',
    name: 'クールダウン(リカンベントバイク)',
    kind: 'cardio',
    sets: 1,
    reps: '5分',
    atMin: 75,
    tip: '翌日腰の張りが強ければ金曜の有酸素を早歩きに',
  },
]

// 金曜:上半身B(プル)+ 有酸素 — 約85分
const UPPER_B: ExerciseDef[] = [
  {
    id: 'chin',
    name: 'チンニング(懸垂)',
    kind: 'main',
    sets: 3,
    reps: '8',
    restSec: 150,
    atMin: 18,
    equipment: 'アシストチンマシンで補助量を調整',
    tip: 'ウォームアップにラットプル軽め×10×2。自力8回できたら自重懸垂へ移行',
  },
  {
    id: 'barbell-row',
    name: 'バーベルロウ',
    kind: 'main',
    sets: 3,
    reps: '5',
    restSec: 150,
    atMin: 30,
    trackWeight: true,
    stepKg: 2.5,
    equipment: 'パワーラック内で',
    alt: 'ラック満員時はプレートロード・ロウ3×8',
  },
  {
    id: 'db-row',
    name: 'ダンベルワンハンドロウ',
    kind: 'accessory',
    sets: 3,
    reps: '10',
    restSec: 90,
    atMin: 42,
    unilateral: true,
    trackWeight: true,
    stepKg: 2,
    equipment: 'フラットベンチ+ダンベル',
  },
  {
    id: 'face-pull',
    name: 'フェイスプル',
    kind: 'accessory',
    sets: 3,
    reps: '12',
    restSec: 60,
    atMin: 52,
    trackWeight: true,
    equipment: 'ケーブル / プリーチャーカールとスーパーセット',
  },
  {
    id: 'preacher-curl',
    name: 'プリーチャーカール',
    kind: 'accessory',
    sets: 3,
    reps: '10',
    restSec: 60,
    atMin: 55,
    trackWeight: true,
    stepKg: 1.25,
    equipment: 'プリーチャー台',
  },
  {
    id: 'zone2-ub',
    name: 'Zone2有酸素',
    kind: 'cardio',
    sets: 1,
    reps: '20分',
    atMin: 62,
    equipment: 'アセントトレーナー第一候補',
    tip: '週末ラウンドの週は15分に短縮可',
  },
]

// 土曜:打ちっぱなし(HS計測固定)
const RANGE: ExerciseDef[] = [
  {
    id: 'overspeed',
    name: 'オーバースピード素振り',
    kind: 'power',
    sets: 1,
    reps: '15分',
    atMin: 0,
    tip: '前半に計測しながら。重い→標準→軽いの3本を全力で。神経系のリミッター解除',
  },
  {
    id: 'hs-measure',
    name: 'ヘッドスピード計測',
    kind: 'power',
    sets: 1,
    reps: '記録',
    atMin: 15,
    tip: '毎週土曜・同条件で固定。記録タブに入力(PRGR等)',
  },
  {
    id: 'range-balls',
    name: 'ドライバー含む実打',
    kind: 'power',
    sets: 1,
    reps: '〜10:30',
    atMin: 25,
    tip: '速く振る神経が起きた状態での実打が最も転写効率が高い',
  },
]

const REST: ExerciseDef[] = []

export const PROGRAMS: Record<DayType, DayProgram> = {
  lower_a: {
    type: 'lower_a',
    title: '下半身A',
    subtitle: '筋力',
    emoji: '🦵',
    durationMin: 85,
    exercises: [...COMMON_WARMUP, ...LOWER_A],
  },
  upper_a: {
    type: 'upper_a',
    title: '上半身A',
    subtitle: 'プッシュ + 有酸素',
    emoji: '💪',
    durationMin: 85,
    exercises: [...COMMON_WARMUP, ...UPPER_A],
  },
  power: {
    type: 'power',
    title: 'パワー日',
    subtitle: 'ゴルフ特化・速さの日',
    emoji: '⚡',
    durationMin: 75,
    note: '「重さ」より「速さ」。動作スピードが落ちたらそのセットで終了。ジム→打ちっぱなし直行が理想の流れ。',
    exercises: [...COMMON_WARMUP, ...POWER],
  },
  lower_b: {
    type: 'lower_b',
    title: '下半身B',
    subtitle: 'ヒンジ',
    emoji: '🏋️',
    durationMin: 80,
    exercises: [...COMMON_WARMUP, ...LOWER_B],
  },
  upper_b: {
    type: 'upper_b',
    title: '上半身B',
    subtitle: 'プル + 有酸素',
    emoji: '🚣',
    durationMin: 85,
    exercises: [...COMMON_WARMUP, ...UPPER_B],
  },
  range: {
    type: 'range',
    title: '打ちっぱなし',
    subtitle: 'HS計測(毎週土曜固定)',
    emoji: '⛳',
    durationMin: 90,
    note: '前半15分にオーバースピード素振り。ヘッドスピード計測は毎週土曜に固定し、同条件で記録を比較。',
    exercises: RANGE,
  },
  rest: {
    type: 'rest',
    title: '完全休養 or ラウンド',
    subtitle: '適応は休んでいる間に進む',
    emoji: '😴',
    durationMin: 0,
    note: '通常週は完全休養(散歩程度はOK)。ラウンド週(月1〜2回)はそのまま実戦+有酸素。',
    exercises: REST,
  },
}

/** その週の曜日 → DayType(0=日) */
export const WEEKDAY_TO_DAYTYPE: DayType[] = [
  'rest', // 日
  'lower_a', // 月
  'upper_a', // 火
  'power', // 水
  'lower_b', // 木
  'upper_b', // 金
  'range', // 土
]

export const DAYTYPE_LABEL: Record<DayType, string> = {
  lower_a: '下半身A',
  upper_a: '上半身A',
  power: 'パワー日',
  lower_b: '下半身B',
  upper_b: '上半身B',
  range: '打ちっぱなし',
  rest: '休養 / ラウンド',
}

/**
 * フェーズに応じた有効セット数を返す。
 * ヘックスバーデッドは「最初の2ヶ月(6-7月)は1セット、8月以降3セット」。
 */
export function resolveSets(ex: ExerciseDef, date: Date): number {
  if (ex.id === 'hex-deadlift') {
    const afterAug = date.getFullYear() > 2026 || (date.getFullYear() === 2026 && date.getMonth() >= 7)
    return afterAug ? 3 : 1
  }
  return ex.sets
}

/** 重量を記録する種目だけを抽出(履歴/PR用) */
export function trackedExercises(): ExerciseDef[] {
  const seen = new Set<string>()
  const out: ExerciseDef[] = []
  for (const day of Object.values(PROGRAMS)) {
    for (const ex of day.exercises) {
      if (ex.trackWeight && !seen.has(ex.id)) {
        seen.add(ex.id)
        out.push(ex)
      }
    }
  }
  return out
}
