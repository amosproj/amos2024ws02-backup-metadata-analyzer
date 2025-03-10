import pandas as pd
from darts import TimeSeries
from sqlalchemy import create_engine
from metadata_analyzer.database import Database
from flask import jsonify
import numpy as np
from darts.ad import KMeansScorer
from darts.ad.detectors import QuantileDetector
import os


class Time_series_analyzer:
    df = ""
    threshold = ""
    training_series_start = 0
    training_series_end = 0
    clusters = 0
    temp_df = []

    def __init__(self, parameters):
        Time_series_analyzer.threshold = float(parameters[0])
        Time_series_analyzer.training_series_start = 0
        Time_series_analyzer.training_series_end = -1
        Time_series_analyzer.clusters = int(parameters[1])

    def preload_data(self, data):
        # read table into a dataframe
        df = pd.DataFrame([res.as_dict() for res in data])

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

        Time_series_analyzer.df = df

    def set_threshold(self, new_threshold):
        Time_series_analyzer.threshold = new_threshold
        return True

    def set_clusters(self, new_clusters):
        Time_series_analyzer.clusters = new_clusters
        return True

    def set_training_start(self, start):
        Time_series_analyzer.training_series_start = start
        return True

    def set_training_end(self, end):
        Time_series_analyzer.training_series_end = end
        return True

    def k_means_analyze(self, variable, task_id, frequency, backup_type, window_size):
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
        if working_df.empty:
            raise ValueError("Series had length 0 after applying specified parameters!")
        working_df = working_df.asfreq(frequency, method="ffill")
        # initializes time series
        series = TimeSeries.from_series(
            working_df, fill_missing_dates=False, freq=frequency
        )

        if len(series) == 0:
            raise ValueError("Series had length 0 after applying specified parameters!")

        Time_series_analyzer.temp_df = working_df

        # if no indices were manually set to override, some are generated that could be useful
        if Time_series_analyzer.training_series_end == -1:
            self.calc_training_indices()

        # trains series
        series_train = series[
            Time_series_analyzer.training_series_start : Time_series_analyzer.training_series_end
        ]

        # determines number of clusters for the k means scorer,
        # use clusters for more useful k value
        maxClusters = len(series_train)

        if Time_series_analyzer.clusters > maxClusters:
            raise ValueError(
                "Series had "
                + str(maxClusters)
                + " different samples, less than the number of clusters "
                + str(Time_series_analyzer.clusters)
            )

        # using basic k-means scorer (moving window comparison)
        Kmeans_scorer = KMeansScorer(
            k=Time_series_analyzer.clusters,
            window=int(window_size),
            component_wise=False,
        )
        Kmeans_scorer.fit(series_train)
        anomaly_score = Kmeans_scorer.score(series)

        # detects where anomalies lie, then return binary prediction
        detector = QuantileDetector(high_quantile=Time_series_analyzer.threshold)
        anomaly_pred = detector.fit_detect(series=anomaly_score)

        # TODO decide on interface to backend and return useful values in useful format
        anomaly_timestamps = []
        vals = anomaly_pred.all_values()
        # gets timestamps of anomalies
        for i in range(len(vals)):
            if vals[i] == 1.0:
                anomaly_timestamps.append(series.get_timestamp_at_point(i))

        return anomaly_timestamps

    def calc_training_indices(self):
        training_df = Time_series_analyzer.temp_df
        if "index" in training_df.columns:
            training_df = training_df.drop("index", axis=1)
        training_df.insert(0, "index", range(0, len(training_df)))

        # rough outlier removal
        training_df = training_df[
            training_df.iloc[:, 1].between(
                training_df.iloc[:, 1].quantile(0.1),
                training_df.iloc[:, 1].quantile(0.9),
            )
        ]

        # groups dataframe into groups with consecutive indices without gaps
        mask = training_df["index"].diff().gt(1)

        grouped = training_df.groupby(mask.cumsum())

        # gets the longest group, i.e. the longest range of consecutive values without outliers
        grp = max(grouped, key=lambda x: x[1].shape)
        grp = grp[1]  # gets series out of tuple

        Time_series_analyzer.training_series_start = int(grp.iloc[0]["index"])
        Time_series_analyzer.training_series_end = int(grp.iloc[len(grp) - 1]["index"])

    def task_preprocessing(backup_type, task_id, variable):
        # --------------- Task Specific Preprocessing ---------------#
        # TODO remove when other types are implemented
        if backup_type != "F":
            raise ValueError(
                "k means analysis for this backup type is not yet implemented"
            )

        working_df = Time_series_analyzer.df
        # removes backups of types that are not specified
        working_df = working_df[working_df.fdi_type == backup_type]
        # removes backups that do not have chosen task id
        working_df = working_df[working_df.task_uuid == task_id]
        # removes columns that are not relevant (only univariate analysis supported)
        working_df = working_df[["sbc_start", variable]]

        return working_df

    def get_task_ids(self):
        # gets all possible values for task_uuid
        task_ids = Time_series_analyzer.df["task_uuid"].unique()
        return dict(enumerate(task_ids.flatten(), 1))

    def get_frequencies(self, task_id, backup_type, variable):
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
