import sys
from collections import defaultdict

class SimpleRuleBasedAnalyzer:
    def __init__(self, size_alert_percentage):
        self.size_alert_percentage = size_alert_percentage

    # Analyze a pair of consecutive results
    def _analyze_pair(self, result1, result2)
        # Handle results with a data_size of zero
        if result1.data_size != 0:
            relative_change = (result1.data_size - result2.data_size) / result1.data_size
        else:
            relative_change = 0 if result2.data_size == 0 else float("inf")

        if relative_change > :
            count += 1
            print(result1.data_size, result2.data_size)

    # For now only search for size changes and trigger corresponding alerts
    def analyze(self, data):
        print(len(data), file=sys.stderr)

        # Group the 'full' results by their task
        groups = defaultdict(list)
        for result in data:
            if (result.task == ""
                or result.fdi_type != 'F'
                or result.data_size is None
                or result.start_time is None):
                continue
            groups[result.task].append(result)

        print(len(groups), file=sys.stderr)

        # Iterate through each group to find drastic size changes
        for task, unordered_results in groups.items():
            results = sorted(unordered_results, key=lambda result: result.start_time)
            print(task, len(results), file=sys.stderr)
            # Iterate through each pair of consecutive results and compare their sizes
            for result1, result2 in zip(results[:-1], results[1:]):
                self._analyze_pair(result1, result2)

        return {}
