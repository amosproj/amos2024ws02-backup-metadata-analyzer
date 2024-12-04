import pandas as pd
from darts import TimeSeries
from sqlalchemy import create_engine
from metadata_analyzer.database import Database


# Create an engine using shared init
database = Database()

# read table into a dataframe
with database.engine.connect() as conn, conn.begin():
    df = pd.read_sql_table("results", conn)

#--------------- General Preprocessing ---------------
# removes null values in sbc_start, task_uuid and is_backup
df = df[df.sbc_start.notnull()]
df = df[df.is_backup.notnull()]
df = df[df.task_uuid.notnull()]
# removes non-backups
df = df[df.is_backup != 0]
#removes backups with size of 0.0
df = df[df.data_size != 0.0]
# removes non-full backups (also removes copy backups in dataset for now)
df = df[df.fdi_type == 'F']
# remove entries that have the same sbc_start, necessary for indexing the time axis (could cause problems later)
df = df.drop_duplicates(subset=['sbc_start'])
# sorts dataframe by sbc_start
df = df.sort_values('sbc_start')
# gets all possible values for task_uuid
task_ids = df['task_uuid'].unique()

#--------------- Task Specific Preprocessing ---------------#
# removes backups that do not have chosen task id; current task has frequency of 86402s
df = df[df.task_uuid == task_ids[0]]
# removes columns that are not relevant (change for other analyses)
df = df[['sbc_start','data_size']]

df.index = df['sbc_start'] # sets index to datetime in sbc_start column
df = df.drop('sbc_start',axis=1) # removes column because values are now in index

# interpolates series to emulate backups at regular intervals, different methods possible
df = df.asfreq('86402s', method='ffill')


series = TimeSeries.from_series(df,fill_missing_dates=False,freq='86402s')
