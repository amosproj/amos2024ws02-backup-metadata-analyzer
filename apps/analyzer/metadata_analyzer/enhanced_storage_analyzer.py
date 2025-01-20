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

        # gets names of data_stores that match labels for the backup results
        distinct_names = set([row.name for row in labeled_data_store])
        # gets the saveset (as an identifier) for all backups that are relevant for these labels
        savesets = set([row.saveset for row in labeled_data_store])

        # throws all backups into a dataframe
        root_df = pd.DataFrame([res.as_dict() for res in data])
        # removes backups from dataframe by their saveset if they are not saved on the data_stores in question
        root_df = root_df.loc[root_df["saveset"].isin(savesets)]

        # gets all tasks of the backups that are relevant
        tasks = root_df['task'].unique()
        #TODO make into a set
        
        #TODO do data cleaning before logic 

        # calculating the share of a task by data_store
        # groups savesets of backups by the data_store they are saved on
        data_store_groups = {}
        for row in labeled_data_store:
            if row.name not in data_store_groups:
                data_store_groups[row.name] = [row.saveset]
            else:
                data_store_groups[row.name].append(row.saveset)

        # calculating the forecast of backup tasks
        # groups savesets by their task
        backup_task_groups = {}
        df = root_df.groupby("task")
        print("grouped df by task",flush=True)
        # starts forecast for every task
        for task,group in backup_task_groups:
            #TODO comment forecast back in
            print("forecast should happen now",flush=True)
            #self.forecast_storage(group,self.forecast_length)

        print("keys",flush=True)
        print(list(data_store_groups.keys()),flush=True)
        print(root_df.head,flush=True)

        for store_group_key in data_store_groups:
            print("fun")
        

        print("distinct names",flush=True)
        print(distinct_names,flush=True)
        # go through all data_stores
        #for row in labeled_data_store:
        #    if i < 10:
        #        print("saveset " + str(row.saveset) + " filled " + str(row.filled) + " capacity " + str(row.capacity),flush=True)
        #    i = i + 1
        #    store_backup = []
        #    df = root_df.loc[root_df["saveset"] == row.saveset]
            #store_backup.append({"data_frame":df})
            # TODO assuming datasize is correct value to use here
            # alternatives: stored_size, total_size
            #sum_backup_size = df["data_size"].sum()
            # TODO assuming capacity is represented in gb, data_size is in byte
            #share_of_store = (sum_backup_size/1000000000) / row.filled

            #store_backup.append({})
            

            #store_backup.append({"high_water_mark":row.high_water_mark})
            #store_backup.append({"capacity":row.capacity})
        
            #    if (
            #        result.task == ""
            #        or result.is_backup == 0
            #        or result.data_size is None
            #        or result.start_time is None
            #        or result.subtask_flag != "0"
            #        or result.data_size == 0
            #    ):
            #       data.remove(result)
        #print("row count: " + str(i),flush=True)
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
            print("forecasting...",flush=True)
 