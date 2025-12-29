var socketio = io()

let myUsername = document.getElementById("current-username").value;

const messages = document.querySelector(".messages-area");

const sound = new Audio("../static/sounds/message-alert.wav");

const messageInput = document.getElementById("message-input");

let typingTimeout;

// Listen when someone starts typing
socketio.on("user_typing", (data) => {
    if (!data || !data.name) return;

    const codeBadge = document.querySelector(".code-badge").innerText;
    if (data.room != codeBadge) return;

    const typingIndicator = document.getElementById("typing-indicator");
    if (!typingIndicator) return;

    // Show typing status
    const typingIndicatorAvatar = document.getElementById("typing-indicator-avatar");
    typingIndicator.style.display = "flex";

    // Also show typing indicator next to the agent's name in the sidebar
    const agents = document.querySelectorAll("#agents-list .user-item");
    agents.forEach((li) => {
        const nameSpan = li.querySelector("div > span");
        if (nameSpan && nameSpan.textContent.trim() == data.name) {
            const agentTyping = li.querySelector(".agent-typing");
            if (agentTyping) {
                agentTyping.style.display = "block";
            }

            const agentAvatar = li.querySelector(".agent-avatar");

            // Checks if an avatar for the specific user already exists in the typing container
            const existingAvatar = [...typingIndicatorAvatar.children].some((a) => a.dataset.name === data.name);

            if (!existingAvatar && agentAvatar) {
                const style = agentAvatar.getAttribute("style");
                const avatarClass = agentAvatar.getAttribute("class");
                const letter = agentAvatar.innerText;

                const newDiv = document.createElement("div");
                newDiv.setAttribute("class", avatarClass);
                newDiv.setAttribute("style", style);
                newDiv.innerText = letter;
                newDiv.dataset.name = data.name;

                typingIndicatorAvatar.appendChild(newDiv);
            }
        }
    });
});

// Listen when someone stops typing
socketio.on("user_stop_typing", (data) => {
    const typingIndicator = document.getElementById("typing-indicator");
    const typingIndicatorAvatar = document.getElementById("typing-indicator-avatar");

    if (!typingIndicator || !typingIndicatorAvatar) return;

    // Div to remove if it's user was typing
    const avatarToRemove = document.querySelector(`div[data-name="${data.name}"]`);

    if (avatarToRemove) {
        avatarToRemove.remove();
    }

    // Hide the container if no childern are left
    if (typingIndicatorAvatar.children.length === 0) {
        typingIndicator.style.display = "none";
    }

    // Also remove typing indicator next to the agent's name in the sidebar
    const agents = document.querySelectorAll("#agents-list .user-item");
    agents.forEach((li) => {
        const nameSpan = li.querySelector("div > span"); // Select direct span in div
        if (nameSpan && nameSpan.textContent.trim() == data.name) {
            const agentTyping = li.querySelector(".agent-typing");
            if (agentTyping) {
                agentTyping.style.display = "none";
            }
        }
    });
});

// Detect typing in the message input field
messageInput.addEventListener("input", () => {
    socketio.emit("typing", {});

    // Clear previous timeout
    clearTimeout(typingTimeout);

    // Stop typing after 1 second of inactivity
    typingTimeout = setTimeout(() => {
        socketio.emit("stop_typing", {});
    }, 1000)
});

function createNotification(name, msg) {
    const content = `
        <div class="join-notification">
            <span class="notify-text">
                <span class="join-name">${name}</span> ${msg}
            </span>
        </div>
    `;

    const messagesArea = document.querySelector(".messages-area");
    const typingIndicator = document.getElementById('typing-indicator');

    if (typingIndicator && messagesArea.contains(typingIndicator)) {
        typingIndicator.insertAdjacentHTML('beforebegin', content)
    } else {
        messages.insertAdjacentHTML('beforeend', content);
    }
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
        appendMessage(data.name, data.message, data.quote_sender, data.quote_msg, formattedTime, isMe);
    }
});

// Color generator
function getAvatarColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        // Multiply current hash by 31, and add character code
        hash = (hash * 31) + str.charCodeAt(i);

        // Prevent hash from growing too large
        if (hash > Number.MAX_SAFE_INTEGER) {
            hash = hash % Number.MAX_SAFE_INTEGER;
        }
    }

    // Map hash to a hue between 0 and 359
    const h = Math.abs(hash) % 360;

    return `hsl(${h}, 70%, 55%)`;
}

