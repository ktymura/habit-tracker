def _auth_headers(client, email: str, password: str = "secret123") -> dict[str, str]:
    client.post("/auth/register", json={"email": email, "password": password})
    response = client.post("/auth/login", json={"email": email, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_habit_returns_201_with_payload(client):
    headers = _auth_headers(client, "creator@example.com")

    response = client.post(
        "/habits",
        json={
            "name": "Read 30 min",
            "color": "#ff8800",
            "icon": "book",
            "frequency": "daily",
        },
        headers=headers,
    )

    assert response.status_code == 201
    body = response.json()
    assert isinstance(body["id"], int)
    assert isinstance(body["user_id"], int)
    assert body["name"] == "Read 30 min"
    assert body["color"] == "#ff8800"
    assert body["icon"] == "book"
    assert body["frequency"] == "daily"
    assert "created_at" in body


def test_update_habit_returns_200_with_changed_fields(client):
    headers = _auth_headers(client, "editor@example.com")
    created = client.post(
        "/habits",
        json={"name": "Old name", "color": "#000000", "frequency": "daily"},
        headers=headers,
    ).json()

    response = client.put(
        f"/habits/{created['id']}",
        json={"name": "New name", "frequency": "weekly"},
        headers=headers,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == created["id"]
    assert body["name"] == "New name"
    assert body["frequency"] == "weekly"
    assert body["color"] == "#000000"


def test_delete_habit_returns_204_and_removes_it(client):
    headers = _auth_headers(client, "remover@example.com")
    created = client.post(
        "/habits",
        json={"name": "To remove"},
        headers=headers,
    ).json()

    delete_response = client.delete(f"/habits/{created['id']}", headers=headers)
    assert delete_response.status_code == 204

    list_response = client.get("/habits", headers=headers)
    assert list_response.status_code == 200
    assert all(habit["id"] != created["id"] for habit in list_response.json())


def test_users_are_isolated_from_each_others_habits(client):
    alice = _auth_headers(client, "alice@example.com")
    bob = _auth_headers(client, "bob@example.com")

    alice_habit = client.post(
        "/habits",
        json={"name": "Alice secret habit"},
        headers=alice,
    ).json()

    bob_list = client.get("/habits", headers=bob)
    assert bob_list.status_code == 200
    assert all(habit["id"] != alice_habit["id"] for habit in bob_list.json())

    bob_update = client.put(
        f"/habits/{alice_habit['id']}",
        json={"name": "Hijacked"},
        headers=bob,
    )
    assert bob_update.status_code == 404

    bob_delete = client.delete(f"/habits/{alice_habit['id']}", headers=bob)
    assert bob_delete.status_code == 404

    alice_list = client.get("/habits", headers=alice)
    assert any(
        habit["id"] == alice_habit["id"] and habit["name"] == "Alice secret habit"
        for habit in alice_list.json()
    )
