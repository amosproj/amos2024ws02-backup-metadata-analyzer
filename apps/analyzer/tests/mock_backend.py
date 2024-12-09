class MockBackend:
    def __init__(self):
        self.backups = []
        self.tasks = []
        self.size_alerts = []
        self.creation_date_alerts = []        
        self.latest_alert_ids = {}

    def send_backup_data_batched(self, batch):
        self.backups += batch

    def send_task_data_batched(self, batch):
        self.tasks += batch

    def create_creation_date_alert(self, alert):
        self.creation_date_alerts.append(alert)

    def create_size_alert(self, alert):
        self.size_alerts.append(alert)

    def set_latest_alert_id(self, alert_type, backup_type, uuid):
        self.latest_alert_ids[(alert_type, backup_type)] = uuid

    def get_latest_alert_id(self, alert_type, backup_type=None):
        if (alert_type, backup_type) in self.latest_alert_ids:
            return self.latest_alert_ids[(alert_type, backup_type)]
        else:
            return ""