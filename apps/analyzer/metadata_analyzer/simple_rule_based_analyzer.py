import sys
from collections import defaultdict
import metadata_analyzer.backend

class SimpleRuleBasedAnalyzer:
    def __init__(self, backend, size_alert_percentage):
        self.backend = backend
        self.size_alert_percentage = size_alert_percentage

    # Analyze a pair of consecutive results, returns a list of created alerts
    def _analyze_pair(self, result1, result2):
        # Handle results with a data_size of zero
        if result1.data_size == 0 and result2.data_size == 0:
            relative_change = 0
        elif result1.data_size == 0:
            relative_change = float("inf")
        elif result2.data_size == 0:
            relative_change = -float("inf")
        else:
            relative_change = (result2.data_size - result1.data_size) / result1.data_size

        # Skip pairs of results with changes inside the bounds
        if -self.size_alert_percentage <= relative_change <= self.size_alert_percentage:
            return []

        alert = {
                "type": 0 if relative_change > 0 else 1,
                "value": result2.data_size / 1_000_000,
                "referenceValue": result1.data_size / 1_000_000,
                "backupId": result2.uuid,
        }

        return [alert]

    # For now only search for size changes and trigger corresponding alerts
    def analyze(self, data):
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
                new_alerts = self._analyze_pair(result1, result2)
                alerts += new_alerts
    
        # Send the alerts to the backend
        for alert in alerts:
            self.backend.create_alert(alert)

        return {
            "count": len(alerts)
        }
