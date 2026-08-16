import type { Place, WeatherResponse } from '../types/weather'

interface AskContext {
  place: Place | null
  weather: WeatherResponse | null
}

/**
 * Sends a message to the /api/chat serverless function, which calls Claude
 * server-side with the app's live weather data attached as context. The
 * Anthropic API key never touches the browser — it only lives on Vercel.
 */
export async function askSkyAssistant(message: string, ctx: AskContext): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      message,
      context: {
        place: ctx.place,
        weather: ctx.weather,
      },
    }),
  })

  if (!res.ok) {
    // Try to pull the real error message out of the response body so we can
    // see what's actually going wrong instead of a generic status code.
    const errBody = await res.json().catch(() => null)
    const detail = errBody?.error || `status ${res.status}`
    throw new Error(`Chat request failed: ${detail}`)
  }

  const data = await res.json()
  if (!data.reply) throw new Error('No reply from assistant')
  return data.reply as string
}