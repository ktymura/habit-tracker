# Stack technologiczny i kontrakt API

## Stack technologiczny

| Rola | Technologia | |
|------|------------|---|
| **Data Engineer** | Baza | PostgreSQL |
| | Migracje | Alembic |
| | Analityka | pandas |
| | Predykcja | scikit-learn |
| | Harmonogram | APScheduler |
| **Frontend** | Framework | React + Vite |
| | Routing | React Router |
| | Wykresy | Recharts |
| | HTTP | Axios |
| | Style | Tailwind CSS |
| **Backend** | Framework | FastAPI |
| | ORM | SQLAlchemy |
| | Auth | JWT + bcrypt |
| | Mail | smtplib |
| | Walidacja | Pydantic |
| **Fullstack / DevOps** | Kontenery | Docker Compose |
| | CI/CD | GitHub Actions |
| | Hosting | Railway |
| | Testy | pytest + Playwright |
| | Docs | Swagger (auto) |

---

## Kontrakt API

> Wszystkie endpointy poza `/auth/*` wymagają nagłówka `Authorization: Bearer <token>`. Dokumentacja generuje się automatycznie przez FastAPI pod `/docs`.

### Auth

| Metoda | Endpoint | Opis | Kto używa |
|--------|----------|------|-----------|
| `POST` | `/auth/register` | Rejestracja nowego użytkownika | Frontend |
| `POST` | `/auth/login` | Logowanie, zwraca JWT token | Frontend |
| `POST` | `/auth/refresh` | Odświeżenie tokenu | Frontend |

### Habits - zarządzanie nawykami

| Metoda | Endpoint | Opis | Kto używa |
|--------|----------|------|-----------|
| `GET` | `/habits` | Lista nawyków zalogowanego użytkownika | Frontend |
| `POST` | `/habits` | Utwórz nowy nawyk (nazwa, kolor, częstotliwość) | Frontend |
| `PUT` | `/habits/{id}` | Edytuj nawyk | Frontend |
| `DELETE` | `/habits/{id}` | Usuń nawyk | Frontend |

### Entries - odhaczanie nawyków

| Metoda | Endpoint | Opis | Kto używa |
|--------|----------|------|-----------|
| `GET` | `/habits/{id}/entries` | Historia wpisów dla nawyku (zakres dat) | Frontend, Analytics |
| `POST` | `/habits/{id}/entries` | Odhaczyć nawyk na dany dzień | Frontend |
| `DELETE` | `/habits/{id}/entries/{date}` | Cofnij odhaczenie | Frontend |

### Analytics - statystyki i analityka

| Metoda | Endpoint | Opis | Kto używa |
|--------|----------|------|-----------|
| `GET` | `/analytics/streaks` | Aktualne i najdłuższe streaki dla wszystkich nawyków | Frontend |
| `GET` | `/analytics/summary` | Tygodniowe / miesięczne podsumowanie (% wykonania) | Frontend |
| `GET` | `/analytics/heatmap` | Dane do heatmapy aktywności (365 dni) | Frontend |
| `GET` | `/analytics/correlations` | Korelacje między nawykami użytkownika | Frontend |
| `GET` | `/analytics/predict/{id}` | Predykcja: prawdopodobieństwo wykonania nawyku | Frontend (opcjonalnie) |