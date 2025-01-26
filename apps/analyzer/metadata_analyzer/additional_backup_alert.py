class AdditionalBackupAlert:
    def __init__(self, result):
        self.backup_uuid = result.uuid
        self.date = result.start_time

    def as_json(self):
        return {
                "backupId": self.backup_uuid,
                "date": self.date.isoformat(),
        }
