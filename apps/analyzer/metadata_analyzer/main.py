from flask import Flask, request, jsonify
from dotenv import load_dotenv
from metadata_analyzer.database import Database
from metadata_analyzer.simple_analyzer import SimpleAnalyzer
from metadata_analyzer.simple_rule_based_analyzer import SimpleRuleBasedAnalyzer
from metadata_analyzer.analyzer import Analyzer
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
        print("Alert limit is not a number")
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
        print("Alert limit is not a number")
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
        print("Alert limit is not a number")
        return "Invalid value for alert limit", 400


def main():
    database = Database()
    backend = Backend(os.getenv("BACKEND_URL"))
    simple_analyzer = SimpleAnalyzer()
    simple_rule_based_analyzer = SimpleRuleBasedAnalyzer(backend, 0.2, 0.2, 0.2, 0.2)
    Analyzer.init(database, backend, simple_analyzer, simple_rule_based_analyzer)

    print(f"FLASK_RUN_HOST: {os.getenv('FLASK_RUN_HOST')}")
    print(f"FLASK_RUN_PORT: {os.getenv('FLASK_RUN_PORT')}")
    print(f"BACKEND_URL: {os.getenv('BACKEND_URL')}")

    new_port = os.getenv("FLASK_RUN_PORT")
    new_host = os.getenv("FLASK_RUN_HOST", "localhost")
    int_port = int(new_port or 5000)
    app.run(host=new_host, port=int_port, debug=False)
