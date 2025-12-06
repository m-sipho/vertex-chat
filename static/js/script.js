var socketio = io()

const messages = document.querySelector(".messages-area");

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

socketio.on("message", (data) => {
    // Check if create notification events
    if (data.message === "joined the room" || data.message === "left the room") {
        createNotification(data.name, data.message);
    }
});

function sendMessage() {
    const input = document.getElementById("message-input");
    const message = input.value;
    if (message == "") return;
    appendMessage("You", message, true);
    input.value = "";
    input.focus();
}

function appendMessage(user, msg, isMe) {
    const div = document.createElement("div");
    div.className = `message-row ${isMe ? 'own' : 'other'}`;

    const name = document.createElement("span");
    name = className = "sender-name";
    name.innerText = user;

    const bubble = document.createElement("div");
    bubble.className = `bubble ${isMe ? 'own' : 'other'}`;
    bubble.innerText = msg;

    div.appendChild(name);
    div.appendChild(bubble);

    const messagesArea = document.querySelector(".messages-area");
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}