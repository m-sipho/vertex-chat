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

socketio.on("update_agents", (data) => {
    const agentsList = document.getElementById("agents-list");
    const agentCount = document.getElementById("agent-count");

    if (!agentsList) return;

    // Clear the list
    agentsList.innerHTML = "";

    // Add each agent as a list item
    data.agents.forEach((agent) => {
        const li = document.createElement("li");
        li.textContent = agent;
        agentsList.appendChild(li);
    });

    if (agentCount) {
        agentCount.textContent = data.count;
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
    const todayOptions = {
        hour: "2-digit",    // Get two digits of hours
        minute: "2-digit"   // Get two digits of minutes
    };

    // How time will show if its any day before today
    const beforeOptions = {
        month: "numeric",
        day: "numeric"
    }

    if (isToday) {
        return messageDate.toLocaleTimeString(undefined, todayOptions);
    } else {
        return messageDate.toLocaleString(undefined, beforeOptions) + " " + messageDate.toLocaleTimeString(undefined, todayOptions);
    }
}

// Fix the timestamps to correct format
document.addEventListener('DOMContentLoaded', () => {
    const timestamps = document.querySelectorAll(".timestamp");

    timestamps.forEach((timestmp) => {
        timestmp.innerText = timeFormat(timestmp.getAttribute("time-utc"));
    })

    messages.scrollTop = messages.scrollHeight;

});

function openSidebar() {
    const sidebar= document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    const toggleBtn = document.querySelector(".sidebar-btn");

    sidebar?.classList.add("active");
    backdrop?.classList.add("active");
    toggleBtn?.classList.add("open");

    if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "true"); // Expand content and make visible
    }
    document.body.classList.add("sidebar-open");
}

function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    const toggleBtn = document.querySelector(".sidebar-btn");

    sidebar?.classList.remove("active");
    backdrop?.classList.remove("active");
    toggleBtn?.classList.remove("open");

    if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "false"); // COntent collapse and hidden
    }
    document.body.classList.remove("sidebar-open");
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) {
        return;
    }
    if (sidebar.classList.contains("active")) {
        closeSidebar();
    } else {
        openSidebar();
    }
}