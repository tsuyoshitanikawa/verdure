import { useState } from 'react'
import { fetchMealAdvice } from '../lib/api.js'

export default function MealAdvice({ meal, weight, goal }) {
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState(null)
  const [error, setError] = useState('')

  const hasMeal = meal && meal.trim().length > 0

  async function onClick() {
    setLoading(true)
    setError('')
    setAdvice(null)
    try {
      const data = await fetchMealAdvice({ meal, weight, goal })
      setAdvice(data)
    } catch (e) {
      const msg = String((e && e.message) || '')
      if (/Failed to fetch|NetworkError|load failed|HTTP (404|405|501)/i.test(msg)) {
        setError(
          'AI食事アドバイスはバックエンド（/api）が必要です。Vercel にデプロイ（または vercel dev で起動）すると利用できます。',
        )
      } else {
        setError(msg || 'アドバイスの取得に失敗しました。')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card reveal">
      <div className="card__head">
        <span className="ico">✨</span>
        <h2>AI 食事アドバイス</h2>
      </div>

      <div className="advice">
        <p className="advice__cta-note">
          {hasMeal
            ? '入力した食事内容をもとに、AIが栄養面のフィードバックを返します。'
            : '左の「食事」欄に内容を入力すると、AIアドバイスを受け取れます。'}
        </p>

        <button
          className="btn btn--primary"
          onClick={onClick}
          disabled={!hasMeal || loading}
        >
          {loading ? (
            <>
              分析中
              <span className="dots">
                <span />
                <span />
                <span />
              </span>
            </>
          ) : (
            <>🥗 アドバイスをもらう</>
          )}
        </button>

        {error && <div className="error-box">⚠️ {error}</div>}

        {advice && (
          <div className="advice__panel">
            {advice.calorieScore && (
              <div className="advice__section">
                <h3>🔥 カロリー評価</h3>
                <span className="badge">{advice.calorieScore}</span>
                <p style={{ marginTop: '0.5rem' }}>{advice.calorieComment}</p>
              </div>
            )}

            <div className="advice__section">
              <h3>⚖️ 栄養バランスの改善点</h3>
              {Array.isArray(advice.balance) ? (
                <ul>
                  {advice.balance.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : (
                <p>{advice.balance}</p>
              )}
            </div>

            <div className="advice__section">
              <h3>🛒 次の食事におすすめの食材</h3>
              {Array.isArray(advice.recommended) ? (
                <ul>
                  {advice.recommended.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              ) : (
                <p>{advice.recommended}</p>
              )}
            </div>

            <div className="advice__section">
              <h3>🎯 体重管理目標に向けて</h3>
              <p>{advice.goalAdvice}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
