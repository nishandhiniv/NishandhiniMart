//=========================================================
// NishandhiniMart - Seller Settings
// =========================================================


// =========================================================
// SELLER DATA
// =========================================================

const sellerId =
    parseInt(
        localStorage.getItem("userId") || "0"
    );


const sellerName =
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    "Seller";


const sellerUsername =
    localStorage.getItem("username") ||
    "-";


const sellerEmail =
    localStorage.getItem("userEmail") ||
    "-";


const sellerStore =
    localStorage.getItem("store_name") ||
    "-";


const sellerPhone =
    localStorage.getItem("phone") ||
    "-";


const sellerRole =
    localStorage.getItem("userRole") ||
    "";


// =========================================================
// LOGIN CHECK
// =========================================================

if (!sellerId || sellerRole !== "seller") {

    alert("Please login as seller.");

    window.location.href =
        "../login.html";

}


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupProfile();

        loadAccountInformation();

        loadNotificationSettings();

        loadAccountStatus();

    }
);


// =========================================================
// PROFILE
// =========================================================

function setupProfile() {

    const nameElement =
        document.getElementById(
            "topProfileName"
        );


    const avatarElement =
        document.getElementById(
            "topProfileAvatar"
        );


    if (nameElement) {

        nameElement.textContent =
            sellerName;

    }


    if (avatarElement) {

        avatarElement.textContent =
            sellerName
                .charAt(0)
                .toUpperCase();

    }

}


// =========================================================
// ACCOUNT INFORMATION
// =========================================================

function loadAccountInformation() {

    setText(
        "settingsUsername",
        sellerUsername
    );


    setText(
        "settingsEmail",
        sellerEmail
    );


    setText(
        "settingsStore",
        sellerStore
    );


    setText(
        "settingsPhone",
        sellerPhone
    );

}


// =========================================================
// ACCOUNT STATUS
// =========================================================

function loadAccountStatus() {

    const accountStatus =
        localStorage.getItem(
            "accountStatus"
        ) || "Active";


    const verificationStatus =
        localStorage.getItem(
            "verificationStatus"
        ) || "Pending Verification";


    const badge =
        document.getElementById(
            "accountStatusBadge"
        );


    const verificationText =
        document.getElementById(
            "verificationText"
        );


    if (badge) {

        badge.textContent =
            accountStatus;

    }


    if (verificationText) {

        verificationText.textContent =
            verificationStatus;

    }

}


// =========================================================
// PROFILE DROPDOWN
// =========================================================

function toggleProfileMenu() {

    const dropdown =
        document.getElementById(
            "profileDropdown"
        );


    if (!dropdown) return;


    dropdown.classList.toggle(
        "show"
    );

}


document.addEventListener(
    "click",
    function (event) {

        const profileMenu =
            document.querySelector(
                ".profile-menu"
            );


        const dropdown =
            document.getElementById(
                "profileDropdown"
            );


        if (
            !profileMenu ||
            !dropdown
        ) {
            return;
        }


        if (
            !profileMenu.contains(
                event.target
            )
        ) {

            dropdown.classList.remove(
                "show"
            );

        }

    }
);


// =========================================================
// OPEN PROFILE
// =========================================================

function openSellerProfile() {

    window.location.href =
        "seller-profile.html";

}


// =========================================================
// NOTIFICATION SETTINGS
// =========================================================

function loadNotificationSettings() {

    const orderNotifications =
        localStorage.getItem(
            "sellerOrderNotifications"
        );


    const stockNotifications =
        localStorage.getItem(
            "sellerStockNotifications"
        );


    const salesNotifications =
        localStorage.getItem(
            "sellerSalesNotifications"
        );


    const orderCheckbox =
        document.getElementById(
            "orderNotifications"
        );


    const stockCheckbox =
        document.getElementById(
            "stockNotifications"
        );


    const salesCheckbox =
        document.getElementById(
            "salesNotifications"
        );


    if (orderCheckbox) {

        orderCheckbox.checked =
            orderNotifications === null
                ? true
                : orderNotifications === "true";

    }


    if (stockCheckbox) {

        stockCheckbox.checked =
            stockNotifications === null
                ? true
                : stockNotifications === "true";

    }


    if (salesCheckbox) {

        salesCheckbox.checked =
            salesNotifications === null
                ? true
                : salesNotifications === "true";

    }

}


