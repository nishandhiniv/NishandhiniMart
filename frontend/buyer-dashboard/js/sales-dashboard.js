// =========================================
// NishandhiniMart - Sales Dashboard
// =========================================

const ORDERS_API =
    "https://nishandhinimart.onrender.com/api/user-orders/";

let orders = [];


// =========================================
// PAGE LOAD
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCartCount();

        loadSalesDashboard();

    }
);


// =========================================
// LOAD SALES DASHBOARD
// =========================================

async function loadSalesDashboard() {

    const userId =
        localStorage.getItem("userId");


    if (!userId) {

        alert(
            "Please login to view your sales dashboard."
        );

        window.location.href =
            "../login.html";

        return;

    }


    showLoading();


    try {

        const response =
            await fetch(
                ORDERS_API +
                encodeURIComponent(userId)
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load order data."
            );

        }


        const data =
            await response.json();


        console.log(
            "Sales dashboard response:",
            data
        );


        if (Array.isArray(data)) {

            orders = data;

        } else if (
            data &&
            Array.isArray(data.orders)
        ) {

            orders = data.orders;

        } else if (
            data &&
            Array.isArray(data.data)
        ) {

            orders = data.data;

        } else {

            orders = [];

        }


        displaySalesSummary();

        displayRecentOrders();

        hideLoading();


    } catch (error) {

        console.error(
            "Sales dashboard error:",
            error
        );


        orders = [];

        displaySalesSummary();

        showNoSales();

        hideLoading();

    }

}


// =========================================
// DISPLAY SALES SUMMARY
// =========================================

function displaySalesSummary() {

    const totalOrders =
        orders.length;


    let totalSpent = 0;

    let productsPurchased = 0;

    let ordersDelivered = 0;


    orders.forEach(
        function (order) {

            const amount =
                Number(
                    order.total_amount ||
                    order.total ||
                    order.amount ||
                    0
                );


            totalSpent += amount;


            const quantity =
                Number(
                    order.quantity ||
                    order.total_quantity ||
                    order.item_quantity ||
                    1
                );


            productsPurchased +=
                quantity;


            const status =
                normalizeStatus(
                    order.status ||
                    order.order_status ||
                    "Processing"
                );


            if (
                status === "delivered"
            ) {

                ordersDelivered++;

            }

        }
    );


    setText(
        "totalOrders",
        totalOrders
    );


    setText(
        "totalSpent",
        totalSpent.toFixed(2)
    );


    setText(
        "productsPurchased",
        productsPurchased
    );


    setText(
        "ordersDelivered",
        ordersDelivered
    );


    // =====================================
    // AVERAGE ORDER VALUE
    // =====================================

    const averageOrderValue =
        totalOrders > 0
        ?
        totalSpent / totalOrders
        :
        0;


    setText(
        "averageOrderValue",
        "₹" +
        averageOrderValue.toFixed(2)
    );


    // =====================================
    // LATEST ORDER
    // =====================================

    if (orders.length > 0) {

        const latestOrder =
            getLatestOrder();


        const latestId =
            latestOrder.id ||
            latestOrder.order_id ||
            "-";


        const latestDate =
            latestOrder.order_date ||
            latestOrder.created_at ||
            latestOrder.createdAt ||
            latestOrder.date ||
            null;


        setText(
            "latestOrderId",
            "#" + latestId
        );


        setText(
            "latestOrderDate",
            formatDate(latestDate)
        );

    } else {

        setText(
            "latestOrderId",
            "-"
        );


        setText(
            "latestOrderDate",
            "-"
        );

    }

}


// =========================================
// DISPLAY RECENT ORDERS
// =========================================

