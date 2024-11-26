from metadata_analyzer.simple_rule_based_analyzer import SimpleRuleBasedAnalyzer
from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.models import Result
from tests.mock_backend import MockBackend
from tests.mock_database import MockDatabase
from datetime import datetime

def _create_mock_result(task, uuid, fdi_type, data_size, start_time):
    mock_result = Result()
    mock_result.task = task
    mock_result.uuid = uuid
    mock_result.fdi_type = fdi_type
    mock_result.data_size = data_size
    mock_result.start_time = start_time
    return mock_result

def test_alert():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "F", 121_000_000, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.alerts == [{
        "type": 0,
        "value": mock_result2.data_size / 1_000_000,
        "referenceValue": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }]

def test_alerts_different_tasks():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "F", 121_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("bar", "1", "F", 200_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result4 = _create_mock_result("bar", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.alerts == [{
        "type": 0,
        "value": mock_result2.data_size / 1_000_000,
        "referenceValue": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }, {
        "type": 1,
        "value": mock_result4.data_size / 1_000_000,
        "referenceValue": mock_result3.data_size / 1_000_000,
        "backupId": mock_result4.uuid
    }]

def test_alert_backup_size_zero():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "F", 0, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.alerts == [{
        "type": 1,
        "value": mock_result2.data_size / 1_000_000,
        "referenceValue": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }]

def test_no_alert_size_diff_too_small():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "F", 120_000_000, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.alerts == []

def test_no_alert_wrong_type():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "D", 121_000_000, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.alerts == []

def test_no_alert_different_tasks():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("bar", "2", "F", 121_000_000, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.alerts == []

def test_alert_limit():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "F", 150_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("foo", "3", "F", 200_000_000, datetime.fromisoformat("2000-01-03"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(1)

    assert len(backend.alerts) == 1

