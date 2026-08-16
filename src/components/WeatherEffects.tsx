import { useMemo } from 'react'
import {
  Sun,
  Moon,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Drop,
  Snowflake,
} from '@phosphor-icons/react'
import type { EffectType } from '../lib/weatherCodes'

interface WeatherEffectsProps {
  effect: EffectType | null
  isDay: boolean
}

/**
 * Ambient animation layer that sits behind the glass UI, on top of the
 * gradient in WeatherBackground. Purely decorative — never intercepts
 * pointer events. Always animates: this is the weather's visual theming,
 * not general UI motion, so it intentionally ignores prefers-reduced-motion.
 */
export function WeatherEffects({ effect, isDay }: WeatherEffectsProps) {
  if (!effect) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <EffectStyles />
      {effect === 'rays' && <RaysLayer />}
      {effect === 'stars' && <StarsLayer />}
      {effect === 'clouds' && <CloudsLayer />}
      {effect === 'fog' && <FogLayer />}
      {effect === 'rain' && <RainLayer />}
      {effect === 'snow' && <SnowLayer />}
      {effect === 'storm' && (
        <>
          <RainLayer heavy />
          <LightningFlash />
        </>
      )}
      {!isDay && (effect === 'rain' || effect === 'storm' || effect === 'snow') && (
        <div className="absolute inset-0 bg-black/10" />
      )}
    </div>
  )
}

/** Clear sky, daytime — a big glowing sun with slowly spinning rays. */
function RaysLayer() {
  return (
    <div className="absolute inset-0">
      <div className="weather-fx-ray-glow absolute left-1/2 top-[-10%] h-[55vh] w-[55vh] -translate-x-1/2 rounded-full bg-amber-200/30 blur-3xl" />
      <div
        className="weather-fx-ray-spin absolute left-1/2 top-[-10%] h-[90vh] w-[90vh] -translate-x-1/2 opacity-40"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.35) 4deg, transparent 10deg, transparent 50deg, rgba(255,255,255,0.25) 54deg, transparent 60deg, transparent 100deg, rgba(255,255,255,0.3) 104deg, transparent 110deg, transparent 150deg, rgba(255,255,255,0.2) 154deg, transparent 160deg, transparent 210deg, rgba(255,255,255,0.3) 214deg, transparent 220deg, transparent 270deg, rgba(255,255,255,0.25) 274deg, transparent 280deg, transparent 320deg, rgba(255,255,255,0.3) 324deg, transparent 330deg, transparent 360deg)',
          maskImage: 'radial-gradient(circle, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 70%)',
        }}
      />
      <Sun
        weight="fill"
        size={140}
        className="weather-fx-sun-breathe absolute left-1/2 top-[2%] -translate-x-1/2 text-amber-200/85"
        style={{ filter: 'drop-shadow(0 0 40px rgba(252,211,77,0.45))' }}
      />
    </div>
  )
}

