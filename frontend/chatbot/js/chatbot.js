const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chatMessages = document.getElementById("chatMessages");

const API_URL = "http://127.0.0.1:10000/api/chat";


function addMessage(message, type) {
    const messageDiv = document.createElement("div");

    messageDiv.className =
        type === "user"
            ? "message user-message"
            : "message bot-message";

    const avatar = document.createElement("div");

    avatar.className = "message-avatar";
    avatar.textContent =
        type === "user" ? "👤" : "🤖";


    const content = document.createElement("div");

    content.className = "message-content";


    const paragraph = document.createElement("p");

    paragraph.textContent = message;

    content.appendChild(paragraph);


    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    chatMessages.appendChild(messageDiv);


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


function showTyping() {

    const typingDiv =
        document.createElement("div");

    typingDiv.className =
        "message bot-message";

    typingDiv.id = "typingMessage";


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent = "🤖";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const typing =
        document.createElement("div");

    typing.className =
        "typing-message";


    for (let i = 0; i < 3; i++) {

        const dot =
            document.createElement("span");

        dot.className =
            "typing-dot";

        typing.appendChild(dot);
    }


    content.appendChild(typing);

    typingDiv.appendChild(avatar);
    typingDiv.appendChild(content);

    chatMessages.appendChild(typingDiv);


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


function removeTyping() {

    const typingMessage =
        document.getElementById(
            "typingMessage"
        );

    if (typingMessage) {
        typingMessage.remove();
    }
}


async function sendMessage(message) {

    message = message.trim();

    if (!message) {
        return;
    }


    addMessage(message, "user");

    messageInput.value = "";

    sendButton.disabled = true;

    messageInput.disabled = true;


    showTyping();


    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message: message
                })
            });


        const data =
            await response.json();


        removeTyping();


        if (data.success) {

            addMessage(
                data.reply,
                "bot"
            );

        } else {

            addMessage(
                data.message ||
                "Sorry, I could not process your request.",
                "bot"
            );
        }

    } catch (error) {

        removeTyping();

        console.error(
            "Chatbot error:",
            error
        );

        addMessage(
            "Sorry, I could not connect to the chatbot server. Please make sure the NishandhiniMart backend is running.",
            "bot"
        );
    }


    sendButton.disabled = false;

    messageInput.disabled = false;

    messageInput.focus();
}


chatForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        sendMessage(
            messageInput.value
        );
    }
);


document
    .querySelectorAll(".quick-btn")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const message =
                    button.dataset.message;

                sendMessage(message);
            }
        );
    });


messageInput.focus();
