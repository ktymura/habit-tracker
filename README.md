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
