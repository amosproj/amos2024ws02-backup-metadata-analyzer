from datetime import datetime

from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.models import Result, DataStore
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

def _create_mock_data_store(name, capacity, high_water_mark, filled):
    mock_data_store = DataStore()
    mock_data_store.name = name
    mock_data_store.capacity = capacity
    mock_data_store.high_water_mark = high_water_mark
    mock_data_store.filled = filled
    return mock_data_store


def test_alert():
    mock_result1 = _create_mock_result(
        "foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "F", 121_000_000, datetime.fromisoformat("2000-01-02")
    )

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis(-1)
    
    assert backend.size_alerts == [{
        "size": mock_result2.data_size / 1_000_000,
        "referenceSize": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }]


def test_no_size_alert_sub_tasks():
    mock_result1 = _create_mock_result(
        "foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "F", 121_000_000, datetime.fromisoformat("2000-01-02")
    )
    mock_result2.subtask_flag = 1

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis(-1)
    
    assert backend.size_alerts == []


def test_alerts_different_tasks():
    mock_result1 = _create_mock_result(
        "foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "F", 121_000_000, datetime.fromisoformat("2000-01-02")
    )
    mock_result3 = _create_mock_result(
        "bar", "1", "F", 200_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result4 = _create_mock_result(
        "bar", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-02")
    )

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
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
    mock_result1 = _create_mock_result(
        "foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "F", 0, datetime.fromisoformat("2000-01-02")
    )

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.size_alerts == [{
        "size": mock_result2.data_size / 1_000_000,
        "referenceSize": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }]



def test_no_alert_size_diff_too_small():
    mock_result1 = _create_mock_result(
        "foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "F", 120_000_000, datetime.fromisoformat("2000-01-02")
    )

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.size_alerts == []


def test_no_alert_wrong_type():
    mock_result1 = _create_mock_result(
        "foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "D", 121_000_000, datetime.fromisoformat("2000-01-02")
    )

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.size_alerts == []


def test_no_alert_different_tasks():
    mock_result1 = _create_mock_result(
        "foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "bar", "2", "F", 121_000_000, datetime.fromisoformat("2000-01-02")
    )

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.size_alerts == []


def test_alert_limit():
    mock_result1 = _create_mock_result(
        "foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "F", 150_000_000, datetime.fromisoformat("2000-01-02")
    )
    mock_result3 = _create_mock_result(
        "foo", "3", "F", 200_000_000, datetime.fromisoformat("2000-01-03")
    )

    database = MockDatabase([mock_result1, mock_result2, mock_result3])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
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
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis(-1)

    assert backend.size_alerts == [{
        "size": mock_result3.data_size / 1_000_000,
        "referenceSize": mock_result2.data_size / 1_000_000,
        "backupId": mock_result3.uuid
    }]

# extremely large difference
def test_alert_backup_size_zero_diff():
    mock_result1 = _create_mock_result(
        "foo", "1", "D", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "D", 0, datetime.fromisoformat("2000-01-02")
    )

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
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
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_diff(-1)

    assert backend.size_alerts == [{
        "size": mock_result3.data_size / 1_000_000,
        "referenceSize": mock_result2.data_size / 1_000_000,
        "backupId": mock_result3.uuid
    }]

# two decreasing diff backups (in the accepted range) with different full backups as base
def test_alert_backup_size_decrease_ok_diff():
    mock_result1 = _create_mock_result(
        "foo", "1", "D", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-02")
    )
    mock_result3 = _create_mock_result(
        "foo", "3", "D", 99_000_000, datetime.fromisoformat("2000-01-03")
    )

    database = MockDatabase([mock_result1, mock_result2, mock_result3])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.size_alerts == []


# two decreasing diff backups (in the accepted range) with same full backup as base
def test_alert_backup_size_decrease_nok_diff():
    mock_result1 = _create_mock_result(
        "foo", "1", "D", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "D", 99_000_000, datetime.fromisoformat("2000-01-03")
    )

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_diff(1)

    
    assert backend.size_alerts == [{
        "size": mock_result2.data_size / 1_000_000,
        "referenceSize": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }]


def test_alert_backup_size_no_subtasks_diff():
    mock_result1 = _create_mock_result(
        "foo", "1", "D", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "D", 1_000_000, datetime.fromisoformat("2000-01-03")
    )
    mock_result2.subtask_flag = 1

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.size_alerts == []


# two decreasing diff backups (not in the accepted range) with same full backup as base
def test_alert_backup_size_decrease_large_nok_diff():
    mock_result1 = _create_mock_result(
        "foo", "1", "D", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "D", 1_000_000, datetime.fromisoformat("2000-01-03")
    )

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.size_alerts == [{
        "size": mock_result2.data_size / 1_000_000,
        "referenceSize": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }]



# two decreasing diff backups (not in the accepted range) with different full backups as base
def test_alert_backup_size_decrease_large_ok_diff():
    mock_result1 = _create_mock_result(
        "foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "D", 1_000_000, datetime.fromisoformat("2000-01-02")
    )
    mock_result3 = _create_mock_result(
        "foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-01-03")
    )
    mock_result4 = _create_mock_result(
        "foo", "4", "D", 1_000_000, datetime.fromisoformat("2000-01-04")
    )

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.size_alerts == []


