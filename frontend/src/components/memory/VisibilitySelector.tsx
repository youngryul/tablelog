import type { MemoryVisibility } from '../../types/memory'

interface VisibilitySelectorProps {
  value: MemoryVisibility
  onChange: (value: MemoryVisibility) => void
}

const OPTIONS: { value: MemoryVisibility; label: string; description: string }[] = [
  { value: 'PRIVATE', label: '나만 보기', description: '나만 볼 수 있어요' },
  { value: 'PUBLIC', label: '전체 공개', description: '다른 사람들도 볼 수 있어요' },
]

export function VisibilitySelector({ value, onChange }: VisibilitySelectorProps) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-xl border px-3 py-2 text-left text-sm transition ${
            value === option.value
              ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
              : 'border-[var(--color-border)]'
          }`}
        >
          <p className="font-medium">{option.label}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{option.description}</p>
        </button>
      ))}
    </div>
  )
}
