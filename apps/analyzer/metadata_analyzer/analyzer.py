import datetime


class Analyzer:
	@classmethod
	def __init__(
			cls,
			database,
			backend,
			simple_rule_based_analyzer,
			time_series_analyzer,
			schedule_based_analyzer,
	):
		cls.database = database
		cls.backend = backend
		cls.simple_rule_based_analyzer = simple_rule_based_analyzer
		cls.time_series_analyzer = time_series_analyzer
		cls.schedule_based_analyzer = schedule_based_analyzer
		cls.series_loaded = False

	@staticmethod
	def _convert_result(result):
		backup_type = {
			"F": "FULL",
			"I": "INCREMENTAL",
			"D": "DIFFERENTIAL",
			"C": "COPY"
		}.get(result.fdi_type, "UNKNOWN")
		return {
			"id": result.uuid,
			"saveset": result.saveset,
			"sizeMB": result.data_size / 1_000_000,
			"creationDate": result.start_time.isoformat(),
			"type": backup_type,
			"taskId": result.task_uuid,
			"scheduledTime": result.scheduledTime.isoformat() if result.scheduledTime else None,
		}

	@staticmethod
	def _convert_task(task):
		return {
			"id": task.uuid,
			"displayName": task.task,
		}

	@classmethod
	def _get_start_date(cls, data, alert_type, backup_type):
		latest_id = cls.backend.get_latest_alert_id(alert_type, backup_type)
		if latest_id == "":
			return datetime.datetime.min
		else:
			latest_alerts = [
				result.start_time for result in data if result.uuid == latest_id
			]
			assert len(latest_alerts) == 1
			return latest_alerts[0]

	@classmethod
	def _get_latest_backup_date_from_backend(cls):
		latest_backup = cls.backend.get_latest_backup_date()
		if latest_backup is None:
			return None
		else:
			return latest_backup['creationDate']

	@classmethod
	def _send_Backups(cls):
		try:
			latest_backup_date = cls._get_latest_backup_date_from_backend()
		except Exception as e:
			print(f"Error getting latest backup date: {e}")
			latest_backup_date = None
		results = list(cls.database.get_results(latest_backup_date))

		schedules = list(cls.database.get_schedules())
		cls.simple_rule_based_analyzer.analyze_creation_dates(results, schedules, None, latest_backup_date,
															   "ONLY_SCHEDULES")

		batch = []
		count = 0

		for result in results:
			if (result.is_backup is not None) and (result.is_backup <= 0):
				continue

			if result.subtask_flag != "0":
				continue

			if result.data_size is None or result.start_time is None:
				continue

			batch.append(cls._convert_result(result))
			count += 1

			if len(batch) == 100:
				cls.backend.send_backup_data_batched(batch)
				batch = []

		if len(batch) > 0:
			cls.backend.send_backup_data_batched(batch)

		return count

	@classmethod
	def _send_Tasks(cls):
		tasks = list(cls.database.get_tasks())

		batch = []
		count = 0

		for task in tasks:

			if task.uuid is None or task.task is None:
				continue

			batch.append(cls._convert_task(task))
			count += 1

			if len(batch) == 100:
				cls.backend.send_task_data_batched(batch)
				batch = []

		if len(batch) > 0:
			cls.backend.send_task_data_batched(batch)

		return count

	@classmethod
	def _send_Storage(cls):
		storages = list(cls.database.get_data_stores())

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

			cls.backend.send_storage_data(storage_data)

		return len(storages)

	@classmethod
	def update_data(cls):
		num_Storage = cls._send_Storage()
		num_Tasks = cls._send_Tasks()
		num_Backups = cls._send_Backups()

		return {
			"storage": num_Storage,
			"tasks": num_Tasks,
			"backups": num_Backups,
		}

	@classmethod
	def simple_rule_based_analysis(cls, alert_limit):
		data = list(cls.database.get_results())
		start_date = cls._get_start_date(data, "SIZE_ALERT", "FULL")
		result = cls.simple_rule_based_analyzer.analyze(
			data, alert_limit, start_date
		)
		return result

	@classmethod
	def simple_rule_based_analysis_diff(cls, alert_limit):
		data = list(cls.database.get_results())
		start_date = cls._get_start_date(data, "SIZE_ALERT", "DIFFERENTIAL")
		result = cls.simple_rule_based_analyzer.analyze_diff(
			data, alert_limit, start_date
		)
		return result

	@classmethod
	def simple_rule_based_analysis_inc(cls, alert_limit):
		data = list(cls.database.get_results())
		start_date = cls._get_start_date(data, "SIZE_ALERT", "INCREMENTAL")
		result = cls.simple_rule_based_analyzer.analyze_inc(
			data, alert_limit, start_date
		)
		return result

	@classmethod
	def simple_time_series_analysis(
			cls,
			variable, task_id, frequency, backup_type, window_size
	):
		if not cls.series_loaded:
			cls.load_time_series_data()

		return cls.time_series_analyzer.k_means_analyze(
			variable, task_id, frequency, backup_type, window_size
		)

	@classmethod
	def time_series_get_frequencies(cls, task_id, backup_type, variable):
		if not cls.series_loaded:
			cls.load_time_series_data()
		return cls.time_series_analyzer.get_frequencies(
			task_id, backup_type, variable
		)

	@classmethod
	def time_series_get_task_ids(cls):
		if not cls.series_loaded:
			cls.load_time_series_data()
		return cls.time_series_analyzer.get_task_ids()

	@classmethod
	def load_time_series_data(cls):
		data = list(cls.database.get_results())
		cls.time_series_analyzer.preload_data(data)
		cls.series_loaded = True

	@classmethod
	def schedule_based_analysis(cls, alert_limit, stop_date):
		results = list(cls.database.get_results())
		schedules = list(cls.database.get_schedules())
		task_events = list(cls.database.get_task_events())
		start_date = max(
			cls._get_start_date(results, "CREATION_DATE_ALERT", None),
			cls._get_start_date(results, "ADDITIONAL_BACKUP_ALERT", None),
		)
		return cls.schedule_based_analyzer.analyze(results, schedules, task_events, alert_limit, start_date, stop_date)

	@classmethod
	def simple_rule_based_analysis_storage_capacity(cls, alert_limit):
		data = list(cls.database.get_data_stores())
		result = cls.simple_rule_based_analyzer.analyze_storage_capacity(
			data, alert_limit
		)
		return result
