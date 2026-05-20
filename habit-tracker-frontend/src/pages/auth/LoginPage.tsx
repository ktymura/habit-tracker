import { type FormEvent, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button, Card, Input } from '../../components/ui'
import { setAuthToken } from '../../features/auth/auth-storage'
import { login } from '../../services/auth/auth-service'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from ?? '/habits'
  }, [location.state])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextFieldErrors: typeof fieldErrors = {}

    if (!emailPattern.test(email)) {
      nextFieldErrors.email = 'Enter a valid email address.'
    }

    if (password.length < 8) {
      nextFieldErrors.password = 'Password must be at least 8 characters.'
    }

    setFieldErrors(nextFieldErrors)

    if (Object.keys(nextFieldErrors).length > 0) {
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      const response = await login({ email, password })
      setAuthToken(response.token)
      navigate(redirectPath)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to sign in.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-6xl items-center px-4 py-10 sm:px-6">
      <section className="mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-[0.8fr_420px] lg:items-center">
        <div className="max-w-sm space-y-3">
          <p className="text-sm font-medium text-[var(--color-accent-strong)]">
            Habit Tracker
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text)] sm:text-3xl">
            Keep the day simple.
          </h2>
          <p className="text-sm leading-6 text-[var(--color-text-muted)]">
            Sign in and continue with your habits.
          </p>
        </div>

        <Card>
          <div className="mb-6 space-y-1">
            <h1 className="text-xl font-semibold">Login</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Use any email and an 8-character password.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              error={fieldErrors.email}
              label="Email"
              placeholder="twoj@email.com"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setFieldErrors((currentErrors) => ({
                  ...currentErrors,
                  email: undefined,
                }))
              }}
            />
            <Input
              error={fieldErrors.password}
              label="Password"
              placeholder="********"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setFieldErrors((currentErrors) => ({
                  ...currentErrors,
                  password: undefined,
                }))
              }}
            />
            {errorMessage ? (
              <p className="rounded-lg bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
                {errorMessage}
              </p>
            ) : null}
            <Button
              fullWidth
              isLoading={isSubmitting}
              loadingLabel="Signing in..."
              type="submit"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-5 text-sm text-[var(--color-text-muted)]">
            No account yet?{' '}
            <Link
              className="font-medium text-[var(--color-accent-strong)] hover:underline"
              to="/register"
            >
              Create one
            </Link>
          </p>
        </Card>
      </section>
    </main>
  )
}
