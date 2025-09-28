import sys
import pathlib
import os

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

from sqlmodel import Session, select
from app.core.db import engine
from app.models import User

with Session(engine) as session:
    user = session.exec(select(User).where(User.email == 'testadmin@apex.com')).first()
    if user:
        print('hash:', user.hashed_password)
    else:
        print('user not found')
