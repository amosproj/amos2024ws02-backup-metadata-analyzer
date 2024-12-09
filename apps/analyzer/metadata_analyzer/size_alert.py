class SizeAlert:
    def __init__(self, result, reference_size):
        self.uuid = result.uuid
        self.backup_saveset = result.saveset
        self.size = result.data_size / 1_000_000
        self.reference_size = reference_size / 1_000_000
        self.date = result.start_time

    def as_json(self):
        return {
                "backupId": self.uuid,
                "backupSavesetName": self.backup_saveset,
                "size": self.size,
                "referenceSize": self.reference_size
        }
