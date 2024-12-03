from datetime import datetime
from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.models import Result
from tests.mock_backend import MockBackend
from tests.mock_database import MockDatabase

def _create_mock_result(task, uuid, fdi_type, data_size, start_time, is_backup=1):
    mock_result = Result()
    mock_result.task = task
    mock_result.uuid = uuid
    mock_result.fdi_type = fdi_type
    mock_result.data_size = data_size
    mock_result.start_time = start_time
    mock_result.is_backup = is_backup
    return mock_result

def test_update_data_all_types():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "D", 150_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("foo", "3", "I", 200_000_000, datetime.fromisoformat("2000-01-03"))
    mock_result4 = _create_mock_result("foo", "4", "C", 250_000_000, datetime.fromisoformat("2000-01-04"))
    mock_results = [mock_result1, mock_result2, mock_result3, mock_result4]

    database = MockDatabase(mock_results)
    backend = MockBackend()
    Analyzer.init(database, backend, None, None)
    Analyzer.update_data()

    assert backend.backups == [{
        "id": mock_result1.uuid,
        "sizeMB": mock_result1.data_size / 1_000_000,
        "creationDate": mock_result1.start_time.isoformat(),
        "type": "FULL"
    }, {
        "id": mock_result2.uuid,
        "sizeMB": mock_result2.data_size / 1_000_000,
        "creationDate": mock_result2.start_time.isoformat(),
        "type": "DIFFERENTIAL"
    }, {
        "id": mock_result3.uuid,
        "sizeMB": mock_result3.data_size / 1_000_000,
        "creationDate": mock_result3.start_time.isoformat(),
        "type": "INCREMENTAL"
    }, {
        "id": mock_result4.uuid,
        "sizeMB": mock_result4.data_size / 1_000_000,
        "creationDate": mock_result4.start_time.isoformat(),
        "type": "COPY"
    }]

def test_update_data_not_a_backup():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"), 0)

    database = MockDatabase([mock_result1])
    backend = MockBackend()
    Analyzer.init(database, backend, None, None)
    Analyzer.update_data()

    assert backend.backups == []
