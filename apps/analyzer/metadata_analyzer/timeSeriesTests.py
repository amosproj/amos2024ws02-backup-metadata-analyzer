import pandas as pd
from darts import TimeSeries
from sqlalchemy import create_engine
from metadata_analyzer.database import Database
from collections import Counter



# Create an engine using shared init
database = Database()

# read table into a dataframe
with database.engine.connect() as conn, conn.begin():
    data_frame = pd.read_sql_table("results", conn)

# preprocessing
# removes null values in sbc_start and is_backup
data_frame = data_frame[data_frame.sbc_start.notnull()]
data_frame = data_frame[data_frame.is_backup.notnull()]
# removes non-backups
data_frame = data_frame[data_frame.is_backup != 0]
# removes non-full backups (also removes copy backups in dataset for now)
# redo with only == 'F'
data_frame = data_frame[data_frame.fdi_type != 'D']
data_frame = data_frame[data_frame.fdi_type != 'I']
data_frame = data_frame[data_frame.fdi_type != 'C']
# remove entries that have the same sbc_start, necessary for indexing the time axis (could cause problems later)
data_frame = data_frame.drop_duplicates(subset=['sbc_start'])



series = TimeSeries.from_dataframe(data_frame, 'sbc_start', 'data_size',fill_missing_dates=True,freq='14s')
   