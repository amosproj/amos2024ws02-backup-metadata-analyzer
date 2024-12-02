import requests

class Backend:
    def __init__(self, backend_url):
        self.backend_url = backend_url

    def send_backup_data_batched(self, batch):
        url = self.backend_url + "backupData/batched"
        r = requests.post(url, json=batch)
        r.raise_for_status()

    def create_alert(self, alert):
        url = self.backend_url + "alerting/size"
        r = requests.post(url, json=alert)
        r.raise_for_status()

    def create_creation_date_alert(self, alert):
        url = self.backend_url + "alerting/creationDate"
        r = requests.post(url, json=alert)
