// Vercel Serverless Function — Claude API を呼び出してトレーニング（筋トレ等）アドバイスを生成する。
// APIキー(ANTHROPIC_API_KEY)はサーバ側の環境変数のみで扱い、フロントへは決して公開しない。

const MODEL = 'claude-sonnet-4-6'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'POST メソッドのみ対応しています。' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: 'サーバーに ANTHROPIC_API_KEY が設定されていません。' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }
  const { training, weight, goal } = body || {}

  if (!training || !String(training).trim()) {
    return res.status(400).json({ error: 'トレーニング内容（training）が空です。' })
  }

  const userContext = [
    `【実施したトレーニング】\n${training}`,
    weight ? `【現在の体重】${weight} kg` : null,
    goal ? `【体重管理の目標】${goal}` : null,
  ]
    .filter(Boolean)
    .join('\n\n')

  const system =
    'あなたは経験豊富なパーソナルトレーナー兼ストレングスコーチです。' +
    'ユーザーが実施したトレーニング内容に対し、専門的かつ前向きで実践しやすいアドバイスを日本語で行います。' +
    'ケガにつながる無理な指導は避け、一般的なトレーニング指導の範囲で答えてください。' +
    '必ず指定されたJSON形式のみで出力し、前後に説明文やマークダウンの囲みを付けないでください。'

  const prompt = `${userContext}

上記のトレーニングについて、次のキーを持つJSONオブジェクトだけを出力してください。

{
  "intensityScore": "「軽め」「適切」「ややハード」「オーバーワーク気味」のいずれか一語",
  "intensityComment": "強度・ボリュームについての簡潔な評価コメント（80字程度）",
  "targetedAreas": ["今回のトレーニングで主に鍛えられた部位を2〜4個の配列で"],
  "improvements": ["フォーム・強度・頻度・休養などの改善点を2〜4個の短い文の配列で"],
  "nextMenu": ["次に取り入れるとよい種目やメニューを3〜5個の配列で"],
  "goalAdvice": "体重・体組成の目標に向けたトレーニング面の具体的で前向きなアドバイス（120字程度）"
}`

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!r.ok) {
      const errText = await r.text()
      console.error('Anthropic API error:', r.status, errText)
      return res
        .status(502)
        .json({ error: `AIサービスでエラーが発生しました (${r.status})。` })
    }

    const data = await r.json()
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim()

    const advice = parseAdvice(text)
    if (!advice) {
      return res
        .status(502)
        .json({ error: 'AIの応答を解釈できませんでした。もう一度お試しください。' })
    }

    return res.status(200).json(advice)
  } catch (e) {
    console.error('training-advice failed:', e)
    return res.status(500).json({ error: 'アドバイスの生成中にエラーが発生しました。' })
  }
}

// モデル出力からJSONを抽出してパース（余計な囲みが付いた場合にも対応）。
function parseAdvice(text) {
  if (!text) return null
  let s = text.trim()
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) s = fence[1].trim()
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(s.slice(start, end + 1))
  } catch {
    return null
  }
}
