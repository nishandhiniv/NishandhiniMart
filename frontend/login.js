const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

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

        console.log(
            "Backend Response:",
            result
        );

        document.getElementById(
            "loginMessage"
        ).textContent = result.message;


        // -----------------------------------------
        // LOGIN SUCCESS
        // -----------------------------------------

        if (
            response.ok &&
            result.success &&
            result.user
        ) {

            // Save user information
            localStorage.setItem(
                "userId",
                result.user.id
            );

            localStorage.setItem(
                "username",
                result.user.username
            );

            localStorage.setItem(
                "userRole",
                result.user.role
            );

            localStorage.setItem(
                "userName",
                result.user.name
            );


            // -------------------------------------
            // REDIRECT BASED ON ROLE
            // -------------------------------------

            if (result.user.role === "buyer") {

                window.location.href =
                    "buyer_dashboard.html";

            }
            else if (
                result.user.role === "seller"
            ) {

                window.location.href =
                    "seller_dashboard.html";

            }
            else if (
                result.user.role === "admin"
            ) {

                window.location.href =
                    "admin_dashboard.html";

            }
        }

    }
    catch (error) {

        document.getElementById(
            "loginMessage"
        ).textContent =
            "Backend connection failed!";

        console.error(
            "Login Error:",
            error
        );
    }

});