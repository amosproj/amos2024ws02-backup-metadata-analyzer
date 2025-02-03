class CreationDateAlert:
    def __init__(self, result, reference_date):
        self.backup_uuid = result.uuid
        self.date = result.start_time
        self.reference_date = reference_date

    def as_json(self):
        return {
            "backupId": self.backup_uuid,
            "date": self.date.isoformat(),
            "referenceDate": self.reference_date.isoformat(),
        }
