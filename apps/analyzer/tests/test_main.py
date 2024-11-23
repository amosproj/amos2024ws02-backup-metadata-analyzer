"""Main unit test module."""

from metadata_analyzer.main import hello_world, update_data
from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.models import Result
from metadata_analyzer.simple_rule_based_analyzer import SimpleRuleBasedAnalyzer
from datetime import datetime

class MockDatabase:
    def __init__(self, results):
        self.results = results

    def get_results(self):
        return iter(self.results)

class MockBackend:
    def __init__(self):
        self.backups = []
        self.alerts = []

    def send_backup_data_batched(self, batch):
        self.backups += batch

    def create_alert(self, alert):
        self.alerts.append(alert)

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

def test_simple_rule_based_analyzer():
    mock_result1 = Result()
    mock_result1.task = "foo"
    mock_result1.uuid = "1"
    mock_result1.fdi_type = "F"
    mock_result1.data_size = 100_000_000
    mock_result1.start_time = datetime.fromisoformat('2000-01-01')

    mock_result2 = Result()
    mock_result2.task = "foo"
    mock_result2.uuid = "2"
    mock_result2.fdi_type = "F"
    mock_result2.data_size = 121_000_000
    mock_result2.start_time = datetime.fromisoformat('2000-01-02')

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis()

    assert backend.alerts == [{
        "type": 0,
        "value": mock_result2.data_size // 1_000_000,
        "referenceValue": mock_result1.data_size // 1_000_000,
        "backupId": mock_result2.uuid
    }]
