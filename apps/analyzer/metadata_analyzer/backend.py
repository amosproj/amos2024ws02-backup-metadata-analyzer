import requests

class Backend:
    def __init__(self, backend_url):
        self.backend_url = backend_url

    def send_backup_data_batched(self, batch):
        url = self.backend_url + "backupData/batched"
        r = requests.post(url, json=batch)
        r.raise_for_status()

    def send_task_data_batched(self, batch):
        url = self.backend_url + "tasks/batched"
        r = requests.post(url, json=batch)
        r.raise_for_status()

    def send_storage_data(self, storage):
        url = self.backend_url + "dataStores"
        r = requests.post(url, json=storage)
        r.raise_for_status()

    def create_size_alert(self, alert):
        url = self.backend_url + "alerting/size"
        r = requests.post(url, json=alert)
        r.raise_for_status()

    def create_creation_date_alert(self, alert):
        url = self.backend_url + "alerting/creationDate"
        r = requests.post(url, json=alert)
        r.raise_for_status()

    def create_storage_fill_alert(self, alert):
        url = self.backend_url + "alerting/storageFill"
        r = requests.post(url, json=alert)
        r.raise_for_status()

    def get_latest_alert_id(self, alert_type, backup_type=None):
        url = self.backend_url + f"alerting/type/{alert_type}/latest"
        if backup_type != None:
            url += f"?backupType={backup_type}"
        r = requests.get(url)
        r.raise_for_status()
        return r.text

    def get_latest_backup_date(self):
        url = self.backend_url + "backupData/latest"
        r = requests.get(url)
        r.raise_for_status()
        return r.json()
