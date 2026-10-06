import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: '지도', icon: '🗺️' },
  { to: '/timeline', label: '추억', icon: '📓' },
  { to: '/saved', label: '저장', icon: '📍' },
  { to: '/profile', label: '프로필', icon: '👤' },
]

export function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)] md:hidden">
      <ul className="mx-auto flex max-w-md justify-around">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-xs ${
                  isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
                }`
              }
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
