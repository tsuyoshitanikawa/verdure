#!/usr/bin/env python3
"""src/index.css とアプリ本体を 1 ファイルに結合して standalone.html を生成する。
Node 不要・ダブルクリックで開ける完全自己完結版。"""
import pathlib

root = pathlib.Path(__file__).parent
css = (root / "src" / "index.css").read_text(encoding="utf-8")

APP_JS = r"""
const { useState, useEffect, useMemo } = React;

/* ---------- storage ---------- */
const KEY = 'verdure.records.v1';
function loadRecords(){ try{const r=localStorage.getItem(KEY);if(!r)return{};const p=JSON.parse(r);return p&&typeof p==='object'?p:{};}catch{return{};} }
function saveRecords(rec){ try{localStorage.setItem(KEY,JSON.stringify(rec));}catch{} }
function todayISO(){ const d=new Date();const off=d.getTimezoneOffset();return new Date(d.getTime()-off*60000).toISOString().slice(0,10); }
function recentSeries(records,days=30){ const out=[];const base=new Date(todayISO());for(let i=days-1;i>=0;i--){const d=new Date(base);d.setDate(base.getDate()-i);const iso=d.toISOString().slice(0,10);const rec=records[iso];if(rec&&rec.weight!=null&&rec.weight!=='')out.push({date:iso,weight:Number(rec.weight)});}return out; }
const EMPTY = { weight:'', breakfast:'', lunch:'', snack:'', dinner:'', training:'', sleep:'', goal:'' };
const MEALS = [
  { key:'breakfast', label:'朝', icon:'🌅', placeholder:'例: オートミールとバナナ' },
  { key:'lunch', label:'昼', icon:'☀️', placeholder:'例: 鶏むね肉のサラダ' },
  { key:'snack', label:'おやつ', icon:'🍪', placeholder:'例: ナッツ、ヨーグルト' },
  { key:'dinner', label:'夜', icon:'🌙', placeholder:'例: 玄米と焼き魚' },
];
function hasContent(r){ return !!(r&&(r.weight||r.breakfast||r.lunch||r.snack||r.dinner||r.meal||r.training||r.sleep)); }

/* ---------- WeightChart ---------- */
function WeightChart({ series }){
  const [hover, setHover] = useState(null);
  const W=560, H=220, pad={top:18,right:16,bottom:28,left:36};
  const geo = useMemo(()=>{
    if(series.length===0) return null;
    const ws=series.map(d=>d.weight); let min=Math.min(...ws),max=Math.max(...ws);
    if(min===max){min-=1;max+=1;}
    const padY=(max-min)*0.15||1; min-=padY; max+=padY;
    const iW=W-pad.left-pad.right, iH=H-pad.top-pad.bottom, n=series.length;
    const x=i=>pad.left+(n===1?iW/2:(i/(n-1))*iW);
    const y=v=>pad.top+iH-((v-min)/(max-min))*iH;
    const points=series.map((d,i)=>({...d,cx:x(i),cy:y(d.weight)}));
    const line=points.map((p,i)=>`${i===0?'M':'L'} ${p.cx} ${p.cy}`).join(' ');
    const area=`M ${points[0].cx} ${pad.top+iH} `+points.map(p=>`L ${p.cx} ${p.cy}`).join(' ')+` L ${points[points.length-1].cx} ${pad.top+iH} Z`;
    const ticks=[min+(max-min)*0.15,(min+max)/2,max-(max-min)*0.15].map(v=>({v,y:y(v)}));
    return {points,line,area,ticks,innerH:iH};
  },[series]);
  const fmt=iso=>{const[,m,d]=iso.split('-');return `${Number(m)}/${Number(d)}`;};
  if(!geo) return <div className="chart-empty">まだデータがありません。<br/>体重を記録するとここに推移が表示されます 🌱</div>;
  return (
    <div className="chart-wrap">
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="過去30日の体重推移グラフ" onMouseLeave={()=>setHover(null)}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#34d399" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0f7a38"/>
            <stop offset="100%" stopColor="#16a34a"/>
          </linearGradient>
        </defs>
        {geo.ticks.map((t,i)=>(
          <g key={i}>
            <line x1={pad.left} x2={W-pad.right} y1={t.y} y2={t.y} stroke="rgba(16,64,40,0.07)" strokeWidth="1"/>
            <text x={pad.left-8} y={t.y+3} textAnchor="end" className="chart-tip">{t.v.toFixed(1)}</text>
          </g>
        ))}
        <path d={geo.area} fill="url(#areaFill)"/>
        <path d={geo.line} fill="none" stroke="url(#lineStroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {geo.points.map((p,i)=>(
          <g key={i}>
            <circle cx={p.cx} cy={p.cy} r="3.5" fill="#fff" stroke="#16a34a" strokeWidth="2"/>
            <rect x={p.cx-14} y={pad.top} width="28" height={geo.innerH} fill="transparent" onMouseEnter={()=>setHover(i)}/>
          </g>
        ))}
        {hover!=null && (
          <g pointerEvents="none">
            <circle cx={geo.points[hover].cx} cy={geo.points[hover].cy} r="5.5" fill="#16a34a"/>
            <text x={Math.min(Math.max(geo.points[hover].cx,pad.left+28),W-pad.right-28)} y={geo.points[hover].cy-12} textAnchor="middle" fontWeight="700" fontSize="12" fill="#0f7a38">{geo.points[hover].weight.toFixed(1)} kg</text>
          </g>
        )}
        <text x={pad.left} y={H-8} className="chart-tip" textAnchor="start">{fmt(geo.points[0].date)}</text>
        {geo.points.length>1 && <text x={W-pad.right} y={H-8} className="chart-tip" textAnchor="end">{fmt(geo.points[geo.points.length-1].date)}</text>}
      </svg>
    </div>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({ records }){
  const series=recentSeries(records,30);
  const current=series.length?series[series.length-1].weight:null;
  const first=series.length?series[0].weight:null;
  const avg=series.length?series.reduce((s,d)=>s+d.weight,0)/series.length:null;
  const delta=current!=null&&first!=null?current-first:null;
  const dc=delta==null||Math.abs(delta)<0.05?'flat':delta<0?'down':'up';
  const arrow=dc==='down'?'▼':dc==='up'?'▲':'–';
  return (
    <section className="card reveal">
      <div className="card__head"><span className="ico">📊</span><h2>ダッシュボード</h2></div>
      <div className="stats">
        <div className="stat"><div className="stat__label">現在の体重</div><div className="stat__value">{current!=null?current.toFixed(1):'—'}{current!=null&&<small> kg</small>}</div></div>
        <div className="stat"><div className="stat__label">期間の変化</div><div className="stat__value">{delta!=null?`${delta>0?'+':''}${delta.toFixed(1)}`:'—'}{delta!=null&&<small> kg</small>}</div>{delta!=null&&<div className={`stat__delta ${dc}`}><span>{arrow}</span>{dc==='down'?'減少傾向':dc==='up'?'増加傾向':'横ばい'}</div>}</div>
        <div className="stat"><div className="stat__label">平均体重</div><div className="stat__value">{avg!=null?avg.toFixed(1):'—'}{avg!=null&&<small> kg</small>}</div></div>
      </div>
      <WeightChart series={series}/>
    </section>
  );
}

/* ---------- RecordForm ---------- */
function RecordForm({ date, value, onChange, onSave }){
  const [flash,setFlash]=useState(false);
  const rec={...EMPTY,...value};
  const update=(f,v)=>onChange({...rec,[f]:v});
  const handleSave=()=>{onSave();setFlash(true);setTimeout(()=>setFlash(false),1800);};
  return (
    <section className="card reveal">
      <div className="card__head"><span className="ico">📝</span><h2>今日の記録</h2></div>
      <div className="field-row">
        <div className="field"><label htmlFor="weight">体重</label><div className="with-unit"><input id="weight" type="number" inputMode="decimal" step="0.1" placeholder="例: 62.5" value={rec.weight} onChange={e=>update('weight',e.target.value)}/><span className="unit">kg</span></div></div>
        <div className="field"><label htmlFor="sleep">睡眠</label><div className="with-unit"><input id="sleep" type="number" inputMode="decimal" step="0.5" placeholder="例: 7.5" value={rec.sleep} onChange={e=>update('sleep',e.target.value)}/><span className="unit">時間</span></div></div>
      </div>
      <div className="field"><label>食事</label>
        <div className="meal-grid">
          {MEALS.map(m=>(
            <div className="meal-item" key={m.key}>
              <label className="meal-item__label" htmlFor={m.key}><span aria-hidden>{m.icon}</span>{m.label}</label>
              <textarea id={m.key} placeholder={m.placeholder} value={rec[m.key]} onChange={e=>update(m.key,e.target.value)}/>
            </div>
          ))}
        </div>
      </div>
      <div className="field"><label htmlFor="training">トレーニング（筋トレ・有酸素など）</label><textarea id="training" placeholder="例: ベンチプレス 50kg×10回×3セット / スクワット 60kg×8回×3セット / ランニング30分" value={rec.training} onChange={e=>update('training',e.target.value)}/></div>
      <div className="field"><label htmlFor="goal">体重管理の目標（任意）</label><input id="goal" type="text" placeholder="例: 3ヶ月で4kg減量、筋肉量は維持したい" value={rec.goal} onChange={e=>update('goal',e.target.value)}/></div>
      <button className="btn btn--ghost" style={{width:'100%',marginTop:'0.4rem'}} onClick={handleSave}>💾 この日（{date}）の記録を保存</button>
      <div className={`saved-flash ${flash?'show':''}`} aria-live="polite">✓ 保存しました</div>
    </section>
  );
}

/* ---------- App ---------- */
function App(){
  const [records,setRecords]=useState(()=>loadRecords());
  const [date,setDate]=useState(()=>todayISO());
  useEffect(()=>{ saveRecords(records); },[records]);
  useEffect(()=>{
    const targets=document.querySelectorAll('.reveal');
    const revealAll=()=>targets.forEach(el=>el.classList.add('in'));
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce||!('IntersectionObserver' in window)){ revealAll(); return; }
    const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.12});
    targets.forEach(el=>io.observe(el));
    const fb=setTimeout(revealAll,1500);
    return ()=>{ io.disconnect(); clearTimeout(fb); };
  },[]);
  const current=records[date]||EMPTY;
  const handleChange=next=>setRecords(p=>({...p,[date]:next}));
  const handleSave=()=>setRecords(p=>{const rec=p[date]||EMPTY;if(!hasContent(rec)){const c={...p};delete c[date];return c;}return {...p,[date]:rec};});
  const deleteRecord=d=>setRecords(p=>{const c={...p};delete c[d];return c;});
  const [syncMsg,setSyncMsg]=useState('');
  function exportData(){
    const blob=new Blob([JSON.stringify(records,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=`verdure-backup-${todayISO()}.json`; a.click();
    URL.revokeObjectURL(url);
    setSyncMsg(`✓ ${Object.keys(records).length}日分のデータを書き出しました`);
  }
  function importData(e){
    const file=e.target.files&&e.target.files[0]; e.target.value='';
    if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const data=JSON.parse(reader.result);
        if(!data||typeof data!=='object'||Array.isArray(data)){ setSyncMsg('⚠️ ファイル形式が正しくありません'); return; }
        const hasExisting=Object.keys(records).length>0;
        if(hasExisting&&!window.confirm('読み込むと、同じ日付の記録は読み込んだファイルの内容で上書きされます。続けますか？')) return;
        setRecords(p=>({...p,...data}));
        setSyncMsg(`✓ ${Object.keys(data).length}日分のデータを読み込みました`);
      }catch{ setSyncMsg('⚠️ 読み込みに失敗しました（JSONファイルを選んでください）'); }
    };
    reader.readAsText(file);
  }
  const history=useMemo(()=>Object.entries(records).filter(([,r])=>hasContent(r)).sort((a,b)=>a[0]<b[0]?1:-1),[records]);
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><div className="brand__mark">🌿</div><div><div className="brand__name">Verdure</div><div className="brand__tag">体重・食事・運動・睡眠の記録</div></div></div>
        <label className="date-pill"><span aria-hidden>📅</span><input type="date" value={date} max={todayISO()} onChange={e=>setDate(e.target.value||todayISO())}/></label>
      </header>
      <main className="layout">
        <div>
          <RecordForm date={date} value={current} onChange={handleChange} onSave={handleSave}/>
        </div>
        <div>
          <Dashboard records={records}/>
          <section className="card reveal">
            <div className="card__head"><span className="ico">🗂️</span><h2>記録の履歴</h2></div>
            {history.length===0?(<div className="chart-empty" style={{padding:'1.5rem'}}>記録はまだありません。</div>):(
              <div className="history">
                {history.map(([d,r])=>(
                  <div className="history__item" key={d}>
                    <button onClick={()=>setDate(d)} style={{textAlign:'left',flex:1,background:'none'}} title="この日を編集">
                      <div className="history__date">{d}</div>
                      <div className="history__meta">{[r.training&&'🏋️ 運動あり',r.sleep&&`😴 ${r.sleep}h`,(r.breakfast||r.lunch||r.snack||r.dinner||r.meal)&&'🍽️ 食事あり'].filter(Boolean).join(' ・ ')||'記録'}</div>
                    </button>
                    <span className="history__weight">{r.weight?`${r.weight}kg`:'—'}</span>
                    <button className="history__del" onClick={()=>deleteRecord(d)} aria-label={`${d} の記録を削除`} title="削除">🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="card reveal">
            <div className="card__head"><span className="ico">🔄</span><h2>データの管理（端末間コピー・バックアップ）</h2></div>
            <p className="advice__cta-note">別の端末に移すには、この端末で「書き出す」→ ファイルをAirDropやメールで送り、移行先で「読み込む」を押してください。バックアップにも使えます。</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:'0.6rem'}}>
              <button className="btn btn--ghost" style={{flex:'1 1 150px'}} onClick={exportData}>⬇️ データを書き出す</button>
              <label className="btn btn--ghost" style={{flex:'1 1 150px'}}>⬆️ データを読み込む<input type="file" accept="application/json,.json" onChange={importData} style={{display:'none'}}/></label>
            </div>
            {syncMsg && <div className="advice__cta-note" style={{marginTop:'0.8rem',marginBottom:0}}>{syncMsg}</div>}
          </section>
        </div>
      </main>
      <footer className="foot">Verdure — データはお使いのブラウザ（LocalStorage）にのみ保存されます。</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
"""

html = """<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8C%BF%3C/text%3E%3C/svg%3E" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verdure — 体重管理（standalone）</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
""" + css + """
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel" data-presets="react">
""" + APP_JS + """
    </script>
  </body>
</html>
"""

(root / "standalone.html").write_text(html, encoding="utf-8")
print("standalone.html generated:", len(html), "bytes")
"""end"""
