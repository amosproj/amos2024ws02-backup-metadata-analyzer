import pandas as pd
from darts import TimeSeries
from sqlalchemy import create_engine
from metadata_analyzer.database import Database
from flask import jsonify


class Time_series_analyzer:
    df = ""

    def init(self):
        # Create an engine using shared init
        database = Database()

        # read table into a dataframe
        with database.engine.connect() as conn, conn.begin():
            df = pd.read_sql_table("results", conn)

        # --------------- General Preprocessing ---------------
        # removes null values in sbc_start, task_uuid and is_backup
        df = df[df.sbc_start.notnull()]
        df = df[df.is_backup.notnull()]
        df = df[df.task_uuid.notnull()]
        df = df[df.data_size.notnull()]
        # removes non-backups
        df = df[df.is_backup != 0]
        # removes backups with size of 0.0
        df = df[df.data_size != 0.0]
        # removes non-full backups (also removes copy backups in dataset for now)
        df = df[df.fdi_type == "F"]
        # remove entries that have the same sbc_start, necessary for indexing the time axis (could cause problems later)
        df = df.drop_duplicates(subset=["sbc_start"])
        # sorts dataframe by sbc_start
        df = df.sort_values("sbc_start")

    def analyze_basic(self):
        # Time series analysis here
        return -1

    def get_task_ids(self):
        # gets all possible values for task_uuid
        task_ids = self.df["task_uuid"].unique()
        return jsonify(task_ids.to_dict())

    def get_frequencies(self):
        # gets backup frequencies present in dataset
        freqs = self.df.diff()["sbc_start"]
        # orders frequencies by count and removes NaN edge cases
        freqs = freqs.value_counts()
        freqs = freqs[freqs.notnull()]
        return jsonify(freqs.to_dict())
