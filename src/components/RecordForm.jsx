import { useState } from 'react'

const EMPTY = {
  weight: '',
  breakfast: '',
  lunch: '',
  snack: '',
  dinner: '',
  training: '',
  sleep: '',
  goal: '',
}

const MEALS = [
  { key: 'breakfast', label: '朝', icon: '🌅', placeholder: '例: オートミールとバナナ' },
  { key: 'lunch', label: '昼', icon: '☀️', placeholder: '例: 鶏むね肉のサラダ' },
  { key: 'snack', label: 'おやつ', icon: '🍪', placeholder: '例: ナッツ、ヨーグルト' },
  { key: 'dinner', label: '夜', icon: '🌙', placeholder: '例: 玄米と焼き魚' },
]

export default function RecordForm({ date, value, onChange, onSave }) {
  const [flash, setFlash] = useState(false)
  const rec = { ...EMPTY, ...value }

  function update(field, v) {
    onChange({ ...rec, [field]: v })
  }

  function handleSave() {
    onSave()
    setFlash(true)
    setTimeout(() => setFlash(false), 1800)
  }

  return (
    <section className="card reveal">
      <div className="card__head">
        <span className="ico">📝</span>
        <h2>今日の記録</h2>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="weight">体重</label>
          <div className="with-unit">
            <input
              id="weight"
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="例: 62.5"
              value={rec.weight}
              onChange={(e) => update('weight', e.target.value)}
            />
            <span className="unit">kg</span>
          </div>
        </div>
        <div className="field">
          <label htmlFor="sleep">睡眠</label>
          <div className="with-unit">
            <input
              id="sleep"
              type="number"
              inputMode="decimal"
              step="0.5"
              placeholder="例: 7.5"
              value={rec.sleep}
              onChange={(e) => update('sleep', e.target.value)}
            />
            <span className="unit">時間</span>
          </div>
        </div>
      </div>

      <div className="field">
        <label>食事</label>
        <div className="meal-grid">
          {MEALS.map((m) => (
            <div className="meal-item" key={m.key}>
              <label className="meal-item__label" htmlFor={m.key}>
                <span aria-hidden>{m.icon}</span>
                {m.label}
              </label>
              <textarea
                id={m.key}
                placeholder={m.placeholder}
                value={rec[m.key]}
                onChange={(e) => update(m.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="training">トレーニング（筋トレ・有酸素など）</label>
        <textarea
          id="training"
          placeholder="例: ベンチプレス 50kg×10回×3セット / スクワット 60kg×8回×3セット / ランニング30分"
          value={rec.training}
          onChange={(e) => update('training', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="goal">体重管理の目標（任意）</label>
        <input
          id="goal"
          type="text"
          placeholder="例: 3ヶ月で4kg減量、筋肉量は維持したい"
          value={rec.goal}
          onChange={(e) => update('goal', e.target.value)}
        />
      </div>

      <button className="btn btn--ghost" style={{ width: '100%', marginTop: '0.4rem' }} onClick={handleSave}>
        💾 この日（{date}）の記録を保存
      </button>

      <div className={`saved-flash ${flash ? 'show' : ''}`} aria-live="polite">
        ✓ 保存しました
      </div>
    </section>
  )
}

export { EMPTY }
