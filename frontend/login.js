// =========================================================
// NISHANDHINIMART - LOGIN
// =========================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const username =
            document.getElementById("username").value.trim();

        const password =
            document.getElementById("password").value;

        const loginMessage =
            document.getElementById("loginMessage");


        // -----------------------------------------
        // VALIDATION
        // -----------------------------------------

        if (!username || !password) {

            loginMessage.style.color = "red";

            loginMessage.textContent =
                "Please enter username/email and password.";

            return;
        }


        try {

            loginMessage.style.color = "#555";

            loginMessage.textContent =
                "Logging in...";


            // -----------------------------------------
            // LOGIN API
            // -----------------------------------------

            const response = await fetch(
                "http://127.0.0.1:10000/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );


            const result =
                await response.json();


            console.log(
                "Login response:",
                result
            );


            // -----------------------------------------
            // LOGIN FAILED
            // -----------------------------------------

            if (
                !response.ok ||
                result.success !== true ||
                !result.user
            ) {

                loginMessage.style.color = "red";

                loginMessage.textContent =
                    result.message ||
                    "Invalid username/email or password.";

                return;
            }


            // -----------------------------------------
            // USER DATA FROM BACKEND
            // -----------------------------------------

            const user = result.user;

            console.log(
                "User received from backend:",
                user
            );


            // -----------------------------------------
            // SAVE USER INFORMATION
            // -----------------------------------------

            localStorage.setItem(
                "userId",
                user.id || ""
            );

            localStorage.setItem(
                "username",
                user.username || ""
            );

            localStorage.setItem(
                "userName",
                user.name || user.username || ""
            );

            localStorage.setItem(
                "userRole",
                user.role || ""
            );


            // -----------------------------------------
            // SAVE PROFILE INFORMATION
            // -----------------------------------------

            localStorage.setItem(
                "userEmail",
                user.email || ""
            );

            localStorage.setItem(
                "store_name",
                user.store_name || ""
            );

            localStorage.setItem(
                "phone",
                user.phone || ""
            );

            localStorage.setItem(
                "address",
                user.address || ""
            );


            // -----------------------------------------
            // DEFAULT PROFILE STATUS
            // -----------------------------------------

            localStorage.setItem(
                "accountStatus",
                "Active"
            );

            localStorage.setItem(
                "verificationStatus",
                "Pending Verification"
            );


            // -----------------------------------------
            // DEBUG - CHECK SAVED DATA
            // -----------------------------------------

            console.log(
                "Saved Profile Data:",
                {
                    userId:
                        localStorage.getItem("userId"),

                    username:
                        localStorage.getItem("username"),

                    userEmail:
                        localStorage.getItem("userEmail"),

                    store_name:
                        localStorage.getItem("store_name"),

                    phone:
                        localStorage.getItem("phone"),

                    address:
                        localStorage.getItem("address")
                }
            );


            // -----------------------------------------
            // SUCCESS MESSAGE
            // -----------------------------------------

            loginMessage.style.color = "green";

            loginMessage.textContent =
                "Login successful!";


            // -----------------------------------------
            // REDIRECT BASED ON ROLE
            // -----------------------------------------

            setTimeout(function () {

                if (user.role === "buyer") {

                    window.location.href =
                        "buyer-dashboard/buyer_dashboard.html";

                }

                else if (user.role === "seller") {

                    window.location.href =
                        "seller-dashboard/dashboard.html";

                }

                else if (user.role === "admin") {

                    window.location.href =
                        "admin-dashboard/dashboard.html";

                }

                else {

                    window.location.href =
                        "login.html";
                }

            }, 500);


        }
        catch (error) {

            console.error(
                "Login Error:",
                error
            );

            loginMessage.style.color = "red";

            loginMessage.textContent =
                "Backend connection failed!";

        }

    });

}
