class MockDatabase:
    def __init__(self, results, tasks = [], data_stores = []):
        self.results = results
        self.tasks = tasks
        self.data_stores = data_stores

    def get_results(self):
        return iter(self.results)

    def get_tasks(self):
        return iter(self.tasks)

    def get_data_stores(self):
        return iter(self.data_stores)
