from metadata_analyzer.forecast_storage_fill_alert import ForecastStorageFillAlert
import pandas as pd
from darts import TimeSeries
from darts.models import ARIMA

class EnhancedStorageAnalyzer:
    forecast_length = 31556952

    # TODO endpoint for this
    def set_forecast_length(self, new_length):
        self.forecast_length = new_length


    # Analyzes if storage capacity will be reached within confines of forecast
    def analyze_future_storage_capacity(self, data, labeled_data_store):
        scaled_forecasts = {}

        # gets names of data_stores that match labels for the backup results
        distinct_names = set([row.name for row in labeled_data_store])

        # gets the saveset (as an identifier) for all backups that are relevant for these labels
        savesets = set([row.saveset for row in labeled_data_store])

        # throws all backups into a dataframe
        root_df = pd.DataFrame([res.as_dict() for res in data])

        # removes backups from dataframe by their saveset if they are not saved on the data_stores in question
        root_df = root_df.loc[root_df["saveset"].isin(savesets)]

        #print("length of saveset list that is relevant to tasks",flush=True)
        #print(root_df,flush=True)
        # TODO does this fix things right in the heart of the smack of the dab
        #root_df = root_df.loc[root_df["subtask_flag"]=='0']

        # gets all tasks of the backups that are relevant
        #tasks = root_df['task'].unique()

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
        tasks_savesets = root_df
        #print("all good here?",flush=True)
        #print(tasks_savesets,flush=True)
        tasks_savesets = tasks_savesets.groupby("task")
        #print("after grouping",flush=True)
        #print(tasks_savesets,flush=True)
        #print("or to string",flush=True)
        #for group in tasks_savesets:
        #    print("group",flush=True)
        #    print(group,flush=True)

        #print("is the root df the culprit?",flush=True)
        #print(root_df.loc[df['sbc_start'] == '2024-10-10 22:01:12'],flush=True)
        #print("space",flush=True)
        #print(root_df.loc[[3645]],flush=True)

        #print("grouped df by task",flush=True)
        # starts forecast for every task
        task_total_sizes = {}
        for task,group in tasks_savesets:#

            #print("group that becomes dataframe for forecasting",flush=True)
            #print(group,flush=True)
            #TODO test, feeding "group" to forecast should work
            #TODO comment forecast back in, remove placeholder time series in next lines
            #forecast = pd.DataFrame.from_dict({'sbc_start':["2025-01-01 02:03:04","2025-01-02 02:03:04","2025-01-03 02:03:04"],'data_size':['21','42','73']})
            #forecast['sbc_start'] = pd.to_datetime(forecast['sbc_start'])
            #forecast.index = forecast["sbc_start"]  # sets index to datetime in sbc_start column
            #forecast = forecast.drop("sbc_start", axis=1)  # removes column because values are now in index
            #forecast = TimeSeries.from_series(forecast, fill_missing_dates=False, freq='d')
            #print("forecasting for task: ",flush=True)
            #print(task,flush=True)
            # MUST NOT BE GROUP; SHOULD BE DATA/RESULTS WHERE SAVESET IS WHAT IS IN GROUP
            # to be safe test if thats not already saved in group table tbh
            #print("forecast_data manual unravelled",flush=True)
            #print("savesets in the current task",flush=True)
            #savesets_list = group["saveset"].values.tolist()
            #print(savesets_list,flush=True)
            #forecast_data = data.query('saveset in @savesets_list')
            #print(forecast_data,flush=True)
            df = group[["sbc_start", "data_size"]]
            #print("cleaned group: ",flush=True)
            #print(df,flush=True)
            with open("crashFile.txt", "a") as f:
                f.write("forecast of task " + str(task))
            forecast = self.forecast_storage(group)
            #print("got the forecast, it's: ",flush=True)
            #print(forecast,flush=True)
            forecasts.update({task:forecast})


            #TODO check if size is actually smaller than capacity when finally split up
            # if not maybe try to interpret data_size as total, so only take data_size of latest saveset value
            task_size_val = group["data_size"].sum()
            #print("size that i need to set is " + str(task_size_val),flush=True)
            
            # Alternative
            task_total_sizes.update({task:task_size_val})

            # TODO remove if alternative works
            # fills task size column
            #print("group that i need to fill",flush=True)
            #print(group,flush=True)
            #print("that was the group",flush=True)

            #group = group.assign(task_size=task_size_val)
            #print(group,flush=True)
            #print("that was the group with hopefully set size",flush=True)

        task_size_on_datastore = {}
        for store,group in data_store_groups.items():
        
            # get size of task on data_store
            task_sizes = {}
            for saveset in group:
                #print("group looks like this",flush=True)
                #print(group,flush=True)
                #print("saveset in loop",flush=True)
                #print(saveset,flush=True)

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
            #print("list i want to get sth out of",flush=True)
            #print(task_size_on_datastore,flush=True)
            #print("key i use on it",flush=True)
            #print(store,flush=True)
            # gets tasks and their corresponding sizes that lie on selected data_store
            current_task_sizes = task_size_on_datastore[store]
            #print("current task sizes",flush=True)
            #print(current_task_sizes,flush=True)
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
                print("is task really None here?",flush=True)
                print(task,flush=True)
                print("ok then what is forecast[task]: ",flush=True)
                print(forecast[task],flush=True)
                #TODO tweak for tasks with different lengths, should be filtered out bc of steps but maybe mismatched frequencies can cause errors
                if forecast[task] is not None:

                    forecast = forecast[task].pd_dataframe()
                    # TODO comment line above back in, below is placeholder for forecasts
                    #forecast = pd.DataFrame.from_dict({'data_size':['21','42','73']})

                    print("unscaled dataframe from forecast series",flush=True)
                    print(forecast,flush=True)
                    forecast["data_size"] = forecast["data_size"].astype(float)
                    if prev is None:
                        prev = forecast * scaler
                        print("scaled forecast",flush=True)
                        print(prev,flush=True)
                    else:
                        prev = prev.add(forecast * scaler, fill_value=0)
                    print("adding prev",flush=True)
                    print(prev,flush=True)
                    print("to the forecast of this task",flush=True)
                    print(forecast,flush=True)
            scaled_forecasts.update({store:prev})

        print("stores with their scaled forecasted series",flush=True)
        print(scaled_forecasts,flush=True)
        
        # TODO find out overflow time with filled attribute, add into return object along with datatore
        return {"placeholder_data_store":"placeholder_overflow_time"}
    
    def forecast_storage(self,df):

        # remove entries that have the same sbc_start, necessary for indexing the time axis (could cause problems later)
        df = df.drop_duplicates(subset=["sbc_start"])
        # sorts dataframe by sbc_start
        df = df.sort_values("sbc_start")
        # removes unnecessary variables, only time for indices and data_size remains
        df = df[["sbc_start", "data_size"]]
        #print("cleaned dataframe: ",flush=True)
        #TODO cleaned dataframe is wrong, has same values everywhere, DETECTIVE WORK NEEDED
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
        #print("these are the frequencies: ",flush=True)
        #print(freqs,flush=True)

        chosen_freq = 0
        chosen_freq = freqs['sbc_start']
        #print("access freqs as dict",flush=True)
        #print(chosen_freq,flush=True)
        if not bool(chosen_freq):
            #case if no frequencies were found
            return None
        chosen_freq = chosen_freq[0]
        #print("now that as list",flush=True)
        #print(chosen_freq,flush=True)
        #print("frequency chosen for this time series was " + str(chosen_freq), flush=True)
        #except:
        #    print("frequency could not be set and forecasting is not possible")
        #    return None
        #TODO add endpoint to change
        print("lock in chosen frequency at a day")
        chosen_freq = 86400

        # calculates number of steps to take for forecasting
        steps = self.forecast_length/chosen_freq
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

        print("forecasting...",flush=True)

        if(len(series)>30):
            print("length of series was over 30, should go through",flush=True)
            with open("crashFile.txt", "a") as f:
                f.write("\nlength of series was over 30, should go through\n")
        
            model = ARIMA(p=12, d=1, q=2)
            print("herex1",flush=True)
            model.fit(series)
        
            print("herex2",flush=True)
            print("number of steps is",flush=True)
            print(steps,flush=True)
            pred = model.predict(steps)
            pred.values()
            print("prediction finished, exiting if ",flush=True)
        else:
            pred = None

        print("prediction next",flush=True)
        print(pred,flush=True)
        return pred
 
    def get_overflow_times(scaled_forecasts):
        print("extracting overflow times")