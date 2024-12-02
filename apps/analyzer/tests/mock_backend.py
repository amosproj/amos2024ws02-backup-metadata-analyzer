class MockBackend:
    def __init__(self):
        self.backups = []
        self.alerts = []
        self.creation_date_alerts = []

    def send_backup_data_batched(self, batch):
        self.backups += batch

    def create_alert(self, alert):
        self.alerts.append(alert)

    def create_creation_date_alert(self, alert):
        self.creation_date_alerts.append(alert)
