class MockBackend:
    def __init__(self):
        self.backups = []
        self.alerts = []

    def send_backup_data_batched(self, batch):
        self.backups += batch

    def create_alert(self, alert):
        self.alerts.append(alert)
