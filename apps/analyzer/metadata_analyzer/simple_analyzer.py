class SimpleAnalyzer:
    def __init__(self):
        pass

    def analyze(self, data):
        count = len(data)
        print("length of data " + str(count))
        dates = []
        sizes = []
        for elem in data:
            dates.append(elem.get("creationDate"))
            sizes.append(elem.get("sizeMB"))
        return {
            "count": count,
            "firstBackup": min(dates),
            "lastBackup": max(dates),
            "minSize": min(sizes),
            "maxSize": max(sizes),
        }
