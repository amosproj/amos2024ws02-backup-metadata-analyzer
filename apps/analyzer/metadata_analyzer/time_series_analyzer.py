import pandas as pd
from darts import TimeSeries
from sqlalchemy import create_engine
from metadata_analyzer.database import Database


class Time_series_analyzer:

    def init():
        # Create an engine using shared init
        database = Database()

        # read table into a dataframe
        with database.engine.connect() as conn, conn.begin():
            df = pd.read_sql_table("results", conn)

        # do preprocessing 
    
    def analyze_basic():
        # Time series analysis here
        return -1