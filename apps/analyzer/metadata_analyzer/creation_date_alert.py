class CreationDateAlert:
    def __init__(self, result, reference_date):
        self.backup_saveset = result.saveset
        self.date = result.start_time
        self.reference_date = reference_date

    def as_json(self):
        return {
                "backupSavesetName": self.backup_saveset,
                "date": self.date.isoformat(),
                "referenceDate": self.reference_date.isoformat()
        }
