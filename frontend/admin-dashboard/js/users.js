/* =========================================================
   NISHANDHINIMART ADMIN - USERS PAGE
   ========================================================= */

const BASE_URL = "http://127.0.0.1:10000/api";

let allUsers = [];
let filteredUsers = [];


/* =========================================================
   ADMIN LOGIN CHECK
   ========================================================= */

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


/* =========================================================
   ADMIN PROFILE
   ========================================================= */

function updateAdminProfile() {

    const adminNameElement = document.getElementById("adminName");
    const adminAvatarElement = document.getElementById("adminAvatar");

    const storedName =
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        "Admin";

    if (adminNameElement) {
        adminNameElement.textContent = storedName;
    }

    if (adminAvatarElement) {

        const firstLetter =
            storedName.trim().charAt(0).toUpperCase() || "A";

        adminAvatarElement.textContent = firstLetter;
    }
}


/* =========================================================
   GET ARRAY FROM API RESPONSE
   ========================================================= */

function getArray(result, key = null) {

    if (Array.isArray(result)) {
        return result;
    }

    if (key && Array.isArray(result?.[key])) {
        return result[key];
    }

    if (Array.isArray(result?.data)) {
        return result.data;
    }

    if (Array.isArray(result?.users)) {
        return result.users;
    }

    if (Array.isArray(result?.result)) {
        return result.result;
    }

    return [];
}


/* =========================================================
   LOAD USERS
   ========================================================= */

