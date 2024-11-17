import pg8000.dbapi
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from metadata_analyzer.models import BackupData, Result
import os


class Database:
    def __init__(self):
        self.engine = create_engine("postgresql+pg8000://postgres:postgres@localhost:5432/postgres")
        

def get_data(self):
    session = Session(self.engine)
    stmt = select(BackupData)

    result = session.scalars(stmt)
    return result

def get_results(self):
    session = Session(self.engine)
    stmt = select(Result)

    result = session.scalars(stmt)
    return result
