from flask import Flask, request, jsonify
from dotenv import load_dotenv
from metadata_analyzer.database import Database, get_data, get_results
from metadata_analyzer.simple_analyzer import SimpleAnalyzer
import requests
import os

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello, world!"


@app.route("/echo", methods=["POST"])
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
def analyze():
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
