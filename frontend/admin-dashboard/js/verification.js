const BASE_URL = "https://nishandhinimart.onrender.com/api";

let allSellers = [];


// ============================================================
// ADMIN LOGIN CHECK
// ============================================================

function checkAdminLogin() {

    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("userRole");

    if (!userId || role !== "admin") {

        alert("Please login as admin.");

        window.location.href = "../login.html";

        return false;
    }

    return true;
}


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    if (!checkAdminLogin()) {
        return;
    }

    loadSellerVerification();

    setupVerificationFilters();

});


// ============================================================
// LOAD SELLER VERIFICATION
// ============================================================

async function loadSellerVerification() {

    const tableBody =
        document.getElementById("verificationTableBody");


    if (tableBody) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="loading-box">
                        <div class="spinner"></div>
                        <p>Loading seller verification...</p>
                    </div>
                </td>
            </tr>
        `;

    }


    try {

        const response =
            await fetch(`${BASE_URL}/admin-users`);


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (Array.isArray(data)) {

            allSellers = data;

        }
        else if (Array.isArray(data.users)) {

            allSellers = data.users;

        }
        else if (Array.isArray(data.data)) {

            allSellers = data.data;

        }
        else {

            allSellers = [];

        }


        // Only seller accounts
        allSellers = allSellers.filter(function (user) {

            return String(
                user.role || ""
            ).toLowerCase() === "seller";

        });


        updateVerificationSummary();

        renderSellerVerification(allSellers);

    }
    catch (error) {

        console.error(
            "Seller verification error:",
            error
        );


        allSellers = [];

        updateVerificationSummary();


        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">

                        <div class="empty-box">

                            <strong>
                                Unable to load seller verification
                            </strong>

                            <p>
                                Please make sure the backend
                                is running on port 8090.
                            </p>

                        </div>

                    </td>
                </tr>
            `;

        }

    }

}


// ============================================================
// UPDATE SUMMARY
// ============================================================

function updateVerificationSummary() {

    let pending = 0;
    let approved = 0;
    let rejected = 0;


    allSellers.forEach(function (seller) {

        const status =
            getVerificationStatus(seller);


        if (status === "approved") {

            approved++;

        }
        else if (status === "rejected") {

            rejected++;

        }
        else {

            pending++;

        }

    });


    setText(
        "totalVerificationSellers",
        allSellers.length
    );


    setText(
        "pendingVerification",
        pending
    );


    setText(
        "approvedVerification",
        approved
    );


    setText(
        "rejectedVerification",
        rejected
    );

}


// ============================================================
// GET VERIFICATION STATUS
// ============================================================

function getVerificationStatus(seller) {

    const value = String(
        seller.verification_status ||
        seller.verificationStatus ||
        "Pending Verification"
    )
        .trim()
        .toLowerCase();


    if (
        value === "approved" ||
        value === "approve"
    ) {

        return "approved";

    }


    if (
        value === "rejected" ||
        value === "reject"
    ) {

        return "rejected";

    }


    return "pending";

}


// ============================================================
// STATUS TEXT
// ============================================================

function getStatusText(status) {

    if (status === "approved") {
        return "Approved";
    }


    if (status === "rejected") {
        return "Rejected";
    }


    return "Pending Verification";

}


// ============================================================
// STATUS CSS CLASS
// ============================================================

function getStatusClass(status) {

    if (status === "approved") {
        return "verification-status-badge approved";
    }

    if (status === "rejected") {
        return "verification-status-badge rejected";
    }

    return "verification-status-badge pending";
}

// ============================================================
// RENDER SELLER TABLE
// ============================================================

