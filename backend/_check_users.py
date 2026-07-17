import sqlite3
db = sqlite3.connect("prototypebd.db")
try:
    rows = db.execute("SELECT id, email, first_name, role, is_active FROM users").fetchall()
    print("users count:", len(rows))
    for r in rows:
        print(r)
except Exception as e:
    print("error:", e)
    tables = [t[0] for t in db.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    print("tables:", tables)
