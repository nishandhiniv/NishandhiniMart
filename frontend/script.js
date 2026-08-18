const registrationForm = document.getElementById("registrationForm");

registrationForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    const userData = {
        name: name,
        username: username,
        email: email,
        password: password
    };

    try {

        const response = await fetch("http://127.0.0.1:8080/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        document.getElementById("message").textContent =
            result.message;

        console.log("Role:", role);
        console.log("Backend Response:", result);

    } catch (error) {

        document.getElementById("message").textContent =
            "Backend connection failed!";

        console.error("Error:", error);
    }
});