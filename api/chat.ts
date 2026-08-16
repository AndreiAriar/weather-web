import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM_PROMPT = `You are Sky, a friendly and concise weather assistant embedded in a weather app called Skylight.

You will usually be given a JSON "context" block containing the currently loaded city and its live weather data (current conditions, next 24 hours, and 7-day forecast). Use that data as ground truth for anything about the loaded city — don't contradict it or make up different numbers.

If the user asks about a different city than the one loaded, you don't have live data for it. Answer using your general knowledge if it's not time-sensitive (e.g. climate, seasons, geography), but for anything requiring current conditions in a different city, tell the user to search for that city in the app first so you can see live data for it.

Keep answers short — 1-4 sentences, plain text, no markdown headers or bullet lists unless truly needed. This renders in a small chat bubble.`

interface ChatRequestBody {
  message?: string
  context?: unknown
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY' })
    return
  }

  const { message, context } = (req.body ?? {}) as ChatRequestBody
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Missing message' })
    return
  }

  const contextBlock = context
    ? `\n\nCurrent app context (JSON — "weather" may be null if no city is loaded yet):\n${JSON.stringify(context)}`
    : ''

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT + contextBlock,
        messages: [{ role: 'user', content: message }],
      }),
    })

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text()
      res.status(502).json({ error: `Anthropic API error: ${errText}` })
      return
    }

    const data = await anthropicRes.json()
    const reply =
      data.content
        ?.filter((block: { type: string }) => block.type === 'text')
        .map((block: { text: string }) => block.text)
        .join('\n')
        .trim() || "Sorry, I couldn't come up with an answer."

    res.status(200).json({ reply })
  } catch {
    res.status(500).json({ error: 'Failed to reach Anthropic API' })
  }
}