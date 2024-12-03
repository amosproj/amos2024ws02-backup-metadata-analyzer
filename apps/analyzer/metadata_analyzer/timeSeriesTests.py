import pandas as pd
from darts import TimeSeries
from sqlalchemy import create_engine
from metadata_analyzer.database import Database



# Create an engine using shared init
database = Database()

# read table into a dataframe
with database.engine.connect() as conn, conn.begin():
    data_frame = pd.read_sql_table("results", conn)

# preprocessing
# removes non-backups
data_frame.drop(data_frame[data_frame['is_backup'] == 0].index)
# removes non-full backups (also removes copy backups in dataset for now)
data_frame.drop(data_frame[data_frame['fdi_type'] == 'D'].index)
data_frame.drop(data_frame[data_frame['fdi_type'] == 'I'].index)
data_frame.drop(data_frame[data_frame['fdi_type'] == 'C'].index)

    
        
    

series = TimeSeries.from_dataframe(data_frame, 'sbc_start', 'data_size',fill_missing_dates=True,freq='None')
   