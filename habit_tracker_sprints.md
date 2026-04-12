# Habit Tracker — Sprints

## Podział ról
**Project Manager / Data Engineer** - Katarzyna Tymura  
**Frontend** - Dominik Stańczyk  
**Backend** - Marcin Pasynczuk  
**Fullstack / DevOps** - Krzysztof Pawełko  

---

## Sprint 1 — Fundament i setup

**Deadline:** 12-04-2026

**Cel:** działające środowisko lokalne, baza z danymi testowymi, uzgodniony kontrakt API

### Data Engineer

1. **Analiza wymagań danych** — Spis encji: users, habits, entries. Szkic relacji między tabelami.
2. **Projekt ERD** — Finalne typy kolumn, klucze obce, unikalność (habit+date). Zapisać jako diagram.
3. **Migracje Alembic** — Inicjacja Alembic, pierwsza migracja tworząca wszystkie tabele.
4. **Seed data** — Skrypt seed.py: 3 userów, 10 nawyków, 90 dni historii wpisów.
5. **Weryfikacja schematu** — Test migracji up/down, sprawdzenie seed data w psql.

### Frontend

1. **Setup projektu** — React + Vite + Tailwind, ESLint, Prettier, struktura folderów.
2. **Makiety ekranów** — Szkice: login, rejestracja, lista nawyków, widok dzienny, dashboard. Zatwierdzone przez zespół.
3. **Komponenty bazowe** — Button, Input, Card, Modal, Spinner — design system na Tailwindzie.
4. **Routing i layout** — React Router: /login, /register, /habits, /dashboard. Navbar, PrivateRoute.
5. **Axios + mock API** — Konfiguracja Axios, interceptory JWT, mockowe dane do widoków (bez backendu).

### Backend

1. **Setup FastAPI** — Projekt, venv, FastAPI + Uvicorn. Hello world działa lokalnie.
2. **Struktura projektu** — Foldery: routers/, models/, schemas/, services/. SQLAlchemy base.
3. **Modele SQLAlchemy** — User, Habit, Entry — modele ORM zgodne z ERD od data engineera.
4. **Połączenie z bazą** — Session factory, dependency injection do FastAPI. Test połączenia z PostgreSQL.
5. **Pydantic schemas** — Request/response schemas dla auth i habits. Walidacja wejścia.

### Fullstack / DevOps

