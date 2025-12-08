# Vertex Chat
Vertex Chat is a real time messaging platform built using Python and WebSockets. It allows users to create private chat rooms and send instant messages.

## Features
- **Real time Messaging**: Messages appear instantly without refreshing.
- **Chat Rooms**: Create unique codes to chat privately with friends.
- **Self Joining**: Automatically joins again if a user refreshes the page.
- **Secure Config**: Protects your server key using environment variables.

## Tech Stack
- **Python 3**
- **Flask**: The web server
- **Flask-SocketIO**: Handles the real-time connections
- **Eventlet**: Helps the server handle many users at once
- **HTML/CSS/Javascript**: The frontend interface

## Installation & Setup
### 1. Clone the Repository
```
git clone [https://github.com/m-sipho/vertex-chat.git](https://github.com/m-sipho/vertex-chat.git)

cd vertex-chat
```
### 2. Install Dependencies
```
pip install -r requirements.txt
```
### 3. Security Setup: Create a new file named .env in the main folder and add this line:
```
SECRET_KEY = "your_secret_key"
```
replace `your_secret_secret` with your own secret key

## How to Run
### 1. Start the server
```
python app.py
```
### 2. Open in Browser Go to the provided link `http://127.0.0.1:5000`

## Public access (ngrok)
To share the app with friends over the internet:
1. Keep `python app.py` running.
2. Open a new terminal and run:
```
ngrok http 5000
```
3. Copy the Forwarding URL (e.g., `https://xyz.ngrok-free.app`) and share it.

## Project Structure
```
/vertex-chat
  ├── app.py
  ├── README.md
  ├── requirements.txt
  └── templates
        └── base.html
        └── home.html
        └── room.html
  └── static
        └── css
        |    └── style.css
        └── images
        |    └── logo.svg
        └── js
        |    └── script.js
        └── sounds
             └── message-alert.wav
```

## Acknowledgement
- V Logo by <a href="https://www.vecteezy.com/members/anggasaputro">Angga saputro</a> from <a href="https://www.vecteezy.com/vector-art/11193285-v-letter-lightning-logo-template">Vectors by Vecteezy</a>

- Message alert sound from <a href="https://mixkit.co/free-sound-effects/interface">https://mixkit.co/free-sound-effects/interface</a>
      