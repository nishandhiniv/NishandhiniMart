/* =========================================================
   NISHANDHINIMART ADMIN - ORDERS PAGE
   ========================================================= */

const BASE_URL = "https://nishandhinimart.onrender.com/api";

let allOrders = [];
let sellerPerformance = {};


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

    const adminNameElement =
        document.getElementById("adminName");

    const adminAvatarElement =
        document.getElementById("adminAvatar");


    const storedName =
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        "Admin";


    if (adminNameElement) {
        adminNameElement.textContent = storedName;
    }


    if (adminAvatarElement) {

        adminAvatarElement.textContent =
            storedName
                .trim()
                .charAt(0)
                .toUpperCase() || "A";
    }
}


/* =========================================================
   GET ARRAY FROM API RESPONSE
   ========================================================= */

function getArray(result, key = null) {

    if (Array.isArray(result)) {
        return result;
    }


    if (
        key &&
        Array.isArray(result?.[key])
    ) {
        return result[key];
    }


    if (Array.isArray(result?.data)) {
        return result.data;
    }


    if (Array.isArray(result?.orders)) {
        return result.orders;
    }


    if (Array.isArray(result?.result)) {
        return result.result;
    }


    return [];
}


/* =========================================================
   LOAD ORDERS
   ========================================================= */

