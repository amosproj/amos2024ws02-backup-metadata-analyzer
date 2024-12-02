class MockBackend:
    def __init__(self):
        self.backups = []
        self.alerts = []
        self.creation_date_alerts = []
        self.latest_creation_alert = ""

    def send_backup_data_batched(self, batch):
        self.backups += batch

    def create_alert(self, alert):
        self.alerts.append(alert)

    def create_creation_date_alert(self, alert):
        self.creation_date_alerts.append(alert)

    def set_latest_creation_date_alert(self, latest_creation_alert):
        self.latest_creation_alert = latest_creation_alert

    def get_latest_creation_date_alert(self):
        return self.latest_creation_alert
