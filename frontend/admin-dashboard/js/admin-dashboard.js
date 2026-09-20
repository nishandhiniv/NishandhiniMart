const BASE_URL = "http://127.0.0.1:8090/api";

let allUsers = [];
let allProducts = [];
let allOrders = [];
let salesChart = null;


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
   HELPERS
========================================================= */

function getArray(result, key) {

    if (Array.isArray(result)) {
        return result;
    }

    if (result && Array.isArray(result[key])) {
        return result[key];
    }

    return [];
}


function formatCurrency(value) {

    return "₹" +
        Number(value || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );
}


function getOrderStatus(order) {

    return String(
        order.status ||
        order.order_status ||
        "Pending"
    ).toLowerCase().trim();
}


function getOrderAmount(order) {

    return Number(
        order.total_amount ??
        order.total ??
        order.amount ??
        order.grand_total ??
        0
    );
}


function getProductQuantity(product) {

    return Number(
        product.quantity ??
        product.stock ??
        0
    );
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   LOAD USERS
========================================================= */

async function loadUsers() {

    try {

        const response =
            await fetch(`${BASE_URL}/admin-users`);

        if (!response.ok) {
            throw new Error("Users API failed");
        }

        const result =
            await response.json();

        allUsers =
            getArray(result, "users");

        updateUserMetrics();

        return allUsers;

    } catch (error) {

        console.error(
            "Load users error:",
            error
        );

        allUsers = [];

        updateUserMetrics();

        return [];
    }
}


/* =========================================================
   USER METRICS
========================================================= */

function updateUserMetrics() {

    const totalCustomers =
        allUsers.filter(
            user =>
                String(user.role || "buyer")
                    .toLowerCase() === "buyer"
        ).length;


    const totalSellers =
        allUsers.filter(
            user =>
                String(user.role || "")
                    .toLowerCase() === "seller"
        ).length;


    const customerElement =
        document.getElementById(
            "totalCustomers"
        );


    const sellerElement =
        document.getElementById(
            "totalSellers"
        );


    if (customerElement) {

        customerElement.textContent =
            totalCustomers;
    }


    if (sellerElement) {

        sellerElement.textContent =
            totalSellers;
    }
}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    try {

        const response =
            await fetch(`${BASE_URL}/products`);

        if (!response.ok) {
            throw new Error("Products API failed");
        }

        const result =
            await response.json();

        allProducts =
            getArray(result, "products");


        const totalProducts =
            document.getElementById(
                "totalProducts"
            );


        if (totalProducts) {

            totalProducts.textContent =
                allProducts.length;
        }


        /*
            Dashboard page does not contain
            a products management table.

            Products are managed from:
            products.html
        */


        return allProducts;

    } catch (error) {

        console.error(
            "Load products error:",
            error
        );

        allProducts = [];

        const totalProducts =
            document.getElementById(
                "totalProducts"
            );

        if (totalProducts) {

            totalProducts.textContent = "0";
        }

        return [];
    }
}


/* =========================================================
   LOAD ORDERS
========================================================= */

async function loadOrders() {

    try {

        const response =
            await fetch(`${BASE_URL}/admin-orders`);

        if (!response.ok) {
            throw new Error("Orders API failed");
        }

        const result =
            await response.json();

        allOrders =
            getArray(result, "orders");


        updateOrderMetrics();

        updateAnalytics();

        return allOrders;

    } catch (error) {

        console.error(
            "Load orders error:",
            error
        );

        allOrders = [];

        updateOrderMetrics();

        updateAnalytics();

        return [];
    }
}


/* =========================================================
   ORDER METRICS
========================================================= */

function updateOrderMetrics() {

    const totalOrders =
        allOrders.length;


    const totalRevenue =
        allOrders.reduce(
            (sum, order) => {

                const status =
                    getOrderStatus(order);


                /*
                    Cancelled orders are not included
                    in revenue.
                */

                if (
                    status === "cancelled" ||
                    status === "canceled"
                ) {

                    return sum;
                }


                return sum +
                    getOrderAmount(order);

            },
            0
        );


    const totalOrdersElement =
        document.getElementById(
            "totalOrders"
        );


    const revenueElement =
        document.getElementById(
            "totalRevenue"
        );


    if (totalOrdersElement) {

        totalOrdersElement.textContent =
            totalOrders;
    }


    if (revenueElement) {

        revenueElement.textContent =
            formatCurrency(totalRevenue);
    }


    updateOrderStatusCards();
}


