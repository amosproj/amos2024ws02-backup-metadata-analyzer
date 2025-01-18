from collections import defaultdict
from datetime import datetime, timedelta, time
import sys


class ScheduleBasedAnalyzer:
    def __init__(self, backend):
        self.backend = backend

    def analyze(self, results, schedules, task_events, alert_limit, start_date):
        print("Schedule based analysis")
        # Group the results by their task
        groups = defaultdict(list)
        for result in results:
            if (
                result.is_backup == 0
                or result.subtask_flag != "0"
                or result.data_size is None
                or result.start_time is None
                or result.task == ""
                or result.fdi_type == ""
            ):
                continue
            groups[result.task].append(result)

        alerts = []
        for task, unordered_results in groups.items():
            results = sorted(unordered_results, key=lambda result: result.start_time)
            if task != "ntx_ase-vm1":  # TODO: remove
                continue
            alerts += self._analyze_one_task(
                task, results, schedules, task_events, start_date
            )

        # TODO: create alert
        count = 0
        return {"count": count}

    def _analyze_one_task(self, task, results, schedules, task_events, start_date):
        used_schedule_names = [
            task_event.schedule
            for task_event in task_events
            if task_event.object == task
        ]
        used_schedules = [
            schedule for schedule in schedules if schedule.name in used_schedule_names
        ]
        # print(used_schedules, file=sys.stderr)
        schedule_groups = defaultdict(list)
        for result in results:
            schedule_groups[result.schedule].append(result)

        alerts = []
        for used_schedule in used_schedules:
            alerts += self._analyze_one_task_one_schedule(
                used_schedule, schedule_groups[used_schedule.name], start_date
            )

        return []

    def _analyze_one_task_one_schedule(self, schedule, results, start_date):
        print(schedule, results, file=sys.stderr)
        reference_time = results[0].start_time
        print(reference_time, file=sys.stderr)
        next_reference_time = self.calculate_next_reference_time(schedule, reference_time)
        print(next_reference_time, file=sys.stderr)
        return []

    def calculate_next_reference_time(self, schedule, reference_time):
        base_to_seconds = {
            "MIN": 60,
            "HOU": 60 * 60,
            "DAY": 24 * 60 * 60,
            "WEE": 7 * 24 * 60 * 60,
            "MON": 30 * 24 * 60 * 60,
        }

        assert schedule.p_base in base_to_seconds.keys()

        # Calculate the expected timedelta between two backups for this schedule
        multiplier = base_to_seconds[schedule.p_base]
        expected_delta_seconds = schedule.p_count * multiplier
        expected_delta = timedelta(seconds=expected_delta_seconds)

        next_reference_time = reference_time + expected_delta;

        # Use the start_time of the schedule if the base is in days, weeks or months
        if schedule.p_base in ["DAY", "WEE", "MON"]:
            try:
                next_reference_time = datetime.combine(next_reference_time, time.fromisoformat(schedule.start_time))
            except ValueError:
                print(f"start_time with invalid format: {schedule_start_time}")

        # Check for the weekday of the next_reference_time if the base is in weeks or months
        if schedule.p_base in ["WEE", "MON"]:
            day_mask = [
                schedule.mo,
                schedule.tu,
                schedule.we,
                schedule.th,
                schedule.fr,
                schedule.sa,
                schedule.su,
            ]
            accepted_days = [i for i in range(7) if day_mask[i] == "1"]
            assert accepted_days != []  # Should have at least one accepted day

            while next_reference_time.weekday() not in accepted_days:
                next_reference_time += timedelta(days=1)

        return next_reference_time

