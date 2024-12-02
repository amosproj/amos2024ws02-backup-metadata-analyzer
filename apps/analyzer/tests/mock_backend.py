class MockBackend:
    def __init__(self):
        self.backups = []
        self.size_alerts = []

    def send_backup_data_batched(self, batch):
        self.backups += batch

    def create_size_alert(self, alert):
        self.size_alerts.append(alert)

    def get_latest_alert_id(self, alert_type, backup_type=None):
        if alert_type == "SIZE_ALERT":
            alerts = self.size_alerts
        else:
            alerts = []

        return ""
            

