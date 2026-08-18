const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const loginData = {
        username: username,
        password: password
    };

    try {

        const response = await fetch("http://127.0.0.1:8080/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        document.getElementById("message").textContent =
            result.message;

        console.log("Backend Response:", result);

    } catch (error) {

        document.getElementById("message").textContent =
            "Backend connection failed!";

        console.error("Error:", error);
    }
});