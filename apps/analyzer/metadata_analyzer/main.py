from flask import Flask, request, jsonify
from dotenv import load_dotenv
from metadata_analyzer.database import Database, get_data, get_results
from metadata_analyzer.simple_analyzer import SimpleAnalyzer
from flasgger import Swagger
import requests
import os

app = Flask(__name__)
swagger = Swagger(app)


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
    data = list(get_results(database))
    converted_data = []

    for elem in data:
        if elem.data_size != None:
            converted_data.append(convert_result(elem))

    result = simple_analyzer.analyze(converted_data)

    return jsonify(result)


# Convert a result from the database into the format used by the backend
def convert_result(result):
    return {
        "id": result.uuid,
        "sizeMB": result.data_size // 1_000_000,
        "creationDate": result.start_time.isoformat(),
    }


@app.route("/updateBackendDatabase", methods=["POST"])
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
    results = list(get_results(database))

    # Batch the api calls to the backend for improved efficiency
    url = backend_url + "backupData/batched"
    batch = []
    count = 0
    for result in results:
        # Only send 'full' backups
        if result.fdi_type != "F":
            continue

        # Only send backups where the relevant data is not null
        if result.data_size is None or result.start_time is None:
            continue

        batch.append(convert_result(result))
        count += 1

        # Send a full batch
        if len(batch) == 100:
            r = requests.post(url, json=batch)
            batch = []

    # Send the remaining results
    if len(batch) > 0:
        r = requests.post(url, json=batch)

    return jsonify(count=count)


def main():
    global database
    global simple_analyzer
    database = Database()
    simple_analyzer = SimpleAnalyzer()

    new_port = os.getenv("FLASK_RUN_PORT")
    int_port = int(new_port or 5000)
    global backend_url
    backend_url = os.getenv("BACKEND_URL")
    app.run(host="localhost", port=int_port, debug=False)