function displayRecentOrders() {

    const tableContainer =
        document.getElementById(
            "salesTableContainer"
        );


    const tableBody =
        document.getElementById(
            "salesTableBody"
        );


    const noSales =
        document.getElementById(
            "noSales"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (
        !Array.isArray(orders) ||
        orders.length === 0
    ) {

        if (tableContainer) {

            tableContainer.style.display =
                "none";

        }


        if (noSales) {

            noSales.style.display =
                "block";

        }


        return;

    }


    if (noSales) {

        noSales.style.display =
            "none";

    }


    if (tableContainer) {

        tableContainer.style.display =
            "block";

    }


    const sortedOrders =
        [...orders].sort(
            function (a, b) {

                const dateA =
                    new Date(
                        a.order_date ||
                        a.created_at ||
                        a.createdAt ||
                        a.date ||
                        0
                    ).getTime();


                const dateB =
                    new Date(
                        b.order_date ||
                        b.created_at ||
                        b.createdAt ||
                        b.date ||
                        0
                    ).getTime();


                return dateB - dateA;

            }
        );


    const recentOrders =
        sortedOrders.slice(0, 10);


    recentOrders.forEach(
        function (order) {

            const row =
                document.createElement(
                    "tr"
                );


            const orderId =
                order.id ||
                order.order_id ||
                "-";


            const orderDate =
                order.order_date ||
                order.created_at ||
                order.createdAt ||
                order.date ||
                null;


            const quantity =
                Number(
                    order.quantity ||
                    order.total_quantity ||
                    order.item_quantity ||
                    1
                );


            const amount =
                Number(
                    order.total_amount ||
                    order.total ||
                    order.amount ||
                    0
                );


            const status =
                order.status ||
                order.order_status ||
                "Processing";


            const statusClass =
                getStatusClass(
                    status
                );


            row.innerHTML = `

                <td>

                    <strong>
                        #${escapeHtml(
                            orderId
                        )}
                    </strong>

                </td>


                <td>
                    ${formatDate(
                        orderDate
                    )}
                </td>


                <td>
                    ${quantity}
                </td>


                <td>

                    <strong class="sales-amount">
                        ₹${amount.toFixed(2)}
                    </strong>

                </td>


                <td>

                    <span
                        class="sales-status ${statusClass}"
                    >
                        ${escapeHtml(
                            formatStatus(
                                status
                            )
                        )}
                    </span>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


// =========================================
// GET LATEST ORDER
// =========================================

function getLatestOrder() {

    if (
        !Array.isArray(orders) ||
        orders.length === 0
    ) {

        return null;

    }


    return [...orders].sort(
        function (a, b) {

            const dateA =
                new Date(
                    a.order_date ||
                    a.created_at ||
                    a.createdAt ||
                    a.date ||
                    0
                ).getTime();


            const dateB =
                new Date(
                    b.order_date ||
                    b.created_at ||
                    b.createdAt ||
                    b.date ||
                    0
                ).getTime();


            return dateB - dateA;

        }
    )[0];

}


// =========================================
// NORMALIZE STATUS
// =========================================

function normalizeStatus(
    status
) {

    return String(
        status || "processing"
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            "_"
        );

}


// =========================================
// FORMAT STATUS
// =========================================

function formatStatus(
    status
) {

    const normalized =
        normalizeStatus(
            status
        );


    const statusMap = {

        pending:
            "Pending",

        processing:
            "Processing",

        confirmed:
            "Confirmed",

        shipped:
            "Shipped",

        out_for_delivery:
            "Out for Delivery",

        delivered:
            "Delivered",

        cancelled:
            "Cancelled",

        canceled:
            "Cancelled"

    };


    return (
        statusMap[normalized] ||
        String(status || "Processing")
    );

}


// =========================================
// STATUS CLASS
// =========================================

function getStatusClass(
    status
) {

    const normalized =
        normalizeStatus(
            status
        );


    switch (
        normalized
    ) {

        case "delivered":

            return "status-delivered";


        case "shipped":

            return "status-shipped";


        case "out_for_delivery":

            return "status-delivery";


        case "cancelled":

        case "canceled":

            return "status-cancelled";


        case "confirmed":

            return "status-confirmed";


        case "pending":

            return "status-pending";


        default:

            return "status-processing";

    }

}


// =========================================
// LOADING
// =========================================

function showLoading() {

    const loading =
        document.getElementById(
            "salesLoading"
        );


    const table =
        document.getElementById(
            "salesTableContainer"
        );


    const noSales =
        document.getElementById(
            "noSales"
        );


    if (loading) {

        loading.style.display =
            "flex";

    }


    if (table) {

        table.style.display =
            "none";

    }


    if (noSales) {

        noSales.style.display =
            "none";

    }

}


function hideLoading() {

    const loading =
        document.getElementById(
            "salesLoading"
        );


    if (loading) {

        loading.style.display =
            "none";

    }

}


// =========================================
// NO SALES
// =========================================

function showNoSales() {

    const table =
        document.getElementById(
            "salesTableContainer"
        );


    const noSales =
        document.getElementById(
            "noSales"
        );


    if (table) {

        table.style.display =
            "none";

    }


    if (noSales) {

        noSales.style.display =
            "block";

    }

}


// =========================================
// CART COUNT
// =========================================

function updateCartCount() {

    let cart = [];


    try {

        cart =
            JSON.parse(
                localStorage.getItem(
                    "cart"
                )
            ) || [];

    } catch (error) {

        cart = [];

    }


    const count =
        cart.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.quantity || 1
                    )
                );

            },
            0
        );


    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (cartCount) {

        cartCount.textContent =
            count;

    }

}


// =========================================
// OPEN CART
// =========================================

function openCart() {

    window.location.href =
        "buyer_dashboard.html";

}


// =========================================
// LOGOUT
// =========================================

function logout() {

    localStorage.removeItem(
        "userId"
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "userName"
    );

    localStorage.removeItem(
        "userRole"
    );

    localStorage.removeItem(
        "userEmail"
    );

    localStorage.removeItem(
        "store_name"
    );

    localStorage.removeItem(
        "phone"
    );

    localStorage.removeItem(
        "address"
    );

    localStorage.removeItem(
        "accountStatus"
    );

    localStorage.removeItem(
        "verificationStatus"
    );


    window.location.href =
        "../login.html";

}


// =========================================
// FORMAT DATE
// =========================================

function formatDate(
    date
) {

    if (!date) {

        return "-";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "-";

    }


    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =========================================
// SET TEXT
// =========================================

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
            value ?? "-";

    }

}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
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

