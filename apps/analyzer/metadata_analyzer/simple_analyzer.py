class SimpleAnalyzer:
    def __init__(self):
        pass

    def analyze(self, data):
        count = len(data)
        print("length of data " + str(count))
        dates = []
        sizes = []
        for elem in data:
            size = elem.get("sizeMB")
            if size != None:
                dates.append(elem.get("creationDate"))
                sizes.append(size)
        return {
            "count": count,
            "firstBackup": min(dates),
            "lastBackup": max(dates),
            "minSize": min(sizes),
            "maxSize": max(sizes),
        }
