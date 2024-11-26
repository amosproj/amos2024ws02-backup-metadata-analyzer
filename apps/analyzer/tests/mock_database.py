class MockDatabase:
    def __init__(self, results):
        self.results = results

    def get_results(self):
        return iter(self.results)
