import { useMemo, useState } from 'react'

// 依存ライブラリ無しの軽量 SVG 折れ線グラフ。グラデーション塗り＋ホバーで値表示。
export default function WeightChart({ series }) {
  const [hover, setHover] = useState(null)

  const W = 560
  const H = 220
  const pad = { top: 18, right: 16, bottom: 28, left: 36 }

  const geo = useMemo(() => {
    if (series.length === 0) return null
    const weights = series.map((d) => d.weight)
    let min = Math.min(...weights)
    let max = Math.max(...weights)
    if (min === max) {
      min -= 1
      max += 1
    }
    const padY = (max - min) * 0.15 || 1
    min -= padY
    max += padY

    const innerW = W - pad.left - pad.right
    const innerH = H - pad.top - pad.bottom
    const n = series.length

    const x = (i) => pad.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW)
    const y = (v) => pad.top + innerH - ((v - min) / (max - min)) * innerH

    const points = series.map((d, i) => ({ ...d, cx: x(i), cy: y(d.weight) }))
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx} ${p.cy}`).join(' ')
    const area =
      `M ${points[0].cx} ${pad.top + innerH} ` +
      points.map((p) => `L ${p.cx} ${p.cy}`).join(' ') +
      ` L ${points[points.length - 1].cx} ${pad.top + innerH} Z`

    // Y軸目盛り（3本）
    const ticks = [min + (max - min) * 0.15, (min + max) / 2, max - (max - min) * 0.15].map((v) => ({
      v,
      y: y(v),
    }))

    return { points, line, area, min, max, ticks, innerH }
  }, [series])

  if (!geo) {
    return (
      <div className="chart-empty">
        まだデータがありません。<br />
        体重を記録するとここに推移が表示されます 🌱
      </div>
    )
  }

  return (
    <div className="chart-wrap">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="過去30日の体重推移グラフ"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0f7a38" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>

        {/* グリッド & Y軸ラベル */}
        {geo.ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={pad.left}
              x2={W - pad.right}
              y1={t.y}
              y2={t.y}
              stroke="rgba(16,64,40,0.07)"
              strokeWidth="1"
            />
            <text x={pad.left - 8} y={t.y + 3} textAnchor="end" className="chart-tip">
              {t.v.toFixed(1)}
            </text>
          </g>
        ))}

        <path d={geo.area} fill="url(#areaFill)" />
        <path
          d={geo.line}
          fill="none"
          stroke="url(#lineStroke)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {geo.points.map((p, i) => (
          <g key={i}>
            <circle cx={p.cx} cy={p.cy} r="3.5" fill="#fff" stroke="#16a34a" strokeWidth="2" />
            <rect
              x={p.cx - 14}
              y={pad.top}
              width="28"
              height={geo.innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          </g>
        ))}

        {hover != null && (
          <g pointerEvents="none">
            <circle cx={geo.points[hover].cx} cy={geo.points[hover].cy} r="5.5" fill="#16a34a" />
            <text
              x={Math.min(Math.max(geo.points[hover].cx, pad.left + 28), W - pad.right - 28)}
              y={geo.points[hover].cy - 12}
              textAnchor="middle"
              fontWeight="700"
              fontSize="12"
              fill="#0f7a38"
            >
              {geo.points[hover].weight.toFixed(1)} kg
            </text>
          </g>
        )}

        {/* X軸: 最初と最後の日付 */}
        <text x={pad.left} y={H - 8} className="chart-tip" textAnchor="start">
          {fmt(geo.points[0].date)}
        </text>
        {geo.points.length > 1 && (
          <text x={W - pad.right} y={H - 8} className="chart-tip" textAnchor="end">
            {fmt(geo.points[geo.points.length - 1].date)}
          </text>
        )}
      </svg>
    </div>
  )
}

function fmt(iso) {
  const [, m, d] = iso.split('-')
  return `${Number(m)}/${Number(d)}`
}
