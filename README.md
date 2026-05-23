# Habit Tracker

Aplikacja do śledzenia nawyków — backend API (FastAPI + PostgreSQL).

## Uruchomienie (Docker)

```bash
docker compose up --build
```

- API: http://localhost:8000
- Baza danych: `localhost:5432`
- Dokumentacja API (Swagger): http://localhost:8000/docs

### Seed danych testowych

```bash
docker compose exec app python seed.py
```

Tworzy 3 użytkowników, 10 nawyków i 90 dni historii wpisów.

## Uruchomienie lokalne (bez Dockera)

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
```

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

## Testy i linting

```bash
pip install -r requirements-dev.txt
ruff check .
ruff format --check .
pytest -v
```

## Strategia branchowania

| Branch | Przeznaczenie |
|--------|---------------|
| `main` | Stabilna wersja — tylko merge z `dev` po zakończeniu sprintu |
| `dev` | Bieżąca praca — integracja feature branchy |
| `feature/*` | Nowe funkcjonalności, np. `feature/backend-sprint-2` |
| `devops/*` | Infrastruktura, CI/CD, np. `devops/github-actions` |

**Flow:** `feature/*` → PR do `dev` → po zakończeniu sprintu merge `dev` → `main`

## CI/CD

GitHub Actions uruchamia lint + testy przy każdym push na `dev` i `main`.

## Testy E2E (Playwright)

End-to-end testy w `habit-tracker-frontend/e2e/` chodzą przeciwko realnemu backendowi z `VITE_USE_MOCKS=false`. Playwright sam odpala uvicorn (BE :8000) i `vite dev` (FE :5173); Postgres musisz wystartować osobno.

**Wymagania:**
- Postgres z `.env` dostępny (np. `docker compose up -d db`).
- W `habit-tracker-backend/` venv z zainstalowanym `requirements.txt` — playwright odpala `python -m uvicorn`, więc `python` w PATH musi mieć uvicorn (np. `source habit-tracker-backend/.venv/bin/activate` przed runem).
- W `habit-tracker-frontend/` po pierwszym razie: `npx playwright install chromium`.

**Run:**

```bash
docker compose up -d db
cd habit-tracker-frontend
npm run test:e2e
```

Playwright odpala BE + FE w tle, uruchamia 3 testy (login, toggle habita, dashboard), gasi serwery. Raport HTML po failu: `playwright-report/index.html`.

Każdy test rejestruje świeżego usera via `POST /auth/register` z unikalnym emailem (`<prefix>-<timestamp>-<random>@example.com`), więc testy są od siebie niezależne i kolejne runy nie wymagają czyszczenia bazy.

## Deploy na Railway (staging)

Staging stoi na Railway z trzema serwisami w jednym projekcie: **PostgreSQL** (managed plugin), **backend** (z `habit-tracker-backend/`) i **frontend** (z `habit-tracker-frontend/`). Konfiguracja per serwis siedzi w `railway.toml` w odpowiednim katalogu. CLI dostępne globalnie po `npm i -g @railway/cli`.

### Pierwszy setup projektu

```bash
railway login
railway init                              # utwórz projekt staging
railway add --plugin postgresql           # provision DB
```

### Backend service

Root directory: `habit-tracker-backend/`. Build: Dockerfile. Start: `./start.sh` (alembic upgrade + uvicorn na `$PORT`). Healthcheck: `/health/db`.

Zmienne środowiskowe (skopiuj z `habit-tracker-backend/.env.staging.example` i ustaw via dashboard lub `railway variables`):

| Zmienna | Skąd brać |
|---------|-----------|
| `DATABASE_URL` | auto-injektowana przez Railway przy zalinkowaniu Postgres pluginu |
| `JWT_SECRET_KEY` | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET_KEY` | `openssl rand -hex 32` (inna wartość) |
| `CORS_ALLOWED_ORIGINS` | URL serwisu frontend (np. `https://habit-tracker-frontend-staging.up.railway.app`) |
| `DEBUG` | `False` |

Deploy:

```bash
cd habit-tracker-backend
railway up --service backend
```

### Frontend service

Root directory: `habit-tracker-frontend/`. Build: Nixpacks (`npm ci && npm run build`). Start: `npm run start` (serve static z `dist/` na `$PORT`). Healthcheck: `/`.

Zmienna środowiskowa (z `habit-tracker-frontend/.env.staging.example`):

| Zmienna | Wartość |
|---------|---------|
| `VITE_API_URL` | URL backendu (np. `https://habit-tracker-backend-staging.up.railway.app`). **Vite inline'uje ją w bundlu na buildzie — ustaw zanim odpalisz `railway up`.** |

Deploy:

```bash
cd habit-tracker-frontend
railway up --service frontend
```

### Po deployu

- Backend healthcheck: `https://<backend-domain>/health/db` → `{"status":"ok","database":"connected"}`
- Frontend: otwórz w przeglądarce, sprawdź Network że requesty walą na backend (nie na localhost)
- Logi: `railway logs --service <name>`


## Struktura projektu

```
habit-tracker/
├─�� .github/workflows/ci.yml
├── docker-compose.yml
├── docs/planning/           # Specyfikacje sprintów, stack, ERD
└── habit-tracker-backend/
    ├── alembic/             # Migracje bazy danych
    ├── app/
    │   ├── core/            # Konfiguracja, połączenie z DB
    │   ├── models/          # Modele SQLAlchemy
    │   ├── routers/         # Endpointy API
    │   ├── schemas/         # Schematy Pydantic
    │   └── services/        # Logika biznesowa
    ├── tests/
    ├── requirements.txt
    └── requirements-dev.txt
```
