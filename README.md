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

## Deploy na Railway

Projekt habit-tracker stoi na Railway w jednym projekcie z dwoma środowiskami: **`production`** i **`staging`**. Każde środowisko ma własną parę serwisów (backend + frontend) i osobną Postgres bazę (fizyczna izolacja, różne hasła, różne JWT secrets). Konfiguracja per serwis siedzi w `railway.toml` w odpowiednim katalogu. CLI dostępne globalnie po `npm i -g @railway/cli`.

### Środowiska i URLe

| | Production | Staging |
|---|---|---|
| Backend | https://backend-production-8b55e.up.railway.app | https://backend-staging-61e6.up.railway.app |
| Frontend | https://frontend-production-fe4d.up.railway.app | https://frontend-staging-150b.up.railway.app |
| Postgres | env-scoped (osobna instancja) | env-scoped (osobna instancja) |

Przełączanie pomiędzy środowiskami w CLI: `railway environment production` lub `railway environment staging`.

### Pierwszy setup projektu (od zera)

```bash
railway login
railway init                              # utwórz projekt
railway add --database postgres           # provision Postgres w obecnym env (production)
railway environment new staging --duplicate production   # drugie środowisko (kopia)
```

### Deploy backendu

Root: `habit-tracker-backend/`. Build: Dockerfile. Start: `./start.sh` (`alembic upgrade head` + uvicorn na `$PORT`). Healthcheck: `/health/db`.

Zmienne (szablon w `habit-tracker-backend/.env.staging.example`, ustaw przez dashboard albo `railway variables --set`):

| Zmienna | Wartość | Różna per env? |
|---------|---------|----------------|
| `DATABASE_URL` | reference: `${{Postgres.DATABASE_URL}}` (Railway resolwuje per env) | tak (różne instancje DB) |
| `JWT_SECRET_KEY` | `openssl rand -hex 32` | **tak — rotuj per env** |
| `JWT_REFRESH_SECRET_KEY` | `openssl rand -hex 32` (inna wartość) | **tak — rotuj per env** |
| `JWT_ALGORITHM` | `HS256` | nie |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | nie |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | nie |
| `CORS_ALLOWED_ORIGINS` | URL FE w danym środowisku | tak |
| `APP_NAME` | `Habit Tracker API` / `Habit Tracker API (staging)` | tak |
| `DEBUG` | `False` | nie |

Deploy (z **roota repo**, nie z katalogu backendu — patrz "Gotchas"):

```bash
railway environment <production|staging>
railway up habit-tracker-backend --path-as-root --service backend
```

### Deploy frontendu

Root: `habit-tracker-frontend/`. Build: Nixpacks (`npm run build`). Start: `npm run start` (`serve -s dist -l $PORT`). Healthcheck: `/`.

Zmienne (szablon w `habit-tracker-frontend/.env.staging.example`):

| Zmienna | Wartość |
|---------|---------|
| `VITE_API_URL` | URL BE w danym środowisku. **Vite inline'uje ją w bundlu na buildzie — ustaw zanim odpalisz `railway up`.** |
| `VITE_USE_MOCKS` | `false` (default `true` w FE; bez tego apka zostaje na mockach) |

Deploy:

```bash
railway environment <production|staging>
railway up habit-tracker-frontend --path-as-root --service frontend
```

### Gotchas (wyłapane podczas pierwszego deployu)

- **Monorepo path**: bez `--path-as-root <subdir>` Railway upload'uje cały root repo i Railpack analizuje monorepo (zobaczy `.github/`, `docs/`, `habit-tracker-backend/` — nie wie którego budować). Zawsze `railway up habit-tracker-{backend,frontend} --path-as-root --service <name>` z roota repo.
- **Node version**: `habit-tracker-frontend/package.json` ma `"engines": {"node": ">=20"}` — wymagane przez react-router 7, vite 8, rolldown. Bez tego Nixpacks daje Node 18 i `npm ci` rzuca `EBADENGINE`.
- **Nixpacks już robi `npm ci` w osobnym stage**, więc w `railway.toml` `buildCommand = "npm run build"` (samo build). Gdy `buildCommand` ma `npm ci && npm run build`, drugi `npm ci` konfliktuje z `--mount=type=cache,target=/app/node_modules/.cache` przez EBUSY.
- **Variable change → auto-redeploy**: po `railway variables --set X=...` serwis sam się przebudowuje. Gdy nie chcesz tego (np. seria zmian na raz), dorzuć `--skip-deploys`.
- **Continuous deploy z gita** nie jest podpięty. Każdy deploy idzie ręcznie przez `railway up`. Można włączyć w dashboardzie: Service Settings → Source → connect repo + watch branch (np. `main` → production, `dev` → staging).

### Po deployu

- Backend healthcheck: `https://<backend-domain>/health/db` → `{"status":"ok","database":"connected"}`
- Frontend: otwórz w przeglądarce, sprawdź Network że requesty walą na backend (nie na `localhost`)
- Logi: `railway logs --service <name>` (przełącz env wcześniej przez `railway environment <name>`)


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
