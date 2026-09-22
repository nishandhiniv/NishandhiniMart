// =========================================================
// NishandhiniMart - Seller Sales
// =========================================================

const ORDERS_API =
    "http://127.0.0.1:10000/api/seller/orders";


const sellerId =
    parseInt(localStorage.getItem("userId") || "0");


const sellerName =
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    "Seller";


const sellerRole =
    localStorage.getItem("userRole") || "";


// =========================================================
// SELLER LOGIN CHECK
// =========================================================

if (!sellerId || sellerRole !== "seller") {

    alert("Please login as seller.");

    window.location.href = "../login.html";
}


// =========================================================
// PAGE START
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    setupProfile();

    loadSales();

});


// =========================================================
// PROFILE
// =========================================================

function setupProfile() {

    const nameElement =
        document.getElementById("topProfileName");

    const avatarElement =
        document.getElementById("topProfileAvatar");


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
// PROFILE DROPDOWN
// =========================================================

function toggleProfileMenu() {

    const dropdown =
        document.getElementById("profileDropdown");


    if (!dropdown) return;


    dropdown.classList.toggle("show");

}


document.addEventListener("click", function (event) {

    const profileMenu =
        document.querySelector(".profile-menu");

    const dropdown =
        document.getElementById("profileDropdown");


    if (!profileMenu || !dropdown) return;


    if (!profileMenu.contains(event.target)) {

        dropdown.classList.remove("show");

    }

});


// =========================================================
// PROFILE PAGE
// =========================================================

function openSellerProfile() {

    window.location.href =
        "seller-profile.html";

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
    localStorage.removeItem("verificationStatus");


    window.location.href =
        "../login.html";

}


// =========================================================
// SALES DATA
// =========================================================

let allSales = [];


// =========================================================
// LOAD SALES
// =========================================================

async function loadSales() {

    const tableBody =
        document.getElementById("salesTableBody");

    const chart =
        document.getElementById("salesChart");


    if (tableBody) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;padding:35px;">
                    Loading sales...
                </td>
            </tr>
        `;

    }


    if (chart) {

        chart.innerHTML = `
            <div class="sales-empty">
                Loading sales data...
            </div>
        `;

    }


    try {

        const response = await fetch(
            ORDERS_API +
            "?seller_id=" +
            encodeURIComponent(sellerId)
        );


        console.log(
            "Sales API Status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "Failed to load sales"
            );

        }


        const data =
            await response.json();


        console.log(
            "Sales API Data:",
            data
        );


        if (!Array.isArray(data)) {

            throw new Error(
                "Invalid sales response"
            );

        }


        allSales = data;


        updateSalesSummary(
            allSales
        );


        renderSalesTable(
            allSales
        );


        renderSalesChart(
            allSales
        );


    } catch (error) {

        console.error(
            "Sales API Error:",
            error
        );


        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        style="text-align:center;padding:35px;color:#999;">
                        Unable to load sales data.
                        Please make sure the backend server is running.
                    </td>
                </tr>
            `;

        }


        if (chart) {

            chart.innerHTML = `
                <div class="sales-empty">
                    Unable to load sales data.
                </div>
            `;

        }

    }

}


// =========================================================
// SUMMARY
// =========================================================

function updateSalesSummary(orders) {

    let totalSales = 0;

    let productsSold = 0;

    let completedOrders = 0;


    orders.forEach(function (order) {

        const status =
            String(
                order.status || "pending"
            )
            .toLowerCase()
            .trim();


        const amount =
            Number(
                order.total_amount ??
                order.amount ??
                (
                    Number(order.price || 0) *
                    Number(order.quantity || 0)
                )
            );


        const quantity =
            Number(
                order.quantity ??
                order.qty ??
                0
            );


        /*
         * Count order value for all non-cancelled
         * orders.
         */

        if (
            status !== "cancelled" &&
            status !== "canceled"
        ) {

            totalSales += amount;

            productsSold += quantity;

        }


        if (
            status === "delivered" ||
            status === "completed"
        ) {

            completedOrders++;

        }

    });


    const totalOrders =
        orders.length;


    // Main cards

    setText(
        "totalSales",
        formatCurrency(totalSales)
    );


    setText(
        "productsSold",
        productsSold
    );


    setText(
        "totalOrders",
        totalOrders
    );


    setText(
        "completedOrders",
        completedOrders
    );


    // Summary section

    setText(
        "summaryRevenue",
        formatCurrency(totalSales)
    );


    setText(
        "summaryProducts",
        productsSold
    );


    setText(
        "summaryOrders",
        totalOrders
    );


    setText(
        "summaryCompleted",
        completedOrders
    );

}


// =========================================================
// SALES TABLE
// =========================================================

