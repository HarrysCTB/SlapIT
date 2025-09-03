def test_get_profile_ok(client_ok):
    r = client_ok.get("/users/u")
    assert r.status_code == 200
    prof = r.json()
    assert prof["username"] == "foo"

def test_update_profile_ok(client_ok):
    body = {"auth_id":"u","username":"neo","avatar_url":None,"bio":"new"}
    r = client_ok.put("/users/u", json=body)
    assert r.status_code == 200
    prof = r.json()
    assert prof["username"] == "neo"
    assert prof["bio"] == "new"