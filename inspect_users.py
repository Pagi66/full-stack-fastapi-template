import os
import sys
import pathlib
from sqlmodel import Session, select

os.environ.setdefault('PROJECT_NAME', 'Apex')
os.environ.setdefault('POSTGRES_SERVER', 'localhost')
os.environ.setdefault('POSTGRES_PORT', '5432')
os.environ.setdefault('POSTGRES_DB', 'app')
os.environ.setdefault('POSTGRES_USER', 'pagi_66')
os.environ.setdefault('POSTGRES_PASSWORD', 'Konohamaru10')
os.environ.setdefault('FIRST_SUPERUSER', 'illmindofbennyj@gmail.com')
os.environ.setdefault('FIRST_SUPERUSER_PASSWORD', 'Konohamaru10')
os.environ.setdefault('SECRET_KEY', 'test-secret-key')
os.environ.setdefault('REFRESH_SECRET', 'test-refresh')
os.environ.setdefault('ACCESS_TOKEN_EXPIRE_MINUTES', '15')
os.environ.setdefault('REFRESH_TOKEN_EXPIRE_DAYS', '7')
os.environ.setdefault('EMAIL_RESET_TOKEN_EXPIRE_HOURS', '1')

sys.path.append(str(pathlib.Path('backend').resolve()))

from app.core.db import engine
from app.models import User

with Session(engine) as session:
    users = session.exec(select(User)).all()
    print('users count', len(users))
    for u in users:
        print(u.email, u.role, u.is_active)
