# Habit Tracker

Aplikacja webowa do śledzenia codziennych nawyków — rejestrowanie wpisów, statystyki, przypomnienia. Monorepo z backendem (FastAPI + PostgreSQL) i frontendem (React + Vite + Tailwind), hostowane na Railway.

## Demo

Live deploy na Railway:

- **Frontend (production):** https://frontend-production-fe4d.up.railway.app
- **Backend API (production):** https://backend-production-8b55e.up.railway.app
- **Swagger / OpenAPI:** https://backend-production-8b55e.up.railway.app/docs
- **Healthcheck:** https://backend-production-8b55e.up.railway.app/health/db

Środowisko `staging` używane do testów przed mergem do `main` — URLe w [docs/deployment.md](docs/deployment.md).

> 📸 _Screenshoty UI — TODO (sprint-4)._

## Architektura

Klasyczny SPA + REST API + relacyjna baza:

```
┌─────────────┐   HTTPS    ┌──────────────────┐   SQL    ┌─────────────┐
│  Browser    │  ───────►  │  Frontend (SPA)  │          │             │
│  (user)     │            │  React + Vite    │          │             │
│             │            │  served by serve │          │             │
└─────────────┘            └────────┬─────────┘          │             │
                                    │ axios              │ PostgreSQL  │
                                    │ + JWT (Bearer)     │     15      │
                                    ▼                    │             │
                           ┌──────────────────┐  psycopg │             │
                           │  Backend API     │ ───────► │             │
                           │  FastAPI         │          │             │
                           │  + Alembic migr. │          │             │
                           └──────────────────┘          └─────────────┘
```

### Stack

| Warstwa | Technologie |
|---------|-------------|
| Frontend | React 19, react-router 7, Vite, TypeScript, Tailwind CSS 4, axios, recharts |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic, psycopg, python-jose (JWT) |
| Baza | PostgreSQL 15 |
| Testy | pytest (backend), Playwright (E2E), ESLint + Prettier, Ruff |
| Infra | Docker (BE), Nixpacks (FE), Railway (hosting), GitHub Actions (CI) |

### Kluczowe decyzje

- **Auth:** JWT (access + refresh). Sekrety per środowisko, rotowane oddzielnie dla `production` i `staging`.
- **Migracje:** Alembic w `habit-tracker-backend/alembic/`. Backend na starcie odpala `alembic upgrade head` (`start.sh`), więc deploy = migracje automatycznie.
- **Mocki frontowe:** FE domyślnie chodzi na zmockowanym API (`VITE_USE_MOCKS=true`) — dev bez backendu jest możliwy. Na deployu i w E2E `VITE_USE_MOCKS=false` celuje w realny BE.
- **Moduły backendu:** routery `auth`, `habits`, `entries`, `analytics`, `notifications`, `health` — patrz Swagger.

## Szybki start (Docker, tylko backend + DB)

```bash
docker compose up --build
```

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Baza: `localhost:5432` (user `postgres`, hasło `Test123`, db `habit_tracker`)

Seed danych demonstracyjnych (1 user, 6 nawyków, 6 miesięcy historii):

```bash
docker compose exec app python seed_demo.py
```

> docker-compose nie odpala frontendu — odpal go osobno (`npm run dev`, sekcja niżej) albo korzystaj ze Swaggera.

## Uruchomienie lokalne (bez Dockera)

### Backend

