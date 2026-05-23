import { NavLink, useNavigate } from 'react-router-dom'

import { Button } from '../ui'
import {
  clearAuthToken,
  isAuthenticated,
} from '../../features/auth/auth-storage'
import { cn } from '../../lib/cn'

const navigationItems = [
  { label: 'Login', to: '/login', requiresAuth: false },
  { label: 'Register', to: '/register', requiresAuth: false },
  { label: 'Habits', to: '/habits', requiresAuth: true },
  { label: 'Dashboard', to: '/dashboard', requiresAuth: true },
]

export function Navbar() {
  const navigate = useNavigate()
  const authenticated = isAuthenticated()

  const visibleItems = navigationItems.filter((item) =>
    authenticated ? item.requiresAuth : !item.requiresAuth,
  )

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/92 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-3 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-soft)]">
            Habit Tracker
          </p>
          <h1 className="text-base font-semibold text-[var(--color-text)]">
            Daily habits
          </h1>
        </div>

        <nav className="col-span-2 row-start-2 flex flex-wrap items-center gap-1.5 sm:col-auto sm:row-auto sm:justify-end">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
                  isActive
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {authenticated ? (
          <Button
            className="col-start-2 row-start-1 whitespace-nowrap sm:col-auto sm:row-auto"
            variant="secondary"
            onClick={() => {
              clearAuthToken()
              navigate('/login')
            }}
          >
            Sign out
          </Button>
        ) : null}
      </div>
    </header>
  )
}
