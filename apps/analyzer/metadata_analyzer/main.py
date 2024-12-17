from flask import Flask, request, jsonify
from dotenv import load_dotenv
from metadata_analyzer.database import Database
from metadata_analyzer.simple_analyzer import SimpleAnalyzer
from metadata_analyzer.simple_rule_based_analyzer import SimpleRuleBasedAnalyzer
from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.time_series_analyzer import Time_series_analyzer
from metadata_analyzer.backend import Backend
from flasgger import Swagger
import requests
import os

app = Flask(__name__)
swagger = Swagger(app)
load_dotenv(dotenv_path=".env")


@app.route("/")
def hello_world():
    """Most basic example endpoint that returns a hello world message.
    ---
    definitions:
        Output:
            type: string
            example: 'Hello, world!'
    responses:
        200:
            description: The hello world message
            schema:
                $ref: '#/definitions/Output'
    """
    return "Hello, world!"


@app.route("/echo", methods=["POST"])
def echo():
    """Example endpoint that echoes an inverted version of the string that was passed to it.
    ---
    parameters:
      - name: Input
        in: body
        type: object
        required: true
        properties:
            body:
                type: object
                items: '#/definitions/TextBody'
                properties:
                    text:
                        type: string
                        example: 'inverted'
    definitions:
        TextBody:
            type: object
            properties:
                text:
                    type: string
                    example: 'detrevni'
        BodyBody:
            type: object
            properties:
                body:
                    type: object
                    items: '#/definitions/TextBody'
    responses:
        200:
            description: The inverted string
            schema:
                $ref: '#/definitions/TextBody'
    """
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
def analyze():
    """Example endpoint that simulates a basic data analysis on real database data.
    ---
    definitions:
      BackupStats:
        type: object
        properties:
          count:
            type: int
            example: 126068
          firstBackup:
            type: string
            example: '2017-11-23T08:10:03'
          lastBackup:
            type: string
            example: '2024-10-12T18:20:22'
          maxSize:
            type: string
            example: 2288438
          minSize:
            type: int
            example: 0
    responses:
      200:
        description: Some basic properties of the backups currently in the database
        schema:
          $ref: '#/definitions/BackupStats'
    """
    return jsonify(Analyzer.analyze())


@app.route("/updateBasicBackupData", methods=["POST"])
def update_data():
    """Updates the backend database with values taken from the analyzer database.
    ---
    parameters:
      - name: Input
        in: body
        type: object
        required: true
        properties:
            content:
                type: object
                items: '#/definitions/BackendRequest'
    definitions:
        BackendRequest:
            type: object
            properties:
                content:
                    type: object
        BackendResponse:
            type: object
            properties:
                count:
                    type: int
                    example: 54767
    responses:
        200:
            description: The number of entries that were updated
            schema:
                $ref: '#/definitions/BackendResponse'
    """
    return jsonify(Analyzer.update_data())


@app.route("/simpleRuleBasedAnalysis", methods=["POST"])
def simple_rule_based_analysis():
    """Fulfills a simple rule based analysis on full backups.
    ---
    parameters:
      - name: Input
        in: query
        name: alertLimit
        schema:
            type: integer
    definitions:
        Alerts:
            type: object
            properties:
                type:
                    type: int
                    example: 1
                value:
                    type: int
                    example: 12345
                referenceValue:
                    type: int
                    example: 12300
                backupId:
                    type: string
        AlertLimit:
            type: object
            properties:
                alertLimit:
                    type: int
                    example: 1
    responses:
        200:
            description: Alerts for the analyzed data
            schema:
                $ref: '#/definitions/Alerts'
        400:
            description: The value set for the alert limit was not valid
    """
    alert_limit = request.args.get("alertLimit")

    try:
        int(alert_limit)
        return jsonify(Analyzer.simple_rule_based_analysis(int(alert_limit)))
    except ValueError:
        return "Invalid value for alert limit", 400


@app.route("/simpleRuleBasedAnalysisDiff", methods=["POST"])
def simple_rule_based_analysis_diff():
    """Fulfills a simple rule based analysis on diff backups.
    ---
    parameters:
      - name: Input
        in: query
        name: alertLimit
        schema:
            type: integer
    definitions:
        Alerts:
            type: object
            properties:
                type:
                    type: int
                    example: 1
                value:
                    type: int
                    example: 12345
                referenceValue:
                    type: int
                    example: 12300
                backupId:
                    type: string
        AlertLimit:
            type: object
            properties:
                alertLimit:
                    type: int
                    example: 1
    responses:
        200:
            description: Alerts for the analyzed data
            schema:
                $ref: '#/definitions/Alerts'
        400:
            description: The value set for the alert limit was not valid
    """
    alert_limit = request.args.get("alertLimit")

    try:
        int(alert_limit)
        return jsonify(Analyzer.simple_rule_based_analysis_diff(int(alert_limit)))
    except ValueError:
        return "Invalid value for alert limit", 400