```bash
cd habit-tracker-backend
python -m venv .venv
source .venv/bin/activate   # Linux/Mac
# .venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

Utwórz plik `.env` w `habit-tracker-backend/`:

```
DATABASE_URL=postgresql+psycopg://postgres:Test123@localhost:5432/habit_tracker
APP_NAME=Habit Tracker API
APP_VERSION=0.1.0
DEBUG=True
JWT_SECRET_KEY=<openssl rand -hex 32>
JWT_REFRESH_SECRET_KEY=<openssl rand -hex 32>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Postgresa odpal np. przez `docker compose up -d db`, potem:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd habit-tracker-frontend
npm install
npm run dev
```

Frontend wstaje na http://localhost:5173. Domyślnie używa mocków (`VITE_USE_MOCKS=true`). Żeby celować w lokalny backend, utwórz `.env` w `habit-tracker-frontend/`:

```
VITE_API_URL=http://localhost:8000
VITE_USE_MOCKS=false
```

## Testy i linting

### Backend

```bash
cd habit-tracker-backend
pip install -r requirements-dev.txt
ruff check .
ruff format --check .
pytest -v
```

### Frontend

```bash
cd habit-tracker-frontend
npm run lint
npm run format:check
```

### E2E (Playwright)

End-to-end testy w `habit-tracker-frontend/e2e/` chodzą przeciwko realnemu backendowi z `VITE_USE_MOCKS=false`. Playwright sam odpala uvicorn (BE :8000) i `vite dev` (FE :5173); Postgresa musisz wystartować osobno.

**Wymagania:**
- Postgres z `.env` dostępny (np. `docker compose up -d db`).
- W `habit-tracker-backend/` venv z zainstalowanym `requirements.txt` (Playwright odpala `python -m uvicorn`).
- W `habit-tracker-frontend/` po pierwszym razie: `npx playwright install chromium`.

**Run:**

```bash
docker compose up -d db
cd habit-tracker-frontend
npm run test:e2e
```

Playwright uruchamia BE + FE w tle, wykonuje testy (login, toggle habita, dashboard), gasi serwery. Raport HTML po failu: `playwright-report/index.html`.

Każdy test rejestruje świeżego usera via `POST /auth/register` z unikalnym emailem, więc testy są od siebie niezależne i kolejne runy nie wymagają czyszczenia bazy.

## Strategia branchowania

| Branch | Przeznaczenie |
|--------|---------------|
| `main` | Stabilna wersja — tylko merge z `dev` po zakończeniu sprintu |
| `dev` | Bieżąca praca — integracja feature branchy |
| `feature/*` | Nowe funkcjonalności, np. `feature/backend-sprint-2` |
| `devops/*` | Infrastruktura, CI/CD, np. `devops/sprint-3-staging` |

**Flow:** `feature/*` → PR do `dev` → po zakończeniu sprintu merge `dev` → `main`

## CI/CD

GitHub Actions uruchamia lint + testy przy każdym push na `dev` i `main` (`.github/workflows/ci.yml`).

Deploy na Railway idzie **ręcznie** przez `railway up` — pełna instrukcja, lista zmiennych środowiskowych, gotchas: [docs/deployment.md](docs/deployment.md).

## Struktura projektu

```
habit-tracker/
├── .github/workflows/ci.yml       # GitHub Actions
├── docker-compose.yml             # BE + Postgres (dev/local)
├── docs/
│   ├── deployment.md              # Railway deploy guide
│   └── planning/                  # Specyfikacje sprintów, stack, ERD
├── habit-tracker-backend/
│   ├── alembic/                   # Migracje bazy danych
│   ├── app/
│   │   ├── core/                  # Konfiguracja, połączenie z DB, JWT
│   │   ├── models/                # Modele SQLAlchemy
│   │   ├── routers/               # auth, habits, entries, analytics, notifications, health
│   │   ├── schemas/               # Schematy Pydantic
│   │   └── services/              # Logika biznesowa
│   ├── tests/                     # pytest
│   ├── Dockerfile
│   ├── start.sh                   # alembic upgrade head + uvicorn
│   └── requirements*.txt
└── habit-tracker-frontend/
    ├── src/
    │   ├── app/                   # Punkt startowy + root component
    │   ├── components/            # Wspólne komponenty UI
    │   ├── features/              # Logika domenowa (auth, ...)
    │   ├── layouts/               # Layouty stron
    │   ├── lib/                   # Utilsy
    │   ├── mocks/                 # MSW / dane mockowe
    │   ├── pages/                 # Ekrany: auth, dashboard, habits
    │   ├── services/              # Klient API (axios)
    │   ├── styles/                # Tailwind + globalne
    │   └── types/                 # Wspólne typy TS
    ├── e2e/                       # Playwright
    ├── vite.config.ts
    └── package.json
```
