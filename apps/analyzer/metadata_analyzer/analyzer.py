import datetime

class Analyzer:
    def init(database, backend, simple_analyzer, simple_rule_based_analyzer):
        Analyzer.database = database
        Analyzer.backend = backend
        Analyzer.simple_analyzer = simple_analyzer
        Analyzer.simple_rule_based_analyzer = simple_rule_based_analyzer

    def analyze():
        data = list(Analyzer.database.get_results())
        converted_data = []

        for elem in data:
            if elem.data_size != None:
                converted_data.append(Analyzer._convert_result(elem))

        result = Analyzer.simple_analyzer.analyze(converted_data)

        return result

    # Convert a result from the database into the format used by the backend
    def _convert_result(result):
        backup_type = {
            "F": "FULL",
            "I": "INCREMENTAL",
            "D": "DIFFERENTIAL",
            "C": "COPY"
        }[result.fdi_type]
        return {
            "id": result.uuid,
            "sizeMB": result.data_size / 1_000_000,
            "creationDate": result.start_time.isoformat(),
            "type": backup_type,
            "taskId": result.task_uuid,
        }

    def _get_start_date(data, alert_type, backup_type):
        latest_id = Analyzer.backend.get_latest_alert_id(alert_type, backup_type)
        if latest_id == "":
            return datetime.datetime.min
        else:
            latest_alerts = [result.start_time for result in data if result.uuid == latest_id]
            assert len(latest_alerts) == 1
            return latest_alerts[0]

    def update_data():
        results = list(Analyzer.database.get_results())

        # Batch the api calls to the backend for improved efficiency
        batch = []
        count = 0

        for result in results:
            # Only send real backups
            if result.is_backup <= 0:
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

        return {"count": count}

    def simple_rule_based_analysis(alert_limit):
        data = list(Analyzer.database.get_results())
        start_date = Analyzer._get_start_date(data, "SIZE_ALERT", "FULL")
        result = Analyzer.simple_rule_based_analyzer.analyze(data, alert_limit, start_date)
        return result

    def simple_rule_based_analysis_diff(alert_limit):
        data = list(Analyzer.database.get_results())
        start_date = Analyzer._get_start_date(data, "SIZE_ALERT", "DIFFERENTIAL")
        result = Analyzer.simple_rule_based_analyzer.analyze_diff(data, alert_limit, start_date)
        return result

    def simple_rule_based_analysis_inc(alert_limit):
        data = list(Analyzer.database.get_results())
        start_date = Analyzer._get_start_date(data, "SIZE_ALERT", "INCREMENTAL")
        result = Analyzer.simple_rule_based_analyzer.analyze_inc(data, alert_limit, start_date)
        return result

    def simple_rule_based_analysis_creation_dates(alert_limit):
        data = list(Analyzer.database.get_results())
        start_date = Analyzer._get_start_date(data, "CREATION_DATE_ALERT", None)
        result = Analyzer.simple_rule_based_analyzer.analyze_creation_dates(data, alert_limit, start_date)
        return result
