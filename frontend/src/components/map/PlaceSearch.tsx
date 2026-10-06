import { useState } from 'react'
import type { PlaceSearchResult } from '../../types/place'
import { placeApi } from '../../api/placeApi'

interface PlaceSearchProps {
  onSelect: (result: PlaceSearchResult) => void
}

export function PlaceSearch({ onSelect }: PlaceSearchProps) {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<PlaceSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!keyword.trim()) return
    setIsSearching(true)
    try {
      const data = await placeApi.search(keyword.trim())
      setResults(data)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="absolute inset-x-4 top-4 z-20 md:inset-x-auto md:left-4 md:w-96">
      <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 shadow-sm">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
          placeholder="식당, 카페, 장소를 검색해보세요"
          className="flex-1 bg-transparent text-sm outline-none"
        />
        <button type="button" onClick={handleSearch} disabled={isSearching} className="text-sm text-[var(--color-accent)]">
          검색
        </button>
      </div>

      {results.length > 0 && (
        <ul className="mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          {results.map((result) => (
            <li key={result.externalPlaceId}>
              <button
                type="button"
                onClick={() => {
                  onSelect(result)
                  setResults([])
                  setKeyword(result.name)
                }}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-accent-soft)]"
              >
                <p className="font-medium">{result.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{result.roadAddress}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
