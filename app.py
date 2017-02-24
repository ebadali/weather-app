from flask import Flask, send_file
from flask import request,jsonify
from flask import session

from flask_cors import CORS
from datetime import datetime


app = Flask(__name__)
CORS(app)
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'

@app.route("/")
def index():
    return send_file("templates/index.html")
	
if __name__ == "__main__":
    app.run(host='0.0.0.0')