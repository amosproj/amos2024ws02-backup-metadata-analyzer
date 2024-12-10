import pandas as pd
from darts import TimeSeries
from sqlalchemy import create_engine
from metadata_analyzer.database import Database
from flask import jsonify
import numpy as np
from darts.ad import KMeansScorer
from darts.ad.detectors import QuantileDetector


class Time_series_analyzer:
    df = ""

    def __init__(self):
        global df
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
        # remove entries that have the same sbc_start, necessary for indexing the time axis (could cause problems later)
        df = df.drop_duplicates(subset=["sbc_start"])
        # sorts dataframe by sbc_start
        df = df.sort_values("sbc_start")

    def k_means_analyze(variable, task_id, frequency, backup_type, window_size):
        working_df = Time_series_analyzer.task_preprocessing(
            backup_type, task_id, variable
        )

        working_df.index = working_df[
            "sbc_start"
        ]  # sets index to datetime in sbc_start column
        working_df = working_df.drop(
            "sbc_start", axis=1
        )  # removes column because values are now in index

        # interpolates series to emulate backups at regular intervals, different methods possible
        frequency = str(frequency) + "s"  # adds unit
        working_df = working_df.asfreq(frequency, method="ffill")
        # determines number of clusters for the k means scorer,
        # TODO use clusters for more useful k value
        clusters = len(df[variable].unique())
        # initializes time series
        series = TimeSeries.from_series(
            working_df, fill_missing_dates=False, freq=frequency
        )

        if len(series) == 0:
            raise ValueError("Series had length 0 after applying specified parameters!")

        # TODO interim definition of training data, change to something more useful
        series_train = series[: round(len(series) / 4)]

        # using basic k-means scorer (moving window comparison)
        Kmeans_scorer = KMeansScorer(k=5, window=int(window_size), component_wise=False)
        Kmeans_scorer.fit(series_train)
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

        return anomaly_timestamps

    def task_preprocessing(backup_type, task_id, variable):
        global df

        # --------------- Task Specific Preprocessing ---------------#
        # TODO remove when other types are implemented
        if backup_type != "F":
            raise ValueError(
                "k means analysis for this backup type is not yet implemented"
            )

        working_df = df
        # removes backups of types that are not specified
        working_df = working_df[working_df.fdi_type == backup_type]
        # removes backups that do not have chosen task id
        working_df = working_df[working_df.task_uuid == task_id]
        # removes columns that are not relevant (only univariate analysis supported)
        working_df = working_df[["sbc_start", variable]]

        return working_df

    def get_task_ids():
        global df
        # gets all possible values for task_uuid
        task_ids = df["task_uuid"].unique()
        return dict(enumerate(task_ids.flatten(), 1))

    def get_frequencies(task_id, backup_type, variable):
        working_df = Time_series_analyzer.task_preprocessing(
            backup_type, task_id, variable
        )
        freqs = working_df[["sbc_start"]]

        # gets backup frequencies present in dataset
        freqs = freqs.diff()["sbc_start"]
        # orders frequencies by count and removes NaN edge cases
        freqs = freqs.value_counts()
        freqs = freqs[freqs.notnull()]
        freqs = freqs.reset_index()  # resetting index back into dataframe

        # converts into returnable format
        freqs["sbc_start"] = freqs["sbc_start"].dt.total_seconds()

        return freqs.to_dict()