# two increasing diff backups (not in the accepted range) with same full backups as base
def test_alert_backup_size_increase_large_nok_diff():
    mock_result1 = _create_mock_result(
        "foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "D", 1_000_000, datetime.fromisoformat("2000-01-02")
    )
    mock_result3 = _create_mock_result(
        "foo", "3", "D", 100_000_000, datetime.fromisoformat("2000-01-03")
    )

    database = MockDatabase([mock_result1, mock_result2, mock_result3])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_diff(1)


    assert backend.size_alerts == [{
        "size": mock_result3.data_size / 1_000_000,
        "referenceSize": mock_result2.data_size / 1_000_000,
        "backupId": mock_result3.uuid
    }]


# two increasing diff backups (not in the accepted range) with different full backups as base
def test_alert_backup_size_increase_large_ok_diff():
    mock_result1 = _create_mock_result(
        "foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "D", 1_000_000, datetime.fromisoformat("2000-01-02")
    )
    mock_result3 = _create_mock_result(
        "foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-01-03")
    )
    mock_result4 = _create_mock_result(
        "foo", "4", "D", 1_000_000, datetime.fromisoformat("2000-01-04")
    )

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.size_alerts == []

    # multiple decreasing diff backups (not in the accepted range) with same full backups as base


def test_alert_backup_size_complex_nok_diff():
    mock_result1 = _create_mock_result(
        "foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "D", 1_000_000, datetime.fromisoformat("2000-01-02")
    )
    mock_result3 = _create_mock_result(
        "foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-01-03")
    )
    mock_result4 = _create_mock_result(
        "foo", "4", "F", 1_000_000, datetime.fromisoformat("2000-01-04")
    )
    mock_result5 = _create_mock_result(
        "foo", "5", "D", 100_000_000, datetime.fromisoformat("2000-01-05")
    )
    mock_result6 = _create_mock_result(
        "foo", "6", "D", 101_000_000, datetime.fromisoformat("2000-01-06")
    )
    mock_result7 = _create_mock_result(
        "foo", "7", "D", 1_000_000, datetime.fromisoformat("2000-01-07")
    )

    database = MockDatabase(
        [
            mock_result1,
            mock_result2,
            mock_result3,
            mock_result4,
            mock_result5,
            mock_result6,
            mock_result7,
        ]
    )
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_diff(1)

    assert backend.size_alerts == [{
        "size": mock_result7.data_size / 1_000_000,
        "referenceSize": mock_result6.data_size / 1_000_000,
        "backupId": mock_result7.uuid
    }]


# large increase of inc size
def test_alert_backup_size_zero_inc():
    mock_result1 = _create_mock_result(
        "foo", "1", "I", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "I", 0, datetime.fromisoformat("2000-01-02")
    )

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_inc(1)

    assert backend.size_alerts == [{
        "size": mock_result2.data_size / 1_000_000,
        "referenceSize": mock_result1.data_size / 1_000_000,
        "backupId": mock_result2.uuid
    }]

def test_alert_backup_size_no_subtasks_inc():
    mock_result1 = _create_mock_result(
        "foo", "1", "I", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "I", 0, datetime.fromisoformat("2000-01-02")
    )
    mock_result2.subtask_flag = 1

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_inc(1)

    assert backend.size_alerts == []

# Tests if the inc analysis skips alerts already created
def test_alert_diff_start_date():
    mock_result1 = _create_mock_result("foo", "1", "I", 100_000_000, datetime.fromisoformat("2000-01-01"))
    mock_result2 = _create_mock_result("foo", "2", "I", 150_000_000, datetime.fromisoformat("2000-01-02"))
    mock_result3 = _create_mock_result("foo", "3", "I", 200_000_000, datetime.fromisoformat("2000-01-03"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3])
    backend = MockBackend()
    backend.set_latest_alert_id("SIZE_ALERT", "INCREMENTAL", "2")
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_inc(-1)

    assert backend.size_alerts == [{
        "size": mock_result3.data_size / 1_000_000,
        "referenceSize": mock_result2.data_size / 1_000_000,
        "backupId": mock_result3.uuid
    }]

