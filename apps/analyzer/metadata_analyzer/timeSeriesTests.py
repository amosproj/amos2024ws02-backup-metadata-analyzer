# %%
import pandas as pd
from darts import TimeSeries
from darts.ad import (
    KMeansScorer,
)
from darts.ad.detectors import QuantileDetector
from sqlalchemy import create_engine
from metadata_analyzer.database import Database
from flask import jsonify


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
# gets all possible values for task_uuid and data_size (debugging utility)
task_ids = df["task_uuid"].unique()
sizes = df["data_size"].unique()

# --------------- Task Specific Preprocessing ---------------#
# removes backups that do not have chosen task id; current task has frequency of 86401s
df = df[df.task_uuid == task_ids[6]]

# removes columns that are not relevant (change for other analyses)
df = df[["sbc_start", "data_size"]]

# init if utility variable for looking at frequencies
freqs = df.sort_values("sbc_start")
# frequencies present in dataset
freqs = df.diff()["sbc_start"]
freqs = freqs.value_counts()
freqs = freqs[freqs.notnull()]

df.index = df["sbc_start"]  # sets index to datetime in sbc_start column
df = df.drop("sbc_start", axis=1)  # removes column because values are now in index

# interpolates series to emulate backups at regular intervals, different methods possible
df = df.asfreq("86401s", method="ffill")
# df.plot()

# utility variable for sizes after reduced to one task
sizes = df["data_size"].unique()
clusters = len(sizes)

# init actual series
series = TimeSeries.from_series(df, fill_missing_dates=False, freq="86401s")

# interim definition of training data, change to something more useful
series_train = series[:100]

# using basic k-means scorer (moving window comparison)
Kmeans_scorer = KMeansScorer(k=2, window=1, component_wise=False)
Kmeans_scorer.fit(series_train)
# computed anomaly scores
anomaly_score = Kmeans_scorer.score(series)

# detects where anomalies lie, then return binary prediction
threshold = 0.95
detector = QuantileDetector(high_quantile=threshold)
anomaly_pred = detector.fit_detect(series=anomaly_score)

# TODO decide on interface to backend and return useful values in useful format
anomaly_timestamps = []
vals = anomaly_pred.all_values()
# gets timestamps of anomalies
for i in range(len(vals)):
    if vals[i] == 1.0:
        anomaly_timestamps.append(series.get_timestamp_at_point(i))
print("timestamps of detected anomalies:")
print(anomaly_timestamps)


# %%