1. **Setup repo** — GitHub repo, branch strategy (main/dev/feature/*), .gitignore, README.
2. **Docker Compose** — docker-compose.yml: serwis app + db (postgres:15). Lokalne uruchomienie dla całego zespołu.
3. **GitHub Actions CI** — Pipeline: lint + testy uruchamiane przy każdym push na dev i main.
4. **Kontrakt API w repo** — Plik api-contract.md: lista endpointów, przykładowe JSON-y request/response.

> **Spotkanie synchronizacyjne w środku sprintu:** przegląd ERD + akceptacja makiet + ustalenie kontraktu API — zanim ktokolwiek zacznie pisać endpointy.

**Koniec sprintu:** każdy ma działające środowisko lokalnie, baza działa z seed data, kontrakt API zapisany w repo, makiety zatwierdzone.

---

## Sprint 2 — Core features (CRUD)

**Deadline:** 26-04-2026

**Cel:** użytkownik może się zarejestrować, zalogować, dodać nawyk i go odhaczać

### Data Engineer

1. **Algorytm streak** — Funkcja Python: current streak i longest streak. Testy jednostkowe w pytest.
2. **Widoki SQL (agregaty)** — Widoki PostgreSQL: dzienna i tygodniowa completion_rate per habit per user.
3. **Indeksy wydajnościowe** — Indeksy na entries(habit_id, date) i habits(user_id). Weryfikacja przez EXPLAIN ANALYZE.
4. **Endpoint /analytics/streaks** — GET /analytics/streaks — integracja funkcji streak z API. Ustalenie formatu JSON z frontendem.

### Frontend

1. **Ekran rejestracji** — Formularz + walidacja kliencka (email, hasło min 8 znaków). Integracja z POST /auth/register.
2. **Ekran logowania** — Formularz logowania, zapis tokenu, redirect po sukcesie. Obsługa błędu 401.
3. **Lista nawyków** — Ekran /habits: pobieranie z API, karty nawyków, skeleton loading, empty state.
4. **Dodawanie nawyku** — Modal: nazwa, kolor, ikona, częstotliwość. POST do API, aktualizacja listy bez przeładowania.
5. **Widok dzienny** — Lista nawyków na dziś z checkboxami. Optymistyczny update UI przed odpowiedzią serwera.

### Backend

1. **POST /auth/register** — Hashowanie hasła bcrypt, zapis usera, zwrot 201. Obsługa duplikatu emaila (409).
2. **POST /auth/login + JWT** — Weryfikacja hasła, generacja access + refresh token. Konfiguracja expiry.
3. **CRUD /habits** — GET, POST, PUT, DELETE — wszystkie endpointy z autoryzacją JWT. Izolacja między userami.
4. **CRUD /entries** — POST i DELETE /habits/{id}/entries — odhaczanie i cofanie. Unikalność habit+dzień.
5. **Middleware błędów** — Globalny handler wyjątków — spójne formaty błędów (400, 401, 404, 422).

### Fullstack / DevOps

1. **Testy auth (pytest)** — Rejestracja, duplikat emaila, błędne hasło, wygasły token.
2. **Testy CRUD habits** — Tworzenie, edycja, usuwanie. Sprawdzenie izolacji danych między userami.
3. **Auth guard (FE)** — PrivateRoute w React — redirect na /login jeśli brak tokenu lub token wygasł.
4. **Logi i obsługa błędów** — Logowanie requestów i błędów po stronie backendu. Toast notifications po stronie frontendu.

> **Spotkanie synchronizacyjne w środku sprintu:** demo działającego logowania end-to-end. Warto zrobić krótki call dzień wcześniej — backend, frontend i baza muszą działać razem.

**Koniec sprintu:** pełny flow działa — rejestracja → logowanie → dodaj nawyk → odhaczyj.

---

## Sprint 3 — Analityka i wizualizacje

**Deadline:** 10-05-2026

**Cel:** dashboard z wykresami, heatmapa, deploy na staging

### Data Engineer

1. **Endpoint /analytics/summary** — Tygodniowy i miesięczny completion_rate per habit. Format JSON ustalony z frontendem.
2. **Endpoint /analytics/heatmap** — 365 dni aktywności użytkownika. Format: [{date, count}] posortowany chronologicznie.
3. **Endpoint /analytics/correlations** — pandas corr() na macierzy completion. Ustalić format z frontendem (lista par vs macierz).
4. **Optymalizacja zapytań** — EXPLAIN ANALYZE na wolnych zapytaniach. Materialized view jeśli potrzeba.
5. **Model predykcji** *(opcjonalnie)* — scikit-learn LogisticRegression: cechy = dzień tygodnia, streak, historia 30 dni.

### Frontend

1. **Szkielet dashboardu** — Layout /dashboard: grid z placeholderami. Responsywny (mobile + desktop).
2. **Wykres liniowy** — Recharts LineChart: completion_rate w czasie dla wybranego nawyku. Przełącznik nawyk/zakres dat.
3. **Heatmapa aktywności** — Calendar heatmap (365 dni). Kolory od 0 do max. Tooltip z datą i liczbą nawyków.
4. **Widok tygodniowy** — Tabela: nawyki × dni tygodnia. Checkboxy, streak badge przy każdym nawyku.
5. **Integracja z prawdziwym API** — Zastąpienie mocków prawdziwymi endpointami. Obsługa stanów loading/error/empty.

### Backend

1. **Caching analityki** — In-memory cache (słownik + TTL) dla /analytics/*. Inwalidacja po nowym wpisie.
2. **GET /habits/{id}/entries** — Filtrowanie po zakresie dat (?from=&to=). Potrzebne przez frontend i analitykę.
3. **Endpoint /analytics/predict** *(opcjonalnie)* — GET /analytics/predict/{id} — wywołanie modelu DE, zwrot {probability: 0.0–1.0}.
4. **Powiadomienia email** — POST /notifications/settings. Wysyłka przypomnienia przez smtplib o ustalonej godzinie.
5. **Bugfixy po demo** — Poprawki zgłoszone podczas spotkania synchronizacyjnego.

### Fullstack / DevOps

1. **Staging environment** — Deploy na Railway: serwis app + baza. Zmienne środowiskowe, healthcheck.
2. **Testy E2E (Playwright)** — Setup Playwright. Testy: logowanie, odhaczanie nawyku, ładowanie dashboardu.
3. **Testy analityki E2E** — Sprawdzenie poprawności danych na wykresach. Test heatmapy.
4. **Wsparcie integracyjne** — Pomoc przy spięciu frontend ↔ backend tam, gdzie pojawią się problemy z CORS, auth, formatami.

> **Spotkanie synchronizacyjne w środku sprintu:** demo na stagingu — przegląd wykresów, feedback UX, priorytetyzacja reszty zadań. Zadania "opcjonalnie" realizować tylko jeśli wszystko inne gotowe.

**Koniec sprintu:** dashboard działa na stagingu z prawdziwymi danymi, heatmapa i wykresy widoczne.

---

## Sprint 4 — Szlify i prezentacja

**Deadline:** 24-05-2026

**Cel:** gotowy produkt na produkcji, dokumentacja, przygotowane demo

### Data Engineer

1. **Dokumentacja modelu danych** — ERD w README, opis każdej tabeli i jej roli, uzasadnienie decyzji projektowych.
2. **Demo dataset na produkcji** — Realistyczny seed: 1 konto demo, 6 nawyków, 6 miesięcy danych — żeby wykresy wyglądały.
3. **Slajdy: warstwa danych** — 2–3 slajdy: schemat bazy, pipeline analityczny, ciekawe wnioski z danych demo.
4. **Bufor / rezerwa** — Poprawki po próbnej prezentacji. Doszlifowanie modelu predykcji jeśli czas.

### Frontend

1. **Poprawki UX** — Feedback z demo sprintu 3: flow, komunikaty błędów, empty states, edycja nawyku.
2. **Animacje i loading states** — Skeleton screens, animacje przejść między ekranami, toast notifications.
3. **Responsywność** — Testy na mobile (375px) i tablet (768px). Poprawki breakpointów.
4. **Bufor / rezerwa** — Poprawki po próbnej prezentacji. Dark mode jeśli zostało czasu.

### Backend

1. **Swagger docs** — Opisy wszystkich endpointów, przykładowe request/response w FastAPI. /docs działa poprawnie.
2. **Edge cases** — Obsługa: brak danych analitycznych, usunięty nawyk z historią, zerowy streak, puste zakresy dat.
3. **Testy regresji** — Pełna runda pytest na produkcyjnym configu. Zero failing tests przed deployem.
4. **Bufor / rezerwa** — Bugfixy produkcyjne, logi na Railway, rate limiting jeśli potrzeba.

### Fullstack / DevOps

1. **Production deploy** — Deploy na Railway production. Migracje na produkcji, zmienne env, healthcheck.
2. **README finalny** — Instrukcja uruchomienia lokalnie, opis architektury, link do demo, screenshoty UI.
3. **Próbna prezentacja** — Organizacja próby: każdy opowiada swój fragment, max 10 min. Lista poprawek po próbie.
4. **Finalne slajdy** — Złożenie slajdów wszystkich osób w jedną prezentację. Próba demo flow na produkcji.

> **Próbna prezentacja (środek sprintu):** pełne demo jak na zaliczeniu — każdy opowiada swój fragment. Na podstawie próby: lista poprawek na ostatnie dni.

**Koniec sprintu:** aplikacja działa na produkcji, konto demo z danymi, dokumentacja i prezentacja gotowe.
