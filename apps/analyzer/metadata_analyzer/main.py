import os

from datetime import datetime
from dotenv import load_dotenv
from flasgger import Swagger
from flasgger import swag_from
from flask import Flask, request, jsonify

from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.backend import Backend
from metadata_analyzer.database import Database
from metadata_analyzer.schedule_based_analyzer import ScheduleBasedAnalyzer
from metadata_analyzer.simple_rule_based_analyzer import SimpleRuleBasedAnalyzer
from metadata_analyzer.enhanced_storage_analyzer import EnhancedStorageAnalyzer
from metadata_analyzer.time_series_analyzer import Time_series_analyzer

app = Flask(__name__)
swagger = Swagger(app)
load_dotenv(dotenv_path=".env")
path = app.root_path

@app.route("/")
def hello_world():
    return "Hello, world!"

@app.route("/updating/basicBackupData", methods=["POST"])
@swag_from(os.path.join(path, "swagger", "updating", "basicBackupData.yaml"), validation=False)
def update_data():
    return jsonify(analyzer.update_data())


@app.route("/alerting/size/fullBackups", methods=["POST"])
@swag_from(os.path.join(path, "swagger", "alerting", "size", "fullBackups.yaml"), validation=False)
def simple_rule_based_analysis():
    alert_limit = request.args.get("alertLimit", -1)

    try:
        int(alert_limit)
        return jsonify(analyzer.simple_rule_based_analysis(int(alert_limit)))
    except ValueError:
        return "Invalid value for alert limit", 400


@app.route("/alerting/size/diffBackups", methods=["POST"])
@swag_from(os.path.join(path, "swagger", "alerting", "size", "diffBackups.yaml"), validation=False)
def simple_rule_based_analysis_diff():
    alert_limit = request.args.get("alertLimit", -1)

    try:
        int(alert_limit)
        return jsonify(Analyzer.simple_rule_based_analysis_diff(int(alert_limit)))
    except ValueError:
        return "Invalid value for alert limit", 400


@app.route("/alerting/size/incBackups", methods=["POST"])
@swag_from(os.path.join(path, "swagger", "alerting", "size", "incBackups.yaml"), validation=False)
def simple_rule_based_analysis_inc():
    alert_limit = request.args.get("alertLimit", -1)

    try:
        int(alert_limit)
        return jsonify(Analyzer.simple_rule_based_analysis_inc(int(alert_limit)))
    except ValueError:
        return "Invalid value for alert limit", 400


@app.route("/alerting/creationDate", methods=["POST"])
@swag_from(os.path.join(path, "swagger", "alerting", "creationDate.yaml"), validation=False)
def simple_rule_based_analysis_creation_date():
    alert_limit = request.args.get("alertLimit", -1)
    now = datetime.now()

    try:
        int(alert_limit)
        return jsonify(
            Analyzer.schedule_based_analysis(int(alert_limit), now)
        )
    except ValueError:
        return "Invalid value for alert limit", 400


@app.route("/alerting/storageCapacity", methods=["POST"])
@swag_from(os.path.join(path, "swagger", "alerting", "storageCapacity.yaml"), validation=False)
def simple_rule_based_analysis_storage_capacity():
    alert_limit = request.args.get("alertLimit", -1)

    try:
        int(alert_limit)
        return jsonify(
            Analyzer.simple_rule_based_analysis_storage_capacity(int(alert_limit))
        )
    except ValueError:
        return "Invalid value for alert limit", 400


@app.route("/timeSeriesAnalysis/kMeansAnomalies", methods=["POST"])
@swag_from(os.path.join(path, "swagger", "timeSeriesAnalysis", "kMeansAnomalies.yaml"), validation=False)
def runTimeSeriesTests():
    json = request.get_json()
    field = "None"
    try:
        field = "variable"
        variable = json["variable"]
        field = "task_id"
        task_id = json["task_id"]
        field = "frequency"
        frequency = json["frequency"]
        field = "backup_type"
        backup_type = json["backup_type"]
        field = "window_size"
        window_size = json["window_size"]
    except KeyError:
        return "Missing field of type " + field, 400

    try:
        result = Analyzer.simple_time_series_analysis(
            variable, task_id, frequency, backup_type, window_size
        )
        return jsonify(result)
    except ValueError as val:
        return "Value error occured: " + str(val), 400
    except AttributeError as att:
        return (
            "No time series analysis possible because of failed data loading: "
            + str(att),
            500,
        )


@app.route("/timeSeriesAnalysis/taskIds", methods=["GET"])
@swag_from(os.path.join(path, "swagger", "timeSeriesAnalysis", "taskIds.yaml"), validation=False)
def return_task_ids():
    try:
        return jsonify(Analyzer.time_series_get_task_ids())
    except AttributeError as att:
        return (
            "No time series analysis possible because of failed data loading: "
            + str(att),
            500,
        )


@app.route("/timeSeriesAnalysis/frequenciesForTask", methods=["POST"])
@swag_from(os.path.join(path, "swagger", "timeSeriesAnalysis", "frequenciesForTask.yaml"), validation=False)
def return_frequencies():
    json = request.get_json()
    field = "None"
    try:
        field = "task_id"
        task_id = json["task_id"]
        field = "backup_type"
        backup_type = json["backup_type"]
        field = "variable"
        variable = json["variable"]
        return jsonify(
            Analyzer.time_series_get_frequencies(task_id, backup_type, variable)
        )
    except KeyError:
        return "Missing field of type " + field, 400
    except AttributeError as att:
        return (
            "No time series analysis possible because of failed data loading: "
            + str(att),
            500,
        )


