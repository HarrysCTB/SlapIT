import pytest
from fastapi.testclient import TestClient
from postgrest.exceptions import APIError

from app.main import app           # ton FastAPI()
from app.core.database import get_db

# --- fakes minimalistes ---
class FakeResp:
    def __init__(self, data=None, status_code=200):
        self.data = data
        self.status_code = status_code

class FakeTable:
    def __init__(self, name, fake):
        self.name = name
        self.fake = fake
        self._ops = []

    # chain builders
    def select(self, *_a, **_k): self._ops.append(("select", _a, _k)); return self
    def insert(self, payload):   self._ops.append(("insert", payload));  return self
    def update(self, payload):   self._ops.append(("update", payload));  return self
    def delete(self):            self._ops.append(("delete",));          return self
    def eq(self, k, v):          self._ops.append(("eq", k, v));         return self
    def order(self, *a, **k):    self._ops.append(("order", a, k));      return self
    def range(self, *a):         self._ops.append(("range", a));         return self
    def single(self):            self._ops.append(("single",));          return self

    def execute(self):
        # route simple selon la table + op
        return self.fake.handle(self.name, self._ops)

class FakeSupabase:
    def __init__(self, script=None):
        # script : fonction (table_name, ops) -> FakeResp ou raise
        self.script = script or (lambda t, ops: FakeResp([]))

    def table(self, name):
        return FakeTable(name, self)

    # storage ou autres si besoin:
    @property
    def storage(self):  # pas utilisé ici, mais tu peux étendre
        raise NotImplementedError

    # router d’exécution
    def handle(self, table, ops):
        return self.script(table, ops)

@pytest.fixture
def client_ok(monkeypatch):
    # script par défaut: renvoie qqch de plausible
    def script(table, ops):
        # Exemple: insert dans stickers → OK
        if table == "stickers":
            if any(op[0] == "insert" for op in ops):
                return FakeResp([{"id": "fixed-id"}])
            if any(op[0] == "select" for op in ops):
                return FakeResp([{
                    "id": "s1","title":"t","description":"d","image_url":"u",
                    "lat": 1.0, "long": 2.0, "community_id": "c", "auth_id":"a",
                    "created_at":"2025-01-01T00:00:00Z"
                }])
        if table == "profiles":
            if any(op[0]=="select" and ("single",) in ops for op in [ops]):
                return FakeResp({"auth_id":"u","username":"foo","bio":"bar","avatar_url":None})
            if any(op[0]=="update" for op in ops):
                # retourne la ligne mise à jour
                payload = [op[1] for op in ops if op[0]=="update"][0]
                return FakeResp([{"auth_id":"u", **payload}])
        if table == "user_communities":
            if any(op[0]=="insert" for op in ops):
                return FakeResp([{"ok": True}])
        if table == "communities":
            if any(op[0]=="select" for op in ops):
                return FakeResp([{"id":"c"}])
        return FakeResp([])

    fake = FakeSupabase(script=script)

    def override_get_db():
        return fake

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture
def client_fk_error(monkeypatch):
    def script(table, ops):
        from postgrest.exceptions import APIError
        if table == "stickers" and any(op[0]=="insert" for op in ops):
            raise APIError({"message": "FK violation"})
        return FakeResp([])
    fake = FakeSupabase(script=script)

    def override_get_db():
        return fake

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()