var socketio = io()

let myUsername = document.getElementById("current-username").value;

const messages = document.querySelector(".messages-area");

const sound = new Audio("../static/sounds/message-alert.wav")

function createNotification(name, msg) {
    const content = `
        <div class="join-notification">
            <span class="notify-text">
                <span class="join-name">${name}</span> ${msg}
            </span>
        </div>
    `
    messages.insertAdjacentHTML('beforeend', content);
    messages.scrollTop = messages.scrollHeight;
}

// Listener waiting for send() from the server
socketio.on("message", (data) => {
    // Format the time
    const formattedTime = timeFormat(data.time);

    // Check if create notification events
    if (data.message === "joined the room" || data.message === "left the room") {
        createNotification(data.name, data.message);
    } else {
        const isMe = data.name === myUsername;
        if (!isMe) {
            const audio = document.getElementById("notify-audio");
            if (audio != null) {
                audio.currentTime = 0;
                audio.play();
            }
        }
        appendMessage(data.name, data.message, formattedTime, isMe);
    }
});

function sendMessage() {
    const input = document.getElementById("message-input");
    const message = input.value;
    if (message == "") return;

    // Send an event named "message" to the server via web socket tunnel
    socketio.emit("message", {data: message})
    
    input.value = "";
    input.focus();
}

function appendMessage(user, msg, time, isMe) {
    const div = document.createElement("div");
    div.className = `message-row ${isMe ? 'own' : 'other'}`;

    const name = document.createElement("span");
    name.className = "sender-name";
    name.innerText = user;

    const bubble = document.createElement("div");
    bubble.className = `bubble ${isMe ? 'own' : 'other'}`;
    bubble.innerHTML = `
        <div>${msg}</div>
        <div class="timestamp">${time}</div>
    `;

    div.appendChild(name);
    div.appendChild(bubble);

    const messagesArea = document.querySelector(".messages-area");
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

const messageInput = document.getElementById("message-input");
messageInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
})

function timeFormat(time) {
    // Get current time
    const now = new Date();
    const messageDate = new Date(time);

    const isToday = (
        now.getDate() == messageDate.getDate() &&
        now.getMonth() == messageDate.getMonth() &&
        now.getFullYear() == messageDate.getFullYear()
    );

    // How time will show if the message is from today
    todayOptions = {
        hour: "2-digit",    // Get two digits of hours
        minute: "2-digit"   // Get two digits of minutes
    };

    // How time will show if its any day before today
    beforeOptions = {
        month: "numeric",
        day: "numeric"
    }

    if (isToday) {
        return messageDate.toLocaleTimeString(undefined, todayOptions);
    } else {
        return messageDate.toLocaleTimeString(undefined, beforeOptions) + " " + messageDate.toLocaleTimeString(undefined, todayOptions);
    }
}

// Fix the timestamps to correct format
document.addEventListener('DOMContentLoaded', () => {
    const timestamps = document.querySelectorAll(".timestamp");

    timestamps.forEach((timestmp) => {
        timestmp.innerText = timeFormat(timestmp.getAttribute("time-utc"));
    })

});