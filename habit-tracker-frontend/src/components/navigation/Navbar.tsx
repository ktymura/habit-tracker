import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '../ui'
import {
  clearAuthToken,
  isAuthenticated,
} from '../../features/auth/auth-storage'
import { cn } from '../../lib/cn'

const navigationItems = [
  { label: 'Logowanie', to: '/login', requiresAuth: false },
  { label: 'Rejestracja', to: '/register', requiresAuth: false },
  { label: 'Nawyki', to: '/habits', requiresAuth: true },
  { label: 'Dashboard', to: '/dashboard', requiresAuth: true },
]

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const authenticated = isAuthenticated()

  const visibleItems = navigationItems.filter(
    (item) => !item.requiresAuth || authenticated,
  )

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/75 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Habit Tracker
          </p>
          <h1 className="text-lg font-semibold text-[var(--color-text)]">
            Frontend Sprint 1
          </h1>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-[var(--color-text-muted)] md:inline">
            {location.pathname}
          </span>
          {authenticated ? (
            <Button
              variant="secondary"
              onClick={() => {
                clearAuthToken()
                navigate('/login')
              }}
            >
              Wyloguj
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