async function loadOrders() {

    showLoading();


    try {

        const response = await fetch(
            `${BASE_URL}/admin-orders`,
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


        const result =
            await response.json();


        console.log(
            "Orders API response:",
            result
        );


        allOrders =
            getArray(result, "orders");


        updateOrderMetrics();

        updateOrderStatus();

        calculateSellerPerformance();

        renderSellerPerformance();


    } catch (error) {

        console.error(
            "Failed to load orders:",
            error
        );


        allOrders = [];

        sellerPerformance = {};


        updateOrderMetrics();

        updateOrderStatus();

        renderSellerPerformanceError();
    }
}


/* =========================================================
   SHOW LOADING
   ========================================================= */

function showLoading() {

    const sellerBody =
        document.getElementById(
            "sellerPerformanceBody"
        );


    if (!sellerBody) {
        return;
    }


    sellerBody.innerHTML = `
        <tr>
            <td colspan="4">

                <div class="loading-box">

                    <div class="spinner"></div>

                    <p>
                        Loading seller performance...
                    </p>

                </div>

            </td>
        </tr>
    `;
}


/* =========================================================
   UPDATE ORDER METRICS
   ========================================================= */

function updateOrderMetrics() {

    const totalOrdersElement =
        document.getElementById("totalOrders");


    const totalSalesElement =
        document.getElementById("totalSales");


    const pendingElement =
        document.getElementById("pendingOrders");


    const processingElement =
        document.getElementById(
            "processingOrders"
        );


    const deliveredElement =
        document.getElementById(
            "deliveredOrders"
        );


    /*
       Cancelled orders are not included
       in completed sales amount.
    */

    const validSalesOrders =
        allOrders.filter(order => {

            const status =
                getOrderStatus(order);

            return (
                status !== "cancelled"
            );
        });


    const totalSales =
        validSalesOrders.reduce(
            (sum, order) => {

                return (
                    sum +
                    getOrderAmount(order)
                );

            },
            0
        );


    const pending =
        allOrders.filter(order => {

            return (
                getOrderStatus(order) ===
                "pending"
            );

        }).length;


    const processing =
        allOrders.filter(order => {

            return (
                getOrderStatus(order) ===
                "processing"
            );

        }).length;


    const delivered =
        allOrders.filter(order => {

            return (
                getOrderStatus(order) ===
                "delivered"
            );

        }).length;


    if (totalOrdersElement) {

        totalOrdersElement.textContent =
            allOrders.length;
    }


    if (totalSalesElement) {

        totalSalesElement.textContent =
            formatCurrency(totalSales);
    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;
    }


    if (processingElement) {

        processingElement.textContent =
            processing;
    }


    if (deliveredElement) {

        deliveredElement.textContent =
            delivered;
    }
}


/* =========================================================
   UPDATE ORDER STATUS CARDS
   ========================================================= */

function updateOrderStatus() {

    const counts = {

        pending: 0,

        processing: 0,

        shipped: 0,

        delivered: 0,

        cancelled: 0
    };


    allOrders.forEach(order => {

        const status =
            getOrderStatus(order);


        if (
            Object.prototype.hasOwnProperty.call(
                counts,
                status
            )
        ) {

            counts[status]++;
        }

    });


    setText(
        "statusPending",
        counts.pending
    );


    setText(
        "statusProcessing",
        counts.processing
    );


    setText(
        "statusShipped",
        counts.shipped
    );


    setText(
        "statusDelivered",
        counts.delivered
    );


    setText(
        "statusCancelled",
        counts.cancelled
    );
}


/* =========================================================
   GET ORDER STATUS
   ========================================================= */

function getOrderStatus(order) {

    const rawStatus =
        order.status ??
        order.order_status ??
        order.orderStatus ??
        "pending";


    const status =
        String(rawStatus)
            .trim()
            .toLowerCase();


    if (
        status === "canceled" ||
        status === "cancel"
    ) {
        return "cancelled";
    }


    if (
        status === "complete" ||
        status === "completed"
    ) {
        return "delivered";
    }


    if (
        status === "pending"
    ) {
        return "pending";
    }


    if (
        status === "processing" ||
        status === "confirmed"
    ) {
        return "processing";
    }


    if (
        status === "shipped" ||
        status === "shipping"
    ) {
        return "shipped";
    }


    if (
        status === "delivered"
    ) {
        return "delivered";
    }


    if (
        status === "cancelled"
    ) {
        return "cancelled";
    }


    return status || "pending";
}


/* =========================================================
   GET ORDER AMOUNT
   ========================================================= */

function getOrderAmount(order) {

    const possibleValues = [

        order.total_amount,

        order.totalAmount,

        order.total,

        order.amount,

        order.order_total,

        order.orderTotal,

        order.price,

        order.sales_amount,

        order.salesAmount
    ];


    for (
        const value of possibleValues
    ) {

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {

            const number =
                Number(value);


            if (
                Number.isFinite(number)
            ) {
                return number;
            }
        }
    }


    /*
       If the API provides quantity × price
       instead of a total amount.
    */

    const price =
        Number(
            order.price ??
            order.unit_price ??
            order.unitPrice ??
            0
        );


    const quantity =
        Number(
            order.quantity ??
            order.qty ??
            1
        );


    if (
        Number.isFinite(price) &&
        Number.isFinite(quantity)
    ) {

        return price * quantity;
    }


    return 0;
}


/* =========================================================
   CALCULATE SELLER PERFORMANCE
   ========================================================= */

function calculateSellerPerformance() {

    sellerPerformance = {};


    allOrders.forEach(order => {

        const status =
            getOrderStatus(order);


        /*
           Seller identification supports
           multiple possible API field names.
        */

        const sellerId =
            order.seller_id ??
            order.sellerId ??
            order.seller?.id ??
            null;


        const sellerName =
            order.seller_name ??
            order.sellerName ??
            order.seller?.name ??
            order.store_name ??
            order.storeName ??
            null;


        /*
           If there is no seller information,
           don't invent a seller.
        */

        if (
            sellerId === null &&
            !sellerName
        ) {
            return;
        }


        const key =
            String(
                sellerId ??
                sellerName
            );


        if (!sellerPerformance[key]) {

            sellerPerformance[key] = {

                sellerId:
                    sellerId,

                sellerName:
                    sellerName ||
                    `Seller ${sellerId}`,

                orders: 0,

                sales: 0,

                cancelled: 0
            };
        }


        if (
            status === "cancelled"
        ) {

            sellerPerformance[key]
                .cancelled++;

            return;
        }


        sellerPerformance[key]
            .orders++;


        sellerPerformance[key]
            .sales +=
            getOrderAmount(order);
    });
}


/* =========================================================
   RENDER SELLER PERFORMANCE
   ========================================================= */

function renderSellerPerformance() {

    const tableBody =
        document.getElementById(
            "sellerPerformanceBody"
        );


    if (!tableBody) {
        return;
    }


    const sellers =
        Object.values(
            sellerPerformance
        );


    if (!sellers.length) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="4">

                    <div class="empty-box">

                        <div style="font-size:32px;">
                            🏪
                        </div>

                        <h3>
                            No seller data available
                        </h3>

                        <p>
                            Seller performance will appear
                            when orders contain seller information.
                        </p>

                    </div>

                </td>

            </tr>
        `;


        updateTopSeller(null);

        return;
    }


    /*
       Sort by sales amount only for display.
       This is a factual ordering of the
       underlying sales data, not a rating.
    */

    sellers.sort(
        (a, b) =>
            b.sales - a.sales
    );


    tableBody.innerHTML =
        sellers.map(
            seller => {

                const sellerName =
                    escapeHtml(
                        seller.sellerName
                    );


                const status =
                    seller.orders > 0
                        ? "Selling"
                        : "No Sales";


                const statusClass =
                    seller.orders > 0
                        ? "status-active"
                        : "status-inactive";


                return `
                    <tr>

                        <td>

                            <div class="user-name-cell">

                                <div class="user-table-avatar">
                                    ${getInitial(
                                        seller.sellerName
                                    )}
                                </div>

                                <strong>
                                    ${sellerName}
                                </strong>

                            </div>

                        </td>


                        <td>
                            ${seller.orders}
                        </td>


                        <td>
                            ${formatCurrency(
                                seller.sales
                            )}
                        </td>


                        <td>

                            <span class="
                                status-badge
                                ${statusClass}
                            ">
                                ${status}
                            </span>

                        </td>

                    </tr>
                `;
            }
        ).join("");


    updateTopSeller(sellers[0]);
}


/* =========================================================
   TOP SELLER INFORMATION
   ========================================================= */

function updateTopSeller(seller) {

    const nameElement =
        document.getElementById(
            "topSellerName"
        );


    const detailsElement =
        document.getElementById(
            "topSellerDetails"
        );


    if (!nameElement || !detailsElement) {
        return;
    }


    if (!seller) {

        nameElement.textContent =
            "No seller data available";


        detailsElement.textContent =
            "Seller performance will appear here when order data is available.";

        return;
    }


    nameElement.textContent =
        seller.sellerName;


    detailsElement.textContent =
        `${seller.orders} order(s) recorded with sales of ${formatCurrency(
            seller.sales
        )}.`;
}


/* =========================================================
   RENDER API ERROR
   ========================================================= */

function renderSellerPerformanceError() {

    const tableBody =
        document.getElementById(
            "sellerPerformanceBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>

            <td colspan="4">

                <div class="empty-box">

                    <div style="font-size:32px;">
                        ⚠️
                    </div>

                    <h3>
                        Unable to load orders
                    </h3>

                    <p>
                        Please make sure the backend
                        is running on port 8090.
                    </p>

                    <button
                        type="button"
                        class="refresh-btn"
                        onclick="loadOrders()"
                    >
                        🔄 Try Again
                    </button>

                </div>

            </td>

        </tr>
    `;


    updateTopSeller(null);
}


/* =========================================================
   FORMAT CURRENCY
   ========================================================= */

function formatCurrency(value) {

    const amount =
        Number(value) || 0;


    return "₹" +
        amount.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
}


/* =========================================================
   SET TEXT HELPER
   ========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {
        element.textContent = value;
    }
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
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
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


    window.location.href =
        "../login.html";
}


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!checkAdminLogin()) {
            return;
        }


        updateAdminProfile();


        loadOrders();
    }
);


