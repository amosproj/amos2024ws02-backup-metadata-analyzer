from flask import Flask, request, jsonify
from dotenv import load_dotenv
from database import Database
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
    data = list(database.get_data())

    return jsonify(count=len(data))

if __name__ == "__main__":
    database = Database()

    new_port = os.getenv("FLASK_RUN_PORT")
    int_port = int(new_port or 5000)
    print("int_port: " + str(int_port))
    app.run(host="localhost", port=int_port, debug=False)
