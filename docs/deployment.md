# Deploy na Railway

Projekt habit-tracker stoi na Railway w jednym projekcie z dwoma środowiskami: **`production`** i **`staging`**. Każde środowisko ma własną parę serwisów (backend + frontend) i osobną Postgres bazę (fizyczna izolacja, różne hasła, różne JWT secrets). Konfiguracja per serwis siedzi w `railway.toml` w odpowiednim katalogu. CLI dostępne globalnie po `npm i -g @railway/cli`.

## Środowiska i URLe

| | Production | Staging |
|---|---|---|
| Backend | https://backend-production-8b55e.up.railway.app | https://backend-staging-61e6.up.railway.app |
| Frontend | https://frontend-production-fe4d.up.railway.app | https://frontend-staging-150b.up.railway.app |
| Postgres | env-scoped (osobna instancja) | env-scoped (osobna instancja) |

Przełączanie pomiędzy środowiskami w CLI: `railway environment production` lub `railway environment staging`.

## Pierwszy setup projektu (od zera)

```bash
railway login
railway init                              # utwórz projekt
railway add --database postgres           # provision Postgres w obecnym env (production)
railway environment new staging --duplicate production   # drugie środowisko (kopia)
```

## Deploy backendu

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

## Deploy frontendu

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

## Gotchas (wyłapane podczas pierwszego deployu)

- **Monorepo path**: bez `--path-as-root <subdir>` Railway upload'uje cały root repo i Railpack analizuje monorepo (zobaczy `.github/`, `docs/`, `habit-tracker-backend/` — nie wie którego budować). Zawsze `railway up habit-tracker-{backend,frontend} --path-as-root --service <name>` z roota repo.
- **Node version**: `habit-tracker-frontend/package.json` ma `"engines": {"node": ">=20"}` — wymagane przez react-router 7, vite 8, rolldown. Bez tego Nixpacks daje Node 18 i `npm ci` rzuca `EBADENGINE`.
- **Nixpacks już robi `npm ci` w osobnym stage**, więc w `railway.toml` `buildCommand = "npm run build"` (samo build). Gdy `buildCommand` ma `npm ci && npm run build`, drugi `npm ci` konfliktuje z `--mount=type=cache,target=/app/node_modules/.cache` przez EBUSY.
- **Variable change → auto-redeploy**: po `railway variables --set X=...` serwis sam się przebudowuje. Gdy nie chcesz tego (np. seria zmian na raz), dorzuć `--skip-deploys`.
- **Continuous deploy z gita** nie jest podpięty. Każdy deploy idzie ręcznie przez `railway up`. Można włączyć w dashboardzie: Service Settings → Source → connect repo + watch branch (np. `main` → production, `dev` → staging).

## Po deployu

- Backend healthcheck: `https://<backend-domain>/health/db` → `{"status":"ok","database":"connected"}`
- Frontend: otwórz w przeglądarce, sprawdź Network że requesty walą na backend (nie na `localhost`)
- Logi: `railway logs --service <name>` (przełącz env wcześniej przez `railway environment <name>`)
