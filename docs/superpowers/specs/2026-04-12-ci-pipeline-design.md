# GitHub Actions CI Pipeline

## Summary

Add a CI pipeline that runs lint and tests on every push to `dev` and `main` branches.

## Trigger

- `push` to branches: `dev`, `main`
- Working directory for all steps: `habit-tracker-backend/`

## Job 1: lint

- **Runner:** ubuntu-latest
- **Python:** 3.12
- Install ruff from `requirements-dev.txt`
- `ruff check .` — static analysis
- `ruff format --check .` — formatting verification

## Job 2: test

- **Runner:** ubuntu-latest
- **Python:** 3.12
- **Service container:** postgres:15 with health check
  - `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD=test`, `POSTGRES_DB=habit_tracker_test`
  - Port 5432 mapped
- Install dependencies from `requirements.txt` + `requirements-dev.txt`
- Run Alembic migrations: `alembic upgrade head`
- Run tests: `pytest -v`

## New files

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | CI pipeline definition |
| `habit-tracker-backend/requirements-dev.txt` | Dev dependencies: ruff, pytest, httpx |
| `habit-tracker-backend/conftest.py` | TestClient fixture with DB session override |
| `habit-tracker-backend/tests/test_health.py` | Smoke test for GET `/` and GET `/health` |

## Test setup

- `conftest.py` creates a FastAPI `TestClient` via httpx
- Overrides `get_db` dependency to use the test database (same DB, managed by CI service container)
- Tests run against real PostgreSQL, same as production driver (psycopg)

## Decisions

- **Real PostgreSQL over SQLite** — ensures tests match production behavior (constraints, types, psycopg driver)
- **Separate requirements-dev.txt** — keeps production image lean
- **Alembic in CI** — validates migrations apply cleanly on every push