# irregular backup times that should not be alerted
def test_alert_backup_size_irregular_inc():
    mock_result1 = _create_mock_result(
        "foo", "1", "I", 100_000_000, datetime.fromisoformat("2000-01-01")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "I", 0, datetime.fromisoformat("2000-01-08")
    )
    mock_result3 = _create_mock_result(
        "foo", "3", "I", 100_000_000, datetime.fromisoformat("2000-01-09")
    )
    mock_result4 = _create_mock_result(
        "foo", "4", "I", 100_000_000, datetime.fromisoformat("2000-01-10")
    )

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_inc(1)

    assert backend.size_alerts == []


# irregular backup sizes
def test_alert_backup_size_irregularSize_inc():
    mock_result1 = _create_mock_result(
        "foo", "1", "I", 100_000_000, datetime.fromisoformat("2000-01-07")
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "I", 100_000_000, datetime.fromisoformat("2000-01-08")
    )
    mock_result3 = _create_mock_result(
        "foo", "3", "I", 72_000_000, datetime.fromisoformat("2000-01-09")
    )
    mock_result4 = _create_mock_result(
        "foo", "4", "I", 100_000_000, datetime.fromisoformat("2000-01-10")
    )
    avg = (
        mock_result1.data_size
        + mock_result2.data_size
        + mock_result3.data_size
        + mock_result4.data_size
    ) / 4

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_inc(1)

    assert backend.size_alerts == [{
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
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_creation_dates(-1)

    assert backend.creation_date_alerts == []

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
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_creation_dates(-1)

    assert backend.creation_date_alerts == []

# Backups with a diff of exactly one hour trigger no alert
def test_alert_time_on_the_limit():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01T12:00:00"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-02T13:00:00"))

    database = MockDatabase([mock_result1, mock_result2])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_creation_dates(-1)

    assert backend.creation_date_alerts == []

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
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_creation_dates(-1)

    assert backend.creation_date_alerts == []

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
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_creation_dates(-1)

    assert backend.creation_date_alerts == []

# Alerts should be triggered when the diff is greater than one hour
def test_alert_unusual_time():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01T12:00:00"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-02T12:00:00"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-01-03T12:00:00"))
    mock_result4 = _create_mock_result("foo", "4", "F", 100_000_000, datetime.fromisoformat("2000-01-04T18:00:00"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_creation_dates(-1)

    assert backend.creation_date_alerts == [{
        "date": mock_result4.start_time.isoformat(),
        "referenceDate": "2000-01-04T12:00:00",
        "backupId": mock_result4.uuid
    }]

def test_alert_creation_date_no_subtasks():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01T12:00:00"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-02T18:00:00"))
    mock_result2.subtask_flag = 1

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_creation_dates(-1)

    assert backend.creation_date_alerts == []

