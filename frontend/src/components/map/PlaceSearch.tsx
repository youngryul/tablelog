import { useState } from 'react'
import type { PlaceSearchResult } from '../../types/place'
import { placeApi } from '../../api/placeApi'

interface PlaceSearchProps {
  results: PlaceSearchResult[]
  onResultsChange: (results: PlaceSearchResult[]) => void
  onSelect: (result: PlaceSearchResult) => void
}

export function PlaceSearch({ results, onResultsChange, onSelect }: PlaceSearchProps) {
  const [keyword, setKeyword] = useState('')
  const [isListOpen, setIsListOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!keyword.trim()) return
    setIsSearching(true)
    setErrorMessage(null)
    try {
      const data = await placeApi.search(keyword.trim())
      onResultsChange(data)
      setIsListOpen(true)
      if (data.length === 0) setErrorMessage('검색 결과가 없어요.')
    } catch {
      setErrorMessage('장소 검색에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleClear = () => {
    setKeyword('')
    setErrorMessage(null)
    setIsListOpen(false)
    onResultsChange([])
  }

  return (
    <div className="absolute inset-x-4 top-4 z-20 md:inset-x-auto md:left-4 md:w-96">
      <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 shadow-sm">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
          onFocus={() => results.length > 0 && setIsListOpen(true)}
          placeholder="식당, 카페, 장소를 검색해보세요"
          className="flex-1 bg-transparent text-sm outline-none"
        />
        {(keyword || results.length > 0) && (
          <button type="button" onClick={handleClear} className="text-sm text-[var(--color-text-muted)]" aria-label="검색 지우기">
            ✕
          </button>
        )}
        <button type="button" onClick={handleSearch} disabled={isSearching} className="text-sm text-[var(--color-accent)]">
          {isSearching ? '검색 중' : '검색'}
        </button>
      </div>

      {errorMessage && (
        <p className="mt-2 rounded-xl bg-[var(--color-surface)] px-4 py-2 text-xs text-[var(--color-text-muted)] shadow-sm">
          {errorMessage}
        </p>
      )}

      {isListOpen && results.length > 0 && (
        <ul className="mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          {results.map((result, index) => (
            <li key={result.externalPlaceId}>
              <button
                type="button"
                onClick={() => {
                  onSelect(result)
                  setIsListOpen(false)
                }}
                className="flex w-full items-start gap-3 px-4 py-2 text-left text-sm hover:bg-[var(--color-accent-soft)]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-semibold text-white">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-medium">{result.name}</span>
                  <span className="block text-xs text-[var(--color-text-muted)]">{result.roadAddress}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
