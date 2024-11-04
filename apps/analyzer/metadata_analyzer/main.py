from flask import Flask,request
import dotenv
    

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello, world!"

@app.route("/echo", methods=['POST'])
def echo():
    if request.method == 'POST': 
        data = request.get_json()
        obj = data["body"]
        strData = obj["text"]
        newData = ""

        for i in range (len(strData)-1,-1,-1):
            newData = newData + strData[i]
       
        newBody = "{ \"output\": \"" + newData + "\" }"
        return newBody

if __name__ == '__main__':
    app.run()
