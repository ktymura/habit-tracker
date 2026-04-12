# Habit Tracker - Analiza wymagań danych i ERD

## Encje

### users
Reprezentuje zarejestrowanego użytkownika aplikacji. Każdy użytkownik ma swój niezależny zestaw nawyków.

### habits
Nawyk należący do konkretnego użytkownika. Może być dzienny lub o innej częstotliwości. Zawiera metadane wizualne (kolor, ikona) używane przez frontend.

### entries
Pojedynczy wpis potwierdzający wykonanie nawyku w danym dniu. Unikalność pary `(habit_id, entry_date)` zapobiega dwukrotnemu zaliczeniu tego samego nawyku w tym samym dniu.

---

## Relacje

- `users` -> `habits`: jeden użytkownik ma wiele nawyków (1:N), usunięcie użytkownika kaskadowo usuwa jego nawyki
- `habits` -> `entries`: jeden nawyk ma wiele wpisów (1:N), usunięcie nawyku kaskadowo usuwa jego wpisy
- `users` -> `entries`: pośrednia relacja przez `habits` - wpisy nie mają bezpośredniego `user_id`

---

## Diagram ERD

```mermaid
erDiagram
    users {
        int id PK
        varchar(255) email UK "NOT NULL, INDEX"
        varchar(255) password_hash "NOT NULL"
        timestamptz created_at "NOT NULL, DEFAULT now()"
    }

    habits {
        int id PK
        int user_id FK "NOT NULL, INDEX"
        varchar(150) name "NOT NULL"
        varchar(50) color
        varchar(50) icon
        varchar(50) frequency "NOT NULL, DEFAULT 'daily'"
        timestamptz created_at "NOT NULL, DEFAULT now()"
    }

    entries {
        int id PK
        int habit_id FK "NOT NULL, INDEX"
        date entry_date "NOT NULL"
        timestamptz created_at "NOT NULL, DEFAULT now()"
    }

    users ||--o{ habits : "posiada"
    habits ||--o{ entries : "posiada"
```

---

## Ograniczenia i indeksy

| Tabela | Ograniczenie | Szczegóły |
|--------|-------------|-----------|
| `users` | `UNIQUE` | `email` |
| `users` | `INDEX` | `email` |
| `habits` | `INDEX` | `user_id` |
| `entries` | `UNIQUE` | `(habit_id, entry_date)` - jeden wpis na nawyk na dzień |
| `entries` | `INDEX` | `habit_id` |

---

## Uwagi do implementacji

- `frequency` w tabeli `habits` to `varchar(50)` bez ograniczenia `CHECK` na poziomie bazy - dopuszczalne wartości (`daily`, `weekly` itp.) są walidowane przez Pydantic w warstwie API
- Klucze obce mają `ON DELETE CASCADE` - usunięcie użytkownika usuwa jego nawyki i wpisy
- Timestampy używają `timezone=True` (`timestamptz` w PostgreSQL)
- Brak kolumny `user_id` w `entries` - dostęp do właściciela wpisu odbywa się przez `entry.habit.user`
