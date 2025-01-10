class MockDatabase:
    def __init__(self, results, tasks=[], data_stores=[], schedules=[]):
        self.results = results
        self.tasks = tasks
        self.data_stores = data_stores
        self.schedules = schedules

    def get_results(self, latest_backup_date=None):
        return iter(self.results)

    def get_tasks(self):
        return iter(self.tasks)

    def get_data_stores(self):
        return iter(self.data_stores)

    def get_schedules(self):
        return iter(self.schedules)
