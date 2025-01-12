from collections import defaultdict

class ScheduleBasedAnalyzer:
    def __init__(self, backend):
        self.backend = backend

    def analyze(self, results, schedules, task_events, alert_limit, start_date):
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
            alerts += self._analyze_one_task(results, start_date)

        count = 0
        return {"count": count}

    def _analyze_one_task(self, results, start_date):
        return []
