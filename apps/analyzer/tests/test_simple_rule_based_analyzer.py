from datetime import datetime

from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.models import Result
from metadata_analyzer.simple_rule_based_analyzer import SimpleRuleBasedAnalyzer
from tests.mock_backend import MockBackend
from tests.mock_database import MockDatabase


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
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.size_alerts == [{
        "size": mock_result2.data_size / 1_000_000,
        "referenceSize": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }]


def test_alerts_different_tasks():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "F", 121_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("bar", "1", "F", 200_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result4 = _create_mock_result("bar", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.size_alerts == [{
        "size": mock_result2.data_size / 1_000_000,
        "referenceSize": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }, {
        "size": mock_result4.data_size / 1_000_000,
        "referenceSize": mock_result3.data_size / 1_000_000,
        "backupId": mock_result4.uuid
    }]


def test_alert_backup_size_zero():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "F", 0, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.size_alerts == [{
        "size": mock_result2.data_size / 1_000_000,
        "referenceSize": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }]


def test_no_alert_size_diff_too_small():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "F", 120_000_000, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.size_alerts == []


def test_no_alert_wrong_type():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "D", 121_000_000, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.size_alerts == []


def test_no_alert_different_tasks():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("bar", "2", "F", 121_000_000, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.size_alerts == []


def test_alert_limit():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "F", 150_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("foo", "3", "F", 200_000_000, datetime.fromisoformat("2000-01-03"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(1)

    assert len(backend.size_alerts) == 1

# Tests if the analysis skips alerts already created
def test_alert_full_start_date():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "F", 150_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("foo", "3", "F", 200_000_000, datetime.fromisoformat("2000-01-03"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3])
    backend = MockBackend()
    backend.set_latest_alert_id("SIZE_ALERT", "FULL", "2")
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.size_alerts == [{
        "size": mock_result3.data_size / 1_000_000,
        "referenceSize": mock_result2.data_size / 1_000_000,
        "backupId": mock_result3.uuid
    }]

# extremely large difference
def test_alert_backup_size_zero_diff():
    mock_result1 = _create_mock_result("foo", "1", "D", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "D", 0, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.size_alerts == [{
        "size": mock_result2.data_size / 1_000_000,
        "referenceSize": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }]

# Tests if the diff analysis skips alerts already created
def test_alert_diff_start_date():
    mock_result1 = _create_mock_result("foo", "1", "D", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "D", 150_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("foo", "3", "D", 200_000_000, datetime.fromisoformat("2000-01-03"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3])
    backend = MockBackend()
    backend.set_latest_alert_id("SIZE_ALERT", "DIFFERENTIAL", "2")
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_diff(-1)

    assert backend.size_alerts == [{
        "size": mock_result3.data_size / 1_000_000,
        "referenceSize": mock_result2.data_size / 1_000_000,
        "backupId": mock_result3.uuid
    }]

# two decreasing diff backups (in the accepted range) with different full backups as base
def test_alert_backup_size_decrease_ok_diff():
    mock_result1 = _create_mock_result("foo", "1", "D", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("foo", "3", "D", 99_000_000, datetime.fromisoformat("2000-01-03"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.size_alerts == []


# two decreasing diff backups (in the accepted range) with same full backup as base
def test_alert_backup_size_decrease_nok_diff():
    mock_result1 = _create_mock_result("foo", "1", "D", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "D", 99_000_000, datetime.fromisoformat("2000-01-03"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.size_alerts == [{
        "size": mock_result2.data_size / 1_000_000,
        "referenceSize": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }]


# two decreasing diff backups (not in the accepted range) with same full backup as base
def test_alert_backup_size_decrease_large_nok_diff():
    mock_result1 = _create_mock_result("foo", "1", "D", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "D", 1_000_000, datetime.fromisoformat("2000-01-03"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.size_alerts == [{
        "size": mock_result2.data_size / 1_000_000,
        "referenceSize": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }]


# two decreasing diff backups (not in the accepted range) with different full backups as base
def test_alert_backup_size_decrease_large_ok_diff():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "D", 1_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-01-03"))
    mock_result4 = _create_mock_result("foo", "4", "D", 1_000_000, datetime.fromisoformat("2000-01-04"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.size_alerts == []


# two increasing diff backups (not in the accepted range) with same full backups as base
def test_alert_backup_size_increase_large_nok_diff():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "D", 1_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("foo", "3", "D", 100_000_000, datetime.fromisoformat("2000-01-03"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.size_alerts == [{
        "size": mock_result3.data_size / 1_000_000,
        "referenceSize": mock_result2.data_size / 1_000_000,
        "backupId": mock_result3.uuid
    }]


# two increasing diff backups (not in the accepted range) with different full backups as base
def test_alert_backup_size_increase_large_ok_diff():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "D", 1_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-01-03"))
    mock_result4 = _create_mock_result("foo", "4", "D", 1_000_000, datetime.fromisoformat("2000-01-04"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.size_alerts == []

    # multiple decreasing diff backups (not in the accepted range) with same full backups as base


def test_alert_backup_size_complex_nok_diff():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "D", 1_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-01-03"))
    mock_result4 = _create_mock_result("foo", "4", "F", 1_000_000, datetime.fromisoformat("2000-01-04"))
    mock_result5 = _create_mock_result("foo", "5", "D", 100_000_000, datetime.fromisoformat("2000-01-05"))
    mock_result6 = _create_mock_result("foo", "6", "D", 101_000_000, datetime.fromisoformat("2000-01-06"))
    mock_result7 = _create_mock_result("foo", "7", "D", 1_000_000, datetime.fromisoformat("2000-01-07"))

    database = MockDatabase(
        [mock_result1, mock_result2, mock_result3, mock_result4, mock_result5, mock_result6, mock_result7])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.size_alerts == [{
        "size": mock_result7.data_size / 1_000_000,
        "referenceSize": mock_result6.data_size / 1_000_000,
        "backupId": mock_result7.uuid
    }]


# large increase of inc size
def test_alert_backup_size_zero_inc():
    mock_result1 = _create_mock_result("foo", "1", "I", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "I", 0, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_inc(1)

    assert backend.size_alerts == [{
        "size": mock_result2.data_size / 1_000_000,
        "referenceSize": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }]

# Tests if the inc analysis skips alerts already created
def test_alert_diff_start_date():
    mock_result1 = _create_mock_result("foo", "1", "I", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "I", 150_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("foo", "3", "I", 200_000_000, datetime.fromisoformat("2000-01-03"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3])
    backend = MockBackend()
    backend.set_latest_alert_id("SIZE_ALERT", "INCREMENTAL", "2")
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_inc(-1)

    assert backend.size_alerts == [{
        "size": mock_result3.data_size / 1_000_000,
        "referenceSize": mock_result2.data_size / 1_000_000,
        "backupId": mock_result3.uuid
    }]

# irregular backup times that should not be alerted
def test_alert_backup_size_irregular_inc():
    mock_result1 = _create_mock_result("foo", "1", "I", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "I", 0, datetime.fromisoformat("2000-01-08"))
    mock_result3 = _create_mock_result("foo", "3", "I", 100_000_000, datetime.fromisoformat("2000-01-09"))
    mock_result4 = _create_mock_result("foo", "4", "I", 100_000_000, datetime.fromisoformat("2000-01-10"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_inc(1)

    assert backend.size_alerts == []


# irregular backup sizes
def test_alert_backup_size_irregularSize_inc():
    mock_result1 = _create_mock_result("foo", "1", "I", 100_000_000, datetime.fromisoformat("2000-01-07"))
    mock_result2 = _create_mock_result("foo", "2", "I", 100_000_000, datetime.fromisoformat("2000-01-08"))
    mock_result3 = _create_mock_result("foo", "3", "I", 72_000_000, datetime.fromisoformat("2000-01-09"))
    mock_result4 = _create_mock_result("foo", "4", "I", 100_000_000, datetime.fromisoformat("2000-01-10"))
    avg = (mock_result1.data_size + mock_result2.data_size + mock_result3.data_size + mock_result4.data_size) / 4

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_inc(1)

    assert backend.size_alerts == [{
        "size": 72,
        "referenceSize": avg / 1_000_000,
        "backupId": mock_result3.uuid
    }]
