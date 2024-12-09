class StorageFillAlert:
    def __init__(self, data_store):
        self.name = data_store.name
        self.capacity = data_store.capacity
        self.filled = data_store.filled
        self.high_water_mark = data_store.high_water_mark

    def as_json(self):
        return {
            "name": self.name,
            "capacity": self.capacity,
            "filled": self.filled,
            "highWaterMark": self.high_water_mark,
        }