/* =========================================================
   ORDER STATUS CARDS
========================================================= */

function updateOrderStatusCards() {

    const counts = {

        pending: 0,

        processing: 0,

        shipped: 0,

        delivered: 0,

        cancelled: 0

    };


    allOrders.forEach(order => {

        let status =
            getOrderStatus(order);


        status =
            status.replace(/\s+/g, "");


        if (status === "pending") {

            counts.pending++;

        }

        else if (status === "processing") {

            counts.processing++;

        }

        else if (status === "shipped") {

            counts.shipped++;

        }

        else if (
            status === "delivered" ||
            status === "completed"
        ) {

            counts.delivered++;

        }

        else if (
            status === "cancelled" ||
            status === "canceled"
        ) {

            counts.cancelled++;
        }

    });


    setElementText(
        "pendingOrders",
        counts.pending
    );


    setElementText(
        "processingOrders",
        counts.processing
    );


    setElementText(
        "shippedOrders",
        counts.shipped
    );


    setElementText(
        "deliveredOrders",
        counts.delivered
    );


    setElementText(
        "cancelledOrders",
        counts.cancelled
    );
}


/* =========================================================
   SET ELEMENT TEXT
========================================================= */

function setElementText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;
    }
}


/* =========================================================
   SALES ANALYTICS
========================================================= */

function updateAnalytics() {

    const periodElement =
        document.getElementById(
            "analyticsPeriod"
        );


    const days =
        Number(
            periodElement?.value || 30
        );


    const today =
        new Date();


    const startDate =
        new Date(today);


    startDate.setDate(
        today.getDate() - days + 1
    );


    const dailyData = {};


    /*
        Create empty data for each day.
    */

    for (
        let i = 0;
        i < days;
        i++
    ) {

        const date =
            new Date(startDate);


        date.setDate(
            startDate.getDate() + i
        );


        const key =
            date.toISOString()
                .split("T")[0];


        dailyData[key] = {

            revenue: 0,

            orders: 0

        };
    }


    /*
        Add order data.
    */

    allOrders.forEach(order => {

        const rawDate =
            order.created_at ||
            order.order_date ||
            order.createdAt;


        if (!rawDate) {
            return;
        }


        const date =
            new Date(rawDate);


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return;
        }


        const key =
            date.toISOString()
                .split("T")[0];


        const status =
            getOrderStatus(order);


        if (
            dailyData[key] &&
            status !== "cancelled" &&
            status !== "canceled"
        ) {

            dailyData[key].revenue +=
                getOrderAmount(order);


            dailyData[key].orders++;
        }

    });


    const labels =
        Object.keys(dailyData);


    const revenueData =
        labels.map(
            key =>
                dailyData[key].revenue
        );


    const orderData =
        labels.map(
            key =>
                dailyData[key].orders
        );


    const periodRevenue =
        revenueData.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    const periodOrders =
        orderData.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    setElementText(
        "chartRevenue",
        formatCurrency(periodRevenue)
    );


    setElementText(
        "chartOrders",
        periodOrders
    );


    drawSalesChart(
        labels,
        revenueData
    );
}


/* =========================================================
   DRAW SALES CHART
========================================================= */

function drawSalesChart(
    labels,
    revenueData
) {

    const canvas =
        document.getElementById(
            "salesChart"
        );


    if (!canvas) {
        return;
    }


    const empty =
        document.getElementById(
            "chartEmpty"
        );


    if (!window.Chart) {

        if (empty) {
            empty.style.display = "flex";
        }

        return;
    }


    if (salesChart) {

        salesChart.destroy();

        salesChart = null;
    }


    const shortLabels =
        labels.map(date => {

            const parts =
                date.split("-");


            return (
                parts[2] +
                "/" +
                parts[1]
            );
        });


    salesChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "line",

                data: {

                    labels: shortLabels,

                    datasets: [

                        {

                            label: "Revenue",

                            data: revenueData,

                            borderColor:
                                "#6c3fd1",

                            backgroundColor:
                                "rgba(108,63,209,0.10)",

                            fill: true,

                            tension: 0.35,

                            borderWidth: 2,

                            pointRadius: 2,

                            pointHoverRadius: 5

                        }

                    ]
                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    plugins: {

                        legend: {

                            display: false

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            " Revenue: " +
                                            formatCurrency(
                                                context.raw
                                            )
                                        );
                                    }

                            }

                        }

                    },


                    scales: {

                        x: {

                            grid: {

                                display: false

                            },


                            ticks: {

                                maxTicksLimit: 10,

                                font: {

                                    size: 9

                                }

                            }

                        },


                        y: {

                            beginAtZero: true,


                            ticks: {

                                font: {

                                    size: 9

                                },


                                callback:
                                    function(value) {

                                        return (
                                            "₹" +
                                            Number(value)
                                                .toLocaleString(
                                                    "en-IN"
                                                )
                                        );
                                    }

                            }

                        }

                    }

                }

            }
        );


    if (empty) {

        empty.style.display =
            "none";
    }
}


