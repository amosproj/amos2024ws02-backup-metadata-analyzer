class ForecastStorageFillAlert:
    def __init__(self, data_store):
        self.name = data_store.name
        self.capacity = data_store.capacity
        self.filled = data_store.filled
        self.high_water_mark = data_store.high_water_mark
        self.time_until_filled = data_store.time_until_filled

    def as_json(self):
        return {
            "dataStoreName": self.name,
            "capacity": self.capacity,
            "filled": self.filled,
            "highWaterMark": self.high_water_mark,
            "timeUntilFilled": self.time_until_filled,
        }
