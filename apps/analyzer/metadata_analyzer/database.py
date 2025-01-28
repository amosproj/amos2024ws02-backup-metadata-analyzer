import datetime
import os

from sqlalchemy import create_engine, select, distinct
from sqlalchemy.orm import Session

from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.models import (
    Result,
    Tasks,
    DataStore,
    Schedule,
    TaskEvent,
    ResultLabel,
)
from metadata_analyzer.simple_rule_based_analyzer import SimpleRuleBasedAnalyzer


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

    def get_results(self, latest_backup_date=None):
        session = Session(self.engine)
        stmt = select(Result)
        # Select all results since the latest backup date
        if latest_backup_date is not None:
            timestamp = datetime.datetime.strptime(
                latest_backup_date, "%Y-%m-%dT%H:%M:%S.%fZ"
            )
            stmt = select(Result).where(Result.start_time > timestamp)
        else:
            stmt = select(Result).where(Result.start_time > datetime.datetime.min)

        results = session.scalars(stmt)

        return results

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

    def get_result_labels(self):
        session = Session(self.engine)
        stmt = select(ResultLabel)

        labels = session.scalars(stmt)
        return labels
    
    def get_labeled_data_store(self):
        session = Session(self.engine)
        stmt = select(DataStore.name,DataStore.high_water_mark,DataStore.capacity,DataStore.filled,DataStore.uuid, ResultLabel.saveset).select_from(DataStore).join(ResultLabel, DataStore.name == ResultLabel.pool) 
        joined = session.execute(stmt).mappings().all()
        return joined