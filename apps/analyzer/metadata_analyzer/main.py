from flask import Flask,request

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello, world!"

@app.route("/echo", methods=['POST'])
def echo():
    if request.method == 'POST': 
        data = request.get_json()
        strData = data["input"]
        newData = ""

        for i in range (len(strData)-1,-1,-1):
            newData = newData + strData[i]

        return newData

if __name__ == '__main__':
    app.run()
