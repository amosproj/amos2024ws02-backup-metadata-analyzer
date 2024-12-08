class MockDatabase:
	def __init__(self, results, tasks = []):
		self.results = results
		self.tasks = tasks

	def get_results(self):
		return iter(self.results)

	def get_tasks(self):
		return iter(self.tasks)
