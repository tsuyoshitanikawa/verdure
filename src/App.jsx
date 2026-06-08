import { useEffect, useMemo, useState } from 'react'
import RecordForm, { EMPTY } from './components/RecordForm.jsx'
import Dashboard from './components/Dashboard.jsx'
import { loadRecords, saveRecords, todayISO } from './lib/storage.js'

// 記録に「中身」があるか（体重・各食事・運動・睡眠のいずれか）。旧 meal も考慮。
function hasContent(r) {
  return !!(
    r &&
    (r.weight || r.breakfast || r.lunch || r.snack || r.dinner || r.meal || r.training || r.sleep)
  )
}

export default function App() {
  const [records, setRecords] = useState(() => loadRecords())
  const [date, setDate] = useState(() => todayISO())

  // 変更のたびに LocalStorage へ自動保存。
  useEffect(() => {
    saveRecords(records)
  }, [records])

  // スクロール連動のフェードイン。.reveal を持つカードを監視し、
  // ビューポートに入ったら .in を付与する。reduced-motion 時は即時表示。
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal')
    const revealAll = () => targets.forEach((el) => el.classList.add('in'))

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) {
      revealAll()
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    targets.forEach((el) => io.observe(el))

    // セーフティネット: 何らかの理由で Observer が発火しなくても、
    // コンテンツが見えなくなることは絶対に避ける（必ず最終的に表示）。
    const fallback = setTimeout(revealAll, 1500)

    return () => {
      io.disconnect()
      clearTimeout(fallback)
    }
  }, [])

  const current = records[date] || EMPTY

  function handleChange(next) {
    setRecords((prev) => ({ ...prev, [date]: next }))
  }

  // 明示的な「保存」操作（自動保存に加えての確認用）。空の記録なら破棄。
  function handleSave() {
    setRecords((prev) => {
      const rec = prev[date] || EMPTY
      if (!hasContent(rec)) {
        const copy = { ...prev }
        delete copy[date]
        return copy
      }
      return { ...prev, [date]: rec }
    })
  }

  function deleteRecord(d) {
    setRecords((prev) => {
      const copy = { ...prev }
      delete copy[d]
      return copy
    })
  }

  const history = useMemo(
    () =>
      Object.entries(records)
        .filter(([, r]) => hasContent(r))
        .sort((a, b) => (a[0] < b[0] ? 1 : -1)),
    [records],
  )

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand__mark">🌿</div>
          <div>
            <div className="brand__name">Verdure</div>
            <div className="brand__tag">体重・食事・運動・睡眠の記録</div>
          </div>
        </div>
        <label className="date-pill">
          <span aria-hidden>📅</span>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value || todayISO())}
          />
        </label>
      </header>

      <main className="layout">
        <div>
          <RecordForm date={date} value={current} onChange={handleChange} onSave={handleSave} />
        </div>

        <div>
          <Dashboard records={records} />

          <section className="card reveal">
            <div className="card__head">
              <span className="ico">🗂️</span>
              <h2>記録の履歴</h2>
            </div>
            {history.length === 0 ? (
              <div className="chart-empty" style={{ padding: '1.5rem' }}>
                記録はまだありません。
              </div>
            ) : (
              <div className="history">
                {history.map(([d, r]) => (
                  <div className="history__item" key={d}>
                    <button
                      onClick={() => setDate(d)}
                      style={{ textAlign: 'left', flex: 1, background: 'none' }}
                      title="この日を編集"
                    >
                      <div className="history__date">{d}</div>
                      <div className="history__meta">
                        {[
                          r.training && '🏋️ 運動あり',
                          r.sleep && `😴 ${r.sleep}h`,
                          (r.breakfast || r.lunch || r.snack || r.dinner || r.meal) &&
                            '🍽️ 食事あり',
                        ]
                          .filter(Boolean)
                          .join(' ・ ') || '記録'}
                      </div>
                    </button>
                    <span className="history__weight">{r.weight ? `${r.weight}kg` : '—'}</span>
                    <button
                      className="history__del"
                      onClick={() => deleteRecord(d)}
                      aria-label={`${d} の記録を削除`}
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="foot">
        Verdure — データはお使いのブラウザ（LocalStorage）にのみ保存されます。
      </footer>
    </div>
  )
}