socketio.on("update_agents", (data) => {
    const agentsList = document.getElementById("agents-list");
    const agentCount = document.getElementById("agent-count");

    if (!agentsList) return;

    // Clear the list
    agentsList.innerHTML = "";

    // Add each agent as a list item
    data.agents.forEach((agent) => {
        const isMe = (agent === myUsername);

        // Use primary color for me, generate color for others
        const avatarColor = isMe ? "var(--main-color)" : getAvatarColor(agent);

        // Specific class for styling 'Me'
        const agentClass = isMe ? 'user-item is-me' : 'user-item';

        const li = document.createElement("li");
        li.className = agentClass;
        li.innerHTML = `
            <div class="agent-avatar" style="background: ${avatarColor};">
                ${agent.charAt(0).toUpperCase()}
            </div>
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 600; color: ${isMe ? 'var(--main-color)' : 'var(--main-text)'}">
                    ${agent}
                </span>
                <span class="agent-typing" style="display: none;">typing...</span>
            </div>
            ${isMe ? '<div class="me-badge">YOU</div>' : '<div class="agent-status"></div>'}
        `;
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

    let replySender = null;
    let replyMessage = null;
    const replyContent = document.querySelector(".reply-bar");
    if (replyContent.style.display != "" && replyContent.style.display != "none") {
        replySender = document.querySelector(".reply-target").innerText;
        replyMessage = document.getElementById("reply-text").innerText;

        replyContent.style.display = "none";
        document.querySelector(".reply-target").innerText = "";
        document.getElementById("reply-text").innerText = "";
    }

    // Send an event named "message" to the server via web socket tunnel
    socketio.emit("message", {data: message, quoteSender: replySender, quoteText: replyMessage});

    // Stop typing indicator when sending
    socketio.emit("stop_typing", {});
    clearTimeout(typingTimeout);
    
    input.value = "";
    input.focus();
}

function appendMessage(user, msg, quoteSender, quoteText, time, isMe) {
    const div = document.createElement("div");
    div.className = `message-row ${isMe ? 'own' : 'other'}`;

    const name = document.createElement("span");
    name.className = "sender-name";
    name.innerText = user;

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    const bubble = document.createElement("div");
    bubble.className = `bubble ${isMe ? 'own' : 'other'}`;
    if (quoteSender == null && quoteText == null) {
        bubble.innerHTML = `
            <div>${msg}</div>
            <div class="timestamp">${time}</div>
        `;
    } else {
        bubble.innerHTML = `
            <div class="reply-quote">
                <span class="quote-sender">${quoteSender}</span>
                <span class="quote-text" id="quote-text">${quoteText}</span>
            </div>
            <div>${msg}</div>
            <div class="timestamp">${time}</div>
        `;
    }

    const replyButton = document.createElement("button");
    replyButton.className = "reply";
    replyButton.setAttribute("data-name", user);
    replyButton.setAttribute("data-message", msg);
    replyButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7.49 12 3.74 8.248m0 0 3.75-3.75m-3.75 3.75h16.5V19.5" />
        </svg>
    `

    messageContent.appendChild(bubble);
    messageContent.appendChild(replyButton);

    div.appendChild(name);
    div.appendChild(messageContent);

    const messagesArea = document.querySelector(".messages-area");
    const typingIndicator = document.getElementById('typing-indicator');

    if (typingIndicator && messagesArea.contains(typingIndicator)) {
        messagesArea.insertBefore(div, typingIndicator);
    } else {
        messagesArea.appendChild(div);
    }
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

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

function startReply(name, text) {
    const replyBar = document.getElementById("reply-bar");
    document.querySelector(".reply-target").innerText = name;
    document.getElementById("reply-text").innerText = text;
    replyBar.style.display = "flex";

    document.getElementById("message-input").focus();
}

// Listen for when the reply button is clicked
messages.addEventListener("click", (e) => {
    const btn = e.target.closest(".reply");

    if (btn) {
        let name = btn.getAttribute("data-name");
        // if (name === myUsername) {
        //     name = "You";
        // }
        const msg = btn.getAttribute("data-message");

        startReply(name, msg);
    }
})

function cancelReply() {
    document.getElementById("reply-bar").style.display = "none";
}