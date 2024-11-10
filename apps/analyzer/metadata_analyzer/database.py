import psycopg
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from models import BackupData
import os


class Database:
    def __init__(self):
        host = os.getenv("DATABASE_HOST")
        port = os.getenv("DATABASE_PORT")
        user  = os.getenv("DATABASE_USER")
        password = os.getenv("DATABASE_PASSWORD")
        database = os.getenv("DATABASE_DATABASE")
        url = f"postgresql+psycopg://{user}:{password}@{host}:{port}/{database}"
        self.engine = create_engine(url)

    def get_data(self):
        session = Session(self.engine)
        stmt = select(BackupData)

        result = session.scalars(stmt)
        return result


Database().get_data()
