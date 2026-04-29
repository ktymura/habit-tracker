import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

  async function handleSubmit() {
    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      const response = await register({ email, password, confirmPassword })
      setAuthToken(response.token)
      navigate('/habits')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nie udalo sie zalozyc konta.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-89px)] w-full max-w-7xl items-center px-6 py-10">
      <Card className="mx-auto w-full max-w-md">
        <div className="space-y-5">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-semibold">Rejestracja</h2>
            <p className="text-sm leading-6 text-[var(--color-text-muted)]">
              Makieta ekranu rejestracji z miejscem pod walidacje i API.
            </p>
          </div>
          <div className="space-y-3">
            <Input
              label="Email"
              placeholder="twoj@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label="Haslo"
              placeholder="********"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Input
              label="Powtorz haslo"
              placeholder="********"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {errorMessage ? (
              <p className="text-sm text-rose-600">{errorMessage}</p>
            ) : null}
            <Button fullWidth disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? 'Tworzenie konta...' : 'Zaloz konto'}
            </Button>
          </div>
        </div>
      </Card>
    </main>
  )
}
