from datetime import datetime, timedelta

from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.models import Result, Schedule, TaskEvent
from metadata_analyzer.schedule_based_analyzer import ScheduleBasedAnalyzer
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


def _create_mock_task_event(id, name, object, schedule):
    mock_task_event = TaskEvent()
    mock_task_event.id = id
    mock_task_event.name = name
    mock_task_event.object = object
    mock_task_event.schedule = schedule
    return mock_task_event


# Test calculate next reference time


# Test with schedule based on minutes
def test_calculate_next_reference_time_min():
    mock_schedule = _create_mock_schedule("foo", "MIN", 30)
    reference_time = datetime.fromisoformat("2000-01-01T12:00:00")
    schedule_based_analyzer = ScheduleBasedAnalyzer(None)
    next_reference_time = schedule_based_analyzer.calculate_next_reference_time(
        mock_schedule, reference_time
    )
    assert next_reference_time == reference_time + timedelta(minutes=30)


# Test with schedule based on hours
def test_calculate_next_reference_time_hou():
    mock_schedule = _create_mock_schedule("foo", "HOU", 4)
    reference_time = datetime.fromisoformat("2000-01-01T12:00:00")
    schedule_based_analyzer = ScheduleBasedAnalyzer(None)
    next_reference_time = schedule_based_analyzer.calculate_next_reference_time(
        mock_schedule, reference_time
    )
    assert next_reference_time == reference_time + timedelta(hours=4)


# Test with schedule based on days
def test_calculate_next_reference_time_day():
    mock_schedule = _create_mock_schedule("foo", "DAY", 1, "14:00")
    reference_time = datetime.fromisoformat("2000-01-01T10:00:00")
    schedule_based_analyzer = ScheduleBasedAnalyzer(None)
    next_reference_time = schedule_based_analyzer.calculate_next_reference_time(
        mock_schedule, reference_time
    )
    assert next_reference_time == datetime.fromisoformat("2000-01-02T14:00:00")


# Test with schedule based on weeks
def test_calculate_next_reference_time_wee():
    mock_schedule = _create_mock_schedule(
        "foo", "WEE", 2, "12:00", days=["mo", "tu", "we", "th", "fr", "sa", "su"]
    )
    reference_time = datetime.fromisoformat("2000-01-01T18:00:00")
    schedule_based_analyzer = ScheduleBasedAnalyzer(None)
    next_reference_time = schedule_based_analyzer.calculate_next_reference_time(
        mock_schedule, reference_time
    )
    assert next_reference_time == datetime.fromisoformat("2000-01-15T12:00:00")


# Test with schedule based on months
def test_calculate_next_reference_time_mon():
    mock_schedule = _create_mock_schedule(
        "foo", "MON", 1, "12:00", days=["mo", "tu", "we", "th", "fr", "sa", "su"]
    )
    reference_time = datetime.fromisoformat("2000-01-02T10:00:00")
    schedule_based_analyzer = ScheduleBasedAnalyzer(None)
    next_reference_time = schedule_based_analyzer.calculate_next_reference_time(
        mock_schedule, reference_time
    )
    assert next_reference_time == datetime.fromisoformat("2000-02-01T12:00:00")


# Backups created according to the schedule should not generate alerts
def test_alerts_correct_schedule():
    mock_result1 = _create_mock_result(
        "foo",
        "1",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T12:00:00"),
        "bar",
    )
    mock_result2 = _create_mock_result(
        "foo",
        "2",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T15:00:00"),
        "bar",
    )
    mock_result3 = _create_mock_result(
        "foo",
        "3",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T18:00:00"),
        "bar",
    )
    mock_result4 = _create_mock_result(
        "foo",
        "4",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T21:00:00"),
        "bar",
    )
    mock_schedule = _create_mock_schedule("bar", "HOU", 3)
    mock_task_event = _create_mock_task_event(1, "1", "foo", "bar")

    database = MockDatabase(
        [mock_result1, mock_result2, mock_result3, mock_result4],
        [],
        [],
        [mock_schedule],
        [mock_task_event],
    )
    backend = MockBackend()
    schedule_based_analyzer = ScheduleBasedAnalyzer(backend)
    Analyzer.init(database, backend, None, None, None, schedule_based_analyzer)
    Analyzer.schedule_based_analysis(-1, datetime.fromisoformat("2000-01-01T22:00:00"))

    assert backend.creation_date_alerts == []
    assert backend.missing_backup_alerts == []
    assert backend.additional_backup_alerts == []


