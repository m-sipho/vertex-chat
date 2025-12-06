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

rooms = {}

def generate_unique_code(length):
    """Generates a code and ensures it does not exist in rooms"""
    characters = ascii_uppercase + digits
    while True:
        code = ""
        for _ in range(length):
            code += random.choice(characters)
        
        if code not in rooms:
            break
    
    return code

@app.route("/", methods=["POST", "GET"])
def home():
    session.clear()
    # Grab our form data
    if request.method == "POST":
        name = request.form.get("name")
        code = request.form.get("code")
        generate = request.form.get("generate", False) # return False if generate doesn't exist
        connect = request.form.get("connect", False) # return False if connect doesn't exist

        # Check if the user did not pass a name
        if not name:
            return render_template("home.html", error="Username cannot be empty.", code=code)
    
        # Check if generate button was clicked
        if generate != False:
            room_code = generate_unique_code(5)

            # Create user immediately, so it exists when user click CONNECT
            rooms[room_code] = {"members": 0, "messages": []}

            return render_template("home.html", name=name, code=room_code)
        
        if connect != False:
            # Check if the user did not pass a room code
            if not code:
                return render_template("home.html", error="The room code cannot be empty.", name=name)
            
            code = code.upper()

            if code not in rooms:
                return render_template("home.html", error="Room does not exist", name=name)
            
            # Success! Log user in
            session["room"] = code
            session["name"] = name
            return redirect(url_for("room"))
    return render_template("home.html")

@app.route("/room")
def room():
    room = session.get("room")
    if room is None or session.get("name") is None or room not in rooms:
        return redirect(url_for("home"))
    
    return render_template("room.html", code_badge=room)

if __name__ == "__main__":
    socketio.run(app, debug=True)
