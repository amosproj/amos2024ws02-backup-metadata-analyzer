from flask import Flask, request, jsonify
from dotenv import load_dotenv
from metadata_analyzer.database import Database
from metadata_analyzer.simple_analyzer import SimpleAnalyzer
from metadata_analyzer.analyzer import Analyzer
from metadata_analyzer.backend import Backend
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
    return jsonify(Analyzer.analyze())


@app.route("/updateBackendDatabase", methods=["POST"])
def update_data():
    return jsonify(Analyzer.update_data())


def main():
    database = Database()
    backend = Backend(os.getenv("BACKEND_URL"))
    simple_analyzer = SimpleAnalyzer()
    Analyzer.init(database, backend, simple_analyzer)

    new_port = os.getenv("FLASK_RUN_PORT")
    int_port = int(new_port or 5000)
    app.run(host="localhost", port=int_port, debug=False)