# Backups created according to the schedule should not generate alerts even with small deviations
def test_alerts_correct_schedule_small_deviations():
    mock_result1 = _create_mock_result(
        "foo",
        "1",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T12:00:00"),
        "bar",
    )
    mock_result2 = _create_mock_result(
        "foo",
        "2",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T15:18:00"),
        "bar",
    )
    mock_result3 = _create_mock_result(
        "foo",
        "3",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T17:42:00"),
        "bar",
    )
    mock_result4 = _create_mock_result(
        "foo",
        "4",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T21:00:00"),
        "bar",
    )
    mock_schedule = _create_mock_schedule("bar", "HOU", 3)
    mock_task_event = _create_mock_task_event(1, "1", "foo", "bar")

    database = MockDatabase(
        [mock_result1, mock_result2, mock_result3, mock_result4],
        [],
        [],
        [mock_schedule],
        [mock_task_event],
    )
    backend = MockBackend()
    schedule_based_analyzer = ScheduleBasedAnalyzer(backend)
    Analyzer.init(database, backend, None, None, None, schedule_based_analyzer)
    Analyzer.schedule_based_analysis(-1, datetime.fromisoformat("2000-01-01T22:00:00"))

    assert backend.creation_date_alerts == []
    assert backend.missing_backup_alerts == []
    assert backend.additional_backup_alerts == []


# Backups created according to the schedule should generate alerts with large deviations
def test_alerts_correct_schedule_large_deviations():
    mock_result1 = _create_mock_result(
        "foo",
        "1",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T12:00:00"),
        "bar",
    )
    mock_result2 = _create_mock_result(
        "foo",
        "2",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T15:18:01"),
        "bar",
    )
    mock_result3 = _create_mock_result(
        "foo",
        "3",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T17:41:59"),
        "bar",
    )
    mock_result4 = _create_mock_result(
        "foo",
        "4",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T21:00:00"),
        "bar",
    )
    mock_schedule = _create_mock_schedule("bar", "HOU", 3)
    mock_task_event = _create_mock_task_event(1, "1", "foo", "bar")

    database = MockDatabase(
        [mock_result1, mock_result2, mock_result3, mock_result4],
        [],
        [],
        [mock_schedule],
        [mock_task_event],
    )
    backend = MockBackend()
    schedule_based_analyzer = ScheduleBasedAnalyzer(backend)
    Analyzer.init(database, backend, None, None, None, schedule_based_analyzer)
    Analyzer.schedule_based_analysis(-1, datetime.fromisoformat("2000-01-01T22:00:00"))

    assert backend.creation_date_alerts == [
        {
            "backupId": mock_result2.uuid,
            "date": mock_result2.start_time.isoformat(),
            "referenceDate": "2000-01-01T15:00:00",
        },
        {
            "backupId": mock_result3.uuid,
            "date": mock_result3.start_time.isoformat(),
            "referenceDate": "2000-01-01T18:00:00",
        },
    ]
    assert backend.missing_backup_alerts == []
    assert backend.additional_backup_alerts == []


# Additional backup should generate additional backup alert
def test_alerts_additional_backup():
    mock_result1 = _create_mock_result(
        "foo",
        "1",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T12:00:00"),
        "bar",
    )
    mock_result2 = _create_mock_result(
        "foo",
        "2",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T15:00:00"),
        "bar",
    )
    mock_result3 = _create_mock_result(
        "foo",
        "3",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T18:00:00"),
        "bar",
    )
    mock_schedule = _create_mock_schedule("bar", "HOU", 6)
    mock_task_event = _create_mock_task_event(1, "1", "foo", "bar")

    database = MockDatabase(
        [mock_result1, mock_result2, mock_result3],
        [],
        [],
        [mock_schedule],
        [mock_task_event],
    )
    backend = MockBackend()
    schedule_based_analyzer = ScheduleBasedAnalyzer(backend)
    Analyzer.init(database, backend, None, None, None, schedule_based_analyzer)
    Analyzer.schedule_based_analysis(-1, datetime.fromisoformat("2000-01-01T22:00:00"))

    assert backend.creation_date_alerts == []
    assert backend.missing_backup_alerts == []
    assert backend.additional_backup_alerts == [
        {
            "backupId": mock_result2.uuid,
            "date": mock_result2.start_time.isoformat(),
        }
    ]


# Multiple additional backups should generate multiple additional backup alerts
def test_alerts_multiple_additional_backups():
    mock_result1 = _create_mock_result(
        "foo",
        "1",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T12:00:00"),
        "bar",
    )
    mock_result2 = _create_mock_result(
        "foo",
        "2",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T14:00:00"),
        "bar",
    )
    mock_result3 = _create_mock_result(
        "foo",
        "3",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T16:00:00"),
        "bar",
    )
    mock_result4 = _create_mock_result(
        "foo",
        "4",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T18:00:00"),
        "bar",
    )
    mock_schedule = _create_mock_schedule("bar", "HOU", 6)
    mock_task_event = _create_mock_task_event(1, "1", "foo", "bar")

    database = MockDatabase(
        [mock_result1, mock_result2, mock_result3, mock_result4],
        [],
        [],
        [mock_schedule],
        [mock_task_event],
    )
    backend = MockBackend()
    schedule_based_analyzer = ScheduleBasedAnalyzer(backend)
    Analyzer.init(database, backend, None, None, None, schedule_based_analyzer)
    Analyzer.schedule_based_analysis(-1, datetime.fromisoformat("2000-01-01T22:00:00"))

    assert backend.creation_date_alerts == []
    assert backend.missing_backup_alerts == []
    assert backend.additional_backup_alerts == [
        {
            "backupId": mock_result2.uuid,
            "date": mock_result2.start_time.isoformat(),
        },
        {
            "backupId": mock_result3.uuid,
            "date": mock_result3.start_time.isoformat(),
        },
    ]