function renderSellerVerification(sellers) {

    const tableBody =
        document.getElementById(
            "verificationTableBody"
        );


    if (!tableBody) {
        return;
    }


    if (!sellers || sellers.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">

                    <div class="empty-box">

                        <strong>
                            No sellers found
                        </strong>

                        <p>
                            There are no seller accounts
                            available for verification.
                        </p>

                    </div>

                </td>
            </tr>
        `;

        return;

    }


    tableBody.innerHTML = sellers.map(
        function (seller) {

            const sellerName =
                escapeHTML(
                    seller.name ||
                    seller.username ||
                    "Unknown Seller"
                );


            const email =
                escapeHTML(
                    seller.email ||
                    ""
                );


            const storeName =
                escapeHTML(
                    seller.store_name ||
                    seller.storeName ||
                    "Not provided"
                );


            const gstNumber =
                escapeHTML(
                    seller.gst_number ||
                    seller.gstNumber ||
                    "Not provided"
                );


            const businessLicense =
                escapeHTML(
                    seller.business_license ||
                    seller.businessLicense ||
                    "Not provided"
                );


            const status =
                getVerificationStatus(
                    seller
                );


            const statusText =
                getStatusText(status);


            return `
                <tr>

                    <td>

                        <div class="user-name-cell">

                            <div class="user-table-avatar">
                                ${getInitial(sellerName)}
                            </div>

                            <div>

                                <strong>
                                    ${sellerName}
                                </strong>

                                <small>
                                    ${email}
                                </small>

                            </div>

                        </div>

                    </td>


                    <td>

                        <span class="store-name">
                            ${storeName}
                        </span>

                    </td>


                    <td>

                        <span class="document-value">
                            ${gstNumber}
                        </span>

                    </td>


                    <td>

                        <span class="document-value">
                            ${businessLicense}
                        </span>

                    </td>


                    <td>

                        <span class="status-badge ${getStatusClass(status)}">
                            ${statusText}
                        </span>

                    </td>


                    <td>

                        <div class="verification-actions">

                            ${createActionButtons(
                                seller,
                                status
                            )}

                        </div>

                    </td>

                </tr>
            `;

        }
    ).join("");

}


// ============================================================
// ACTION BUTTONS
// ============================================================

function createActionButtons(
    seller,
    status
) {

    const sellerId = seller.id;


    if (!sellerId) {

        return `
            <span class="action-unavailable">
                No ID
            </span>
        `;

    }


    // APPROVED SELLER
    if (status === "approved") {

        return `
            <span class="verification-status-badge approved">
                ✓ Approved
            </span>
        `;

    }


    // REJECTED SELLER
    if (status === "rejected") {

        return `
            <span class="verification-status-badge rejected">
                ✕ Rejected
            </span>
        `;

    }


    // PENDING SELLER
    return `
        <div class="verification-action-group">

            <button
                class="verification-approve-btn"
                onclick="changeVerificationStatus(
                    ${sellerId},
                    'Approved'
                )"
            >
                ✓ Approve
            </button>

            <button
                class="verification-reject-btn"
                onclick="changeVerificationStatus(
                    ${sellerId},
                    'Rejected'
                )"
            >
                ✕ Reject
            </button>

        </div>
    `;

}


// ============================================================
// UPDATE VERIFICATION STATUS
// ============================================================

async function changeVerificationStatus(
    sellerId,
    newStatus
) {

    const seller =
        allSellers.find(function (item) {

            return Number(item.id) ===
                   Number(sellerId);

        });


    if (!seller) {

        alert("Seller not found.");

        return;

    }


    const sellerName =
        seller.name ||
        seller.username ||
        "this seller";


    let message;


    if (newStatus === "Approved") {

        message =
            `Approve ${sellerName} for seller verification?`;

    }
    else if (newStatus === "Rejected") {

        message =
            `Reject ${sellerName}'s seller verification?`;

    }
    else {

        message =
            `Move ${sellerName} back to Pending Verification?`;

    }


    if (!confirm(message)) {
        return;
    }


    try {

        const response =
            await fetch(
                `${BASE_URL}/update-verification-status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_id: sellerId,

                        verification_status:
                            newStatus

                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        alert(
            `Seller verification status updated to ${newStatus}.`
        );


        await loadSellerVerification();

    }
    catch (error) {

        console.error(
            "Verification update error:",
            error
        );


        alert(
            "Unable to update verification status. " +
            "Please make sure the backend is running."
        );

    }

}


// ============================================================
// SEARCH + FILTER
// ============================================================

function setupVerificationFilters() {

    const searchInput =
        document.getElementById(
            "verificationSearch"
        );


    const statusFilter =
        document.getElementById(
            "verificationStatusFilter"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyVerificationFilters
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyVerificationFilters
        );

    }

}


// ============================================================
// APPLY FILTERS
// ============================================================

function applyVerificationFilters() {

    const searchInput =
        document.getElementById(
            "verificationSearch"
        );


    const statusFilter =
        document.getElementById(
            "verificationStatusFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";


    const filtered =
        allSellers.filter(function (seller) {

            const sellerName =
                String(
                    seller.name ||
                    seller.username ||
                    ""
                ).toLowerCase();


            const storeName =
                String(
                    seller.store_name ||
                    seller.storeName ||
                    ""
                ).toLowerCase();


            const email =
                String(
                    seller.email ||
                    ""
                ).toLowerCase();


            const status =
                getVerificationStatus(
                    seller
                );


            const matchesSearch =
                !search ||
                sellerName.includes(search) ||
                storeName.includes(search) ||
                email.includes(search);


            const matchesStatus =
                selectedStatus === "all" ||
                selectedStatus === status;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    renderSellerVerification(
        filtered
    );

}


// ============================================================
// LOGOUT
// ============================================================

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


// ============================================================
// HELPER
// ============================================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent = value;

    }

}


// ============================================================
// INITIAL
// ============================================================

function getInitial(name) {

    if (!name) {
        return "S";
    }


    return name
        .trim()
        .charAt(0)
        .toUpperCase();

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