/* =========================================================
   SELLER PERFORMANCE
========================================================= */

/*
    This function prepares seller-wise performance
    from the existing orders data.

    It does not display a table on Dashboard because
    the Dashboard is intended as a summary page.

    Orders page will use this data later.
*/

function getSellerPerformance() {

    const sellerMap = {};


    allOrders.forEach(order => {

        const sellerId =
            order.seller_id ??
            order.sellerId ??
            order.seller ??
            null;


        if (
            sellerId === null ||
            sellerId === undefined
        ) {

            return;
        }


        const key =
            String(sellerId);


        if (!sellerMap[key]) {

            sellerMap[key] = {

                sellerId: sellerId,

                sellerName:
                    order.seller_name ||
                    order.sellerName ||
                    `Seller ${sellerId}`,

                orders: 0,

                sales: 0

            };
        }


        const status =
            getOrderStatus(order);


        if (
            status === "cancelled" ||
            status === "canceled"
        ) {

            return;
        }


        sellerMap[key].orders++;

        sellerMap[key].sales +=
            getOrderAmount(order);

    });


    return Object.values(
        sellerMap
    );
}


/* =========================================================
   INVENTORY SUMMARY
========================================================= */

function getInventorySummary() {

    const summary = {

        totalProducts:
            allProducts.length,

        totalQuantity: 0,

        lowStock: 0,

        outOfStock: 0

    };


    allProducts.forEach(product => {

        const quantity =
            getProductQuantity(product);


        summary.totalQuantity +=
            quantity;


        if (quantity <= 0) {

            summary.outOfStock++;

        }

        else if (quantity <= 5) {

            summary.lowStock++;
        }

    });


    return summary;
}


/* =========================================================
   USER SUMMARY
========================================================= */

function getUserSummary() {

    const summary = {

        total: allUsers.length,

        buyers: 0,

        sellers: 0,

        admins: 0

    };


    allUsers.forEach(user => {

        const role =
            String(
                user.role || "buyer"
            ).toLowerCase();


        if (role === "buyer") {

            summary.buyers++;

        }

        else if (role === "seller") {

            summary.sellers++;

        }

        else if (role === "admin") {

            summary.admins++;
        }

    });


    return summary;
}


/* =========================================================
   REFRESH DASHBOARD
========================================================= */

async function refreshDashboard() {

    try {

        await Promise.all([

            loadUsers(),

            loadProducts(),

            loadOrders()

        ]);


        updateAnalytics();


    } catch (error) {

        console.error(
            "Dashboard refresh error:",
            error
        );
    }
}


/* =========================================================
   ADMIN PROFILE
========================================================= */

function updateAdminProfile() {

    const name =
        localStorage.getItem(
            "userName"
        ) ||
        localStorage.getItem(
            "username"
        ) ||
        "Administrator";


    const element =
        document.getElementById(
            "adminName"
        );


    if (element) {

        element.textContent =
            name;
    }


    const avatar =
        document.querySelector(
            ".profile-avatar"
        );


    if (avatar) {

        avatar.textContent =
            name
                .charAt(0)
                .toUpperCase();
    }
}


/* =========================================================
   TOGGLE SIDEBAR
========================================================= */

function toggleAdminSidebar() {

    const sidebar =
        document.querySelector(
            ".admin-sidebar"
        );


    if (!sidebar) {
        return;
    }


    sidebar.classList.toggle(
        "mobile-open"
    );
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem(
        "userId"
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "userRole"
    );

    localStorage.removeItem(
        "userName"
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


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        /*
            First verify admin login.
        */

        if (!checkAdminLogin()) {

            return;
        }


        /*
            Show admin name.
        */

        updateAdminProfile();


        /*
            Load dashboard data.
        */

        await Promise.all([

            loadUsers(),

            loadProducts(),

            loadOrders()

        ]);


        /*
            Draw chart after data loading.
        */

        updateAnalytics();

    }
);