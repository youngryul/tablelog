interface HeaderProps {
  title: string
  action?: React.ReactNode
}

export function Header({ title, action }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur">
      <h1 className="text-lg font-medium text-[var(--color-text)]">{title}</h1>
      {action}
    </header>
  )
}
