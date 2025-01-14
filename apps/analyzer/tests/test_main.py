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
