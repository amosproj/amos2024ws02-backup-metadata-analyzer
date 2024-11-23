import requests

class Backend:
    def __init__(self, backend_url):
        self.backend_url = backend_url

    def send_backup_data_batched(self, batch):
        url = self.backend_url + "backupData/batched"
        r = requests.post(url, json=batch)

    def create_alert(self, alert):
        url = self.backend_url + "alerting"
        r = requests.post(url, json=alert)
