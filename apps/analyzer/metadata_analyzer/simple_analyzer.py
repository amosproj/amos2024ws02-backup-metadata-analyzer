class SimpleAnalyzer:
    def __init__(self):
        pass

    def analyze(self, data):
        count = len(data)
        dates = list(map(lambda backup_data: backup_data.creationDate, data))
        sizes = list(map(lambda backup_data: backup_data.sizeMB, data))
        return {
            "count": count,
            "firstBackup": min(dates),
            "lastBackup": max(dates),
            "minSize": min(sizes),
            "maxSize": max(sizes),
        }
