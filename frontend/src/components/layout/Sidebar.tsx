import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: '지도', icon: '🗺️' },
  { to: '/timeline', label: '추억', icon: '📓' },
  { to: '/saved', label: '저장', icon: '📍' },
  { to: '/profile', label: '프로필', icon: '👤' },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-20 md:shrink-0 md:flex-col md:items-center md:gap-1 md:border-r md:border-[var(--color-border)] md:bg-[var(--color-surface)] md:py-6">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex w-16 flex-col items-center gap-1 rounded-xl py-3 text-xs ${
              isActive
                ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)]'
            }`
          }
        >
          <span className="text-lg leading-none">{tab.icon}</span>
          {tab.label}
        </NavLink>
      ))}
    </aside>
  )
}
