document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    updateCartCount();
});


/* ================================
   LOAD SETTINGS
================================ */

function loadSettings() {

    const name =
        localStorage.getItem("userName") || "";

    const username =
        localStorage.getItem("username") || "";

    const email =
        localStorage.getItem("userEmail") || "";

    const phone =
        localStorage.getItem("phone") || "";

    const address =
        localStorage.getItem("address") || "";

    const accountStatus =
        localStorage.getItem("accountStatus") || "Active";

    const verificationStatus =
        localStorage.getItem("verificationStatus") ||
        "Verified";

    const role =
        localStorage.getItem("userRole") || "buyer";


    setValue("settingsName", name);
    setValue("settingsUsername", username);
    setValue("settingsEmail", email);
    setValue("settingsPhone", phone);
    setValue("settingsAddress", address);


    setText(
        "accountStatus",
        accountStatus
    );

    setText(
        "accountRole",
        formatRole(role)
    );

    setText(
        "verificationStatus",
        verificationStatus
    );
}


/* ================================
   SAVE SETTINGS
================================ */

function saveSettings() {

    const name =
        getValue("settingsName");

    const email =
        getValue("settingsEmail");

    const phone =
        getValue("settingsPhone");

    const address =
        getValue("settingsAddress");


    if (!name) {

        showSettingsMessage(
            "Please enter your name.",
            "error"
        );

        return;
    }


    if (!email) {

        showSettingsMessage(
            "Please enter your email.",
            "error"
        );

        return;
    }


    localStorage.setItem(
        "userName",
        name
    );

    localStorage.setItem(
        "userEmail",
        email
    );

    localStorage.setItem(
        "phone",
        phone
    );

    localStorage.setItem(
        "address",
        address
    );


    /*
       Save notification preferences
    */

    localStorage.setItem(
        "orderNotifications",
        document.getElementById(
            "orderNotifications"
        ).checked
    );

    localStorage.setItem(
        "deliveryNotifications",
        document.getElementById(
            "deliveryNotifications"
        ).checked
    );

    localStorage.setItem(
        "promotionNotifications",
        document.getElementById(
            "promotionNotifications"
        ).checked
    );


    showSettingsMessage(
        "Settings saved successfully.",
        "success"
    );
}


/* ================================
   LOAD NOTIFICATION SETTINGS
================================ */

function loadNotificationSettings() {

    const orderNotifications =
        localStorage.getItem(
            "orderNotifications"
        );

    const deliveryNotifications =
        localStorage.getItem(
            "deliveryNotifications"
        );

    const promotionNotifications =
        localStorage.getItem(
            "promotionNotifications"
        );


    if (orderNotifications !== null) {

        document.getElementById(
            "orderNotifications"
        ).checked =
            orderNotifications === "true";
    }


    if (deliveryNotifications !== null) {

        document.getElementById(
            "deliveryNotifications"
        ).checked =
            deliveryNotifications === "true";
    }


    if (promotionNotifications !== null) {

        document.getElementById(
            "promotionNotifications"
        ).checked =
            promotionNotifications === "true";
    }
}


/* ================================
   CHANGE PASSWORD
================================ */

function changePassword() {

    alert(
        "Password change option will be available soon."
    );
}


/* ================================
   CART
================================ */

function updateCartCount() {

    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem("cart")
            ) || [];

    } catch (error) {

        console.error(
            "Unable to read cart:",
            error
        );

        cart = [];
    }


    const count = cart.reduce(
        (total, item) =>
            total + Number(item.quantity || 1),
        0
    );


    const cartCount =
        document.getElementById(
            "cartCount"
        );

    if (cartCount) {
        cartCount.textContent = count;
    }
}


/* ================================
   OPEN CART
================================ */

function openCart() {

    window.location.href =
        "buyer_dashboard.html";
}


/* ================================
   LOGOUT
================================ */

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
    localStorage.removeItem("verificationStatus");

    window.location.href =
        "../login.html";
}


/* ================================
   HELPERS
================================ */

function getValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";
}


function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.value = value;
    }
}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function formatRole(role) {

    if (!role) {
        return "Buyer";
    }

    return role.charAt(0).toUpperCase() +
        role.slice(1);
}


function showSettingsMessage(
    message,
    type
) {

    const messageElement =
        document.getElementById(
            "settingsMessage"
        );

    if (!messageElement) {
        return;
    }


    messageElement.textContent =
        message;

    messageElement.className =
        `settings-message ${type}`;


    setTimeout(() => {

        messageElement.textContent =
            "";

        messageElement.className =
            "settings-message";

    }, 3000);
}


/* ================================
   LOAD NOTIFICATIONS AFTER PAGE LOAD
================================ */

loadNotificationSettings();