/** Clear sky, night — a glowing moon with a twinkling starfield. */
function StarsLayer() {
  const stars = useMemo(
    () =>
      Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        top: Math.random() * 60,
        left: Math.random() * 100,
        size: Math.random() * 1.6 + 0.6,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 4,
      })),
    []
  )
  return (
    <div className="absolute inset-0">
      <div className="weather-fx-moon-glow absolute left-[68%] top-[3%] h-40 w-40 -translate-x-1/2 rounded-full bg-indigo-100/25 blur-3xl" />
      <Moon
        weight="fill"
        size={110}
        className="weather-fx-moon-breathe absolute left-[68%] top-[4%] -translate-x-1/2 text-indigo-100/80"
        style={{ filter: 'drop-shadow(0 0 30px rgba(199,210,254,0.4))' }}
      />
      {stars.map((s) => (
        <span
          key={s.id}
          className="weather-fx-twinkle absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/** Partly cloudy / overcast — real cloud-shaped icons drifting across. */
function CloudsLayer() {
  const clouds = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        top: 2 + Math.random() * 30,
        size: 80 + Math.random() * 100,
        duration: 55 + Math.random() * 40,
        delay: -Math.random() * 60,
        opacity: 0.35 + Math.random() * 0.35,
      })),
    []
  )
  return (
    <div className="absolute inset-0">
      {clouds.map((c) => (
        <Cloud
          key={c.id}
          weight="fill"
          size={c.size}
          className="weather-fx-cloud-drift absolute left-0 text-white"
          style={{
            top: `${c.top}%`,
            opacity: c.opacity,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/** Fog — a large soft cloud icon plus drifting horizontal haze bands. */
function FogLayer() {
  const bands = useMemo(
    () =>
      Array.from({ length: 3 }).map((_, i) => ({
        id: i,
        top: 20 + i * 25 + Math.random() * 10,
        duration: 20 + Math.random() * 10,
        delay: -Math.random() * 20,
      })),
    []
  )
  return (
    <div className="absolute inset-0">
      <CloudFog
        weight="fill"
        size={150}
        className="absolute left-1/2 top-[6%] -translate-x-1/2 text-white/30"
      />
      {bands.map((b) => (
        <span
          key={b.id}
          className="weather-fx-fog-drift absolute left-[-20%] h-24 w-[140%] rounded-full bg-white/25 blur-3xl"
          style={{
            top: `${b.top}%`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/** Rain / drizzle / storm base — a rain cloud icon plus falling raindrop icons. */
function RainLayer({ heavy = false }: { heavy?: boolean }) {
  const count = heavy ? 55 : 32
  const drops = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 0.5 + Math.random() * 0.45,
        delay: -Math.random() * 1,
        size: 10 + Math.random() * 7,
        opacity: 0.35 + Math.random() * 0.4,
      })),
    [count]
  )
  return (
    <div className="absolute inset-0">
      <CloudRain
        weight="fill"
        size={130}
        className="weather-fx-cloud-bob absolute left-1/2 top-[3%] -translate-x-1/2 text-slate-100/55"
      />
      {drops.map((d) => (
        <Drop
          key={d.id}
          weight="fill"
          size={d.size}
          className="weather-fx-rain-fall absolute top-[-10%] text-sky-100"
          style={{
            left: `${d.left}%`,
            opacity: d.opacity,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/** Snow — a snow cloud icon plus tumbling snowflake icons. */
function SnowLayer() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 12 + Math.random() * 10,
        duration: 7 + Math.random() * 7,
        delay: -Math.random() * 12,
        opacity: 0.5 + Math.random() * 0.4,
      })),
    []
  )
  return (
    <div className="absolute inset-0">
      <CloudSnow
        weight="fill"
        size={130}
        className="weather-fx-cloud-bob absolute left-1/2 top-[3%] -translate-x-1/2 text-sky-50/55"
      />
      {flakes.map((f) => (
        <Snowflake
          key={f.id}
          weight="bold"
          size={f.size}
          className="weather-fx-snow-fall absolute top-[-6%] text-white"
          style={{
            left: `${f.left}%`,
            opacity: f.opacity,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/** Storm — a lightning cloud icon that flickers in sync with the flash overlay. */
function LightningFlash() {
  return (
    <>
      <CloudLightning
        weight="fill"
        size={130}
        className="weather-fx-lightning-icon absolute left-1/2 top-[3%] -translate-x-1/2 text-amber-100/70"
      />
      <div className="weather-fx-flash-a absolute inset-0 bg-white" />
      <div className="weather-fx-flash-b absolute inset-0 bg-white" />
    </>
  )
}

/** Keyframes for every effect layer, injected once alongside whichever layer is active. */
function EffectStyles() {
  return (
    <style>{`
      @keyframes weather-fx-twinkle {
        0%, 100% { opacity: 0.15; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.15); }
      }
      .weather-fx-twinkle {
        animation-name: weather-fx-twinkle;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
      }

      @keyframes weather-fx-ray-glow-pulse {
        0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
        50% { opacity: 0.9; transform: translateX(-50%) scale(1.08); }
      }
      .weather-fx-ray-glow {
        animation: weather-fx-ray-glow-pulse 6s ease-in-out infinite;
      }

      @keyframes weather-fx-ray-spin-anim {
        from { transform: translateX(-50%) rotate(0deg); }
        to { transform: translateX(-50%) rotate(360deg); }
      }
      .weather-fx-ray-spin {
        animation: weather-fx-ray-spin-anim 90s linear infinite;
      }

      @keyframes weather-fx-sun-breathe-anim {
        0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.85; }
        50% { transform: translateX(-50%) scale(1.06); opacity: 1; }
      }
      .weather-fx-sun-breathe {
        animation: weather-fx-sun-breathe-anim 5s ease-in-out infinite;
      }

      @keyframes weather-fx-moon-glow-anim {
        0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
        50% { opacity: 0.85; transform: translateX(-50%) scale(1.1); }
      }
      .weather-fx-moon-glow {
        animation: weather-fx-moon-glow-anim 7s ease-in-out infinite;
      }

      @keyframes weather-fx-moon-breathe-anim {
        0%, 100% { transform: translateX(-50%) scale(1); }
        50% { transform: translateX(-50%) scale(1.04); }
      }
      .weather-fx-moon-breathe {
        animation: weather-fx-moon-breathe-anim 7s ease-in-out infinite;
      }

      @keyframes weather-fx-cloud-drift-anim {
        from { transform: translateX(-30vw); }
        to { transform: translateX(130vw); }
      }
      .weather-fx-cloud-drift {
        animation-name: weather-fx-cloud-drift-anim;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }

      @keyframes weather-fx-fog-drift-anim {
        0% { transform: translateX(0); }
        50% { transform: translateX(6%); }
        100% { transform: translateX(0); }
      }
      .weather-fx-fog-drift {
        animation-name: weather-fx-fog-drift-anim;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      @keyframes weather-fx-cloud-bob-anim {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        50% { transform: translateX(-50%) translateY(-8px); }
      }
      .weather-fx-cloud-bob {
        animation: weather-fx-cloud-bob-anim 4.5s ease-in-out infinite;
      }

      @keyframes weather-fx-rain-fall-anim {
        from { transform: translateY(-10vh) rotate(10deg); }
        to { transform: translateY(110vh) rotate(10deg); }
      }
      .weather-fx-rain-fall {
        animation-name: weather-fx-rain-fall-anim;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }

      @keyframes weather-fx-snow-fall-anim {
        0% { transform: translate(0, -6vh) rotate(0deg); }
        25% { transform: translate(10px, 25vh) rotate(90deg); }
        50% { transform: translate(-10px, 50vh) rotate(180deg); }
        75% { transform: translate(10px, 75vh) rotate(270deg); }
        100% { transform: translate(0, 108vh) rotate(360deg); }
      }
      .weather-fx-snow-fall {
        animation-name: weather-fx-snow-fall-anim;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }

      @keyframes weather-fx-flash-anim {
        0%, 96%, 100% { opacity: 0; }
        97% { opacity: 0.5; }
        97.5% { opacity: 0.05; }
        98% { opacity: 0.35; }
        99% { opacity: 0; }
      }
      .weather-fx-flash-a {
        animation: weather-fx-flash-anim 7s ease-in-out infinite;
      }
      .weather-fx-flash-b {
        animation: weather-fx-flash-anim 11s ease-in-out infinite;
        animation-delay: 3.2s;
      }

      @keyframes weather-fx-lightning-icon-anim {
        0%, 96%, 100% { filter: drop-shadow(0 0 0 rgba(252,211,77,0)); opacity: 0.7; }
        97% { filter: drop-shadow(0 0 25px rgba(252,211,77,0.9)); opacity: 1; }
        98% { filter: drop-shadow(0 0 6px rgba(252,211,77,0.4)); opacity: 0.8; }
        99% { filter: drop-shadow(0 0 20px rgba(252,211,77,0.8)); opacity: 1; }
      }
      .weather-fx-lightning-icon {
        animation: weather-fx-lightning-icon-anim 7s ease-in-out infinite;
      }
    `}</style>
  )
}