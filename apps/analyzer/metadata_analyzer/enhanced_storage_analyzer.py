from metadata_analyzer.forecast_storage_fill_alert import ForecastStorageFillAlert
import pandas as pd
from darts import TimeSeries

class EnhancedStorageAnalyzer:
    forecast_length = 31556952

    # TODO endpoint for this
    def set_forecast_length(self, new_length):
        self.forecast_length = new_length


    # Analyzes if storage capacity will be reached within confines of forecast
    def analyze_future_storage_capacity(self, data, labeled_data_store, time, high_water_mark, capacity):
        forecasted_overflows = []

        # gets names of data_stores that match labels for the backup results
        distinct_names = set([row.name for row in labeled_data_store])
        # gets the saveset (as an identifier) for all backups that are relevant for these labels
        savesets = set([row.saveset for row in labeled_data_store])

        # throws all backups into a dataframe
        root_df = pd.DataFrame([res.as_dict() for res in data])
        # removes backups from dataframe by their saveset if they are not saved on the data_stores in question
        root_df = root_df.loc[root_df["saveset"].isin(savesets)]
        root_df = root_df.loc[root_df["subtask_flag"]=='0']

        # gets all tasks of the backups that are relevant
        tasks = root_df['task'].unique()

        # groups savesets of backups by the data_store they are saved on
        data_store_groups = {}
        for row in labeled_data_store:
            if row.name not in data_store_groups:
                data_store_groups[row.name] = [row.saveset]
            else:
                data_store_groups[row.name].append(row.saveset)

        # calculates the forecast values of each task
        forecasts = {}
        # groups savesets by their task, relevant tasks implicitly filtered as well
        tasks_savesets = root_df.groupby("task")
        #print("grouped df by task",flush=True)
        # starts forecast for every task
        for task,group in tasks_savesets:
            #TODO check if size is actually smaller than capacity when finally split up
            # if not maybe try to interpret data_size as total, so only take data_size of latest saveset value
            task_size = group["data_size"].sum()
            print("task size is " + str(task_size),flush=True)
            #print("forecast should happen now",flush=True)

            #TODO test, feeding "group" to forecast should work
            #TODO comment forecast back in, remove placeholder time series in next lines
            forecast = {'sbc_start':["2025-01-01","2025-01-02","2025-01-03"],'data_size':['21','42','73']}
            forecast = TimeSeries.from_series(forecast, fill_missing_dates=False, freq='d')
            #forecast = self.forecast_storage(group,self.forecast_length)
            forecasts.update({task:forecast})

        task_size_on_datastore = {}
        for store,group in data_store_groups.items():
        
            # get size of task on data_store
            task_sizes = {}
            for saveset in group:
                #print("group looks like this",flush=True)
                #print(group,flush=True)
                print("saveset in loop",flush=True)
                print(saveset,flush=True)

                current_task = root_df.loc[root_df['saveset'] == saveset]

                # sums up the total size a certain task needs on a data_store
                if current_task.empty:
                    print("saveset for task not found in root_df",flush=True)
                else: 
                    current_task = current_task.iloc[0]['task']
                    #print("current task is now",flush=True)
                    #print(current_task,flush=True)
                    if current_task not in task_sizes:
                        task_sizes.update({current_task:root_df.loc[root_df['saveset'] == saveset].iloc[0]['data_size']})
                    else:
                        sum = task_sizes[current_task] + root_df.loc[root_df['saveset'] == saveset].iloc[0]['data_size']
                        task_sizes.update({current_task:sum})
            
            # scale forecast values
            prev = pd.DataFrame()
            #TODO fix placeholder scaler
            scaler = 0.7
            # for savesets that have task that is in 
                # add previous groups to current (scaled) 
            current_task_sizes = task_size_on_datastore[store]
            for task,size in current_task_sizes:
                # TODO adjust unit of size
                prev = prev.add(size * scaler, fill_value=0)

            task_size_on_datastore.update({store:task_sizes})



        #print("stores with their tasks, all with the sizes on that store",flush=True)
        #print(task_size_on_datastore,flush=True)
        #TODO calc share using filled and capacity


        print("keys",flush=True)
        print(list(data_store_groups.keys()),flush=True)
        print(root_df.head,flush=True)

        for store_group_key in data_store_groups:
            print("fun")
        
        return None
    
    def forecast_storage(self,df):
        # TODO adjust passed time to actual time series frequency, then calculate number of steps
        # TODO convert seconds to steps
        steps = self.forecast_length

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
            #TODO forecasting here
            df.index = df["sbc_start"]  # sets index to datetime in sbc_start column
            working_df = working_df.drop("sbc_start", axis=1)  # removes column because values are now in index
            print("forecasting...",flush=True)

            #TODO return timeseries that includes forecasted steps
 