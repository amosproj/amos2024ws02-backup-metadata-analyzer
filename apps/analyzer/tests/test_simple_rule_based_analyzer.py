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

    assert backend.alerts == [{
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

    assert backend.alerts == [{
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

    assert backend.alerts == [{
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

    assert backend.alerts == []


def test_no_alert_wrong_type():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "D", 121_000_000, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.alerts == []


def test_no_alert_different_tasks():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("bar", "2", "F", 121_000_000, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.alerts == []


def test_alert_limit():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "F", 150_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("foo", "3", "F", 200_000_000, datetime.fromisoformat("2000-01-03"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(1)

    assert len(backend.alerts) == 1


# extremely large difference
def test_alert_backup_size_zero_diff():
    mock_result1 = _create_mock_result("foo", "1", "D", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "D", 0, datetime.fromisoformat("2000-01-02"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.alerts == [{
        "size": mock_result2.data_size / 1_000_000,
        "referenceSize": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
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

    assert backend.alerts == []


# two decreasing diff backups (in the accepted range) with same full backup as base
def test_alert_backup_size_decrease_nok_diff():
    mock_result1 = _create_mock_result("foo", "1", "D", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "D", 99_000_000, datetime.fromisoformat("2000-01-03"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.alerts == [{
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

    assert backend.alerts == [{
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

    assert backend.alerts == []


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

    assert backend.alerts == [{
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

    assert backend.alerts == []

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

    assert backend.alerts == [{
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

    assert backend.alerts == [{
        "size": mock_result2.data_size / 1_000_000,
        "referenceSize": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
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

    assert backend.alerts == []


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

    assert backend.alerts == [{
        "size": 72,
        "referenceSize": avg / 1_000_000,
        "backupId": mock_result3.uuid
    }]

# Tests for the creation time alerts

# Same exact time each day
def test_alert_exact_time():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01T03:00:00"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-02T03:00:00"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-01-03T03:00:00"))
    mock_result4 = _create_mock_result("foo", "4", "F", 100_000_000, datetime.fromisoformat("2000-01-04T03:00:00"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(1)

    assert backend.alerts == []

# Deviations up to 15 mins from the first backup
def test_alert_small_time_deviation():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01T12:00:00"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2000-02-01T12:05:00"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-03-01T12:15:00"))
    mock_result4 = _create_mock_result("foo", "4", "F", 100_000_000, datetime.fromisoformat("2000-04-01T11:55:00"))
    mock_result5 = _create_mock_result("foo", "5", "F", 100_000_000, datetime.fromisoformat("2000-05-01T11:45:00"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4, mock_result5])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(1)

    assert backend.alerts == []

# Backups with a diff of exactly one hour trigger no alert
def test_alert_time_on_the_limit():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01T12:00:00"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-02T13:00:00"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(1)

    assert backend.alerts == []

# Check if all past backups are considered as a reference
def test_alert_moving_schedule():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01T12:00:00"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2000-02-01T13:00:00"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-03-01T14:00:00"))
    mock_result4 = _create_mock_result("foo", "4", "F", 100_000_000, datetime.fromisoformat("2000-04-01T14:30:00"))
    mock_result5 = _create_mock_result("foo", "5", "F", 100_000_000, datetime.fromisoformat("2000-05-01T15:30:00"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4, mock_result5])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(1)

    assert backend.alerts == []

# Check behaviour around midnight
def test_alert_time_midnight_no_alert():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01T00:00:00"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-01T23:30:00"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-02-02T00:30:00"))
    mock_result4 = _create_mock_result("foo", "4", "F", 100_000_000, datetime.fromisoformat("2000-01-02T23:00:00"))
    mock_result5 = _create_mock_result("foo", "5", "F", 100_000_000, datetime.fromisoformat("2000-01-03T01:00:00"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4, mock_result5])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(1)

    assert backend.alerts == []

# Alerts should be triggered when the diff is greater than one hour
def test_alert_unusual_time():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01T12:00:00"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-02T12:00:00"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-01-03T12:00:00"))
    mock_result4 = _create_mock_result("foo", "4", "F", 100_000_000, datetime.fromisoformat("2000-01-04T18:00:00"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(1)

    assert backend.alerts == [{
        "date": mock_result4.start_time,
        "referenceDate": datetime.fromisoformat("2000-01-04T12:00:00"),
        "backupId": mock_result4.uuid
    }]

# Two different schedules should trigger one alert for the first backup of the second schedule
def test_alert_two_different_schedules_same_task():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2020-12-24T18:00:00"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2020-12-25T06:00:00"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2020-12-26T18:00:00"))
    mock_result4 = _create_mock_result("foo", "4", "F", 100_000_000, datetime.fromisoformat("2020-12-27T06:00:00"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(1)

    assert backend.alerts == [{
        "date": mock_result2.start_time,
        "referenceDate": datetime.fromisoformat("2020-12-25T18:00:00"),
        "backupId": mock_result2.uuid
    }]

# Check behaviour around midnight
def test_alert_time_midnight_alerts():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01T00:00:00"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-02T02:00:00"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-01-03T22:59:00"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer)
    Analyzer.simple_rule_based_analysis(2)

    assert backend.alerts == [{
        "date": mock_result2.start_time,
        "referenceDate": datetime.fromisoformat("2000-01-02T00:00:00"),
        "backupId": mock_result2.uuid
    }, {
        "date": mock_result3.start_time,
        "referenceDate": datetime.fromisoformat("2000-01-03T00:00:00"),
        "backupId": mock_result3.uuid
    }]
