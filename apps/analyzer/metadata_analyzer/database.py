import pg8000.dbapi
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from metadata_analyzer.models import BackupData
import os


""" class Database:
    def __init__(self):
        host = str(os.getenv("DATABASE_HOST") or "localhost")
        port = int(os.getenv("DATABASE_PORT") or 5000)
        user  = str(os.getenv("DATABASE_USER") or "postgres")
        password = str(os.getenv("DATABASE_PASSWORD") or "postgres")
        database = str(os.getenv("DATABASE_DATABASE") or "database")
        
        #url = f"postgresql+psycopg://{user}:{password}@{host}:{port}/{database}"
        print("BUILT THIS URL")
        print("postgresql+pg8000://"+user+":"+password+"@"+host+":"+str(port)+"/"+database)
        url = "postgresql+pg8000://"+user+":"+password+"@"+host+":"+str(port)+"/"+database
        self.engine = create_engine("postgresql+pg8000://"+user+":"+password+"@"+host+"/"+database,client_encoding='utf8')
        """
class Database:
    def __init__(self):
        self.engine = create_engine("postgresql+pg8000://postgres:postgres@localhost:5432/postgres")
        

def get_data(self):
    session = Session(self.engine)
    stmt = select(BackupData)

    result = session.scalars(stmt)
    return result


#Database().get_data()
