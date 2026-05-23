from datetime import date, timedelta


def _auth_headers(client, email: str, password: str = "secret123") -> dict[str, str]:
    client.post("/auth/register", json={"email": email, "password": password})
    response = client.post("/auth/login", json={"email": email, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create_habit(client, headers: dict[str, str], name: str = "Read") -> dict:
    return client.post("/habits", json={"name": name}, headers=headers).json()


def _add_entry(
    client, headers: dict[str, str], habit_id: int, entry_date: date
) -> None:
    response = client.post(
        f"/habits/{habit_id}/entries",
        json={"entry_date": entry_date.isoformat()},
        headers=headers,
    )
    assert response.status_code == 201, response.text


def test_heatmap_returns_365_zero_days_for_user_without_entries(client):
    headers = _auth_headers(client, "empty@example.com")

    response = client.get("/analytics/heatmap", headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 365
    assert all(day["count"] == 0 for day in body)
    assert body[-1]["date"] == date.today().isoformat()


def test_heatmap_counts_entries_per_date(client):
    headers = _auth_headers(client, "heatmap@example.com")
    habit = _create_habit(client, headers, "Read")
    today = date.today()
    yesterday = today - timedelta(days=1)
    _add_entry(client, headers, habit["id"], today)
    _add_entry(client, headers, habit["id"], yesterday)

    response = client.get("/analytics/heatmap", headers=headers)

    assert response.status_code == 200
    counts_by_date = {day["date"]: day["count"] for day in response.json()}
    assert counts_by_date[today.isoformat()] == 1
    assert counts_by_date[yesterday.isoformat()] == 1
    other_days = [
        count
        for day_date, count in counts_by_date.items()
        if day_date not in {today.isoformat(), yesterday.isoformat()}
    ]
    assert sum(other_days) == 0


def test_streaks_reflect_consecutive_entries(client):
    headers = _auth_headers(client, "streaks@example.com")
    habit = _create_habit(client, headers, "Meditate")
    today = date.today()
    for offset in range(3):
        _add_entry(client, headers, habit["id"], today - timedelta(days=offset))

    response = client.get("/analytics/streaks", headers=headers)

    assert response.status_code == 200
    streaks = response.json()["habits"]
    assert len(streaks) == 1
    assert streaks[0]["habit_id"] == habit["id"]
    assert streaks[0]["habit_name"] == "Meditate"
    assert streaks[0]["current_streak"] == 3
    assert streaks[0]["longest_streak"] == 3


def test_summary_returns_entry_aggregates_per_habit(client):
    headers = _auth_headers(client, "summary@example.com")
    habit = _create_habit(client, headers, "Workout")
    today = date.today()
    for offset in range(5):
        _add_entry(client, headers, habit["id"], today - timedelta(days=offset))

    response = client.get("/analytics/summary", headers=headers)

    assert response.status_code == 200
    summary = response.json()
    assert len(summary) == 1
    item = summary[0]
    assert item["habit_id"] == habit["id"]
    assert item["habit_name"] == "Workout"
    assert item["total_entries"] == 5
    assert item["weekly_completion_rate"] == round(5 / 7, 2)
    assert item["monthly_completion_rate"] == round(5 / 30, 2)
