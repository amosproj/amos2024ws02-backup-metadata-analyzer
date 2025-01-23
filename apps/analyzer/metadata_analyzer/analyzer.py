import datetime


class Analyzer:
	def init(
			database,
			backend,
			simple_rule_based_analyzer,
			time_series_analyzer,
	):
		Analyzer.database = database
		Analyzer.backend = backend
		Analyzer.simple_rule_based_analyzer = simple_rule_based_analyzer
		Analyzer.time_series_analyzer = time_series_analyzer
		Analyzer.series_loaded = False

	# Convert a result from the database into the format used by the backend
	def _convert_result(result):
		backup_type = {
			"F": "FULL",
			"I": "INCREMENTAL",
			"D": "DIFFERENTIAL",
			"C": "COPY"
		}.get(result.fdi_type, "UNKNOWN")  # Use .get() to handle unexpected types
		return {
			"id": result.uuid,
			"saveset": result.saveset,
			"sizeMB": result.data_size / 1_000_000,
			"creationDate": result.start_time.isoformat(),
			"type": backup_type,
			"taskId": result.task_uuid,
			"scheduledTime": result.scheduledTime.isoformat() if result.scheduledTime else None,  # Handle None value
		}

	# Convert a task from the database into the format used by the backend
	def _convert_task(task):
		return {
			"id": task.uuid,
			"displayName": task.task,
		}

	def _get_start_date(data, alert_type, backup_type):
		latest_id = Analyzer.backend.get_latest_alert_id(alert_type, backup_type)
		if latest_id == "":
			return datetime.datetime.min
		else:
			latest_alerts = [
				result.start_time for result in data if result.uuid == latest_id
			]
			assert len(latest_alerts) == 1
			return latest_alerts[0]

	def _get_latest_backup_date_from_backend():
		latest_backup = Analyzer.backend.get_latest_backup_date()
		if latest_backup is None:
			return None
		else:
			return latest_backup['creationDate']

	def _send_Backups():
		try:
			latest_backup_date = Analyzer._get_latest_backup_date_from_backend()
		except Exception as e:
			print(f"Error getting latest backup date: {e}")
			latest_backup_date = None
		results = list(Analyzer.database.get_results(latest_backup_date))

		schedules = list(Analyzer.database.get_schedules())
		Analyzer.simple_rule_based_analyzer.analyze_creation_dates(results, schedules, None, latest_backup_date,
																   "ONLY_SCHEDULES")

		# Batch the api calls to the backend for improved efficiency
		batch = []
		count = 0

		for result in results:
			# Only send real backups
			if (result.is_backup is not None) and (result.is_backup <= 0):
				continue

			# Don't send subtasks
			if result.subtask_flag != "0":
				continue

			# Only send backups where the relevant data is not null
			if result.data_size is None or result.start_time is None:
				continue

			batch.append(Analyzer._convert_result(result))
			count += 1

			# Send a full batch
			if len(batch) == 100:
				Analyzer.backend.send_backup_data_batched(batch)
				batch = []

		# Send the remaining results
		if len(batch) > 0:
			Analyzer.backend.send_backup_data_batched(batch)

		return count

	def _send_Tasks():
		tasks = list(Analyzer.database.get_tasks())

		# Batch the api calls to the backend for improved efficiency
		batch = []
		count = 0

		for task in tasks:

			if task.uuid is None or task.task is None:
				continue

			batch.append(Analyzer._convert_task(task))
			count += 1

			# Send a full batch
			if len(batch) == 100:
				Analyzer.backend.send_task_data_batched(batch)
				batch = []

		# Send the remaining results
		if len(batch) > 0:
			Analyzer.backend.send_task_data_batched(batch)

		return count

	def _send_Storage():
		storages = list(Analyzer.database.get_data_stores())

		for storage in storages:

			if storage.uuid is None or storage.name is None or storage.capacity is None or storage.high_water_mark is None or storage.filled is None:
				continue

			storage_data = {
				"id": storage.uuid,
				"displayName": storage.name,
				"capacity": storage.capacity,
				"highWaterMark": storage.high_water_mark,
				"filled": storage.filled,
			}

			Analyzer.backend.send_storage_data(storage_data)

		return len(storages)

	def update_data():
		num_Storage = Analyzer._send_Storage()
		num_Tasks = Analyzer._send_Tasks()
		num_Backups = Analyzer._send_Backups()

		# Return the number of items sent to the backend
		return {
			"storage": num_Storage,
			"tasks": num_Tasks,
			"backups": num_Backups,
		}

	def simple_rule_based_analysis(alert_limit):
		data = list(Analyzer.database.get_results())
		start_date = Analyzer._get_start_date(data, "SIZE_ALERT", "FULL")
		result = Analyzer.simple_rule_based_analyzer.analyze(
			data, alert_limit, start_date
		)
		return result

	def simple_rule_based_analysis_diff(alert_limit):
		data = list(Analyzer.database.get_results())
		start_date = Analyzer._get_start_date(data, "SIZE_ALERT", "DIFFERENTIAL")
		result = Analyzer.simple_rule_based_analyzer.analyze_diff(
			data, alert_limit, start_date
		)
		return result

	def simple_rule_based_analysis_inc(alert_limit):
		data = list(Analyzer.database.get_results())
		start_date = Analyzer._get_start_date(data, "SIZE_ALERT", "INCREMENTAL")
		result = Analyzer.simple_rule_based_analyzer.analyze_inc(
			data, alert_limit, start_date
		)
		return result

	def simple_time_series_analysis(
			variable, task_id, frequency, backup_type, window_size
	):
		if not Analyzer.series_loaded:
			Analyzer.load_time_series_data()

		return Analyzer.time_series_analyzer.k_means_analyze(
			variable, task_id, frequency, backup_type, window_size
		)

	def time_series_get_frequencies(task_id, backup_type, variable):
		if not Analyzer.series_loaded:
			Analyzer.load_time_series_data()
		return Analyzer.time_series_analyzer.get_frequencies(
			task_id, backup_type, variable
		)

	def time_series_get_task_ids():
		if not Analyzer.series_loaded:
			Analyzer.load_time_series_data()
		return Analyzer.time_series_analyzer.get_task_ids()

	def load_time_series_data():
		data = list(Analyzer.database.get_results())
		Analyzer.time_series_analyzer.preload_data(data)
		Analyzer.series_loaded = True

	def simple_rule_based_analysis_creation_dates(alert_limit):
		data = list(Analyzer.database.get_results())
		schedules = list(Analyzer.database.get_schedules())
		start_date = Analyzer._get_start_date(data, "CREATION_DATE_ALERT", None)
		result = Analyzer.simple_rule_based_analyzer.analyze_creation_dates(data, schedules, alert_limit, start_date)
		return result

	def simple_rule_based_analysis_storage_capacity(alert_limit):
		data = list(Analyzer.database.get_data_stores())
		result = Analyzer.simple_rule_based_analyzer.analyze_storage_capacity(
			data, alert_limit
		)
		return result
