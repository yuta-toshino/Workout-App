import type { DayProgram, DayType, ExerciseDef } from '../types'

// 全ジム日共通:入場〜トレ開始まで(動線ガイド v2 の 0:00〜0:13)
export const COMMON_WARMUP: ExerciseDef[] = [
  {
    id: 'wu-cardio',
    name: '心拍上げ(3分)',
    kind: 'cardio',
    target: '全身ウォームアップ(血流・体温)',
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
    target: '胸椎・股関節の可動域',
    sets: 1,
    reps: '5分',
    atMin: 8,
    tip: 'ワールドグレイテストストレッチ 左右5回 → 90/90股関節 左右8回 → オープンブック 左右8回。狭ければベンチに座って胸椎回旋でも可',
  },
]

// 月曜:下半身A(筋力)— 約85分
// 初回(2026-06-29)実績をベースに、フリーウェイト→マシン→仕上げの順に再構成。
// クアッド優位だった前回に対し、後鎖(RDL)とふくらはぎ(カーフ)を最初から負荷ありで追加。
const LOWER_A: ExerciseDef[] = [
  {
    id: 'hex-squat',
    name: 'ヘックスバースクワット',
    kind: 'main',
    target: '大腿四頭筋・臀筋(下半身全体)',
    sets: 4,
    reps: '5',
    restSec: 180,
    atMin: 13,
    trackWeight: true,
    stepKg: 2.5,
    startKg: 60,
    equipment: 'ヘックスバー(疲れる前に最初へ)',
    tip: 'ウォームアップ:40kg×5→本番。目標 60kg→80kg×5。フォームに余裕が出たらバーベルバックスクワット(空バー)習得に移行。1セット目を横から撮影',
    alt: 'ヘックスバーが埋まっていたら45度レッグプレスを先に',
  },
  {
    id: 'rdl',
    name: 'ルーマニアンデッドリフト',
    kind: 'main',
    target: 'ハムストリングス・臀筋(後鎖)',
    sets: 3,
    reps: '8',
    restSec: 120,
    atMin: 35,
    trackWeight: true,
    stepKg: 2.5,
    startKg: 40,
    equipment: 'バーベル(後鎖=ゴルフHSの源)',
    tip: '重量より先にヒンジのフォーム習得(腰のケガ予防)。背中フラット・ハムのストレッチ感。40kgで固めてから増量、目標 60kg×8',
  },
  {
    id: 'leg-press',
    name: '45度レッグプレス',
    kind: 'accessory',
    target: '大腿四頭筋',
    sets: 3,
    reps: '10',
    restSec: 90,
    atMin: 48,
    trackWeight: true,
    stepKg: 5,
    startKg: 120,
    equipment: 'プレートロード式',
    tip: '深く下ろしすぎて腰が浮かない範囲で。10回が余裕なら毎回+5kg、目標 150kg×10',
  },
  {
    id: 'calf-raise',
    name: 'カーフプレス / カーフレイズ',
    kind: 'accessory',
    target: 'ふくらはぎ(下腿三頭筋)',
    sets: 3,
    reps: '15',
    restSec: 60,
    atMin: 56,
    trackWeight: true,
    stepKg: 5,
    startKg: 60,
    equipment: 'レッグプレス台でカーフプレス(つま先を乗せ足首で押す)or 片足自重',
    tip: '両足自重は負荷不足で効かない。可動域フル(下で伸ばす)+トップ1秒静止。目標 90kg×15',
  },
  {
    id: 'plank',
    name: 'プランク',
    kind: 'core',
    target: '体幹(腹横筋・腹直筋)',
    sets: 3,
    reps: '45秒',
    atMin: 61,
    alt: '床が取れない日はクランチ台3×12+アブドミナル3×12',
  },
  {
    id: 'deadbug',
    name: 'デッドバグ',
    kind: 'core',
    target: '体幹(腹横筋・抗伸展)',
    sets: 3,
    reps: '10',
    atMin: 65,
  },
  {
    id: 'cooldown-bike-la',
    name: 'クールダウン(リカンベントバイク)',
    kind: 'cardio',
    target: 'クールダウン(有酸素)',
    sets: 1,
    reps: '5分',
    atMin: 70,
  },
]

