from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from metadata_analyzer.models import BackupData, Result, Tasks, DataStore, Schedule, TaskEvent
import os


class Database:
    def __init__(self):
        db_user = os.getenv("DATABASE_USER") or "postgres"
        db_port = os.getenv("DATABASE_PORT") or "5432"
        db_password = os.getenv("DATABASE_PASSWORD") or "postgres"
        db_host = os.getenv("DATABASE_HOST") or "localhost"
        db_name = os.getenv("DATABASE_DATABASE") or "postgres"
        self.engine = create_engine(
            "postgresql+pg8000://"
            + db_user
            + ":"
            + db_password
            + "@"
            + db_host
            + ":"
            + db_port
            + "/"
            + db_name
        )


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

    def get_tasks(self):
        session = Session(self.engine)
        stmt = select(Tasks)

        result = session.scalars(stmt)
        return result

    def get_data_stores(self):
        session = Session(self.engine)
        stmt = select(DataStore)

        result = session.scalars(stmt)
        return result

    def get_schedules(self):
        session = Session(self.engine)
        stmt = select(Schedule)

        result = session.scalars(stmt)
        return result

    def get_task_events(self):
        session = Session(self.engine)
        stmt = select(TaskEvent)

        result = session.scalars(stmt)
        return result
