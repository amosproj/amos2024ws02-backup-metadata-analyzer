import sys
from collections import defaultdict
import metadata_analyzer.backend
from datetime import datetime, timedelta

class SimpleRuleBasedAnalyzer:
    def __init__(self, backend, size_alert_percentage, inc_percentage, inc_date_percentage, diff_percentage):
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

        alert = {
                "size": result2.data_size / 1_000_000,
                "referenceSize": result1.data_size / 1_000_000,
                "backupId": result2.uuid,
        }
        return [alert]
    
    def handle_zero(self,result1, result2):
        # Handle results with a data_size of zero
        if result1.data_size == 0 and result2.data_size == 0:
            relative_change = 0
        elif result1.data_size == 0:
            relative_change = float("inf")
        elif result2.data_size == 0:
            relative_change = -float("inf")
        else:
            relative_change = (result2.data_size - result1.data_size) / result1.data_size
        return relative_change
    
    # Analyze a pair of consecutive results, returns a list of created alerts
    def _analyze_pair_diff(self, result1, result2):
        relative_change = self.handle_zero(result1, result2)

        # Skip pairs of results with changes inside the bounds that increase
        if relative_change > 0 and relative_change <= self.diff_percentage:
            return []

        alert = {
                "size": result2.data_size / 1_000_000,
                "referenceSize": result1.data_size / 1_000_000,
                "backupId": result2.uuid,
        }

        return [alert]

    # For now only search for size changes and trigger corresponding alerts
    def analyze(self, data, alert_limit):
        # Group the 'full' results by their task
        groups = defaultdict(list)
        for result in data:
            if (result.task == ""
                or result.fdi_type != 'F'
                or result.data_size is None
                or result.start_time is None):
                continue
            groups[result.task].append(result)

        alerts = []
        # Iterate through each group to find drastic size changes
        for task, unordered_results in groups.items():
            results = sorted(unordered_results, key=lambda result: result.start_time)
            # Iterate through each pair of consecutive results and compare their sizes
            for result1, result2 in zip(results[:-1], results[1:]):
                new_alerts = self._analyze_pair(result1, result2, self.size_alert_percentage)
                alerts += new_alerts

            # Find creation time alerts
            self._analyze_creation_times(results)
    
        # Only send a maximum of alert_limit alerts or all alerts if alert_limit is -1
        count = len(alerts) if alert_limit == -1 else min(alert_limit, len(alerts))
        # Send the alerts to the backend
        for alert in alerts[:count]:
            self.backend.create_alert(alert)

        return {
            "count": count
        }
    
    # Searches for size increases in diffs and trigger corresponding alerts if not applicable
    def analyze_diff(self, data, alert_limit):
        # Group the 'full' and 'diff results by their task
        groups = defaultdict(list)
        groupNum = 0
        for result in data:
            if (result.task == ""
                or (result.fdi_type != 'F' and result.fdi_type != 'D')
                or result.data_size is None
                or result.start_time is None):
                continue
            if (result.fdi_type == 'F'):
                groupNum += 1
                continue
            groups[groupNum].append(result)

        alerts = []
        # Iterates through groups to ensure size increases except when a full backup was done
        for task, unordered_results in groups.items():
            results = sorted(unordered_results, key=lambda result: result.start_time)
            # Iterate through each pair of consecutive results and compare their sizes
            for result1, result2 in zip(results[:-1], results[1:]):
                new_alerts = self._analyze_pair_diff(result1, result2)
                alerts += new_alerts
    
        # Only send a maximum of alert_limit alerts or all alerts if alert_limit is -1
        count = len(alerts) if alert_limit == -1 else min(alert_limit, len(alerts))
        # Send the alerts to the backend
        for alert in alerts[:count]:
            self.backend.create_alert(alert)

        return {
            "count": count
        }

# Searches for size changes in incs and triggers corresponding alerts if not applicable
    def analyze_inc(self, data, alert_limit):

        groups = defaultdict(list)
        for result in data:
            if (result.task == ""
                or result.fdi_type != 'I'
                or result.data_size is None
                or result.start_time is None):
                continue
            groups[result.task].append(result)

        alerts = []
        # Iterates through groups to ensure size increases except when a full backup was done
        for task, unordered_results in groups.items():
            results = sorted(unordered_results, key=lambda result: result.start_time)

            # For now assumes that average size of incs is base value from which to judge all incs, may be subject to change
            # Iterate through each results get an average value
            avg_size = 0
            prev_time = results[0].start_time
            avg_time = timedelta(0)


            for result in results:
                avg_size += result.data_size
                avg_time +=  result.start_time - prev_time
                prev_time = result.start_time

            avg_size = avg_size/(len(results))
            avg_time = avg_time/(len(results)-1)
            
                #if(True): # so times are regular in margin and data sizes are same in margin

            for prev, current in zip(results[:-1], results[1:]):
        
                interval = current.start_time - prev.start_time
                # only compares if incs happened at quasi-regular intervals
                if(interval >= avg_time * (1 - self.inc_date_percentage) and interval <= avg_time * (1 + self.inc_date_percentage)):
                    # converts prev to a result with the average size
                    prev.data_size = avg_size
                    new_alerts = self._analyze_pair(prev, current, self.inc_data_percentage)
                    alerts += new_alerts
    
        # Only send a maximum of alert_limit alerts or all alerts if alert_limit is -1
        count = len(alerts) if alert_limit == -1 else min(alert_limit, len(alerts))
        # Send the alerts to the backend
        for alert in alerts[:count]:
            self.backend.create_alert(alert)

        return {
            "count": count
        }
    

    # Analyzes the creation times of a group of results from one task
    def _analyze_creation_times(self, results):
        SECONDS_PER_DAY = 24 * 60 * 60

        alerts = []
        print("NEW")
        times = [results[0].start_time]
        # Skip the first result
        for result in results[1:]:
            time = result.start_time
            smallest_diff = SECONDS_PER_DAY
            for ref_time in times:
                diff = (time - ref_time).seconds
                if diff > SECONDS_PER_DAY / 2:
                    diff = SECONDS_PER_DAY - diff
                smallest_diff = min(smallest_diff, diff)

            if diff > 60 * 60:
                alerts.append({
                    "time": result.start_time,
                    "difference": diff,
                    "backupId": result.uuid
                })

            times.append(time)
        print(alerts)
        return times


