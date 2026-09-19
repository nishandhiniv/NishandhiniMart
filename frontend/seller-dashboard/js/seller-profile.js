// =========================================================
// SELLER PROFILE
// NishandhiniMart
// =========================================================


// =========================================================
// SELLER LOGIN INFORMATION
// =========================================================

const sellerId =
    parseInt(localStorage.getItem("userId") || "0");

const sellerName =
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    "Seller";

const sellerUsername =
    localStorage.getItem("username") ||
    sellerName;

const sellerEmail =
    localStorage.getItem("userEmail") ||
    localStorage.getItem("email") ||
    "Not available";

const sellerPhone =
    localStorage.getItem("phone") ||
    localStorage.getItem("userPhone") ||
    "Not available";

const sellerAddress =
    localStorage.getItem("address") ||
    localStorage.getItem("userAddress") ||
    "Not available";

const sellerStoreName =
    localStorage.getItem("store_name") ||
    localStorage.getItem("storeName") ||
    sellerName;

const sellerRole =
    localStorage.getItem("userRole") || "";

const sellerAccountStatus =
    localStorage.getItem("accountStatus") ||
    "Active";

const sellerVerificationStatus =
    localStorage.getItem("verificationStatus") ||
    "Pending Verification";


// =========================================================
// LOGIN CHECK
// =========================================================

if (!sellerId || sellerRole !== "seller") {

    alert("Please login as seller.");

    window.location.href = "../login.html";
}


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProfileInformation();

        loadPaymentInformation();

        setupProfileMenu();

    }
);


// =========================================================
// LOAD PROFILE INFORMATION
// =========================================================

function loadProfileInformation() {

    // -----------------------------------------------------
    // TOP PROFILE
    // -----------------------------------------------------

    const profileAvatar =
        document.getElementById("profileAvatar");

    const profileUsername =
        document.getElementById("profileUsername");

    const profileStoreName =
        document.getElementById("profileStoreName");

    const profileStatus =
        document.getElementById("profileStatus");


    if (profileAvatar) {

        profileAvatar.textContent =
            sellerName
                .charAt(0)
                .toUpperCase();

    }


    if (profileUsername) {

        profileUsername.textContent =
            sellerName;

    }


    if (profileStoreName) {

        profileStoreName.textContent =
            sellerStoreName;

    }


    if (profileStatus) {

        profileStatus.textContent =
            sellerAccountStatus + " Seller";

    }


    // -----------------------------------------------------
    // HEADER PROFILE
    // -----------------------------------------------------

    const topProfileAvatar =
        document.getElementById("topProfileAvatar");

    const topProfileName =
        document.getElementById("topProfileName");


    if (topProfileAvatar) {

        topProfileAvatar.textContent =
            sellerName
                .charAt(0)
                .toUpperCase();

    }


    if (topProfileName) {

        topProfileName.textContent =
            sellerName;

    }


    // -----------------------------------------------------
    // PERSONAL INFORMATION
    // -----------------------------------------------------

    setText(
        "usernameValue",
        sellerUsername
    );


    setText(
        "emailValue",
        sellerEmail
    );


    setText(
        "phoneValue",
        sellerPhone
    );


    setText(
        "addressValue",
        sellerAddress
    );


    // -----------------------------------------------------
    // ACCOUNT STATUS
    // -----------------------------------------------------

    const statusValue =
        document.getElementById("statusValue");


    if (statusValue) {

        const statusLower =
            sellerAccountStatus
                .toLowerCase()
                .trim();


        let badgeClass = "active";


        if (
            statusLower !== "active" &&
            statusLower !== "verified"
        ) {

            badgeClass = "pending";

        }


        statusValue.innerHTML = `
            <span class="profile-badge ${badgeClass}">
                ${escapeHtml(sellerAccountStatus)}
            </span>
        `;

    }


    // -----------------------------------------------------
    // STORE INFORMATION
    // -----------------------------------------------------

    setText(
        "storeNameValue",
        sellerStoreName
    );


    // -----------------------------------------------------
    // VERIFICATION
    // -----------------------------------------------------

    const gst =
        localStorage.getItem("gst") ||
        localStorage.getItem("gstNumber") ||
        localStorage.getItem("taxNumber") ||
        "Not submitted";


    const license =
        localStorage.getItem("license") ||
        localStorage.getItem("businessLicense") ||
        localStorage.getItem("licenseNumber") ||
        "Not submitted";


    setText(
        "gstValue",
        gst
    );


    setText(
        "licenseValue",
        license
    );


    const verificationValue =
        document.getElementById(
            "verificationValue"
        );


    if (verificationValue) {

        const verificationLower =
            sellerVerificationStatus
                .toLowerCase()
                .trim();


        let badgeClass = "pending";


        if (
            verificationLower === "verified" ||
            verificationLower === "approved"
        ) {

            badgeClass = "active";

        }


        verificationValue.innerHTML = `
            <span class="profile-badge ${badgeClass}">
                ${escapeHtml(sellerVerificationStatus)}
            </span>
        `;

    }

}


