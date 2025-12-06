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
    createNotification(data.name, data.message);
});

function sendMessage() {
    console.log("send");
}