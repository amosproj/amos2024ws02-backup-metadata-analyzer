import requests

class Backend:
    def __init__(self, backend_url):
        self.backend_url = backend_url

    def sendBackupDataBatched(self, batch):
        url = self.backend_url + "backupData/batched"
        r = requests.post(url, json=batch)