// 火曜:上半身A(プッシュ)+ 有酸素 — 約85分
// 初回(2026-06-30)、バーベルのベンチ/OHPは重量に不慣れで負荷が三頭・肩に逃げ、
// 大胸筋に効かせにくかった。軌道が安定するマシン/ケーブル中心に再構成し、
// 大胸筋へのマインドマッスル(効かせる意識)を優先。慣れたらバーベルへ移行する。
const UPPER_A: ExerciseDef[] = [
  {
    id: 'chest-press',
    name: 'チェストプレス(マシン)',
    kind: 'main',
    target: '大胸筋',
    sets: 3,
    reps: '10',
    restSec: 120,
    atMin: 13,
    trackWeight: true,
    stepKg: 2.5,
    equipment: 'マシン(軌道が安定し胸に集中しやすい)',
    tip: '肩甲骨を寄せて胸を張り、肘でなく「胸で押して寄せる」。重量より大胸筋に効かせる意識。慣れてフォームが安定したらバーベルベンチに移行',
    alt: '混雑時はスミスマシンのベンチでも可',
  },
  {
    id: 'cable-fly',
    name: 'ケーブルチェストフライ(クロスオーバー)',
    kind: 'accessory',
    target: '大胸筋(内側・ストレッチ)',
    sets: 3,
    reps: '12',
    restSec: 60,
    atMin: 30,
    trackWeight: true,
    stepKg: 1,
    equipment: 'ケーブル(滑車を上 or 中段に)',
    tip: '腕で引かず、胸を寄せて手を体の前で合わせる。下ろす時に大胸筋のストレッチを感じる。軽めで可動域とマインドマッスル重視',
  },
  {
    id: 'shoulder-press-m',
    name: 'ショルダープレス(マシン)',
    kind: 'accessory',
    target: '三角筋(肩・前部)',
    sets: 3,
    reps: '10',
    restSec: 90,
    atMin: 42,
    trackWeight: true,
    stepKg: 2,
    equipment: 'マシン(OHPの代替・軌道が安定)',
    tip: 'バーベルOHPの代わり。肩に集中しやすい。反動を使わずコントロール',
  },
  {
    id: 'side-raise',
    name: 'サイドレイズ',
    kind: 'accessory',
    target: '三角筋中部(肩の横)',
    sets: 3,
    reps: '12',
    restSec: 60,
    atMin: 52,
    trackWeight: true,
    stepKg: 1,
    equipment: 'ダンベル or ケーブル / プレスダウンとスーパーセット',
    tip: '小指側をやや上に、肩をすくめず横に張り出す',
  },
  {
    id: 'pushdown',
    name: 'ケーブルプレスダウン',
    kind: 'accessory',
    target: '上腕三頭筋',
    sets: 3,
    reps: '10',
    restSec: 60,
    atMin: 58,
    trackWeight: true,
    equipment: 'ケーブル / サイドレイズと交互でレスト60秒・時短',
  },
  {
    id: 'zone2-ua',
    name: 'Zone2有酸素',
    kind: 'cardio',
    target: '有酸素(脂肪燃焼)',
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
    target: '胸椎・股関節(回旋準備)',
    sets: 1,
    reps: '5分',
    atMin: 13,
    tip: 'ヒールシットT-spine回旋 左右8回 → ピジョン 各30秒。回旋の日は胸椎・股関節を入念に',
  },
  {
    id: 'cmj',
    name: 'カウンタームーブメントジャンプ (CMJ)',
    kind: 'power',
    target: '下肢の爆発力(HSの源)',
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
    target: '下肢の爆発力(地面反力)',
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
    target: '体幹回旋(腹斜筋・ダウンスイング)',
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
    target: '体幹回旋(腹斜筋・フォロースルー)',
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
    target: '体幹回旋(腹斜筋)',
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
    target: '体幹(抗回旋・安定性)',
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
    target: '上半身の爆発力(大胸筋)',
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
    target: '後鎖(ハム・臀筋・脊柱起立筋)',
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
    target: '臀筋(大臀筋)',
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
    target: '臀筋・大腿四頭筋(片脚)',
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
    target: 'ハムストリングス',
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
    target: '脊柱起立筋・臀部(後鎖)',
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
    target: '体幹(腹直筋下部)',
    sets: 3,
    reps: '8',
    atMin: 69,
    equipment: 'パワーラックの懸垂バー or アシストチンの台',
  },
  {
    id: 'side-plank',
    name: 'サイドプランク',
    kind: 'core',
    target: '体幹(腹斜筋)',
    sets: 2,
    reps: '左右30秒',
    atMin: 72,
  },
  {
    id: 'cooldown-bike-lb',
    name: 'クールダウン(リカンベントバイク)',
    kind: 'cardio',
    target: 'クールダウン(有酸素)',
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
    target: '広背筋',
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
    target: '背中(僧帽筋中部・広背筋)',
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
    target: '広背筋・僧帽筋',
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
    target: '三角筋後部・僧帽筋',
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
    target: '上腕二頭筋',
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
    target: '有酸素(脂肪燃焼)',
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
    target: 'スイング速度(神経系の解放)',
    sets: 1,
    reps: '15分',
    atMin: 0,
    tip: '前半に計測しながら。重い→標準→軽いの3本を全力で。神経系のリミッター解除',
  },
  {
    id: 'hs-measure',
    name: 'ヘッドスピード計測',
    kind: 'power',
    target: '計測・記録(進捗確認)',
    sets: 1,
    reps: '記録',
    atMin: 15,
    tip: '毎週土曜・同条件で固定。記録タブに入力(PRGR等)',
  },
  {
    id: 'range-balls',
    name: 'ドライバー含む実打',
    kind: 'power',
    target: 'スイング転写(実打)',
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