// =========================================================
// SAVE NOTIFICATION SETTINGS
// =========================================================

function saveNotificationSettings() {

    const orderCheckbox =
        document.getElementById(
            "orderNotifications"
        );


    const stockCheckbox =
        document.getElementById(
            "stockNotifications"
        );


    const salesCheckbox =
        document.getElementById(
            "salesNotifications"
        );


    localStorage.setItem(
        "sellerOrderNotifications",
        orderCheckbox.checked
    );


    localStorage.setItem(
        "sellerStockNotifications",
        stockCheckbox.checked
    );


    localStorage.setItem(
        "sellerSalesNotifications",
        salesCheckbox.checked
    );


    showMessage(
        "notificationMessage",
        "Notification preferences saved successfully.",
        "success"
    );

}


// =========================================================
// CHANGE PASSWORD
// =========================================================

function changePassword() {

    const currentPassword =
        document.getElementById("currentPassword").value.trim();

    const newPassword =
        document.getElementById("newPassword").value.trim();

    const confirmPassword =
        document.getElementById("confirmPassword").value.trim();

    // User ID
    const userId =
        parseInt(localStorage.getItem("userId") || "0");

    // Login check
    if (!userId) {

        showMessage(
            "passwordMessage",
            "Please login again.",
            "error"
        );

        return;
    }

    // Empty check
    if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
    ) {

        showMessage(
            "passwordMessage",
            "Please fill all password fields.",
            "error"
        );

        return;
    }

    // Minimum length
    if (newPassword.length < 6) {

        showMessage(
            "passwordMessage",
            "New password must contain at least 6 characters.",
            "error"
        );

        return;
    }

    // Confirm password
    if (newPassword !== confirmPassword) {

        showMessage(
            "passwordMessage",
            "New password and confirmation password do not match.",
            "error"
        );

        return;
    }

    // Same password check
    if (currentPassword === newPassword) {

        showMessage(
            "passwordMessage",
            "New password must be different from current password.",
            "error"
        );

        return;
    }

    // Backend request
    fetch(
        "http://127.0.0.1:10000/api/change-password",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                user_id: userId,

                current_password:
                    currentPassword,

                new_password:
                    newPassword

            })
        }
    )
    .then(function (response) {

        return response.json();

    })
    .then(function (data) {

        if (!data.success) {

            showMessage(
                "passwordMessage",
                data.message ||
                    "Unable to change password.",
                "error"
            );

            return;
        }

        showMessage(
            "passwordMessage",
            "Password changed successfully.",
            "success"
        );

        clearPasswordFields();

    })
    .catch(function (error) {

        console.error(
            "Change Password Error:",
            error
        );

        showMessage(
            "passwordMessage",
            "Unable to connect to the backend.",
            "error"
        );

    });

}
// =========================================================
// CLEAR PASSWORD
// =========================================================

function clearPasswordFields() {

    const currentPassword =
        document.getElementById(
            "currentPassword"
        );


    const newPassword =
        document.getElementById(
            "newPassword"
        );


    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        );


    if (currentPassword) {

        currentPassword.value = "";

    }


    if (newPassword) {

        newPassword.value = "";

    }


    if (confirmPassword) {

        confirmPassword.value = "";

    }


    const message =
        document.getElementById(
            "passwordMessage"
        );


    if (message) {

        message.className =
            "settings-message";

        message.textContent = "";

    }

}


// =========================================================
// LOGOUT
// =========================================================

function logout() {

    localStorage.removeItem("userId");

    localStorage.removeItem("username");

    localStorage.removeItem("userName");

    localStorage.removeItem("userRole");

    localStorage.removeItem("userEmail");

    localStorage.removeItem("store_name");

    localStorage.removeItem("phone");

    localStorage.removeItem("address");

    localStorage.removeItem("accountStatus");

    localStorage.removeItem(
        "verificationStatus"
    );


    window.location.href =
        "../login.html";

}


// =========================================================
// HELPER - SET TEXT
// =========================================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;

    }

}


// =========================================================
// HELPER - MESSAGE
// =========================================================

function showMessage(
    elementId,
    message,
    type
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) return;


    element.textContent =
        message;


    element.className =
        "settings-message " +
        type;


    setTimeout(
        function () {

            element.className =
                "settings-message";

            element.textContent =
                "";

        },
        4000
    );

}
