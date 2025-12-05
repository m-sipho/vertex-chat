from flask import Flask, render_template, request, session, redirect, url_for
from flask_socketio import join_room, leave_room, send, SocketIO
import random
from string import ascii_uppercase, digits
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

@app.route("/", methods=["POST", "GET"])
def home():
    # Grab our form data
    if request.method == "POST":
        name = request.form.get("name")
        code = request.form.get("code")
        # generate = request.form.get("generate", False) # return False if generate doem't exist
        # connect = request.form.get("connect", False) # return False if connect doesn't exist

        # Check if the user did not pass a name
        if not name:
            return render_template("home.html", error="Username cannot be empty.")
        
        # Check if the user did not pass a room code
        if not code:
            return render_template("home.html", error="The room code cannot be empty.")


    return render_template("home.html")

if __name__ == "__main__":
    socketio.run(app, debug=True)
