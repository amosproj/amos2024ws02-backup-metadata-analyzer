from datetime import datetime

from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.models import Result
from metadata_analyzer.time_series_analyzer import Time_series_analyzer
from tests.mock_backend import MockBackend
from tests.mock_database import MockDatabase
import pytest


class Test_time_series_analyzer:

    def _create_mock_result(
        self, task, uuid, fdi_type, data_size, start_time, task_uuid
    ):
        mock_result = Result()
        mock_result.task = task
        mock_result.uuid = uuid
        mock_result.fdi_type = fdi_type
        mock_result.data_size = data_size
        mock_result.start_time = start_time
        mock_result.task_uuid = task_uuid
        return mock_result

    def test_k_means_analyze_empty(self):
        mock_result1 = self._create_mock_result(
            "foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"), "234"
        )
        mock_result2 = self._create_mock_result(
            "foo", "2", "F", 121_000_000, datetime.fromisoformat("2000-01-02"), "234"
        )
        mock_result3 = self._create_mock_result(
            "bar", "1", "F", 200_000_000, datetime.fromisoformat("2000-01-03"), "345"
        )
        mock_result4 = self._create_mock_result(
            "bar", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-04"), "345"
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
        time_series_analyzer = Time_series_analyzer()
        Analyzer.init(database, backend, None, None, time_series_analyzer)

        with pytest.raises(ValueError) as valErr:
            Analyzer.simple_time_series_analysis(
                variable, task_id, frequency, backup_type, window_size
            )
