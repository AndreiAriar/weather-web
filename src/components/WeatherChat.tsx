import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { PaperPlaneRight, X } from '@phosphor-icons/react'
import { askSkyAssistant } from '../lib/aiChat'
import type { Place, WeatherResponse } from '../types/weather'

// Served directly from the public/ folder — no bundler import needed.
const cloudLogo = '/cloudfacelogo.png'

interface ChatMessage {
  id: string
  role: 'bot' | 'user'
  text: string
}

interface WeatherChatProps {
  place: Place | null
  weather: WeatherResponse | null
}

export function WeatherChat({ place, weather }: WeatherChatProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'intro', role: 'bot', text: "Hi, I'm Sky — ask me anything about the weather!" },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open, isSending])

  async function send() {
    const text = input.trim()
    if (!text || isSending) return

    const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsSending(true)

    try {
      const reply = await askSkyAssistant(text, { place, weather })
      setMessages((prev) => [...prev, { id: `${Date.now()}-b`, role: 'bot', text: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-b`,
          role: 'bot',
          text: "Sorry, I couldn't reach the assistant just now. Try again in a moment.",
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      void send()
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex h-[28rem] w-80 flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900/70 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <img src={cloudLogo} alt="Sky Assistant" className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Sky Assistant</p>
                <p className="text-[11px] text-white/50">Ask me about the weather</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                      m.role === 'user'
                        ? 'bg-sky-500/80 text-white'
                        : 'border border-white/10 bg-white/10 text-white/90'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
                    <span className="weather-chat-dot h-1.5 w-1.5 rounded-full bg-white/60" />
                    <span className="weather-chat-dot h-1.5 w-1.5 rounded-full bg-white/60" style={{ animationDelay: '0.15s' }} />
                    <span className="weather-chat-dot h-1.5 w-1.5 rounded-full bg-white/60" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-white/10 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the weather..."
                disabled={isSending}
                className="w-full rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={isSending}
                aria-label="Send message"
                className="shrink-0 rounded-full bg-sky-500 p-2 text-white transition hover:bg-sky-400 active:scale-95 disabled:opacity-60"
              >
                <PaperPlaneRight size={16} weight="bold" />
              </button>
            </div>

            <style>{`
              @keyframes weather-chat-dot-bounce {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
                30% { transform: translateY(-4px); opacity: 1; }
              }
              .weather-chat-dot {
                animation: weather-chat-dot-bounce 1s ease-in-out infinite;
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.92 }}
        aria-label={open ? 'Close weather assistant' : 'Open weather assistant'}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/95 shadow-xl backdrop-blur-xl"
      >
        <img src={cloudLogo} alt="" className="h-10 w-10" />
      </motion.button>
    </div>
  )
}