import os

from flask import Flask, request, render_template, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/redact", methods=["POST"])
@app.route("/reveal", methods=["POST"])
def reflect_pdf():
    return Response(request.data, content_type="application/pdf")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=os.getenv("PORT", 5000))
