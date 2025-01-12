from datetime import datetime

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


def _create_mock_schedule(name, p_base, p_count, start_time = None, days = []):
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


# Backups created according to the schedule should not generate alerts
def test_creation_time_alert_correct_schedule():
    mock_result1 = _create_mock_result(
        "foo", "1", "F", 100_000_000, datetime.fromisoformat("2000-01-01T12:00:00"), "bar",
    )
    mock_result2 = _create_mock_result(
        "foo", "2", "F", 100_000_000, datetime.fromisoformat("2000-01-01T15:00:00"), "bar",
    )
    mock_result3 = _create_mock_result(
        "foo", "3", "F", 100_000_000, datetime.fromisoformat("2000-01-01T18:00:00"), "bar",
    )
    mock_result4 = _create_mock_result(
        "foo", "4", "F", 100_000_000, datetime.fromisoformat("2000-01-01T21:00:00"), "bar",
    )
    mock_schedule = _create_mock_schedule(
        "bar", "HOU", 3
    )
    mock_task_event = _create_mock_task_event(
        1, "1", "foo", "bar"
    )

    database = MockDatabase(
        [mock_result1, mock_result2, mock_result3, mock_result4], [], [], [mock_schedule], [mock_task_event]
    )
    backend = MockBackend()
    schedule_based_analyzer = ScheduleBasedAnalyzer(backend)
    Analyzer.init(database, backend, None, None, None, schedule_based_analyzer)
    Analyzer.schedule_based_analysis(-1)

    assert backend.creation_date_alerts == []
