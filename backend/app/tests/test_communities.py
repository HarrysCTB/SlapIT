from uuid import UUID

def test_join_community_ok(client_ok):
    cid = "cbddd46b-619c-4a3d-ab83-5888fe9bc21e"
    body = {"user_id":"7660c4d7-a3af-47b2-a9d0-b37c72643324"}
    r = client_ok.post(f"/communities/{cid}/join", json=body)
    assert r.status_code == 200
    assert r.json()["ok"] is True