"""Main unit test module."""

from metadata_analyzer.main import hello_world, update_data
from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.models import Result
from datetime import datetime

class MockDatabase:
    def __init__(self, results):
        self.results = results

    def get_results(self):
        return iter(self.results)

class MockBackend:
    def __init__(self):
        self.backups = []

    def send_backup_data_batched(self, batch):
        self.backups += batch

def test_hello_world():
    """Test the hello_world function."""
    assert hello_world() == "Hello, world!"

def test_update_data():
    mock_result = Result()
    mock_result.uuid = "1"
    mock_result.fdi_type = "F"
    mock_result.data_size = 100
    mock_result.start_time = datetime.now()

    database = MockDatabase([mock_result])
    backend = MockBackend()
    Analyzer.init(database, backend, None, None)
    Analyzer.update_data()

    assert backend.backups == [Analyzer._convert_result(mock_result)]
