# Habit Tracker - backend
Aby odpalić backend lokalnie należy użyć komend:
```
.venv\Scripts\activate
python -m uvicorn app.main:app --reload
```

## Model danych

```mermaid
erDiagram
    users {
        int id PK
        string email
        string password_hash
        timestamp created_at
    }
    habits {
        int id PK
        int user_id FK
        string name
        string color
        string icon
        string frequency
        timestamp created_at
    }
    entries {
        int id PK
        int habit_id FK
        date entry_date
        timestamp created_at
    }
    notification_settings {
        int id PK
        int user_id FK
        bool enabled
        time reminder_time
        timestamp created_at
        timestamp updated_at
    }

    users ||--o{ habits : "posiada"
    habits ||--o{ entries : "ma wpisy"
    users ||--o| notification_settings : "konfiguruje"
```


### Tabele

| Tabela | Rola |
|--------|------|
| `users` | Konta użytkowników. Hasła przechowywane jako hash bcrypt. |
| `habits` | Nawyki należące do użytkownika. Kolor i ikona służą prezentacji w UI. Pole `frequency` rezerwuje możliwość nawyków tygodniowych (obecnie zawsze `daily`). |
| `entries` | Pojedynczy wpis = wykonanie nawyku w danym dniu. Unikalny constraint `(habit_id, entry_date)` zapobiega duplikatom. |
| `notification_settings` | Relacja 1:1 z `users`. Przechowuje preferencje przypomnień — wyodrębniona osobno, żeby nie rozrastać tabeli users. |

### Widoki i materialized views

| Obiekt | Typ | Rola |
|--------|-----|------|
| `daily_completion_rate` | VIEW | Liczba wykonań nawyku per dzień — używana przez endpoint analityczny. |
| `weekly_completion_rate` | VIEW | Tygodniowy % ukończenia per nawyk (zakłada 7-dniowy tydzień). |
| `user_heatmap_mv` | MATERIALIZED VIEW | Agregat `(user_id, date, count)` dla heatmapy. Odświeżany po zapisie wpisu — eliminuje kosztowne GROUP BY w czasie żądania. |