# Two different schedules should trigger one alert for the first backup of the second schedule
def test_alert_two_different_schedules_same_task():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2020-12-24T18:00:00"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2020-12-25T06:00:00"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2020-12-26T18:00:00"))
    mock_result4 = _create_mock_result("foo", "4", "F", 100_000_000, datetime.fromisoformat("2020-12-27T06:00:00"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_creation_dates(-1)

    assert backend.creation_date_alerts == [{
        "date": mock_result2.start_time.isoformat(),
        "referenceDate": "2020-12-25T18:00:00",
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
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_creation_dates(-1)

    assert backend.creation_date_alerts == [{
        "date": mock_result2.start_time.isoformat(),
        "referenceDate": "2000-01-02T00:00:00",
        "backupId": mock_result2.uuid
    }, {
        "date": mock_result3.start_time.isoformat(),
        "referenceDate": "2000-01-03T00:00:00",
        "backupId": mock_result3.uuid
    }]

# Test unordered results
def test_alert_creation_date_unordered():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2020-01-01T18:00:00"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2020-01-02T13:30:00"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2020-01-03T18:30:00"))
    mock_result4 = _create_mock_result("foo", "4", "F", 100_000_000, datetime.fromisoformat("2020-01-04T19:31:00"))

    database = MockDatabase([mock_result4, mock_result2, mock_result3, mock_result1])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_creation_dates(-1)

    assert backend.creation_date_alerts == [{
        "date": mock_result2.start_time.isoformat(),
        "referenceDate": "2020-01-02T18:00:00",
        "backupId": mock_result2.uuid
    }, {
        "date": mock_result4.start_time.isoformat(),
        "referenceDate": "2020-01-04T18:30:00",
        "backupId": mock_result4.uuid
    }]

# Test different tasks
def test_alert_creation_date_different_tasks():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2020-01-01T14:00:00"))
    mock_result2 = _create_mock_result("bar", "2", "F", 100_000_000, datetime.fromisoformat("2020-01-01T19:00:00"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2020-01-02T14:30:00"))
    mock_result4 = _create_mock_result("bar", "4", "F", 100_000_000, datetime.fromisoformat("2020-01-02T20:01:00"))

    database = MockDatabase([mock_result4, mock_result2, mock_result3, mock_result1])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_creation_dates(-1)

    assert backend.creation_date_alerts == [{
        "date": mock_result4.start_time.isoformat(),
        "referenceDate": "2020-01-02T19:00:00",
        "backupId": mock_result4.uuid
    }]

# Alerts should be triggered when the diff is greater than one hour
def test_alert_latest_creation_date():
    mock_result1 = _create_mock_result("foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01T12:00:00"))
    mock_result2 = _create_mock_result("foo", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-02T14:00:00"))
    mock_result3 = _create_mock_result("foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-01-03T16:00:00"))
    mock_result4 = _create_mock_result("foo", "4", "F", 100_000_000, datetime.fromisoformat("2000-01-04T18:00:00"))

    database = MockDatabase([mock_result1, mock_result2, mock_result3, mock_result4])
    backend = MockBackend()
    backend.set_latest_alert_id("CREATION_DATE_ALERT", None, "3")
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_creation_dates(-1)

    assert backend.creation_date_alerts == [{
        "date": mock_result4.start_time.isoformat(),
        "referenceDate": "2000-01-04T16:00:00",
        "backupId": mock_result4.uuid
    }]

# Tests for the storage fill alerts


# Empty data store should not generate an alert
def test_storage_fill_alert_empty():
    mock_data_store1 = _create_mock_data_store("foo", 100, 80, 0)

    database = MockDatabase([], [], [mock_data_store1])
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_storage_capacity(-1)

    assert backend.storage_fill_alerts == []


# Data stores with enough capacity left should not generate an alert
def test_storage_fill_alert_enough_capacity_left():
    mock_data_store1 = _create_mock_data_store("foo", 100, 80, 20)
    mock_data_store2 = _create_mock_data_store("bar", 120, 90, 80)
    mock_data_store3 = _create_mock_data_store("baz", 150, 50, 50)

    database = MockDatabase(
        [], [], [mock_data_store1, mock_data_store2, mock_data_store3]
    )
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_storage_capacity(-1)

    assert backend.storage_fill_alerts == []


# Data stores with less than enough capacity left should generate an alert
def test_storage_fill_alert_enough_capacity_left():
    mock_data_store1 = _create_mock_data_store("foo", 100, 80, 81)
    mock_data_store2 = _create_mock_data_store("bar", 120, 90, 100)
    mock_data_store3 = _create_mock_data_store("baz", 150, 50, 150)

    database = MockDatabase(
        [], [], [mock_data_store1, mock_data_store2, mock_data_store3]
    )
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_storage_capacity(-1)

    assert backend.storage_fill_alerts == [
        {
            "dataStoreName": mock_data_store1.name,
            "capacity": mock_data_store1.capacity,
            "filled": mock_data_store1.filled,
            "highWaterMark": mock_data_store1.high_water_mark,
        },
        {
            "dataStoreName": mock_data_store2.name,
            "capacity": mock_data_store2.capacity,
            "filled": mock_data_store2.filled,
            "highWaterMark": mock_data_store2.high_water_mark,
        },
        {
            "dataStoreName": mock_data_store3.name,
            "capacity": mock_data_store3.capacity,
            "filled": mock_data_store3.filled,
            "highWaterMark": mock_data_store3.high_water_mark,
        },
    ]


# Data stores with missing data should not generate an alert
def test_storage_fill_alert_missing_data():
    mock_data_store1 = _create_mock_data_store("foo", None, 80, 100)
    mock_data_store2 = _create_mock_data_store("bar", 120, None, 120)
    mock_data_store3 = _create_mock_data_store("baz", 150, 50, None)

    database = MockDatabase(
        [], [], [mock_data_store1, mock_data_store2, mock_data_store3]
    )
    backend = MockBackend()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, None, simple_rule_based_analyzer, None)
    Analyzer.simple_rule_based_analysis_storage_capacity(-1)

    assert backend.storage_fill_alerts == []
