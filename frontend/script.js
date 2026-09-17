const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const usernameElement = document.getElementById("username");
        const passwordElement = document.getElementById("password");

        const username = usernameElement.value.trim();
        const password = passwordElement.value;

        if (!username || !password) {
            alert("Please enter username and password.");
            return;
        }

        const loginData = {
            username: username,
            password: password
        };

        try {
            const response = await fetch(
                "http://127.0.0.1:8090/api/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(loginData)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Login failed.");
                return;
            }

            console.log("Login successful:", result);

            const user = result.user || result;

            localStorage.setItem("userId", user.id || "");
            localStorage.setItem("username", user.username || username);
            localStorage.setItem("userRole", user.role || "buyer");
            localStorage.setItem("userName", user.name || user.username || username);

            if (user.role === "admin") {
                window.location.href = "admin_dashboard.html";
            } else if (user.role === "seller") {
                window.location.href = "seller_dashboard.html";
            } else {
                window.location.href = "buyer_dashboard.html";
            }

        } catch (error) {
            console.error("Login Error:", error);
            alert("Backend connection failed. Please make sure the backend is running.");
        }
    });
}