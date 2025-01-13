from metadata_analyzer.forecast_storage_fill_alert import ForecastStorageFillAlert

class EnhancedStorageAnalyzer:

    # Analyzes if storage capacity will be reached within confines of forecast
    def analyze_future_storage_capacity(self, data, alert_limit):
        alerts = []
        for data_store in data:
            # Skip data stores with missing data
            if (
                data_store.capacity is None
                or data_store.filled is None
                or data_store.high_water_mark is None
            ):
                continue
            if data_store.filled > data_store.high_water_mark:
                alerts.append(ForecastStorageFillAlert(data_store))

        if alert_limit is None:
            alert_limit = 10

        # Only send a maximum of alert_limit alerts or all alerts if alert_limit is -1
        count = len(alerts) if alert_limit == -1 else min(alert_limit, len(alerts))
        # Send the alerts to the backend
        for alert in alerts[:count]:
            self.backend.create_storage_fill_alert(alert.as_json())

        return {"count": count}