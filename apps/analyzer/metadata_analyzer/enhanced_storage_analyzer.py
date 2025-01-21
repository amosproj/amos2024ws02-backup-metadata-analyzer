from metadata_analyzer.forecast_storage_fill_alert import ForecastStorageFillAlert
import pandas as pd
import numpy as np
from darts import TimeSeries
from darts.models import AutoARIMA
from decimal import Decimal

class EnhancedStorageAnalyzer:
    forecast_length = 31622400
    frequency = 86400

    # TODO endpoint for this
    def set_forecast_length(self, new_length):
        self.forecast_length = new_length

    def set_forecast_frequency(self,new_frequency):
        self.frequency = new_frequency

    

    # Analyzes if storage capacity will be reached within confines of forecast
    def analyze_future_storage_capacity(self, data, labeled_data_store):
        scaled_forecasts = {}

        # gets the saveset (as an identifier) for all backups that are relevant for these labels
        savesets = set([row.saveset for row in labeled_data_store])

        # throws all backups into a dataframe
        root_df = pd.DataFrame([res.as_dict() for res in data])

        # removes backups from dataframe by their saveset if they are not saved on the data_stores in question
        root_df = root_df.loc[root_df["saveset"].isin(savesets)]

        
        # removing subtasks leads to forecast not converging, so leave commented out
        #root_df = root_df.loc[root_df["subtask_flag"]=='0']

        data_store_capacities = {}
        # groups savesets of backups by the data_store they are saved on
        data_store_groups = {}
        for row in labeled_data_store:
            if row.name not in data_store_groups:
                data_store_groups[row.name] = [row.saveset]
            else:
                data_store_groups[row.name].append(row.saveset)
            # saves data_store cpacities for later use
            if row.name not in data_store_capacities:
                data_store_capacities[row.name] = [row.capacity]


        # calculates the forecast values of each task
        forecasts = {}
        # groups savesets by their task, relevant tasks implicitly filtered as well
        tasks_savesets = root_df
        tasks_savesets = tasks_savesets.groupby("task")

        # starts forecast for every task
        task_total_sizes = {}
        for task,group in tasks_savesets:#

            df = group[["sbc_start", "data_size"]]
            forecast = self.forecast_storage(df)
            forecasts.update({task:forecast})


            # get the total size of all tasks on store
            task_size_val = group["data_size"].sum()
            task_total_sizes.update({task:task_size_val})

        task_size_on_datastore = {}
        for store,group in data_store_groups.items():
        
            # get size of task on data_store
            task_sizes = {}
            for saveset in group:

                current_task = root_df.loc[root_df['saveset'] == saveset]

                # sums up the total size a certain task needs on a data_store
                if not current_task.empty: 
                    current_task = current_task.iloc[0]['task']

                    # TODO ensure updates the right values bc of iloc() function
                    if current_task not in task_sizes:
                        task_sizes.update({current_task:root_df.loc[root_df['saveset'] == saveset].iloc[0]['data_size']})
                    else:
                        sum = task_sizes[current_task] + root_df.loc[root_df['saveset'] == saveset].iloc[0]['data_size']
                        task_sizes.update({current_task:sum})
            task_size_on_datastore.update({store:task_sizes})
            
            # scale forecast values
            prev = None

            # gets tasks and their corresponding sizes that lie on selected data_store
            current_task_sizes = task_size_on_datastore[store]

            for task,size in current_task_sizes.items():
                # divides size of task that is on data_store by size of whole task
                print("scaling",flush=True)
                print("size on store is " + str(size),flush=True)
                print("total size of task next",flush=True)
                total_task_size = task_total_sizes[task]
                print(total_task_size,flush=True)
                scaler = size/(total_task_size)
                print("scaler is " + str(scaler),flush=True)
                #checks if first forecast for store, else adds normally

                #TODO tweak for tasks with different lengths, should be filtered out bc of steps but maybe mismatched frequencies can cause errors
                if forecasts[task] is not None:

                    forecast = forecasts[task]

                    print("unscaled dataframe from forecast series",flush=True)
                    print(forecast,flush=True)
                    if prev is None:
                        prev = forecast * scaler
                        print("scaled forecast",flush=True)
                        print(prev,flush=True)
                    else:
                        prev = np.add(prev,forecast * scaler)
                    print("adding prev",flush=True)
                    print(prev,flush=True)
                    print("to the forecast of this task",flush=True)
                    print(forecast,flush=True)
            scaled_forecasts.update({store:prev})

        print("stores with their scaled forecasted series",flush=True)
        print(scaled_forecasts,flush=True)
        
        return self.get_overflow_times(scaled_forecasts,data_store_capacities)
    
    def forecast_storage(self,df):

        # remove entries that have the same sbc_start, necessary for indexing the time axis (could cause problems later)
        df = df.drop_duplicates(subset=["sbc_start"])
        # sorts dataframe by sbc_start
        df = df.sort_values("sbc_start")
        # removes unnecessary variables, only time for indices and data_size remains
        df = df[["sbc_start", "data_size"]]
        df = df.dropna()

        # gets backup frequencies present in dataset
        freqs = df.diff()["sbc_start"]
        # orders frequencies by count and removes NaN edge cases
        freqs = freqs.value_counts()
        freqs = freqs[freqs.notnull()]
        freqs = freqs.reset_index()  # resetting index back into dataframe
        # converts into returnable format
        freqs["sbc_start"] = freqs["sbc_start"].dt.total_seconds()
        freqs = freqs.to_dict()

        chosen_freq = 0
        chosen_freq = freqs['sbc_start']

        if not bool(chosen_freq):
            #case if no frequencies were found
            return None
        chosen_freq = chosen_freq[0]
        #TODO add endpoint to change
        print("lock in chosen frequency at a day")
        chosen_freq = self.frequency

        # calculates number of steps to take for forecasting
        steps = int(self.forecast_length/chosen_freq)
        print("forecast length ",flush=True)
        print(self.forecast_length,flush=True)
        print("frequency ",flush=True)
        print(chosen_freq,flush=True)
        print("steps are " + str(steps),flush=True)

        df.index = df["sbc_start"]  # sets index to datetime in sbc_start column
        df = df.drop("sbc_start", axis=1)  # removes column because values are now in index

        # sets determined frequency and initializes time series
        chosen_freq = str(chosen_freq) + "s"  # adds unit
        df = df.asfreq(chosen_freq, method="ffill")
        # initializes time series
        series = TimeSeries.from_series(
            df, fill_missing_dates=False, freq=chosen_freq
        )

        #series must have 30 values, otherwise forecast is not possible
        if(len(series)>30):
            
            # TODO tweak init values
            model = AutoARIMA(start_p=8, max_p=12, start_q=1)
            model.fit(series)
            pred = model.predict(steps)
            pred = pred.values(True)
        else:
            pred = None

        print("prediction next",flush=True)
        print(pred,flush=True)
        return pred
 
    def get_overflow_times(self,scaled_forecasts,data_store_capacities):
        print("extracting overflow times")
        overflows = {}

        for key,forecasted_steps in scaled_forecasts.items():
            multiplier = 1000000000 #assume capacity in gb, forecast in bytes
            limit = data_store_capacities[key][0]
            print("limit is " + str(limit),flush=True)
            step_width = self.forecast_length / len(forecasted_steps)
            print("step width is " + str(step_width),flush=True)
            if not any(np.isnan(forecasted_steps)):
                # calculates how many steps
                i = 0
                for step in forecasted_steps:
                    i = i + 1
                    step = step[0]
                    print("step is " + str(step/multiplier),flush=True)
                    print("step converted to " + str(Decimal(step)),flush=True)
                    
                    # converts data_size in scientific notation to an int
                    if Decimal(step) >= limit * multiplier:
                        break
                print("without scaling would land at " + str(i) + " steps",flush=True)
                overflows.update({key:(i * step_width)})
        return overflows



