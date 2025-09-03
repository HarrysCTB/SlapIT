def test_add_sticker_ok(client_ok):
    payload = {
        "community_id":"cbddd46b-619c-4a3d-ab83-5888fe9bc21e",
        "title":"Test",
        "description":"depuis tests",
        "image_url":"https://x/y.jpg",
        "long":2.3,
        "lat":48.8,
        "auth_id":"7660c4d7-a3af-47b2-a9d0-b37c72643324"
    }
    r = client_ok.post("/stickers/", json=payload)
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert "id" in body

def test_add_sticker_missing_comm(client_ok):
    payload = {
        "community_id":"",
        "title":"t","description":"d","image_url":"u","long":1,"lat":2,
        "auth_id":"7660c4d7-a3af-47b2-a9d0-b37c72643324"
    }
    r = client_ok.post("/stickers/", json=payload)
    assert r.status_code in (400,422)

def test_add_sticker_fk_error(client_fk_error):
    payload = {
        "community_id":"cbddd46b-619c-4a3d-ab83-5888fe9bc21e",
        "title":"t","description":"d","image_url":"u","long":1,"lat":2,
        "auth_id":"7660c4d7-a3af-47b2-a9d0-b37c72643324"
    }
    r = client_fk_error.post("/stickers/", json=payload)
    assert r.status_code == 400
    assert "FK" in r.text or "Insert failed" in r.text

def test_get_user_stickers(client_ok):
    r = client_ok.get("/users/7660c4d7-a3af-47b2-a9d0-b37c72643324/stickers")
    assert r.status_code == 200
    arr = r.json()
    assert isinstance(arr, list)
    assert arr and "id" in arr[0]