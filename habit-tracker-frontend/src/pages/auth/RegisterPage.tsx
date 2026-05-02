import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button, Card, Input } from '../../components/ui'
import { setAuthToken } from '../../features/auth/auth-storage'
import { register } from '../../services/auth/auth-service'

export function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      const response = await register({ email, password, confirmPassword })
      setAuthToken(response.token)
      navigate('/habits')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to create account.',
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
            Start with one small routine.
          </h2>
          <p className="text-sm leading-6 text-[var(--color-text-muted)]">
            Create an account and move straight into the app.
          </p>
        </div>

        <Card>
          <div className="mb-6 space-y-1">
            <h1 className="text-xl font-semibold">Register</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Email and password are enough for this step.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              placeholder="twoj@email.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label="Password"
              placeholder="********"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Input
              label="Repeat password"
              placeholder="********"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {errorMessage ? (
              <p className="rounded-lg bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
                {errorMessage}
              </p>
            ) : null}
            <Button
              fullWidth
              isLoading={isSubmitting}
              loadingLabel="Creating account..."
              type="submit"
            >
              Create account
            </Button>
          </form>

          <p className="mt-5 text-sm text-[var(--color-text-muted)]">
            Already have an account?{' '}
            <Link
              className="font-medium text-[var(--color-accent-strong)] hover:underline"
              to="/login"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </section>
    </main>
  )
}
