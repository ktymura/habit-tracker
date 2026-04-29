import { Outlet } from 'react-router-dom'

import { Navbar } from '../components/navigation/Navbar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar />
      <Outlet />
    </div>
  )
}
