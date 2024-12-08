class StorageFillAlert:
    def __init__(self, data_store):
        self.name = data_store.name
        self.capacity = data_store.capacity
        self.filled = data_store.filled

    def as_json(self):
        return {
                "name": self.name,
                "capacity": self.capacity
                "filled": self.filled
        }
