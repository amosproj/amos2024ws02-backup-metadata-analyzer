import pandas as pd
from darts import TimeSeries
from sqlalchemy import create_engine
from metadata_analyzer.database import Database
from collections import Counter



# Create an engine using shared init
database = Database()

# read table into a dataframe
with database.engine.connect() as conn, conn.begin():
    df = pd.read_sql_table("results", conn)

# preprocessing
# removes null values in sbc_start and is_backup
df = df[df.sbc_start.notnull()]
df = df[df.is_backup.notnull()]
# removes non-backups
df = df[df.is_backup != 0]
# removes non-full backups (also removes copy backups in dataset for now)
# redo with only == 'F'
df = df[df.fdi_type != 'D']
df = df[df.fdi_type != 'I']
df = df[df.fdi_type != 'C']
# remove entries that have the same sbc_start, necessary for indexing the time axis (could cause problems later)
df = df.drop_duplicates(subset=['sbc_start'])




series = TimeSeries.from_dataframe(df, 'sbc_start', 'data_size',fill_missing_dates=True,freq='D')
   