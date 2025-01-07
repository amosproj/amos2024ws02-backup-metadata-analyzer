from flask import Flask, request, jsonify
from dotenv import load_dotenv
from metadata_analyzer.database import Database
from metadata_analyzer.simple_analyzer import SimpleAnalyzer
from metadata_analyzer.simple_rule_based_analyzer import SimpleRuleBasedAnalyzer
from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.time_series_analyzer import Time_series_analyzer
from metadata_analyzer.backend import Backend
from flasgger import Swagger
from flasgger import swag_from
import requests
import os

app = Flask(__name__)
swagger = Swagger(app)
load_dotenv(dotenv_path=".env")
path = app.root_path


@app.route("/")
@swag_from(os.path.join(path,'swagger','root.yaml'), validation=True)
def hello_world():
    return "Hello, world!"


@app.route("/echo", methods=["POST"])
@swag_from(os.path.join(path,'swagger','echo.yaml'), validation=True)
def echo():
    if request.method == "POST":
        data = request.get_json()
        obj = data["body"]
        strData = obj["text"]
        newData = ""

        for i in range(len(strData) - 1, -1, -1):
            newData = newData + strData[i]

        newBody = '{ "output": "' + newData + '" }'
        return newBody


@app.route("/analyze", methods=["GET"])
@swag_from(os.path.join(path,'swagger','analyze.yaml'), validation=True)
def analyze():
    return jsonify(Analyzer.analyze())


@app.route("/updateBasicBackupData", methods=["POST"])
@swag_from(os.path.join(path,'swagger','updateBasicBackupData.yaml'), validation=True)
def update_data():
    return jsonify(Analyzer.update_data())


@app.route("/simpleRuleBasedAnalysis", methods=["POST"])
@swag_from(os.path.join(path,'swagger','simpleRuleBasedAnalysis.yaml'), validation=True)
def simple_rule_based_analysis():
    alert_limit = request.args.get("alertLimit")

    try:
        int(alert_limit)
        return jsonify(Analyzer.simple_rule_based_analysis(int(alert_limit)))
    except ValueError:
        print("Alert limit is not a number")
        return "Invalid value for alert limit", 400



@app.route("/simpleRuleBasedAnalysisDiff", methods=["POST"])
@swag_from(os.path.join(path,'swagger','simpleRuleBasedAnalysisDiff.yaml'), validation=True)
def simple_rule_based_analysis_diff():
    alert_limit = request.args.get("alertLimit")

    try:
        int(alert_limit)
        return jsonify(Analyzer.simple_rule_based_analysis_diff(int(alert_limit)))
    except ValueError:
        print("Alert limit is not a number")
        return "Invalid value for alert limit", 400



@app.route("/simpleRuleBasedAnalysisInc", methods=["POST"])
@swag_from(os.path.join(path,'swagger','simpleRuleBasedAnalysisInc.yaml'), validation=True)
def simple_rule_based_analysis_inc():
    alert_limit = request.args.get("alertLimit")

    try:
        int(alert_limit)
        return jsonify(Analyzer.simple_rule_based_analysis_inc(int(alert_limit)))
    except ValueError:
        print("Alert limit is not a number")
        return "Invalid value for alert limit", 400


@app.route("/simpleRuleBasedAnalysisCreationDates", methods=["POST"])
@swag_from(os.path.join(path,'swagger','simpleRuleBasedAnalysisCreationDates.yaml'), validation=True)
def simple_rule_based_analysis_creation_dates():
    alert_limit = request.args.get("alertLimit")

    try:
        int(alert_limit)
        return jsonify(Analyzer.simple_rule_based_analysis_creation_dates(int(alert_limit)))
    except ValueError:
        return "Invalid value for alert limit", 400


@app.route("/simpleRuleBasedAnalysisStorageCapacity", methods=["POST"])
@swag_from(os.path.join(path,'swagger','simpleRuleBasedAnalysisStorageCapacity.yaml'), validation=True)
def simple_rule_based_analysis_storage_capacity():
    alert_limit = request.args.get("alertLimit")

    try:
        int(alert_limit)
        return jsonify(
            Analyzer.simple_rule_based_analysis_storage_capacity(int(alert_limit))
        )
    except ValueError:
        return "Invalid value for alert limit", 400


@app.route("/kMeansAnomalies", methods=["POST"])
@swag_from(os.path.join(path,'swagger','kMeansAnomalies.yaml'), validation=True)
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


@app.route("/getTaskIds", methods=["GET"])
@swag_from(os.path.join(path,'swagger','getTaskIds.yaml'), validation=True)
def return_task_ids():
    return jsonify(Time_series_analyzer.get_task_ids())


@app.route("/getFrequenciesForTask", methods=["POST"])
@swag_from(os.path.join(path,'swagger','getFrequenciesForTask.yaml'), validation=True)
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
    except KeyError:
        return "Missing field of type " + field, 400

    return jsonify(Time_series_analyzer.get_frequencies(task_id, backup_type, variable))


def main():
    database = Database()
    backend = Backend(os.getenv("BACKEND_URL"))
    simple_analyzer = SimpleAnalyzer()
    time_series_analyzer = Time_series_analyzer(database)
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(
        database,
        backend,
        simple_analyzer,
        simple_rule_based_analyzer,
        time_series_analyzer,
    )

    print(f"FLASK_RUN_HOST: {os.getenv('FLASK_RUN_HOST')}")
    print(f"FLASK_RUN_PORT: {os.getenv('FLASK_RUN_PORT')}")
    print(f"BACKEND_URL: {os.getenv('BACKEND_URL')}")

    new_port = os.getenv("FLASK_RUN_PORT")
    new_host = os.getenv("FLASK_RUN_HOST", "localhost")
    int_port = int(new_port or 5000)
    app.run(host=new_host, port=int_port, debug=False)
