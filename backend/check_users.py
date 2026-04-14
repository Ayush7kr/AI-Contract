from app.core.database import engine
from sqlalchemy import text
from app.models.user import User

with engine.connect() as conn:
    try:
        result = conn.execute(text('SELECT email FROM users'))
        users = result.fetchall()
        print(f"Users found: {len(users)}")
        for u in users:
            print(f" - {u[0]}")
    except Exception as e:
        print(f"Error: {e}")
