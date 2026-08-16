import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { formatHour } from '../lib/format'
import { WeatherIcon } from './WeatherIcon'
import type { HourlyPoint } from '../types/weather'

export function HourlyStrip({ hours, timezone }: { hours: HourlyPoint[]; timezone: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const rafRef = useRef<number | null>(null)

  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const [thumb, setThumb] = useState({ widthPct: 100, leftPct: 0 })

  const recalcThumb = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)

    const trackWidth = el.scrollWidth
    const visibleWidth = el.clientWidth
    const widthPct = Math.min((visibleWidth / trackWidth) * 100, 100)
    const maxScroll = trackWidth - visibleWidth
    const leftPct = maxScroll > 0 ? (el.scrollLeft / maxScroll) * (100 - widthPct) : 0
    setThumb({ widthPct, leftPct })
  }, [])

  function handleScroll() {
    if (draggingRef.current) return
    recalcThumb()
  }

  function scrollByAmount(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.75, behavior: 'smooth' })
  }

  // Moves the strip's scrollLeft to match a pointer x-position on the track.
  const seekToClientX = useCallback((clientX: number) => {
    const track = trackRef.current
    const el = scrollerRef.current
    if (!track || !el) return

    const rect = track.getBoundingClientRect()
    const maxScroll = el.scrollWidth - el.clientWidth
    if (maxScroll <= 0) return

    const thumbWidthPx = (thumb.widthPct / 100) * rect.width
    const usableTrack = Math.max(rect.width - thumbWidthPx, 1)
    const pointerOffset = clientX - rect.left - thumbWidthPx / 2
    const clampedOffset = Math.min(Math.max(pointerOffset, 0), usableTrack)
    const ratio = clampedOffset / usableTrack

    el.scrollLeft = ratio * maxScroll
    recalcThumb()
  }, [thumb.widthPct, recalcThumb])

  // Pointer moves fire far more often than the browser can usefully repaint,
  // so the actual seek is batched into a single rAF per frame for a smooth drag.
  const queueSeek = useCallback((clientX: number) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      seekToClientX(clientX)
      rafRef.current = null
    })
  }, [seekToClientX])

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      if (!draggingRef.current) return
      queueSeek(e.clientX)
    }
    function handlePointerUp() {
      draggingRef.current = false
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [queueSeek])

  function handleThumbPointerDown(e: React.PointerEvent) {
    e.preventDefault()
    draggingRef.current = true
  }

  function handleTrackPointerDown(e: React.PointerEvent) {
    // Clicking anywhere on the track (not the thumb itself) jumps to that position.
    e.preventDefault()
    draggingRef.current = true
    seekToClientX(e.clientX)
  }

  const showSlider = thumb.widthPct < 100

  return (
    <div className="relative rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-white/60">
        Next 24 hours
      </h2>

      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex gap-5 overflow-x-auto pb-1 [scroll-snap-type:x_proximity] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {hours.map((hour, i) => (
            <div
              key={hour.time}
              className="flex shrink-0 flex-col items-center gap-2 [scroll-snap-align:start]"
            >
              <span className="text-xs font-medium text-white/60">
                {i === 0 ? 'Now' : formatHour(hour.time, timezone)}
              </span>
              <WeatherIcon code={hour.weatherCode} isDay={hour.isDay} size={22} />
              <span className="text-sm font-semibold tabular-nums text-white">
                {Math.round(hour.temperature)}°
              </span>
            </div>
          ))}
        </div>

        {/* Edge fades hint that the strip scrolls; they fade out once you reach either end */}
        <motion.div
          aria-hidden
          animate={{ opacity: atStart ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-900/40 to-transparent"
        />
        <motion.div
          aria-hidden
          animate={{ opacity: atEnd ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900/40 to-transparent"
        />
      </div>

      {/* Bottom row: left arrow, draggable slider, right arrow — arrows bookend the track */}
      <div className="mt-3 flex select-none items-center gap-2">
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          disabled={atStart}
          aria-label="Scroll earlier hours"
          className="shrink-0 rounded-full border border-white/15 bg-white/10 p-1 text-white/70 transition hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:hover:bg-white/10"
        >
          <CaretLeft size={13} weight="bold" />
        </button>

        <div
          ref={trackRef}
          onPointerDown={handleTrackPointerDown}
          className="relative h-1.5 flex-1 cursor-pointer touch-none rounded-full bg-white/10"
        >
          {showSlider && (
            <div
              onPointerDown={handleThumbPointerDown}
              className="absolute inset-y-0 -my-1 cursor-grab rounded-full bg-white/70 transition-colors hover:bg-white active:cursor-grabbing active:bg-white"
              style={{
                width: `${thumb.widthPct}%`,
                left: `${thumb.leftPct}%`,
                height: '0.625rem',
              }}
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          disabled={atEnd}
          aria-label="Scroll later hours"
          className="shrink-0 rounded-full border border-white/15 bg-white/10 p-1 text-white/70 transition hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:hover:bg-white/10"
        >
          <CaretRight size={13} weight="bold" />
        </button>
      </div>
    </div>
  )
}