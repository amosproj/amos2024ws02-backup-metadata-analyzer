from collections import defaultdict
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
        return []
