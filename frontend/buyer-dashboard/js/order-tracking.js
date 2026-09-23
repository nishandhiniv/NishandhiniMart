// =========================================
// ORDER TRACKING
// =========================================

const ORDERS_API =
    "https://nishandhinimart.onrender.com/api/user-orders/";


// =========================================
// PAGE LOAD
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    updateCartCount();

    loadLatestOrder();

});


// =========================================
// GET USER ID
// =========================================

function getUserId() {

    return localStorage.getItem("userId");

}


// =========================================
// LOAD LATEST ORDER
// =========================================

async function loadLatestOrder() {

    const userId = getUserId();

    if (!userId) {

        showTrackingMessage(
            "Please login to view your orders.",
            "error"
        );

        return;
    }

    try {

        const response = await fetch(
            ORDERS_API + encodeURIComponent(userId)
        );

        if (!response.ok) {

            throw new Error(
                "Unable to load orders."
            );

        }

        const data = await response.json();

        const orders =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(data.orders)
                        ? data.orders
                        : []
                );


        if (orders.length === 0) {

            showNoOrder();

            return;
        }


        // Show the most recent order

        const latestOrder =
            orders[orders.length - 1];

        displayOrder(latestOrder);

    }
    catch (error) {

        console.error(
            "Order tracking error:",
            error
        );

        showTrackingMessage(
            "Unable to load your orders. Please try again.",
            "error"
        );

    }

}


// =========================================
// TRACK ORDER
// =========================================

async function trackOrder() {

    const input =
        document.getElementById("orderIdInput");

    const orderId =
        input
            ? input.value.trim()
            : "";


    if (!orderId) {

        showTrackingMessage(
            "Please enter an order ID.",
            "error"
        );

        return;
    }


    const userId = getUserId();


    if (!userId) {

        showTrackingMessage(
            "Please login before tracking an order.",
            "error"
        );

        return;
    }


    showTrackingLoading();


    try {

        const response = await fetch(
            ORDERS_API + encodeURIComponent(userId)
        );


        if (!response.ok) {

            throw new Error(
                "Unable to load orders."
            );

        }


        const data = await response.json();


        const orders =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(data.orders)
                        ? data.orders
                        : []
                );


        const order =
            orders.find(function (item) {

                return String(
                    item.id ||
                    item.order_id
                ) === String(orderId);

            });


        if (!order) {

            hideTrackingLoading();

            showTrackingMessage(
                "Order not found. Please check the order ID.",
                "error"
            );

            return;
        }


        hideTrackingLoading();

        displayOrder(order);

    }
    catch (error) {

        console.error(
            "Track order error:",
            error
        );

        hideTrackingLoading();

        showTrackingMessage(
            "Unable to track this order. Please try again.",
            "error"
        );

    }

}


// =========================================
// DISPLAY ORDER
// =========================================

function displayOrder(order) {

    const result =
        document.getElementById("trackingResult");

    const noOrder =
        document.getElementById("noTrackingOrder");

    if (!result) {
        return;
    }


    if (noOrder) {
        noOrder.style.display = "none";
    }


    result.style.display = "block";


    // -----------------------------------------
    // BASIC ORDER DETAILS
    // -----------------------------------------

    const orderId =
        order.id ||
        order.order_id ||
        "-";


    const productName =
        order.product_name ||
        order.productName ||
        order.name ||
        "Order";


    const quantity =
        Number(
            order.quantity ||
            order.total_quantity ||
            1
        );


    const amount =
        Number(
            order.total_amount ||
            order.totalAmount ||
            order.amount ||
            0
        );


    const orderDate =
        order.created_at ||
        order.createdAt ||
        order.order_date ||
        "";


    setText(
        "trackingOrderId",
        "#" + orderId
    );


    setText(
        "trackingProductName",
        productName
    );


    setText(
        "trackingQuantity",
        quantity
    );


    setText(
        "trackingAmount",
        "₹" + amount.toFixed(2)
    );


    setText(
        "trackingOrderDate",
        formatDate(orderDate)
    );


    // -----------------------------------------
    // STATUS
    // -----------------------------------------

    const status =
        normalizeStatus(
            order.status ||
            order.order_status ||
            "Processing"
        );


    updateStatusDisplay(status);

    updateTrackingTimeline(status);

    updateEstimatedDelivery(
        orderDate,
        status
    );

}


// =========================================
// NORMALIZE STATUS
// =========================================

function normalizeStatus(status) {

    const value =
        String(status || "")
            .trim()
            .toLowerCase();


    if (
        value.includes("deliver")
        &&
        !value.includes("out")
    ) {

        return "Delivered";

    }


    if (
        value.includes("out")
        ||
        value.includes("delivery")
    ) {

        return "Out for Delivery";

    }


    if (
        value.includes("ship")
    ) {

        return "Shipped";

    }


    if (
        value.includes("process")
        ||
        value.includes("confirm")
    ) {

        return "Processing";

    }


    if (
        value.includes("cancel")
    ) {

        return "Cancelled";

    }


    return "Processing";

}


