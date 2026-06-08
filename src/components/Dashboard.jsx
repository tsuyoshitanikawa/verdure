import WeightChart from './WeightChart.jsx'
import { recentSeries } from '../lib/storage.js'

export default function Dashboard({ records }) {
  const series = recentSeries(records, 30)

  const current = series.length ? series[series.length - 1].weight : null
  const first = series.length ? series[0].weight : null
  const avg = series.length
    ? series.reduce((s, d) => s + d.weight, 0) / series.length
    : null
  const delta = current != null && first != null ? current - first : null

  const deltaClass = delta == null || Math.abs(delta) < 0.05 ? 'flat' : delta < 0 ? 'down' : 'up'
  const deltaArrow = deltaClass === 'down' ? '▼' : deltaClass === 'up' ? '▲' : '–'

  return (
    <section className="card reveal">
      <div className="card__head">
        <span className="ico">📊</span>
        <h2>ダッシュボード</h2>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat__label">現在の体重</div>
          <div className="stat__value">
            {current != null ? current.toFixed(1) : '—'}
            {current != null && <small> kg</small>}
          </div>
        </div>

        <div className="stat">
          <div className="stat__label">期間の変化</div>
          <div className="stat__value">
            {delta != null ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}` : '—'}
            {delta != null && <small> kg</small>}
          </div>
          {delta != null && (
            <div className={`stat__delta ${deltaClass}`}>
              <span>{deltaArrow}</span>
              {deltaClass === 'down' ? '減少傾向' : deltaClass === 'up' ? '増加傾向' : '横ばい'}
            </div>
          )}
        </div>

        <div className="stat">
          <div className="stat__label">平均体重</div>
          <div className="stat__value">
            {avg != null ? avg.toFixed(1) : '—'}
            {avg != null && <small> kg</small>}
          </div>
        </div>
      </div>

      <WeightChart series={series} />
    </section>
  )
}