@app.route("/simpleRuleBasedAnalysisInc", methods=["POST"])
def simple_rule_based_analysis_inc():
    """Fulfills a simple rule based analysis on inc backups.
    ---
    parameters:
      - name: Input
        in: query
        name: alertLimit
        schema:
            type: integer
    definitions:
        Alerts:
            type: object
            properties:
                type:
                    type: int
                    example: 1
                value:
                    type: int
                    example: 12345
                referenceValue:
                    type: int
                    example: 12300
                backupId:
                    type: string
        AlertLimit:
            type: object
            properties:
                alertLimit:
                    type: int
                    example: 1
    responses:
        200:
            description: Alerts for the analyzed data
            schema:
                $ref: '#/definitions/Alerts'
        400:
            description: The value set for the alert limit was not valid
    """
    alert_limit = request.args.get("alertLimit")

    try:
        int(alert_limit)
        return jsonify(Analyzer.simple_rule_based_analysis_inc(int(alert_limit)))
    except ValueError:
        return "Invalid value for alert limit", 400


@app.route("/simpleRuleBasedAnalysisCreationDates", methods=["POST"])
def simple_rule_based_analysis_creation_dates():
    """Runs a simple rule based analysis on full backups searching for unusual creation times
    ---
    parameters:
      - name: Input
        in: query
        name: alertLimit
        schema:
            type: integer
    responses:
        200:
            description: Number of created alerts
        400:
            description: The value set for the alert limit was not valid
    """
    alert_limit = request.args.get("alertLimit")

    try:
        int(alert_limit)
        return jsonify(
            Analyzer.simple_rule_based_analysis_creation_dates(int(alert_limit))
        )
    except ValueError:
        return "Invalid value for alert limit", 400


@app.route("/simpleRuleBasedAnalysisStorageCapacity", methods=["POST"])
def simple_rule_based_analysis_storage_capacity():
    """Runs a simple rule based analysis on data stores searching for ones with
    almost full
    ---
    parameters:
      - name: Input
        in: query
        name: alertLimit
        schema:
            type: integer
    responses:
        200:
            description: Number of created alerts
        400:
            description: The value set for the alert limit was not valid
    """
    alert_limit = request.args.get("alertLimit")

    try:
        int(alert_limit)
        return jsonify(
            Analyzer.simple_rule_based_analysis_storage_capacity(int(alert_limit))
        )
    except ValueError:
        return "Invalid value for alert limit", 400


# TODO yaml for swagger
@app.route("/kMeansAnomalies", methods=["POST"])
def runTimeSeriesTests():
    """Runs k-means anomaly detection on the specified dataset.
    ---
    parameters:
      - name: input
        in: body
        type: object
        required: true
        properties:
            variable:
                type: string
                example: 'data_size'
            task_id:
                type: string
                example: '67de754c-b953-4098-83cd-6d34ca2960c3'
            backup_type:
                type: string
                example: 'F'
            frequency:
                type: int
                example: 86401
            window_size:
                type: int
                example: 2
    definitions:
        MeansBody:
            type: object
            properties:
                variable:
                    type: string
                    example: 'data_size'
                task_id:
                    type: string
                    example: '67de754c-b953-4098-83cd-6d34ca2960c3'
                backup_type:
                    type: string
                    example: 'F'
                frequency:
                    type: int
                    example: 86401
                windows_size:
                    type: int
                    example: 2
        Timestamps:
            type: array
            items:
                type: string
            example:
                - 'Tue, 10 Sep 2024 21:01:22 GMT'
                - 'Sat, 21 Sep 2024 21:01:33 GMT'
                - 'Sun, 22 Sep 2024 21:01:34 GMT'
                - 'Tue, 08 Oct 2024 21:01:50 GMT'
                - 'Wed, 09 Oct 2024 21:01:51 GMT'
    responses:
      200:
        description: The timestamps of the anomalies
        schema:
          $ref: '#/definitions/Timestamps'
      400:
        description: Input either asked for non-implemented features or led to an emtpy cleaned dataset.
      500:
        description: Data was not loaded correctly in previous steps so a time series analysis is not possible.
    """
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


