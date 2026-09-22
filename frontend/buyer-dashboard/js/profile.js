document.addEventListener("DOMContentLoaded", function () {

    loadProfile();
    updateCartCount();

});


function loadProfile() {

    const userId =
        localStorage.getItem("userId") || "";

    const username =
        localStorage.getItem("username") || "";

    const userName =
        localStorage.getItem("userName") ||
        username ||
        "Buyer";

    const email =
        localStorage.getItem("userEmail") || "";

    const phone =
        localStorage.getItem("phone") || "";

    const address =
        localStorage.getItem("address") || "";

    const role =
        localStorage.getItem("userRole") || "buyer";

    const accountStatus =
        localStorage.getItem("accountStatus") || "Active";


    /* PROFILE NAME */

    setText(
        "profileDisplayName",
        userName
    );


    /* USERNAME */

    setText(
        "profileUsername",
        username
            ? "@" + username
            : "@buyer"
    );


    /* PROFILE INITIAL */

    const initialElement =
        document.getElementById("profileInitial");

    if (initialElement) {

        const firstLetter =
            userName
                .trim()
                .charAt(0)
                .toUpperCase();

        initialElement.textContent =
            firstLetter || "U";
    }


    /* PERSONAL INFORMATION */

    setText(
        "profileName",
        userName || "Not available"
    );

    setText(
        "profileUsernameValue",
        username || "Not available"
    );

    setText(
        "profileEmail",
        email || "Not available"
    );

    setText(
        "profilePhone",
        phone || "Not available"
    );

    setText(
        "profileAddress",
        address || "Not available"
    );


    /* ACCOUNT ROLE */

    let displayRole = "Buyer";

    if (role) {

        displayRole =
            role.charAt(0).toUpperCase() +
            role.slice(1);
    }

    setText(
        "profileRole",
        displayRole
    );


    /* ACCOUNT STATUS */

    setText(
        "profileAccountStatus",
        accountStatus
    );


    /* USER ID */

    setText(
        "profileUserId",
        userId || "Not available"
    );

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(elementId, value) {

    const element =
        document.getElementById(elementId);

    if (!element) return;

    element.textContent = value;
}


/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {

    const cartCountElement =
        document.getElementById("cartCount");

    if (!cartCountElement) return;


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


    let totalItems = 0;


    cart.forEach(function (item) {

        const quantity =
            Number(item.quantity) || 1;

        totalItems += quantity;

    });


    cartCountElement.textContent =
        totalItems;

}


/* =========================================================
   CART
========================================================= */

function openCart() {

    window.location.href =
        "buyer-dashboard.html";

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    const confirmLogout =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmLogout) return;


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
