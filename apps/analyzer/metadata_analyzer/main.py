from flask import Flask, request, jsonify
from dotenv import load_dotenv
from metadata_analyzer.database import Database, get_data
from metadata_analyzer.simple_analyzer import SimpleAnalyzer
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
    data = list(get_data(database))
    result = simple_analyzer.analyze(data)

    return jsonify(result)

def main():
    global database
    global simple_analyzer
    database = Database()
    simple_analyzer = SimpleAnalyzer()

    new_port = os.getenv("FLASK_RUN_PORT")
    int_port = int(new_port or 5000)
    print("int_port: " + str(int_port))
    app.run(host="localhost", port=int_port, debug=False)