@app.route("/getTaskIds", methods=["GET"])
def return_task_ids():
    """Gets task ids of current dataset, necessary for time series analysis.
    ---
    definitions:
        task_ids:
            type: object
            properties:
                1:
                    type: string
                    example: 'd6f0d862-ef51-4f01-8d34-5503a58c6421'
                2:
                    type: string
                    example: '67de754c-b953-4098-83cd-6d34ca2960c3'
                3:
                    type: string
                    example: '8cc9efbc-d392-430d-8844-af04da35e7d6'
    responses:
      200:
        description: All possible task ids
        schema:
          $ref: '#/definitions/task_ids'
      500:
        description: Data was not loaded correctly in previous steps so a time series analysis is not possible.
    """
    try:

        return jsonify(Analyzer.time_series_get_task_ids())
    except AttributeError as att:
        return (
            "No time series analysis possible because of failed data loading: "
            + str(att),
            500,
        )


@app.route("/getFrequenciesForTask", methods=["POST"])
def return_frequencies():
    """Gets frequencies for a specific task, variable and backup type.
    ---
    parameters:
      - name: input
        in: body
        type: object
        required: true
        properties:
            variable:
                type: string
                example: 'data_size'
            task_id:
                type: string
                example: '67de754c-b953-4098-83cd-6d34ca2960c3'
            backup_type:
                type: string
                example: 'F'
    definitions:
        Frequencies:
            type: object
            properties:
                count:
                    type: object
                    properties:
                        0:
                            type: int
                            example: 20
                        1:
                            type: int
                            example: 17
                        2:
                            type: int
                            example: 5
                sbc_start:
                    type: object
                    properties:
                        0:
                            type: int
                            example: 86400
                        1:
                            type: int
                            example: 86401
                        2:
                            type: int
                            example: 86399
    responses:
      200:
        description: All backup frequencies found that meet the conditions, ranked by times appeared
        schema:
          $ref: '#/definitions/Frequencies'
      500:
        description: Data was not loaded correctly in previous steps so a time series analysis is not possible.
    """
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


@app.route("/setTimeSeriesThreshold", methods=["POST"])
def set_time_series_threshold():
    """Sets a new threshold value for the time series analysis, should be between 1 and 0
    ---
    parameters:
      - name: Input
        in: query
        name: threshold
        schema:
            type: string
    responses:
        200:
            description: Threshold set
        400:
            description: The value set for the threshold was not valid
    """
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
    return "Setting threshold was succesful", 200


@app.route("/setTimeSeriesClusters", methods=["POST"])
def set_time_series_clusters():
    """Sets a new cluster value for the time series analysis
    ---
    parameters:
      - name: Input
        in: query
        name: clusters
        schema:
            type: integer
    responses:
        200:
            description: Clusters number set
        400:
            description: The value set for the clusters was not valid
    """
    try:
        clusters = int(request.args.get("clusters"))
    except:
        return "Clusters value not an integer, was " + str(clusters), 400
    Analyzer.time_series_analyzer.set_clusters(clusters)
    return "Setting clusters was succesful", 200


@app.route("/setTrainingDataLimits", methods=["POST"])
def set_training_limits():
    """Sets start and end index of the values to be used as a training set.
    ---
    parameters:
      - name: Input
        in: body
        type: object
        required: true
        properties:
            body:
                type: object
                items: '#/definitions/LimitBody'
                properties:
                    training_series_start:
                        type: int
                        example: 4
                    training_series_end:
                        type: int
                        example: 329
    definitions:
        LimitBody:
            type: object
            properties:
                training_series_start:
                        type: int
                        example: 4
                training_series_end:
                        type: int
                        example: 329
    responses:
        200:
            description: Values set succesfully
    """
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
        return "Indices set succesfully", 200


@app.route("/calcTrainingDataLimits", methods=["GET"])
def calculate_training_indices():
    """Triggers automatic calculation of the indices for training data in basic time series analysis. Only possible when at least one analysis already done.
    ---
    responses:
      200:
        description: Calculation was succesful
      500:
        description: Calculation could not be completed
    """
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


def main():
    database = Database()
    backend = Backend(os.getenv("BACKEND_URL"))
    simple_analyzer = SimpleAnalyzer()
    parameters = []
    parameters.append(os.getenv("ANOMALY_THRESHOLD"))
    parameters.append(os.getenv("CLUSTER_NUMBER"))
    time_series_analyzer = Time_series_analyzer(parameters)
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
