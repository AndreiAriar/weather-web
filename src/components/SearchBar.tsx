import { useEffect, useRef, useState } from 'react'
import { MagnifyingGlass, MapPin, X, NavigationArrow, SpinnerGap } from '@phosphor-icons/react'
import { useDebounce } from '../hooks/useDebounce'
import { searchPlaces } from '../lib/api'
import type { Place } from '../types/weather'

interface SearchBarProps {
  onSelect: (place: Place) => void
  onUseCurrentLocation: () => void
  locating: boolean
}

export function SearchBar({ onSelect, onUseCurrentLocation, locating }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const debouncedQuery = useDebounce(query, 350)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }
    let cancelled = false
    setSearching(true)
    searchPlaces(debouncedQuery)
      .then((places) => {
        if (!cancelled) setResults(places)
      })
      .finally(() => {
        if (!cancelled) setSearching(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(place: Place) {
    onSelect(place)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-2xl border border-white/25 bg-white/15 px-4 py-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
        <MagnifyingGlass size={18} weight="bold" className="shrink-0 text-white/80" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search for a city..."
          className="w-full bg-transparent text-sm font-medium text-white placeholder:text-white/60 outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setResults([])
            }}
            aria-label="Clear search"
            className="shrink-0 text-white/60 transition hover:text-white active:scale-95"
          >
            <X size={16} weight="bold" />
          </button>
        )}
        <button
          type="button"
          onClick={onUseCurrentLocation}
          aria-label="Use current location"
          disabled={locating}
          className="shrink-0 rounded-full p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white active:scale-95 disabled:opacity-60"
        >
          {locating ? (
            <SpinnerGap size={16} weight="bold" className="animate-spin" />
          ) : (
            <NavigationArrow size={16} weight="bold" />
          )}
        </button>
      </div>

      {open && (query.trim().length > 0) && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-white/20 bg-slate-900/80 backdrop-blur-2xl shadow-2xl">
          {searching && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-white/60">
              <SpinnerGap size={14} className="animate-spin" />
              Searching...
            </div>
          )}
          {!searching && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-white/50">No places found.</div>
          )}
          {!searching &&
            results.map((place, i) => (
              <button
                key={`${place.latitude}-${place.longitude}-${i}`}
                type="button"
                onClick={() => handleSelect(place)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/10 active:bg-white/15"
              >
                <MapPin size={16} className="shrink-0 text-white/50" />
                <span className="flex-1 truncate">
                  <span className="font-medium">{place.name}</span>
                  <span className="text-white/50">
                    {place.region ? `, ${place.region}` : ''}, {place.country}
                  </span>
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
