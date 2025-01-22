from datetime import datetime

from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.models import Result, Tasks, DataStore
from tests.mock_backend import MockBackend
from tests.mock_database import MockDatabase


def _create_mock_result(task, uuid, saveset, fdi_type, data_size, start_time, task_uuid=None, is_backup=1,
						subtask_flag="0"):
	mock_result = Result()
	mock_result.task = task
	mock_result.saveset = saveset
	mock_result.uuid = uuid
	mock_result.fdi_type = fdi_type
	mock_result.data_size = data_size
	mock_result.start_time = start_time
	mock_result.is_backup = is_backup
	mock_result.task_uuid = task_uuid
	mock_result.subtask_flag = subtask_flag
	return mock_result


def _create_mock_task(uuid, task):
	mock_task = Tasks()
	mock_task.uuid = uuid
	mock_task.task = task
	return mock_task


def _create_mock_storage(uuid, display_name, capacity, high_water_mark, filled, stored):
	mock_storage = DataStore()
	mock_storage.uuid = uuid
	mock_storage.name = display_name
	mock_storage.capacity = capacity
	mock_storage.high_water_mark = high_water_mark
	mock_storage.filled = filled
	mock_storage.stored = stored

	return mock_storage


# Mock SimpleRuleBasedAnalyzer
class MockSimpleRuleBasedAnalyzer:
	def analyze_creation_dates(self, data, schedules, alert_limit, start_date, mode="DEFAULT"):
		pass


def test_update_data_all_types():
	mock_result1 = _create_mock_result("foo", "1", "saveset1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"))
	mock_result2 = _create_mock_result("foo", "2", "saveset2", "D", 150_000_000, datetime.fromisoformat("2000-01-02"))
	mock_result3 = _create_mock_result("foo", "3", "saveset3", "I", 200_000_000, datetime.fromisoformat("2000-01-03"))
	mock_result4 = _create_mock_result("foo", "4", "saveset4", "C", 250_000_000, datetime.fromisoformat("2000-01-04"),
									   '123')
	mock_results = [mock_result1, mock_result2, mock_result3, mock_result4]

	mock_task1 = _create_mock_task("1", "task1")
	mock_task2 = _create_mock_task("123", "task123")
	mock_tasks = [mock_task1, mock_task2]

	mock_storage1 = _create_mock_storage("1", "storage1", 100_000_000, 90, 10, 10)
	mock_storage2 = _create_mock_storage("123", "storage123", 200_000_000, 80, 20, 20)
	mock_storages = [mock_storage1, mock_storage2]

	database = MockDatabase(mock_results, mock_tasks, mock_storages)
	backend = MockBackend()
	simple_rule_based_analyzer = MockSimpleRuleBasedAnalyzer()
	Analyzer.init(database, backend, simple_rule_based_analyzer, None)
	Analyzer.update_data()

	assert backend.backups == [{
		"id": mock_result1.uuid,
		"sizeMB": mock_result1.data_size / 1_000_000,
		"creationDate": mock_result1.start_time.isoformat(),
		"type": "FULL",
		"taskId": None,
		"saveset": mock_result1.saveset,
		"scheduledTime": None
	}, {
		"id": mock_result2.uuid,
		"sizeMB": mock_result2.data_size / 1_000_000,
		"creationDate": mock_result2.start_time.isoformat(),
		"type": "DIFFERENTIAL",
		"taskId": None,
		"saveset": mock_result2.saveset,
		"scheduledTime": None
	}, {
		"id": mock_result3.uuid,
		"sizeMB": mock_result3.data_size / 1_000_000,
		"creationDate": mock_result3.start_time.isoformat(),
		"type": "INCREMENTAL",
		"taskId": None,
		"saveset": mock_result3.saveset,
		"scheduledTime": None
	}, {
		"id": mock_result4.uuid,
		"sizeMB": mock_result4.data_size / 1_000_000,
		"creationDate": mock_result4.start_time.isoformat(),
		"type": "COPY",
		"taskId": '123',
		"saveset": mock_result4.saveset,
		"scheduledTime": None
	}]

	assert backend.tasks == [
		{
			"id": "1",
			"displayName": "task1"
		},
		{
			"id": "123",
			"displayName": "task123"
		}
	]

	assert backend.storages == [
		{
			"id": "1",
			"displayName": "storage1",
			"capacity": 100_000_000,
			"highWaterMark": 90,
			"filled": 10,
		},
		{
			"id": "123",
			"displayName": "storage123",
			"capacity": 200_000_000,
			"highWaterMark": 80,
			"filled": 20,
		}
	]


def test_update_data_not_a_backup():
	mock_result1 = _create_mock_result("foo", "1", "saveset1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"),
									   None, 0)
	simple_rule_based_analyzer = MockSimpleRuleBasedAnalyzer()
	database = MockDatabase([mock_result1], [])
	backend = MockBackend()
	Analyzer.init(database, backend, simple_rule_based_analyzer, None)
	Analyzer.update_data()

	assert backend.backups == []


def test_update_data_no_subtasks():
	mock_result1 = _create_mock_result("foo", "1", "saveset1", "F", 100_000_000, datetime.fromisoformat("2000-01-01"),
									   None, 1, 1)
	simple_rule_based_analyzer = MockSimpleRuleBasedAnalyzer()
	database = MockDatabase([mock_result1], [])
	backend = MockBackend()
	Analyzer.init(database, backend, simple_rule_based_analyzer, None)
	Analyzer.update_data()

	assert backend.backups == []
