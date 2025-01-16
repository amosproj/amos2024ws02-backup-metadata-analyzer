from metadata_analyzer.forecast_storage_fill_alert import ForecastStorageFillAlert
import pandas as pd

class EnhancedStorageAnalyzer:
    forecast_length = 31556952

    # TODO endpoint for this
    def set_forecast_length(self, new_length):
        self.forecast_length = new_length


    # Analyzes if storage capacity will be reached within confines of forecast
    def analyze_future_storage_capacity(self, data, labeled_data_store, time, high_water_mark, capacity):
        forecasted_overflows = []

        # go through all data_stores
        for row in labeled_data_store:
            print("reached")
                

        #for data_store in data_stores:
        #    # Skip data stores with missing data
        #    if (
        #       
        #    ):
        #        continue

        

            #    if (
            #        result.task == ""
            #        or result.is_backup == 0
            #        or result.data_size is None
            #        or result.start_time is None
            #        or result.subtask_flag != "0"
            #        or result.data_size == 0
            #    ):
            #       data.remove(result)

                # TODO when mapping between results and data_stores is found,
                #  use this information to split up forecasted storage sizes
                #print("data_store_uuid: ",flush=True)
                #print(data_store.uuid,flush=True)
                #print("location_uuid: ",flush=True)
                #print(result.location_uuid,flush=True)
                #print("data_store_name: ",flush=True)
                #print(data_store.name,flush=True)
                #print("location: ",flush=True)
                #print(result.location,flush=True)
                #print("data_size:",flush=True)
                #print(result.data_size,flush=True)
                #print("stored_size:",flush=True)
                #print(result.stored_size,flush=True)

            # TODO add parametrization so goes through all valid backups instead of all valid drives
            # bc i probably won't get that information

            # TODO change time series logic to continue until time to full found
            # read table into a dataframe
            #df = pd.DataFrame([res.as_dict() for res in data])
            #forecast_size = self.forecast_storage(df, time)

            #print("current data_store name:",flush=True)
            #print(data_store.name,flush=True)
            #print("current datastore uuid:",flush=True)
            #print(data_store.uuid,flush=True)
            #for label in labels:
            #    print("current data_store name:",flush=True)
            #    print(data_store.name,flush=True)
            #    print("current datastore uuid:",flush=True)
            #    print(data_store.uuid,flush=True)
            #    print("going through the labels")
            #    print("saveset:",flush=True)
            #    print(label.saveset,flush=True)
            #    print("uuid",flush=True)
            #    print(label.uuid,flush=True)
            #    print("pool:",flush=True)
            #    print(label.pool,flush=True)

            #TODO remove, placeholder
        forecast_size = None

        single_overflow = []
        if forecast_size is None:
            single_overflow.append({"high_water_mark": False})
            single_overflow.append({"capacity": False})
        else:
            if forecast_size > high_water_mark:
                single_overflow.append({"high_water_mark": True})
            else: 
                single_overflow.append({"high_water_mark": False})
            if forecast_size > capacity:
                single_overflow.append({"capacity": True})
            else:
                single_overflow.append({"capacity": False})    
                
            # TODO analyze when overflow is going to be (capacity and high watermark)
            # TODO write into forecasted_overflows (unit in seconds?)

            # adds overflows of specific backup task to collection
            forecasted_overflows.append({single_overflow})
        return forecasted_overflows
    
    def forecast_storage(self,df,time):
        # TODO adjust passed time to actual time series frequency, then calculate number of steps

        # remove entries that have the same sbc_start, necessary for indexing the time axis (could cause problems later)
        df = df.drop_duplicates(subset=["sbc_start"])
        # sorts dataframe by sbc_start
        df = df.sort_values("sbc_start")
        # removes unnecessary variables, only time for indices and data_size remains
        df = df[["sbc_start", "data_size"]]
        #print("cleaned dataframe: ",flush=True)
        #print(df,flush=True)


        # gets backup frequencies present in dataset
        freqs = df.diff()["sbc_start"]
        # orders frequencies by count and removes NaN edge cases
        freqs = freqs.value_counts()
        freqs = freqs[freqs.notnull()]
        freqs = freqs.reset_index()  # resetting index back into dataframe
        # converts into returnable format
        freqs["sbc_start"] = freqs["sbc_start"].dt.total_seconds()
        freqs = freqs.to_dict()
        #print("freqs found in dataset: " + str(freqs), flush=True)
        if len(freqs) > 3:
            print("actual freqs found!",flush=True)
            print(freqs,flush=True)

        if freqs:
            return None
        else:
            chosen_freq = freqs[0]
            print("frequency chosen for this time series was " + int(chosen_freq), flush=True)
            print("forecasting...",flush=True)
 