// =========================================================
// PAYMENT INFORMATION
// =========================================================

function loadPaymentInformation() {

    const totalPayment =
        Number(
            localStorage.getItem(
                "sellerTotalPayment"
            ) || "0"
        );


    const pendingPayment =
        Number(
            localStorage.getItem(
                "sellerPendingPayment"
            ) || "0"
        );


    const savedAvailablePayout =
        localStorage.getItem(
            "sellerAvailablePayout"
        );


    const availablePayout =
        savedAvailablePayout !== null
            ? Number(savedAvailablePayout)
            : totalPayment;


    setText(
        "totalPayment",
        formatCurrency(totalPayment)
    );


    setText(
        "pendingPayment",
        formatCurrency(pendingPayment)
    );


    setText(
        "availablePayout",
        formatCurrency(availablePayout)
    );

}


// =========================================================
// CURRENCY FORMAT
// =========================================================

function formatCurrency(value) {

    return "₹" +
        Number(value || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// =========================================================
// PROFILE DROPDOWN
// =========================================================

function setupProfileMenu() {

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

}


function toggleProfileMenu() {

    const dropdown =
        document.getElementById(
            "profileDropdown"
        );


    if (!dropdown) {

        return;

    }


    dropdown.classList.toggle("show");

}


// =========================================================
// PROFILE NAVIGATION
// =========================================================

function openSellerProfile() {

    window.location.href =
        "seller-profile.html";

}


function goDashboard() {

    window.location.href =
        "dashboard.html";

}


function goSettings() {

    window.location.href =
        "settings.html";

}


// =========================================================
// EDIT PROFILE
// =========================================================

function editProfile() {
    window.location.href = "edit-profile.html";
}

// =========================================================
// NOTIFICATION
// =========================================================

function showNotificationMessage() {

    alert(
        "No new notifications."
    );

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
// SET TEXT HELPER
// =========================================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        return;

    }


    element.textContent =
        value ||
        "Not available";

}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
// =========================================================
// VERIFICATION EDIT
// =========================================================

function toggleVerificationEdit() {

    const view = document.getElementById("verificationView");
    const edit = document.getElementById("verificationEdit");

    if (!view || !edit) return;

    // Load existing values
    const gstValue =
        document.getElementById("gstValue")?.textContent.trim() || "";

    const licenseValue =
        document.getElementById("licenseValue")?.textContent.trim() || "";

    const gstInput =
        document.getElementById("gstNumber");

    const licenseInput =
        document.getElementById("businessLicense");

    if (gstInput) {
        gstInput.value =
            gstValue === "Not submitted" ? "" : gstValue;
    }

    if (licenseInput) {
        licenseInput.value =
            licenseValue === "Not submitted" ? "" : licenseValue;
    }

    view.style.display = "none";
    edit.style.display = "block";
}


function cancelVerificationEdit() {

    const view = document.getElementById("verificationView");
    const edit = document.getElementById("verificationEdit");

    if (!view || !edit) return;

    edit.style.display = "none";
    view.style.display = "block";
}


async function saveVerification() {

    const gstInput =
        document.getElementById("gstNumber");

    const licenseInput =
        document.getElementById("businessLicense");

    const gstNumber =
        gstInput ? gstInput.value.trim() : "";

    const businessLicense =
        licenseInput ? licenseInput.value.trim() : "";

    const userId =
        parseInt(localStorage.getItem("userId") || "0");


    if (!userId) {
        alert("User session not found. Please login again.");
        return;
    }


    if (!gstNumber) {
        alert("Please enter GST / Tax Number.");
        gstInput?.focus();
        return;
    }


    if (!businessLicense) {
        alert("Please enter Business License Number.");
        licenseInput?.focus();
        return;
    }


    try {

        const response = await fetch(
            "http://127.0.0.1:8090/api/update-seller-verification",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    user_id: userId,
                    gst_number: gstNumber,
                    business_license: businessLicense
                })
            }
        );


        const data = await response.json();

        console.log(
            "Verification Update Response:",
            data
        );


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to save verification details."
            );
        }


        // Update page display
        const gstDisplay =
            document.getElementById("gstValue");

        const licenseDisplay =
            document.getElementById("licenseValue");


        if (gstDisplay) {
            gstDisplay.textContent = gstNumber;
            gstDisplay.classList.remove("muted");
        }


        if (licenseDisplay) {
            licenseDisplay.textContent =
                businessLicense;

            licenseDisplay.classList.remove("muted");
        }


        // Save locally too
        localStorage.setItem(
            "gst_number",
            gstNumber
        );

        localStorage.setItem(
            "business_license",
            businessLicense
        );


        cancelVerificationEdit();


        alert(
            "Verification details saved successfully."
        );

    } catch (error) {

        console.error(
            "Verification Save Error:",
            error
        );

        alert(
            error.message ||
            "Unable to save verification details."
        );
    }
}