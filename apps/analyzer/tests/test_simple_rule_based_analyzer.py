from datetime import datetime

from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.models import Result, DataStore, Schedule
from metadata_analyzer.simple_rule_based_analyzer import SimpleRuleBasedAnalyzer
from tests.mock_backend import MockBackend
from tests.mock_database import MockDatabase


def _create_mock_result(task, uuid, fdi_type, data_size, start_time, schedule=""):
	mock_result = Result()
	mock_result.task = task
	mock_result.uuid = uuid
	mock_result.fdi_type = fdi_type
	mock_result.data_size = data_size
	mock_result.start_time = start_time
	mock_result.subtask_flag = "0"
	mock_result.schedule = schedule
	return mock_result


def _create_mock_data_store(name, capacity, high_water_mark, filled):
	mock_data_store = DataStore()
	mock_data_store.name = name
	mock_data_store.capacity = capacity
	mock_data_store.high_water_mark = high_water_mark
	mock_data_store.filled = filled
	return mock_data_store


def _create_mock_schedule(name, p_base, p_count, start_time=None, days=[]):
	mock_schedule = Schedule()
	mock_schedule.name = name
	mock_schedule.p_base = p_base
	mock_schedule.p_count = p_count
	mock_schedule.start_time = start_time
	mock_schedule.mo = "1" if "mo" in days else "0"
	mock_schedule.tu = "1" if "tu" in days else "0"
	mock_schedule.we = "1" if "we" in days else "0"
	mock_schedule.th = "1" if "th" in days else "0"
	mock_schedule.fr = "1" if "fr" in days else "0"
	mock_schedule.sa = "1" if "sa" in days else "0"
	mock_schedule.su = "1" if "su" in days else "0"
	return mock_schedule


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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis(-1)

	assert backend.size_alerts == [
		{
			"size": mock_result2.data_size / 1_000_000,
			"referenceSize": mock_result1.data_size / 1_000_000,
			"backupId": mock_result2.uuid,
		}
	]


def test_no_size_alert_sub_tasks():
	mock_result1 = _create_mock_result(
		"foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01")
	)
	mock_result2 = _create_mock_result(
		"foo", "2", "F", 121_000_000, datetime.fromisoformat("2000-01-02")
	)
	mock_result2.subtask_flag = "1"

	database = MockDatabase([mock_result1, mock_result2])
	backend = MockBackend()
	simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis(-1)

	assert backend.size_alerts == [
		{
			"size": mock_result2.data_size / 1_000_000,
			"referenceSize": mock_result1.data_size / 1_000_000,
			"backupId": mock_result2.uuid,
		},
		{
			"size": mock_result4.data_size / 1_000_000,
			"referenceSize": mock_result3.data_size / 1_000_000,
			"backupId": mock_result4.uuid,
		},
	]


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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis(-1)

	assert backend.size_alerts == [
		{
			"size": mock_result2.data_size / 1_000_000,
			"referenceSize": mock_result1.data_size / 1_000_000,
			"backupId": mock_result2.uuid,
		}
	]


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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis(1)

	assert len(backend.size_alerts) == 1


# Tests if the analysis skips alerts already created
def test_alert_full_start_date():
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
	backend.set_latest_alert_id("SIZE_ALERT", "FULL", "2")
	simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis(-1)

	assert backend.size_alerts == [
		{
			"size": mock_result3.data_size / 1_000_000,
			"referenceSize": mock_result2.data_size / 1_000_000,
			"backupId": mock_result3.uuid,
		}
	]


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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis_diff(1)

	assert backend.size_alerts == [
		{
			"size": mock_result2.data_size / 1_000_000,
			"referenceSize": mock_result1.data_size / 1_000_000,
			"backupId": mock_result2.uuid,
		}
	]


