import sys
from collections import defaultdict
import metadata_analyzer.backend
from datetime import datetime, timedelta
from metadata_analyzer.size_alert import SizeAlert
from metadata_analyzer.creation_date_alert import CreationDateAlert
from metadata_analyzer.storage_fill_alert import StorageFillAlert


class SimpleRuleBasedAnalyzer:
    def __init__(
        self,
        backend,
        size_alert_percentage,
        inc_percentage,
        inc_date_percentage,
        diff_percentage,
    ):
        self.backend = backend
        self.size_alert_percentage = size_alert_percentage
        self.inc_data_percentage = inc_percentage
        self.inc_date_percentage = inc_date_percentage
        self.diff_percentage = diff_percentage

    # Analyze a pair of consecutive results, returns a list of created alerts
    def _analyze_pair(self, result1, result2, bound):
        relative_change = self.handle_zero(result1, result2)
        # Skip pairs of results with changes inside the bounds
        if -bound <= relative_change <= bound:
            return []

        alert = SizeAlert(result2, result1.data_size)
        return [alert]

    def handle_zero(self, result1, result2):
        # Handle results with a data_size of zero
        if result1.data_size == 0 and result2.data_size == 0:
            relative_change = 0
        elif result1.data_size == 0:
            relative_change = float("inf")
        elif result2.data_size == 0:
            relative_change = -float("inf")
        else:
            relative_change = (
                result2.data_size - result1.data_size
            ) / result1.data_size
        return relative_change

    # Analyze a pair of consecutive results, returns a list of created alerts
    def _analyze_pair_diff(self, result1, result2):
        relative_change = self.handle_zero(result1, result2)

        # Skip pairs of results with changes inside the bounds that increase
        if relative_change > 0 and relative_change <= self.diff_percentage:
            return []

        alert = SizeAlert(result2, result1.data_size)
        return [alert]

    # For now only search for size changes and trigger corresponding alerts
    def analyze(self, data, alert_limit, start_date):
        # Group the 'full' results by their task
        groups = defaultdict(list)
        for result in data:
            if (
                result.task == ""
                or result.fdi_type != "F"
                or result.data_size is None
                or result.start_time is None
                or result.subtask_flag != "0"
            ):
                continue
            groups[result.task].append(result)

        alerts = []
        # Iterate through each group to find drastic size changes
        for task, unordered_results in groups.items():
            results = sorted(unordered_results, key=lambda result: result.start_time)
            # Iterate through each pair of consecutive results and compare their sizes
            for result1, result2 in zip(results[:-1], results[1:]):
                # Only create alerts for unanalyzed results
                if result2.start_time > start_date:
                    alerts += self._analyze_pair(
                        result1, result2, self.size_alert_percentage
                    )

        # Because we ignore alerts which would be created earlier than the current latest alert,
        # we have to sort the alerts to not miss any alerts in the future
        alerts = sorted(alerts, key=lambda alert: alert.date)

        # If no alert limit was passed set it to default value
        if alert_limit is None:
            alert_limit = 10

        # Only send a maximum of alert_limit alerts or all alerts if alert_limit is -1
        count = len(alerts) if alert_limit == -1 else min(alert_limit, len(alerts))
        # Send the alerts to the backend
        for alert in alerts[:count]:
            self.backend.create_size_alert(alert.as_json())

        return {"count": count}

    # Searches for size increases in diffs and trigger corresponding alerts if not applicable
    def analyze_diff(self, data, alert_limit, start_date):
        # Group the 'full' and 'diff results by their task
        groups = defaultdict(list)
        groupNum = 0
        for result in data:
            if (
                result.task == ""
                or (result.fdi_type != "F" and result.fdi_type != "D")
                or result.data_size is None
                or result.start_time is None
                or result.subtask_flag != "0"
            ):
                continue
            if result.fdi_type == "F":
                groupNum += 1
                continue
            groups[groupNum].append(result)

        alerts = []
        # Iterates through groups to ensure size increases except when a full backup was done
        for task, unordered_results in groups.items():
            results = sorted(unordered_results, key=lambda result: result.start_time)
            # Iterate through each pair of consecutive results and compare their sizes
            for result1, result2 in zip(results[:-1], results[1:]):
                # Only create alerts for unanalyzed results
                if result2.start_time > start_date:
                    alerts += self._analyze_pair_diff(result1, result2)

        # Because we ignore alerts which would be created earlier than the current latest alert,
        # we have to sort the alerts to not miss any alerts in the future
        alerts = sorted(alerts, key=lambda alert: alert.date)

        # If no alert limit was passed set it to default value
        if alert_limit is None:
            alert_limit = 10

        # Only send a maximum of alert_limit alerts or all alerts if alert_limit is -1
        count = len(alerts) if alert_limit == -1 else min(alert_limit, len(alerts))
        # Send the alerts to the backend
        for alert in alerts[:count]:
            self.backend.create_size_alert(alert.as_json())

        return {"count": count}

    # Searches for size changes in incs and triggers corresponding alerts if not applicable
    def analyze_inc(self, data, alert_limit, start_date):

        groups = defaultdict(list)
        for result in data:
            if (
                result.task == ""
                or result.fdi_type != "I"
                or result.data_size is None
                or result.start_time is None
                or result.subtask_flag != "0"
            ):
                continue
            groups[result.task].append(result)

        alerts = []
        # Iterates through groups to ensure size increases except when a full backup was done
        for task, unordered_results in groups.items():
            results = sorted(unordered_results, key=lambda result: result.start_time)

            if len(results) <= 1:
                continue

            # For now assumes that average size of incs is base value from which to judge all incs, may be subject to change
            # Iterate through each results get an average value
            avg_size = 0
            prev_time = results[0].start_time
            avg_time = timedelta(0)

            for result in results:
                avg_size += result.data_size
                avg_time += result.start_time - prev_time
                prev_time = result.start_time

            avg_size = avg_size / (len(results))
            avg_time = avg_time / (len(results) - 1)

            # if(True): # so times are regular in margin and data sizes are same in margin

            for prev, current in zip(results[:-1], results[1:]):

                interval = current.start_time - prev.start_time
                # only compares if incs happened at quasi-regular intervals
                if interval >= avg_time * (
                    1 - self.inc_date_percentage
                ) and interval <= avg_time * (1 + self.inc_date_percentage):
                    # converts prev to a result with the average size
                    prev.data_size = avg_size

                    # Only create alerts for unanalyzed results
                    if current.start_time > start_date:
                        alerts += self._analyze_pair(
                            prev, current, self.inc_data_percentage
                        )

        # Because we ignore alerts which would be created earlier than the current latest alert,
        # we have to sort the alerts to not miss any alerts in the future
        alerts = sorted(alerts, key=lambda alert: alert.date)

        # If no alert limit was passed set it to default value
        if alert_limit is None:
            alert_limit = 10

        # Only send a maximum of alert_limit alerts or all alerts if alert_limit is -1
        count = len(alerts) if alert_limit == -1 else min(alert_limit, len(alerts))
        # Send the alerts to the backend
        for alert in alerts[:count]:
            self.backend.create_size_alert(alert.as_json())
            
        return {"count": count}

    # Search for unusual creation times of 'full' backups made after start_date
    def analyze_creation_dates(self, data, schedules, alert_limit, start_date):
        # Group the 'full' results by their task
        groups = defaultdict(list)
        for result in data:
            if (result.task == ""
                or result.fdi_type != 'F'
                or result.data_size is None
                or result.start_time is None
                or result.subtask_flag != "0"
            ):
                continue
            groups[result.task].append(result)

        # Create a dictionary from schedule name to the schedule object
        schedule_dict = dict()
        for schedule in schedules:
            schedule_dict[schedule.name] = schedule


        alerts = []
        # Iterate through each group to find unusual creation times
        for task, unordered_results in groups.items():
            results = sorted(unordered_results, key=lambda result: result.start_time)
            alerts += self._analyze_creation_dates_of_one_task(results, schedule_dict, start_date)
    

        # Because we ignore alerts which would be created earlier than the current latest alert,
        # we have to sort the alerts to not miss any alerts in the future
        alerts = sorted(alerts, key=lambda alert: alert.date)

        # If no alert limit was passed set it to default value:
        if alert_limit is None:
            alert_limit = 10

        # Only send a maximum of alert_limit alerts or all alerts if alert_limit is -1
        count = len(alerts) if alert_limit == -1 else min(alert_limit, len(alerts))
        # Send the alerts to the backend
        for alert in alerts[:count]:
            self.backend.create_creation_date_alert(alert.as_json())

        return {"count": count}
    

    # Analyzes the creation times of a group of results from one task.
    def _analyze_creation_dates_of_one_task(self, results, schedule_dict, start_date):
        base_to_seconds = {
            "MIN": 60,
            "HOU": 60 * 60,
            "DAY": 24 * 60 * 60,
            "WEE": 7 * 24 * 60 * 60,
            "MON": 30 * 24 * 60 * 60,
        }

        # Group all results by their schedule
        schedule_groups = defaultdict(list)
        for result in results:
            schedule_groups[result.schedule].append(result)

        alerts = []
        for schedule_name, schedule_group in schedule_groups.items():
            # Skip backups with schedules which are not in the schedule table
            if schedule_name not in schedule_dict.keys():
                continue
            # Get the schedule for this schedule group
            schedule = schedule_dict[schedule_name]
            if schedule.p_base not in base_to_seconds.keys():
                continue
            # Calculate the expected timedelta between two backups for this schedule
            multiplier = base_to_seconds[schedule.p_base]
            expected_delta_seconds = schedule.p_count * multiplier
            expected_delta = timedelta(seconds=expected_delta_seconds)
            # Skip the first backup in a schedule group
            for result1, result2 in zip(schedule_group[:-1], schedule_group[1:]):
                # Don't generate alerts for results older than the start_date
                if result2.start_time <= start_date:
                    continue

                # Calculate the expected time for result2 and compare it with the actual time
                expected_time = result1.start_time + expected_delta
                diff = abs(expected_time - result2.start_time)
                if diff.total_seconds() > 60 * 60: # Diff greater than an hour => alert
                    alerts.append(CreationDateAlert(result2, expected_time))

        return alerts


    # Search for data stores that are almost full
    def analyze_storage_capacity(self, data, alert_limit):
        alerts = []
        for data_store in data:
            # Skip data stores with missing data
            if (
                data_store.capacity is None
                or data_store.filled is None
                or data_store.high_water_mark is None
            ):
                continue
            if data_store.filled > data_store.high_water_mark:
                alerts.append(StorageFillAlert(data_store))

        if alert_limit is None:
            alert_limit = 10

        # Only send a maximum of alert_limit alerts or all alerts if alert_limit is -1
        count = len(alerts) if alert_limit == -1 else min(alert_limit, len(alerts))
        # Send the alerts to the backend
        for alert in alerts[:count]:
            self.backend.create_storage_fill_alert(alert.as_json())

        return {"count": count}
