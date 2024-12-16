from datetime import datetime

from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.models import Result
from metadata_analyzer.time_series_analyzer import Time_series_analyzer
from tests.mock_backend import MockBackend
from tests.mock_database import MockDatabase
import pytest
import pandas as pd


class Test_time_series_analyzer:

    def _create_mock_result(
        self, task, uuid, fdi_type, data_size, sbc_start, task_uuid, is_backup
    ):
        mock_result = Result()
        mock_result.task = task
        mock_result.uuid = uuid
        mock_result.fdi_type = fdi_type
        mock_result.data_size = data_size
        mock_result.sbc_start = sbc_start
        mock_result.task_uuid = task_uuid
        mock_result.is_backup = is_backup
        return mock_result

    def test_k_means_analyze_empty(self):
        mock_result1 = self._create_mock_result(
            "foo", "1", "F", 100_000_000, pd.Timestamp("2000-01-01T12"), "234", "1"
        )
        mock_result2 = self._create_mock_result(
            "foo", "2", "F", 121_000_000, pd.Timestamp("2000-01-02T12"), "234", "2"
        )
        mock_result3 = self._create_mock_result(
            "bar", "1", "F", 200_000_000, pd.Timestamp("2000-01-03T12"), "345", "3"
        )
        mock_result4 = self._create_mock_result(
            "bar", "2", "F", 300_000_000, pd.Timestamp("2000-01-04T12"), "345", "4"
        )

        variable = "data_size"
        task_id = "1234"
        frequency = "86400"
        backup_type = "F"
        window_size = 1

        backend = MockBackend()
        database = MockDatabase(
            [mock_result1, mock_result2, mock_result3, mock_result4]
        )
        time_series_analyzer = Time_series_analyzer([0.95, 5])
        Analyzer.init(database, backend, None, None, time_series_analyzer)
        Analyzer.load_time_series_data()

        with pytest.raises(ValueError) as valErr:
            Analyzer.simple_time_series_analysis(
                variable, task_id, frequency, backup_type, window_size
            )

    def test_k_means_analyze_no_anomaly(self):
        mock_result1 = self._create_mock_result(
            "foo", "1", "F", 100_000_000, pd.Timestamp("2000-01-01T12"), "234", "1"
        )
        mock_result2 = self._create_mock_result(
            "foo", "2", "F", 121_000_000, pd.Timestamp("2000-01-02T12"), "234", "1"
        )
        mock_result3 = self._create_mock_result(
            "bar", "3", "F", 200_000_000, pd.Timestamp("2000-01-03T12"), "234", "1"
        )
        mock_result4 = self._create_mock_result(
            "bar", "4", "F", 150_000_000, pd.Timestamp("2000-01-04T12"), "234", "1"
        )
        mock_result5 = self._create_mock_result(
            "foo", "5", "F", 100_000_000, pd.Timestamp("2000-01-05T12"), "234", "1"
        )
        mock_result6 = self._create_mock_result(
            "foo", "6", "F", 121_000_000, pd.Timestamp("2000-01-06T12"), "234", "1"
        )
        mock_result7 = self._create_mock_result(
            "bar", "7", "F", 200_000_000, pd.Timestamp("2000-01-07T12"), "234", "1"
        )
        mock_result8 = self._create_mock_result(
            "bar", "8", "F", 150_000_000, pd.Timestamp("2000-01-08T12"), "234", "1"
        )
        mock_result9 = self._create_mock_result(
            "foo", "9", "F", 100_000_000, pd.Timestamp("2000-01-09T12"), "234", "1"
        )
        mock_result10 = self._create_mock_result(
            "foo", "10", "F", 121_000_000, pd.Timestamp("2000-01-10T12"), "234", "1"
        )
        mock_result11 = self._create_mock_result(
            "bar", "11", "F", 200_000_000, pd.Timestamp("2000-01-11T12"), "234", "1"
        )
        mock_result12 = self._create_mock_result(
            "bar", "12", "F", 150_000_000, pd.Timestamp("2000-01-12T12"), "234", "1"
        )
        mock_result13 = self._create_mock_result(
            "foo", "13", "F", 100_000_000, pd.Timestamp("2000-01-13T12"), "234", "1"
        )
        mock_result14 = self._create_mock_result(
            "foo", "14", "F", 121_000_000, pd.Timestamp("2000-01-14T12"), "234", "1"
        )
        mock_result15 = self._create_mock_result(
            "bar", "15", "F", 200_000_000, pd.Timestamp("2000-01-15T12"), "234", "1"
        )
        mock_result16 = self._create_mock_result(
            "bar", "16", "F", 150_000_000, pd.Timestamp("2000-01-16T12"), "234", "1"
        )
        mock_result17 = self._create_mock_result(
            "bar", "17", "F", 150_000_000, pd.Timestamp("2000-01-17T12"), "234", "1"
        )
        mock_result18 = self._create_mock_result(
            "foo", "18", "F", 100_000_000, pd.Timestamp("2000-01-18T12"), "234", "1"
        )
        mock_result19 = self._create_mock_result(
            "foo", "19", "F", 121_000_000, pd.Timestamp("2000-01-19T12"), "234", "1"
        )
        mock_result20 = self._create_mock_result(
            "bar", "20", "F", 200_000_000, pd.Timestamp("2000-01-20T12"), "234", "1"
        )
        mock_result21 = self._create_mock_result(
            "bar", "21", "F", 150_000_000, pd.Timestamp("2000-01-21T12"), "234", "1"
        )

        variable = "data_size"
        task_id = "234"
        frequency = "86400"
        backup_type = "F"
        window_size = 1

        backend = MockBackend()
        database = MockDatabase(
            [
                mock_result1,
                mock_result2,
                mock_result3,
                mock_result4,
                mock_result5,
                mock_result6,
                mock_result7,
                mock_result8,
                mock_result9,
                mock_result10,
                mock_result11,
                mock_result12,
                mock_result13,
                mock_result14,
                mock_result15,
                mock_result16,
                mock_result17,
                mock_result18,
                mock_result19,
                mock_result20,
                mock_result21,
            ]
        )
        time_series_analyzer = Time_series_analyzer([0.95, 5])
        Analyzer.init(database, backend, None, None, time_series_analyzer)
        Analyzer.load_time_series_data()

        result = Analyzer.simple_time_series_analysis(
            variable, task_id, frequency, backup_type, window_size
        )

        assert result == []

    def test_k_means_analyze_simple(self):
        mock_result1 = self._create_mock_result(
            "foo", "1", "F", 100_000_000, pd.Timestamp("2000-01-01T12"), "234", "1"
        )
        mock_result2 = self._create_mock_result(
            "foo", "2", "F", 121_000_000, pd.Timestamp("2000-01-02T12"), "234", "1"
        )
        mock_result3 = self._create_mock_result(
            "bar", "3", "F", 200_000_000, pd.Timestamp("2000-01-03T12"), "234", "1"
        )
        mock_result4 = self._create_mock_result(
            "bar", "4", "F", 150_000_000, pd.Timestamp("2000-01-04T12"), "234", "1"
        )
        mock_result5 = self._create_mock_result(
            "foo", "5", "F", 100_000_000, pd.Timestamp("2000-01-05T12"), "234", "1"
        )
        mock_result6 = self._create_mock_result(
            "foo", "6", "F", 121_000_000, pd.Timestamp("2000-01-06T12"), "234", "1"
        )
        mock_result7 = self._create_mock_result(
            "bar", "7", "F", 200_000_000, pd.Timestamp("2000-01-07T12"), "234", "1"
        )
        mock_result8 = self._create_mock_result(
            "bar", "8", "F", 150_000_000, pd.Timestamp("2000-01-08T12"), "234", "1"
        )
        mock_result9 = self._create_mock_result(
            "foo", "9", "F", 100_000_000, pd.Timestamp("2000-01-09T12"), "234", "1"
        )
        mock_result10 = self._create_mock_result(
            "foo", "10", "F", 121_000_000, pd.Timestamp("2000-01-10T12"), "234", "1"
        )
        mock_result11 = self._create_mock_result(
            "bar", "11", "F", 200_000_000, pd.Timestamp("2000-01-11T12"), "234", "1"
        )
        mock_result12 = self._create_mock_result(
            "bar", "12", "F", 150_000_000, pd.Timestamp("2000-01-12T12"), "234", "1"
        )
        mock_result13 = self._create_mock_result(
            "foo", "13", "F", 100_000_000, pd.Timestamp("2000-01-13T12"), "234", "1"
        )
        mock_result14 = self._create_mock_result(
            "foo", "14", "F", 121_000_000, pd.Timestamp("2000-01-14T12"), "234", "1"
        )
        mock_result15 = self._create_mock_result(
            "bar", "15", "F", 200_000_000, pd.Timestamp("2000-01-15T12"), "234", "1"
        )
        mock_result16 = self._create_mock_result(
            "bar", "16", "F", 150_000_000, pd.Timestamp("2000-01-16T12"), "234", "1"
        )
        mock_result17 = self._create_mock_result(
            "bar", "17", "F", 150_000_000, pd.Timestamp("2000-01-17T12"), "234", "1"
        )
        mock_result18 = self._create_mock_result(
            "foo", "18", "F", 100_000_000, pd.Timestamp("2000-01-18T12"), "234", "1"
        )
        mock_result19 = self._create_mock_result(
            "foo", "19", "F", 1_000, pd.Timestamp("2000-01-19T12"), "234", "1"
        )
        mock_result20 = self._create_mock_result(
            "bar", "20", "F", 200_000_000, pd.Timestamp("2000-01-20T12"), "234", "1"
        )
        mock_result21 = self._create_mock_result(
            "bar", "21", "F", 150_000_000, pd.Timestamp("2000-01-21T12"), "234", "1"
        )

        variable = "data_size"
        task_id = "234"
        frequency = "86400"
        backup_type = "F"
        window_size = 1

        backend = MockBackend()
        database = MockDatabase(
            [
                mock_result1,
                mock_result2,
                mock_result3,
                mock_result4,
                mock_result5,
                mock_result6,
                mock_result7,
                mock_result8,
                mock_result9,
                mock_result10,
                mock_result11,
                mock_result12,
                mock_result13,
                mock_result14,
                mock_result15,
                mock_result16,
                mock_result17,
                mock_result18,
                mock_result19,
                mock_result20,
                mock_result21,
            ]
        )
        time_series_analyzer = Time_series_analyzer([0.95, 5])
        Analyzer.init(database, backend, None, None, time_series_analyzer)
        Analyzer.load_time_series_data()

        result = Analyzer.simple_time_series_analysis(
            variable, task_id, frequency, backup_type, window_size
        )

        assert result == [pd.Timestamp("2000-01-19T12")]
