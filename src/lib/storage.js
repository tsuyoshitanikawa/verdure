// LocalStorage を単純なキー・バリューの「日付→記録」ストアとして扱う薄いラッパ。
const KEY = 'verdure.records.v1'

export function loadRecords() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveRecords(records) {
  try {
    localStorage.setItem(KEY, JSON.stringify(records))
  } catch {
    /* 容量超過などは黙って無視（UI 側で別途ハンドリング可能） */
  }
}

// 朝・昼・おやつ・夜の入力を、AIに渡す1つのラベル付きテキストにまとめる。
// 旧データ（freeform の meal）が残っている場合はそれも拾う。
export function composeMeal(rec) {
  if (!rec) return ''
  const parts = [
    rec.breakfast && `朝: ${rec.breakfast}`,
    rec.lunch && `昼: ${rec.lunch}`,
    rec.snack && `おやつ: ${rec.snack}`,
    rec.dinner && `夜: ${rec.dinner}`,
  ].filter(Boolean)
  if (parts.length === 0 && rec.meal) return rec.meal
  return parts.join('\n')
}

export function todayISO() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

// 直近 days 日分を「古い順」で返す。値が無い日はスキップ。
export function recentSeries(records, days = 30) {
  const out = []
  const base = new Date(todayISO())
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base)
    d.setDate(base.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const rec = records[iso]
    if (rec && rec.weight != null && rec.weight !== '') {
      out.push({ date: iso, weight: Number(rec.weight) })
    }
  }
  return out
}