# Missing backup should generate missing backup alert
def test_alerts_missing_backup():
    mock_result1 = _create_mock_result(
        "foo",
        "1",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T12:00:00"),
        "bar",
    )
    mock_result2 = _create_mock_result(
        "foo",
        "2",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T18:00:00"),
        "bar",
    )
    mock_schedule = _create_mock_schedule("bar", "HOU", 3)
    mock_task_event = _create_mock_task_event(1, "1", "foo", "bar")

    database = MockDatabase(
        [mock_result1, mock_result2],
        [],
        [],
        [mock_schedule],
        [mock_task_event],
    )
    backend = MockBackend()
    schedule_based_analyzer = ScheduleBasedAnalyzer(backend)
    Analyzer.init(database, backend, None, None, None, schedule_based_analyzer)
    Analyzer.schedule_based_analysis(-1, datetime.fromisoformat("2000-01-01T20:00:00"))

    assert backend.creation_date_alerts == []
    assert backend.missing_backup_alerts == [
        {
            "referenceDate": "2000-01-01T15:00:00",
        }
    ]
    assert backend.additional_backup_alerts == []


# Multiple missing backups should generate multiple missing backup alerts
def test_alerts_multiple_missing_backups():
    mock_result1 = _create_mock_result(
        "foo",
        "1",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T12:00:00"),
        "bar",
    )
    mock_result2 = _create_mock_result(
        "foo",
        "2",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T18:00:00"),
        "bar",
    )
    mock_schedule = _create_mock_schedule("bar", "HOU", 2)
    mock_task_event = _create_mock_task_event(1, "1", "foo", "bar")

    database = MockDatabase(
        [mock_result1, mock_result2],
        [],
        [],
        [mock_schedule],
        [mock_task_event],
    )
    backend = MockBackend()
    schedule_based_analyzer = ScheduleBasedAnalyzer(backend)
    Analyzer.init(database, backend, None, None, None, schedule_based_analyzer)
    Analyzer.schedule_based_analysis(-1, datetime.fromisoformat("2000-01-01T19:00:00"))

    assert backend.creation_date_alerts == []
    assert backend.missing_backup_alerts == [
        {
            "referenceDate": "2000-01-01T14:00:00",
        },
        {
            "referenceDate": "2000-01-01T16:00:00",
        },
    ]
    assert backend.additional_backup_alerts == []


# Check correct behavior of mixing additional backup alerts and creation date alerts
def test_alerts_creation_date_alert_and_additional_backup_alerts():
    mock_result1 = _create_mock_result(
        "foo",
        "1",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T12:00:00"),
        "bar",
    )
    mock_result2 = _create_mock_result(
        "foo",
        "2",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T15:00:00"),
        "bar",
    )
    mock_result3 = _create_mock_result(
        "foo",
        "3",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T16:30:00"),
        "bar",
    )
    mock_result4 = _create_mock_result(
        "foo",
        "4",
        "F",
        100_000_000,
        datetime.fromisoformat("2000-01-01T20:00:00"),
        "bar",
    )
    mock_schedule = _create_mock_schedule("bar", "HOU", 4)
    mock_task_event = _create_mock_task_event(1, "1", "foo", "bar")

    database = MockDatabase(
        [mock_result1, mock_result2, mock_result3, mock_result4],
        [],
        [],
        [mock_schedule],
        [mock_task_event],
    )
    backend = MockBackend()
    schedule_based_analyzer = ScheduleBasedAnalyzer(backend)
    Analyzer.init(database, backend, None, None, None, schedule_based_analyzer)
    Analyzer.schedule_based_analysis(-1, datetime.fromisoformat("2000-01-01T22:00:00"))

    assert backend.creation_date_alerts == [
        {
            "backupId": mock_result3.uuid,
            "date": mock_result3.start_time.isoformat(),
            "referenceDate": "2000-01-01T16:00:00",
        }
    ]
    assert backend.missing_backup_alerts == []
    assert backend.additional_backup_alerts == [
        {
            "backupId": mock_result2.uuid,
            "date": mock_result2.start_time.isoformat(),
        }
    ]
