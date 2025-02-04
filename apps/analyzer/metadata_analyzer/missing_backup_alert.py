class MissingBackupAlert:
    def __init__(self, reference_date):
        self.reference_date = reference_date

    def as_json(self):
        return {"referenceDate": self.reference_date.isoformat()}