function renderSalesTable(orders) {

    const tableBody =
        document.getElementById(
            "salesTableBody"
        );


    if (!tableBody) return;


    if (
        !orders ||
        orders.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;padding:40px;color:#999;">
                    No sales found yet.
                </td>
            </tr>
        `;

        return;

    }


    /*
     * Show newest orders first.
     */

    const sortedOrders =
        [...orders].sort(
            function (a, b) {

                const dateA =
                    new Date(
                        a.created_at ||
                        a.order_date ||
                        a.date ||
                        0
                    );

                const dateB =
                    new Date(
                        b.created_at ||
                        b.order_date ||
                        b.date ||
                        0
                    );

                return dateB - dateA;

            }
        );


    tableBody.innerHTML =
        sortedOrders
            .map(function (order) {

                return createSalesRow(
                    order
                );

            })
            .join("");

}


// =========================================================
// SALES ROW
// =========================================================

function createSalesRow(order) {

    const orderId =
        order.order_id ??
        order.id ??
        "-";


    const productName =
        order.product_name ||
        order.name ||
        "Product";


    const quantity =
        order.quantity ??
        order.qty ??
        0;


    const amount =
        Number(
            order.total_amount ??
            order.amount ??
            (
                Number(order.price || 0) *
                Number(order.quantity || 0)
            )
        );


    const date =
        order.created_at ||
        order.order_date ||
        order.date ||
        "";


    const status =
        String(
            order.status ||
            "Pending"
        );


    const statusClass =
        getStatusClass(
            status
        );


    return `
        <tr>

            <td>
                <span class="order-id">
                    #${escapeHtml(orderId)}
                </span>
            </td>

            <td>
                <span class="sales-product">
                    ${escapeHtml(productName)}
                </span>
            </td>

            <td>
                ${escapeHtml(quantity)}
            </td>

            <td>
                <span class="sales-amount">
                    ${formatCurrency(amount)}
                </span>
            </td>

            <td>
                ${formatDate(date)}
            </td>

            <td>
                <span class="sales-status ${statusClass}">
                    ${escapeHtml(status)}
                </span>
            </td>

        </tr>
    `;

}


// =========================================================
// SALES CHART
// =========================================================

function renderSalesChart(orders) {

    const chart =
        document.getElementById(
            "salesChart"
        );


    if (!chart) return;


    if (
        !orders ||
        orders.length === 0
    ) {

        chart.innerHTML = `
            <div class="sales-empty">
                No sales data available for chart.
            </div>
        `;

        return;

    }


    /*
     * Create last 7 days.
     */

    const days = [];


    for (let i = 6; i >= 0; i--) {

        const date =
            new Date();


        date.setHours(
            0,
            0,
            0,
            0
        );


        date.setDate(
            date.getDate() - i
        );


        days.push({
            date: date,
            label: date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short"
                }
            ),
            total: 0
        });

    }


    /*
     * Add order amounts to matching days.
     */

    orders.forEach(function (order) {

        const status =
            String(
                order.status || ""
            )
            .toLowerCase()
            .trim();


        if (
            status === "cancelled" ||
            status === "canceled"
        ) {

            return;

        }


        const orderDate =
            new Date(
                order.created_at ||
                order.order_date ||
                order.date ||
                0
            );


        if (
            Number.isNaN(
                orderDate.getTime()
            )
        ) {

            return;

        }


        orderDate.setHours(
            0,
            0,
            0,
            0
        );


        const amount =
            Number(
                order.total_amount ??
                order.amount ??
                (
                    Number(order.price || 0) *
                    Number(order.quantity || 0)
                )
            );


        days.forEach(function (day) {

            if (
                day.date.getTime() ===
                orderDate.getTime()
            ) {

                day.total += amount;

            }

        });

    });


    const maxValue =
        Math.max(
            ...days.map(
                day => day.total
            ),
            1
        );


    chart.innerHTML =
        days.map(function (day) {

            const height =
                day.total > 0
                    ? Math.max(
                        8,
                        (day.total / maxValue) * 180
                    )
                    : 4;


            return `
                <div class="chart-column">

                    <div class="chart-value">
                        ${day.total > 0
                            ? formatCurrencyShort(day.total)
                            : "₹0"}
                    </div>

                    <div
                        class="chart-bar"
                        style="height:${height}px;"
                        title="${formatCurrency(day.total)}">
                    </div>

                    <div class="chart-label">
                        ${escapeHtml(day.label)}
                    </div>

                </div>
            `;

        })
        .join("");

}


// =========================================================
// STATUS CLASS
// =========================================================

function getStatusClass(status) {

    const value =
        String(status)
            .toLowerCase()
            .trim();


    if (
        value === "delivered" ||
        value === "completed"
    ) {

        return "delivered";

    }


    if (value === "pending") {

        return "pending";

    }


    if (
        value === "processing" ||
        value === "confirmed"
    ) {

        return "processing";

    }


    if (value === "shipped") {

        return "shipped";

    }


    if (
        value === "cancelled" ||
        value === "canceled"
    ) {

        return "cancelled";

    }


    return "pending";

}


// =========================================================
// DATE
// =========================================================

function formatDate(value) {

    if (!value) return "-";


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return escapeHtml(value);

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =========================================================
// CURRENCY
// =========================================================

function formatCurrency(value) {

    return "₹" +
        Number(value || 0)
            .toLocaleString(
                "en-IN",
                {
                    maximumFractionDigits: 2
                }
            );

}


function formatCurrencyShort(value) {

    const number =
        Number(value || 0);


    if (number >= 100000) {

        return "₹" +
            (number / 100000)
                .toFixed(1) +
            "L";

    }


    if (number >= 1000) {

        return "₹" +
            (number / 1000)
                .toFixed(1) +
            "K";

    }


    return "₹" +
        Math.round(number);

}


// =========================================================
// SET TEXT
// =========================================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

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
