class MockBackend:
	def __init__(self):
		self.backups = []
		self.tasks = []
		self.storages = []
		self.size_alerts = []
		self.creation_date_alerts = []
		self.storage_fill_alerts = []
		self.missing_backup_alerts = []
		self.additional_backup_alerts = []
		self.latest_alert_ids = {}

	def send_backup_data_batched(self, batch):
		self.backups += batch

	def send_task_data_batched(self, batch):
		self.tasks += batch

	def send_storage_data(self, storage):
		self.storages += [storage]

	def create_creation_date_alert(self, alert):
		self.creation_date_alerts.append(alert)

	def create_size_alert(self, alert):
		self.size_alerts.append(alert)

	def create_storage_fill_alerts(self, alerts):
		self.storage_fill_alerts += alerts

	def create_missing_backup_alert(self, alert):
		self.missing_backup_alerts.append(alert)

	def create_additional_backup_alert(self, alert):
		self.additional_backup_alerts.append(alert)

	def set_latest_alert_id(self, alert_type, backup_type, uuid):
		self.latest_alert_ids[(alert_type, backup_type)] = uuid

	def get_latest_alert_id(self, alert_type, backup_type=None):
		if (alert_type, backup_type) in self.latest_alert_ids:
			return self.latest_alert_ids[(alert_type, backup_type)]
		else:
			return ""

	def get_latest_backup_date(self):
		if len(self.backups) == 0:
			return None
		else:
			return self.backups[-1]
