from metadata_analyzer.forecast_storage_fill_alert import ForecastStorageFillAlert
import pandas as pd

class EnhancedStorageAnalyzer:

    # Analyzes if storage capacity will be reached within confines of forecast
    def analyze_future_storage_capacity(self, data_stores, data, alert_limit):
        print("top of the method", flush=True)
        alerts = []
        forecasted_overflows = []
        print("Whoop we got into the forecasting method",flush=True)
        for data_store in data_stores:
            # Skip data stores with missing data
            if (
                data_store.capacity is None
                or data_store.filled is None
                or data_store.high_water_mark is None
            ):
                continue
            # TODO remove, debug!
            printed = False
            for result in data:
                # TODO remove next lines, debug!
                if(not printed):
                    print("result: ",flush=True)
                    print(result,flush=True)
                    #df = pd.DataFrame([result.as_dict()])
                    #print("dataframe: ",flush=True)
                    #print(df,flush=True)
                    printed = True
                    print(" ",flush=True)
                    print("capacity: ", flush=True)
                    print(data_store.capacity, flush=True)
                    print("high watermark: ", flush=True)
                    print(data_store.high_water_mark,flush=True)
                #print("result uuid: " + str(result.uuid), flush=True)
                #print("store  uuid: " + str(data_store.uuid), flush=True)
                if result.uuid == data_store.uuid:
                    print("i found matching uuids, " + int(result.uuid),flush=True)
                    # example store uuid: 7aeeab22-f6f1-11e3-9dc1-448a5b8404a2

                    # make time series
                    df = pd.DataFrame([result.as_dict()])
                    print("dataframe: ",flush=True)
                    print(df,flush=True)
                    # TODO analyze when overflow is going to be (capacity and high watermark    )
                    # TODO write into forecasted_overflows (unit in seconds?)
                    # removes already analyzed uuids from list
                    data.remove(result)
                    break

            #if data_store.filled > data_store.high_water_mark:
            #    alerts.append(ForecastStorageFillAlert(data_store))
            # TODO time series data preprocessing:
            # - time series transformation from data_store
            # - filter out subtasks
            # - remove unnecessary variables

        if alert_limit is None:
            alert_limit = 10

        # Only send a maximum of alert_limit alerts or all alerts if alert_limit is -1
        count = len(alerts) if alert_limit == -1 else min(alert_limit, len(alerts))
        # Send the alerts to the backend
        for alert in alerts[:count]:
            #self.backend.create_forecast_storage_fill_alert(alert.as_json())
            print("alert is next",flush=True)
            print(alert,flush=True)

        return {"count": count}