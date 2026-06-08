// Vercel Functions（/api/*）を呼び出すクライアント。
// 開発時に VITE_API_BASE を設定すると、本番 Vercel の関数に向けて検証できる。
const BASE = import.meta.env.VITE_API_BASE || ''

async function postJSON(path, payload) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let detail = ''
    try {
      const j = await res.json()
      detail = j.error || ''
    } catch {
      /* noop */
    }
    throw new Error(detail || `リクエストに失敗しました (HTTP ${res.status})`)
  }

  return res.json()
}

export function fetchMealAdvice({ meal, weight, goal }) {
  return postJSON('/api/meal-advice', { meal, weight, goal })
}

export function fetchTrainingAdvice({ training, weight, goal }) {
  return postJSON('/api/training-advice', { training, weight, goal })
}