# Tests if the diff analysis skips alerts already created
def test_alert_diff_start_date():
	mock_result1 = _create_mock_result(
		"foo", "1", "D", 100_000_000, datetime.fromisoformat("2000-01-01")
	)
	mock_result2 = _create_mock_result(
		"foo", "2", "D", 150_000_000, datetime.fromisoformat("2000-01-02")
	)
	mock_result3 = _create_mock_result(
		"foo", "3", "D", 200_000_000, datetime.fromisoformat("2000-01-03")
	)

	database = MockDatabase([mock_result1, mock_result2, mock_result3])
	backend = MockBackend()
	backend.set_latest_alert_id("SIZE_ALERT", "DIFFERENTIAL", "2")
	simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis_diff(-1)

	assert backend.size_alerts == [
		{
			"size": mock_result3.data_size / 1_000_000,
			"referenceSize": mock_result2.data_size / 1_000_000,
			"backupId": mock_result3.uuid,
		}
	]


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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis_diff(1)

	assert backend.size_alerts == [
		{
			"size": mock_result2.data_size / 1_000_000,
			"referenceSize": mock_result1.data_size / 1_000_000,
			"backupId": mock_result2.uuid,
		}
	]


def test_alert_backup_size_no_subtasks_diff():
	mock_result1 = _create_mock_result(
		"foo", "1", "D", 100_000_000, datetime.fromisoformat("2000-01-01")
	)
	mock_result2 = _create_mock_result(
		"foo", "2", "D", 1_000_000, datetime.fromisoformat("2000-01-03")
	)
	mock_result2.subtask_flag = "1"

	database = MockDatabase([mock_result1, mock_result2])
	backend = MockBackend()
	simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis_diff(1)

	assert backend.size_alerts == [
		{
			"size": mock_result2.data_size / 1_000_000,
			"referenceSize": mock_result1.data_size / 1_000_000,
			"backupId": mock_result2.uuid,
		}
	]


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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis_diff(1)

	assert backend.size_alerts == [
		{
			"size": mock_result3.data_size / 1_000_000,
			"referenceSize": mock_result2.data_size / 1_000_000,
			"backupId": mock_result3.uuid,
		}
	]


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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis_diff(1)

	assert backend.size_alerts == [
		{
			"size": mock_result7.data_size / 1_000_000,
			"referenceSize": mock_result6.data_size / 1_000_000,
			"backupId": mock_result7.uuid,
		}
	]


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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis_inc(1)

	assert backend.size_alerts == [
		{
			"size": mock_result2.data_size / 1_000_000,
			"referenceSize": mock_result1.data_size / 1_000_000,
			"backupId": mock_result2.uuid,
		}
	]


def test_alert_backup_size_no_subtasks_inc():
	mock_result1 = _create_mock_result(
		"foo", "1", "I", 100_000_000, datetime.fromisoformat("2000-01-01")
	)
	mock_result2 = _create_mock_result(
		"foo", "2", "I", 0, datetime.fromisoformat("2000-01-02")
	)
	mock_result2.subtask_flag = "1"

	database = MockDatabase([mock_result1, mock_result2])
	backend = MockBackend()
	simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis_inc(1)

	assert backend.size_alerts == []


# Tests if the inc analysis skips alerts already created
def test_alert_diff_start_date():
	mock_result1 = _create_mock_result(
		"foo", "1", "I", 100_000_000, datetime.fromisoformat("2000-01-01")
	)
	mock_result2 = _create_mock_result(
		"foo", "2", "I", 150_000_000, datetime.fromisoformat("2000-01-02")
	)
	mock_result3 = _create_mock_result(
		"foo", "3", "I", 200_000_000, datetime.fromisoformat("2000-01-03")
	)

	database = MockDatabase([mock_result1, mock_result2, mock_result3])
	backend = MockBackend()
	backend.set_latest_alert_id("SIZE_ALERT", "INCREMENTAL", "2")
	simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis_inc(-1)

	assert backend.size_alerts == [
		{
			"size": mock_result3.data_size / 1_000_000,
			"referenceSize": mock_result2.data_size / 1_000_000,
			"backupId": mock_result3.uuid,
		}
	]


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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis_inc(1)

	assert backend.size_alerts == [
		{"size": 72, "referenceSize": avg / 1_000_000, "backupId": mock_result3.uuid}
	]


# Tests for the storage fill alerts


# Empty data store should not generate an alert
def test_storage_fill_alert_empty():
	mock_data_store1 = _create_mock_data_store("foo", 100, 80, 0)

	database = MockDatabase([], [], [mock_data_store1])
	backend = MockBackend()
	simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
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
	Analyzer.__init__(database, backend, simple_rule_based_analyzer, None, None, None)
	Analyzer.simple_rule_based_analysis_storage_capacity(-1)

	assert backend.storage_fill_alerts == []