// =========================================
// UPDATE STATUS
// =========================================

function updateStatusDisplay(status) {

    const statusElement =
        document.getElementById(
            "trackingStatus"
        );


    const deliveryStatus =
        document.getElementById(
            "deliveryStatus"
        );


    if (statusElement) {

        statusElement.textContent =
            status;

        statusElement.className =
            "tracking-status";

        statusElement.classList.add(
            getStatusClass(status)
        );

    }


    if (deliveryStatus) {

        deliveryStatus.textContent =
            status;

    }

}


// =========================================
// STATUS CLASS
// =========================================

function getStatusClass(status) {

    switch (status) {

        case "Delivered":
            return "status-delivered";

        case "Out for Delivery":
            return "status-out";

        case "Shipped":
            return "status-shipped";

        case "Cancelled":
            return "status-cancelled";

        default:
            return "status-processing";

    }

}


// =========================================
// UPDATE TIMELINE
// =========================================

function updateTrackingTimeline(status) {

    const steps = [

        {
            id: "stepPlaced",
            level: 1
        },

        {
            id: "stepProcessing",
            level: 2
        },

        {
            id: "stepShipped",
            level: 3
        },

        {
            id: "stepOutForDelivery",
            level: 4
        },

        {
            id: "stepDelivered",
            level: 5
        }

    ];


    let currentLevel = 2;


    switch (status) {

        case "Processing":
            currentLevel = 2;
            break;

        case "Shipped":
            currentLevel = 3;
            break;

        case "Out for Delivery":
            currentLevel = 4;
            break;

        case "Delivered":
            currentLevel = 5;
            break;

        case "Cancelled":
            currentLevel = 1;
            break;

        default:
            currentLevel = 2;

    }


    steps.forEach(function (step) {

        const element =
            document.getElementById(
                step.id
            );


        if (!element) {
            return;
        }


        element.classList.remove(
            "completed",
            "current"
        );


        const icon =
            element.querySelector(
                ".tracking-step-icon"
            );


        if (
            step.level <
            currentLevel
        ) {

            element.classList.add(
                "completed"
            );

            if (icon) {
                icon.textContent = "✓";
            }

        }
        else if (
            step.level ===
            currentLevel
        ) {

            element.classList.add(
                "completed",
                "current"
            );

            if (icon) {
                icon.textContent = "✓";
            }

        }
        else {

            if (icon) {
                icon.textContent =
                    step.level;
            }

        }

    });

}


// =========================================
// ESTIMATED DELIVERY
// =========================================

function updateEstimatedDelivery(
    orderDate,
    status
) {

    const element =
        document.getElementById(
            "estimatedDelivery"
        );


    if (!element) {
        return;
    }


    if (status === "Delivered") {

        element.textContent =
            "Delivered";

        return;

    }


    if (!orderDate) {

        element.textContent =
            "To be updated";

        return;

    }


    const date =
        new Date(orderDate);


    if (isNaN(date.getTime())) {

        element.textContent =
            "To be updated";

        return;

    }


    date.setDate(
        date.getDate() + 5
    );


    element.textContent =
        date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


// =========================================
// FORMAT DATE
// =========================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "Recently placed";

    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {

        return "Recently placed";

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
            value;

    }

}


// =========================================
// LOADING
// =========================================

function showTrackingLoading() {

    const loading =
        document.getElementById(
            "trackingLoading"
        );


    const result =
        document.getElementById(
            "trackingResult"
        );


    const noOrder =
        document.getElementById(
            "noTrackingOrder"
        );


    if (loading) {
        loading.style.display = "flex";
    }


    if (result) {
        result.style.display = "none";
    }


    if (noOrder) {
        noOrder.style.display = "none";
    }

}


function hideTrackingLoading() {

    const loading =
        document.getElementById(
            "trackingLoading"
        );


    if (loading) {
        loading.style.display = "none";
    }

}


// =========================================
// NO ORDER
// =========================================

function showNoOrder() {

    const result =
        document.getElementById(
            "trackingResult"
        );


    const noOrder =
        document.getElementById(
            "noTrackingOrder"
        );


    if (result) {
        result.style.display = "none";
    }


    if (noOrder) {
        noOrder.style.display = "flex";
    }

}


// =========================================
// MESSAGE
// =========================================

function showTrackingMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "trackingMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        "tracking-message";


    if (type) {

        element.classList.add(
            type
        );

    }

}


// =========================================
// CART COUNT
// =========================================

function updateCartCount() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (!cartCount) {
        return;
    }


    let cart = [];


    try {

        cart =
            JSON.parse(
                localStorage.getItem("cart")
            ) || [];

    }
    catch (error) {

        cart = [];

    }


    const totalItems =
        cart.reduce(
            function (total, item) {

                return total +
                    (
                        Number(
                            item.quantity
                        ) || 1
                    );

            },
            0
        );


    cartCount.textContent =
        totalItems;

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