async function loadUsers() {

    const tableBody =
        document.getElementById("usersTableBody");

    if (tableBody) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="loading-box">
                        <div class="spinner"></div>
                        <p>Loading users...</p>
                    </div>
                </td>
            </tr>
        `;
    }


    try {

        const response = await fetch(
            `${BASE_URL}/admin-users`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const result = await response.json();


        console.log("Users API response:", result);


        allUsers = getArray(result, "users");

        filteredUsers = [...allUsers];


        updateUserMetrics();

        renderUsers();


    } catch (error) {

        console.error(
            "Failed to load users:",
            error
        );


        allUsers = [];

        filteredUsers = [];


        updateUserMetrics();


        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-box">
                            <div style="font-size:32px;">
                                ⚠️
                            </div>

                            <h3>
                                Unable to load users
                            </h3>

                            <p>
                                Please make sure the backend
                                is running on port 8090.
                            </p>

                            <button
                                type="button"
                                class="refresh-btn"
                                onclick="loadUsers()"
                            >
                                🔄 Try Again
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
}


/* =========================================================
   UPDATE USER METRICS
   ========================================================= */

function updateUserMetrics() {

    const totalUsersElement =
        document.getElementById("totalUsers");

    const totalBuyersElement =
        document.getElementById("totalBuyers");

    const totalSellersElement =
        document.getElementById("totalSellers");

    const totalAdminsElement =
        document.getElementById("totalAdmins");

    const activeUsersElement =
        document.getElementById("activeUsers");


    const totalUsers = allUsers.length;


    const buyers = allUsers.filter(user => {

        return String(
            user.role || ""
        ).toLowerCase() === "buyer";

    }).length;


    const sellers = allUsers.filter(user => {

        return String(
            user.role || ""
        ).toLowerCase() === "seller";

    }).length;


    const admins = allUsers.filter(user => {

        return String(
            user.role || ""
        ).toLowerCase() === "admin";

    }).length;


    /*
       The current database does not have a reliable
       online/current-session field.

       Therefore we do not fabricate an active-user count.
    */

    const activeUsers = 0;


    if (totalUsersElement) {
        totalUsersElement.textContent = totalUsers;
    }

    if (totalBuyersElement) {
        totalBuyersElement.textContent = buyers;
    }

    if (totalSellersElement) {
        totalSellersElement.textContent = sellers;
    }

    if (totalAdminsElement) {
        totalAdminsElement.textContent = admins;
    }

    if (activeUsersElement) {
        activeUsersElement.textContent = activeUsers;
    }
}


/* =========================================================
   RENDER USERS TABLE
   ========================================================= */

function renderUsers() {

    const tableBody =
        document.getElementById("usersTableBody");


    if (!tableBody) {
        return;
    }


    if (!filteredUsers.length) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">

                    <div class="empty-box">

                        <div style="font-size:32px;">
                            👥
                        </div>

                        <h3>
                            No users found
                        </h3>

                        <p>
                            There are no users matching
                            your search.
                        </p>

                    </div>

                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML = filteredUsers
        .map(user => createUserRow(user))
        .join("");
}


/* =========================================================
   CREATE USER ROW
   ========================================================= */

function createUserRow(user) {

    const name =
        escapeHtml(
            user.name ||
            user.username ||
            "Unknown"
        );


    const username =
        escapeHtml(
            user.username ||
            "-"
        );


    const email =
        escapeHtml(
            user.email ||
            "-"
        );


    const role =
        String(
            user.role || "buyer"
        ).toLowerCase();


    const roleText =
        role.charAt(0).toUpperCase() +
        role.slice(1);


    const status =
        getUserStatus(user);


    const statusClass =
        status.toLowerCase() === "active"
            ? "status-active"
            : "status-inactive";


    const userId =
        user.id ?? "";


    return `
        <tr>

            <td>
                <div class="user-name-cell">

                    <div class="user-table-avatar">
                        ${getInitial(
                            user.name ||
                            user.username ||
                            "U"
                        )}
                    </div>

                    <strong>
                        ${name}
                    </strong>

                </div>
            </td>


            <td>
                ${username}
            </td>


            <td>
                ${email}
            </td>


            <td>

                <span class="
                    role-badge
                    role-${escapeHtml(role)}
                ">
                    ${escapeHtml(roleText)}
                </span>

            </td>


            <td>

                <span class="
                    status-badge
                    ${statusClass}
                ">
                    ${escapeHtml(status)}
                </span>

            </td>


            <td>

                <button
                    type="button"
                    class="view-user-btn"
                    onclick="viewUserDetails(${Number(userId) || 0})"
                >
                    View
                </button>

            </td>

        </tr>
    `;
}


/* =========================================================
   USER STATUS
   ========================================================= */

function getUserStatus(user) {

    /*
       Support possible status fields if backend
       provides them later.
    */

    const value =
        user.status ??
        user.account_status ??
        user.accountStatus;


    if (!value) {
        return "Active";
    }


    const normalized =
        String(value).toLowerCase();


    if (
        normalized === "inactive" ||
        normalized === "disabled" ||
        normalized === "blocked"
    ) {
        return "Inactive";
    }


    return "Active";
}


/* =========================================================
   SEARCH USERS
   ========================================================= */

function searchUsers() {

    const searchInput =
        document.getElementById("userSearch");

    const roleFilter =
        document.getElementById("roleFilter");


    const searchTerm =
        String(
            searchInput?.value || ""
        )
        .trim()
        .toLowerCase();


    const selectedRole =
        String(
            roleFilter?.value || "all"
        )
        .toLowerCase();


    filteredUsers = allUsers.filter(user => {


        const name =
            String(
                user.name || ""
            ).toLowerCase();


        const username =
            String(
                user.username || ""
            ).toLowerCase();


        const email =
            String(
                user.email || ""
            ).toLowerCase();


        const role =
            String(
                user.role || ""
            ).toLowerCase();


        const matchesSearch =
            !searchTerm ||
            name.includes(searchTerm) ||
            username.includes(searchTerm) ||
            email.includes(searchTerm);


        const matchesRole =
            selectedRole === "all" ||
            role === selectedRole;


        return (
            matchesSearch &&
            matchesRole
        );
    });


    renderUsers();
}


/* =========================================================
   VIEW USER DETAILS
   ========================================================= */
/* =========================================================
   VIEW USER DETAILS
   ========================================================= */

async function viewUserDetails(userId) {

    try {

        const response = await fetch(
            `${BASE_URL}/admin-users/${userId}`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );


        const data = await response.json();


        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Unable to load user details."
            );

            return;
        }


        const profile =
            data.profile || {};

        const account =
            data.account || {};

        const purchaseHistory =
            Array.isArray(data.purchase_history)
                ? data.purchase_history
                : [];

        const orders =
            Array.isArray(data.orders)
                ? data.orders
                : [];

        const reviews =
            Array.isArray(data.reviews_given)
                ? data.reviews_given
                : [];


        const name =
            profile.name ||
            profile.username ||
            "Unknown";


        const username =
            profile.username ||
            "-";


        const email =
            profile.email ||
            "-";


        const role =
            String(
                profile.role || "-"
            ).toLowerCase();


        const phone =
            profile.phone ||
            "N/A";


        const address =
            account.address ||
            "N/A";


        /* =====================================================
           PERSONAL DETAILS
        ====================================================== */

        let message =
            "USER ACTIVITY\n\n" +

            `${name}\n\n` +

            "PERSONAL DETAILS\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +

            `User ID       : ${profile.user_id || "-"}\n` +
            `Name          : ${name}\n` +
            `Username      : ${username}\n` +
            `Email         : ${email}\n` +
            `Role          : ${profile.role || "-"}\n` +
            `Phone         : ${phone}\n\n`;


        /* =====================================================
           ACCOUNT DETAILS
        ====================================================== */

        message +=
            "ACCOUNT DETAILS\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +

            `Address       : ${address}\n`;


        /* =====================================================
           SELLER ONLY DETAILS
        ====================================================== */

        if (role === "seller") {

            message +=

                `Store Name    : ${
                    account.store_name || "N/A"
                }\n` +

                `GST Number    : ${
                    account.gst_number || "N/A"
                }\n` +

                `Business License : ${
                    account.business_license || "N/A"
                }\n` +

                `Verification  : ${
                    account.verification_status || "N/A"
                }\n`;
        }


        message += "\n";


        /* =====================================================
           BUYER PURCHASE HISTORY
        ====================================================== */

        if (role === "buyer") {

            message +=
                "PURCHASE HISTORY\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";


            if (!purchaseHistory.length) {

                message +=
                    "No products purchased yet.\n";

            } else {

                purchaseHistory.forEach(
                    (item, index) => {

                        const price =
                            Number(
                                item.price || 0
                            );

                        const total =
                            Number(
                                item.total || 0
                            );


                        message +=

                            `\nPurchase ${index + 1}\n` +

                            `Order ID      : ${
                                item.order_id || "-"
                            }\n` +

                            `Product       : ${
                                item.product || "-"
                            }\n` +

                            `Quantity      : ${
                                item.quantity || 0
                            }\n` +

                            `Price         : ₹${
                                price.toLocaleString("en-IN")
                            }\n` +

                            `Total         : ₹${
                                total.toLocaleString("en-IN")
                            }\n` +

                            `Status        : ${
                                item.status || "-"
                            }\n` +

                            `Order Date    : ${
                                formatActivityDate(
                                    item.date
                                )
                            }\n`;
                    }
                );
            }


            /* =================================================
               ORDERS
            ================================================== */

            message +=
                "\nORDERS\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";


            if (!orders.length) {

                message +=
                    "No orders found.\n";

            } else {

                orders.forEach(
                    (order, index) => {

                        const amount =
                            Number(
                                order.total_amount || 0
                            );


                        message +=

                            `\nOrder ${index + 1}\n` +

                            `Order ID      : ${
                                order.order_id || "-"
                            }\n` +

                            `Total Amount  : ₹${
                                amount.toLocaleString("en-IN")
                            }\n` +

                            `Status        : ${
                                order.status || "-"
                            }\n` +

                            `Order Date    : ${
                                formatActivityDate(
                                    order.order_date
                                )
                            }\n`;
                    }
                );
            }


            /* =================================================
               REVIEWS
            ================================================== */

            message +=
                "\nREVIEWS GIVEN\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";


            if (!reviews.length) {

                message +=
                    "No reviews given yet.\n";

            } else {

                reviews.forEach(
                    (review, index) => {

                        message +=

                            `\nReview ${index + 1}\n` +

                            `Product       : ${
                                review.product || "-"
                            }\n` +

                            `Rating        : ${
                                review.rating || 0
                            } / 5\n` +

                            `Review        : ${
                                review.review || "N/A"
                            }\n` +

                            `Date          : ${
                                formatActivityDate(
                                    review.date
                                )
                            }\n`;
                    }
                );
            }
        }


        /* =====================================================
           SHOW DETAILS
        ====================================================== */

        alert(message);


    } catch (error) {

        console.error(
            "Error loading user details:",
            error
        );


        alert(
            "Unable to connect to the backend."
        );
    }
}


/* =========================================================
   FORMAT ACTIVITY DATE
   ========================================================= */

function formatActivityDate(value) {

    if (!value) {
        return "N/A";
    }


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {
        return String(value);
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}
/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   GET INITIAL
   ========================================================= */

function getInitial(value) {

    const text =
        String(value || "U").trim();


    return escapeHtml(
        text.charAt(0).toUpperCase() || "U"
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

    const confirmLogout =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmLogout) {
        return;
    }


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


    window.location.href = "../login.html";
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!checkAdminLogin()) {
            return;
        }


        updateAdminProfile();


        const searchInput =
            document.getElementById("userSearch");


        const roleFilter =
            document.getElementById("roleFilter");


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                searchUsers
            );
        }


        if (roleFilter) {

            roleFilter.addEventListener(
                "change",
                searchUsers
            );
        }


        loadUsers();
    }
);