@app.route("/timeSeriesAnalysis/threshold", methods=["POST"])
@swag_from(os.path.join(path, "swagger", "timeSeriesAnalysis", "threshold.yaml"), validation=False)
def set_time_series_threshold():
    try:
        threshold = float(request.args.get("threshold"))
    except:
        return (
            "Threshold value could not be converted to float, was " + str(threshold),
            400,
        )
    if threshold > 1 or threshold < 0:
        return "Threshold value not between 1 and 0, was " + str(threshold), 400
    Analyzer.time_series_analyzer.set_threshold(threshold), 200
    return "Setting threshold was successful", 200


@app.route("/timeSeriesAnalysis/clusters", methods=["POST"])
@swag_from(os.path.join(path, "swagger", "timeSeriesAnalysis", "clusters.yaml"), validation=False)
def set_time_series_clusters():
    try:
        clusters = None
        clusters = int(request.args.get("clusters"))
    except:
        return "Clusters value not an integer, was " + str(clusters), 400
    Analyzer.time_series_analyzer.set_clusters(clusters)
    return "Setting clusters was successful", 200


@app.route("/timeSeriesAnalysis/trainingDataLimits", methods=["POST"])
@swag_from(os.path.join(path, "swagger", "timeSeriesAnalysis", "trainingDataLimits.yaml"), validation=False)
def set_training_limits():
    if request.method == "POST":
        data = request.get_json()
        obj = data["body"]
        try:
            start = int(obj["training_series_start"])
            end = int(obj["training_series_end"])
        except:
            return "Indices were not valid integers", 400

        if start >= end:
            return "Start index was not smaller than end index", 400

        Analyzer.time_series_analyzer.set_training_start(start)
        Analyzer.time_series_analyzer.set_training_end(end)
        return "Indices set successfully", 200


@app.route("/timeSeriesAnalysis/trainingDataLimits/calculated", methods=["GET"])
@swag_from(os.path.join(path, "swagger", "timeSeriesAnalysis" , "trainingDataLimits", "calculated.yaml"), validation=False)
def calculate_training_indices():
    try:
        Analyzer.time_series_analyzer.calc_training_indices()
    except NameError as name:
        return (
            "Run time series analysis first, calculates initial training series bounds. "
            + str(name),
            500,
        )
    except Exception as ex:
        return (
            "Calculation of training series indices encountered an exception: "
            + str(ex),
            500,
        )
    return "Calculation of training series was successful", 200

@app.route("/timeSeriesAnalysis/forecasting/storageOverflow", methods=["GET"])
@swag_from(os.path.join(path,'swagger','timeSeriesAnalysis","forecasting","storageOverflow.yaml'), validation=False)
def enhanced_analysis_storage_capacity():
    try:
        return jsonify(
            Analyzer.enhanced_analysis_storage_capacity()
        )
    except KeyError as keyError:
        return "KeyError occurred: " + str(keyError), 500
    except ValueError as valError:
        return "Invalid value occurred: " + str(valError), 500
    
@app.route("/timeSeriesAnalysis/forecasting/steps", methods=["POST"])
@swag_from(os.path.join(path,'swagger','timeSeriesAnalysis","forecasting","steps.yaml'), validation=False)
def set_enhanced_size_forecast_steps():
    try:
        steps = int(request.args.get("steps"))
    except:
        return (
            "Threshold value could not be converted to int, was " + str(steps),
            400,
        )
    Analyzer.enhanced_storage_analyzer.set_forecast_length(steps), 200
    return "Setting forecasting steps was succesful", 200

@app.route("/timeSeriesAnalysis/forecasting/frequency", methods=["POST"])
@swag_from(os.path.join(path,'swagger','timeSeriesAnalysis","forecasting","frequency.yaml'), validation=False)
def set_enhanced_size_forecast_frequency():
    try:
        steps = int(request.args.get("freq"))
    except:
        return (
            "Threshold value could not be converted to int, was " + str(steps),
            400,
        )
    Analyzer.enhanced_storage_analyzer.set_forecast_length(steps), 200
    return "Setting forecasting frequency was succesful", 200

def main():
    database = Database()
    backend = Backend(os.getenv("BACKEND_URL"))
    parameters = []
    parameters.append(os.getenv("ANOMALY_THRESHOLD"))
    parameters.append(os.getenv("CLUSTER_NUMBER"))
    time_series_analyzer = Time_series_analyzer(parameters)
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    schedule_based_analyzer = ScheduleBasedAnalyzer(backend)
    enhanced_storage_analyzer = EnhancedStorageAnalyzer(backend)
    Analyzer.__init__(
        database,
        backend,
        simple_rule_based_analyzer,
        time_series_analyzer,
        schedule_based_analyzer,
        enhanced_storage_analyzer,
    )

    print(f"FLASK_RUN_HOST: {os.getenv('FLASK_RUN_HOST')}")
    print(f"FLASK_RUN_PORT: {os.getenv('FLASK_RUN_PORT')}")
    print(f"BACKEND_URL: {os.getenv('BACKEND_URL')}")

    new_port = os.getenv("FLASK_RUN_PORT")
    new_host = os.getenv("FLASK_RUN_HOST", "localhost")
    int_port = int(new_port or 5000)
    app.run(host=new_host, port=int_port, debug=False)
