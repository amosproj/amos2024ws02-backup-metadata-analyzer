from collections import defaultdict
from datetime import datetime, timedelta, time
import sys
from metadata_analyzer.creation_date_alert import CreationDateAlert
from metadata_analyzer.missing_backup_alert import MissingBackupAlert
from metadata_analyzer.additional_backup_alert import AdditionalBackupAlert

class ScheduleBasedAnalyzer:
    def __init__(self, backend):
        self.backend = backend

    def analyze(self, results, schedules, task_events, alert_limit, start_date, stop_date):
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
            alerts += self._analyze_one_task(
                task, results, schedules, task_events, start_date, stop_date
            )

        for alert in alerts:
            print(alert.as_json())
            if isinstance(alert, CreationDateAlert):
                self.backend.create_creation_date_alert(alert.as_json())
            elif isinstance(alert, MissingBackupAlert):
                self.backend.create_missing_backup_alert(alert.as_json())
            elif isinstance(alert, AdditionalBackupAlert):
                self.backend.create_additional_backup_alert(alert.as_json())

        # TODO: create alert
        count = 0
        return {"count": count}

    def _analyze_one_task(self, task, results, schedules, task_events, start_date, stop_date):
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
                used_schedule, schedule_groups[used_schedule.name], start_date, stop_date
            )

        return alerts

    def _analyze_one_task_one_schedule(self, schedule, results, start_date, stop_date):
        alerts = []
        print(schedule, results)
        tolerance = self.calculate_tolerance(schedule)
        print(tolerance)
        first_start = results[0].start_time
        last_ref, cur_ref, next_ref = first_start, first_start, self.calculate_next_reference_time(schedule, first_start) 
        print(last_ref, cur_ref, next_ref)
        while cur_ref < stop_date:
            left_end = last_ref + (cur_ref - last_ref) / 2 # Inclusive
            right_end = cur_ref + (next_ref - cur_ref) / 2 # Exclusive
            print(left_end, right_end)

            cur_results = [result for result in results if left_end <= result.start_time < right_end]
            print(cur_results)

            if len(cur_results) > 0:
                nearest_result = min(cur_results, key=lambda result: abs(result.start_time - cur_ref))
                smallest_diff = abs(nearest_result.start_time - cur_ref)
            else:
                nearest_result = None
            print(nearest_result, smallest_diff)

            if nearest_result is None:
                alerts.append(MissingBackupAlert(cur_ref))

            if smallest_diff > tolerance:
                alerts.append(CreationDateAlert(nearest_result, cur_ref))
            
            for result in cur_results:
                if nearest_result is None or result.uuid != nearest_result.uuid:
                    alerts.append(AdditionalBackupAlert(result))

            last_ref, cur_ref, next_ref = cur_ref, next_ref, self.calculate_next_reference_time(schedule, next_ref)
        return alerts

    def calculate_tolerance(self, schedule):
        return 0.1 * self.calculate_expected_delta(schedule);

    def calculate_expected_delta(self, schedule):
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
        return timedelta(seconds=expected_delta_seconds)


    def calculate_next_reference_time(self, schedule, reference_time):
        expected_delta = self.calculate_expected_delta(schedule)
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

