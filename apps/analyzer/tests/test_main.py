"""Main unit test module."""

from metadata_analyzer.main import hello_world, update_data
from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.models import Result
from metadata_analyzer.simple_rule_based_analyzer import SimpleRuleBasedAnalyzer
from datetime import datetime
from tests.mock_backend import MockBackend
from tests.mock_database import MockDatabase

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

