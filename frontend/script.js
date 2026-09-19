// =========================================================
// NISHANDHINIMART - AUTHENTICATION SCRIPT
// Registration + Login
// =========================================================


// =========================================================
// REGISTRATION
// =========================================================

const registrationForm =
    document.getElementById("registrationForm");

if (registrationForm) {

    registrationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const username =
                document.getElementById("username").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;

            const role =
                document.getElementById("role").value.toLowerCase();

            const messageElement =
                document.getElementById("message");


            // Clear old message
            messageElement.textContent = "";
            messageElement.style.color = "red";


            // Basic validation
            if (
                !username ||
                !email ||
                !password ||
                !confirmPassword
            ) {
                messageElement.textContent =
                    "Please fill all required fields.";
                return;
            }


            // Password confirmation
            if (password !== confirmPassword) {
                messageElement.textContent =
                    "Passwords do not match.";
                return;
            }


            // Seller-specific fields
            let storeName = "";
            let phone = "";
            let address = "";

            if (role === "seller") {

                const storeField =
                    document.getElementById("store_name");

                const phoneField =
                    document.getElementById("phone");

                const addressField =
                    document.getElementById("address");


                storeName =
                    storeField.value.trim();

                phone =
                    phoneField.value.trim();

                address =
                    addressField.value.trim();


                if (
                    !storeName ||
                    !phone ||
                    !address
                ) {
                    messageElement.textContent =
                        "Please fill all seller details.";
                    return;
                }
            }


            try {

                messageElement.style.color = "#555";

                messageElement.textContent =
                    "Creating your account...";


                const response = await fetch(
                    "http://127.0.0.1:8090/api/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            name: username,

                            username: username,

                            email: email,

                            password: password,

                            role: role,

                            store_name: storeName,

                            phone: phone,

                            address: address

                        })
                    }
                );


                const result =
                    await response.json();


                console.log(
                    "Register response:",
                    result
                );


                if (
                    !response.ok ||
                    result.success === false
                ) {

                    messageElement.style.color = "red";

                    messageElement.textContent =
                        result.message ||
                        "Registration failed.";

                    return;
                }


                messageElement.style.color = "green";

                messageElement.textContent =
                    result.message ||
                    "Registration successful! You can now login.";


                registrationForm.reset();


                // Reset role to Buyer
                if (
                    typeof selectRole === "function"
                ) {
                    selectRole("buyer");
                }

            }
            catch (error) {

                console.error(
                    "Registration Error:",
                    error
                );

                messageElement.style.color = "red";

                messageElement.textContent =
                    "Backend connection failed. Please make sure the backend is running.";
            }

        }
    );

}



// =========================================================
// LOGIN
// =========================================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                document.getElementById("username").value.trim();

            const password =
                document.getElementById("password").value;


            const loginMessage =
                document.getElementById("loginMessage");


            if (!username || !password) {

                if (loginMessage) {
                    loginMessage.textContent =
                        "Please enter username/email and password.";
                }

                return;
            }


            const loginData = {

                username: username,

                password: password

            };


            try {

                if (loginMessage) {
                    loginMessage.style.color = "#555";
                    loginMessage.textContent =
                        "Logging in...";
                }


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


                const result =
                    await response.json();


                console.log(
                    "Login response:",
                    result
                );


                if (
                    !response.ok ||
                    result.success !== true ||
                    !result.user
                ) {

                    if (loginMessage) {

                        loginMessage.style.color = "red";

                        loginMessage.textContent =
                            result.message ||
                            "Invalid username/email or password.";
                    }

                    return;
                }


                // =================================================
                // LOGIN SUCCESS - SAVE COMPLETE USER DETAILS
                // =================================================

                const user =
                    result.user;


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


                // Additional profile defaults
                localStorage.setItem(
                    "accountStatus",
                    "Active"
                );

                localStorage.setItem(
                    "verificationStatus",
                    "Pending Verification"
                );

                localStorage.setItem(
                    "gstNumber",
                    ""
                );

                localStorage.setItem(
                    "businessLicense",
                    ""
                );


                console.log(
                    "Saved user details:",
                    {
                        userId: user.id,
                        username: user.username,
                        name: user.name,
                        role: user.role,
                        email: user.email,
                        store_name: user.store_name,
                        phone: user.phone,
                        address: user.address
                    }
                );


                if (loginMessage) {

                    loginMessage.style.color = "green";

                    loginMessage.textContent =
                        "Login successful!";

                }


                // =================================================
                // REDIRECT BASED ON ROLE
                // =================================================

                setTimeout(function () {

                    if (user.role === "buyer") {

                        window.location.href =
                            "buyer_dashboard.html";

                    }
                    else if (user.role === "seller") {

                        window.location.href =
                            "seller_dashboard.html";

                    }
                    else if (user.role === "admin") {

                        window.location.href =
                            "admin_dashboard.html";

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

                if (loginMessage) {

                    loginMessage.style.color = "red";

                    loginMessage.textContent =
                        "Backend connection failed!";

                }

            }

        }
    );

}