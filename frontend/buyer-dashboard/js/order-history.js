document.addEventListener("DOMContentLoaded", function () {

    loadOrderHistory();
    updateCartCount();

});


/* =========================================================
   LOAD ORDER HISTORY
========================================================= */
async function loadOrderHistory() {

    const loading =
        document.getElementById("ordersLoading");

    const container =
        document.getElementById("ordersContainer");

    const noOrders =
        document.getElementById("noOrders");

    if (!container) return;

    const userId =
        localStorage.getItem("userId");

    if (!userId) {

        if (loading) {
            loading.style.display = "none";
        }

        if (noOrders) {
            noOrders.style.display = "flex";
        }

        return;
    }

    try {

        const response = await fetch(
            `http://127.0.0.1:10000/api/user-orders/${userId}`
        );

        if (!response.ok) {
            throw new Error("Failed to load orders");
        }

        const data = await response.json();

        console.log("Order History API:", data);

        const orders =
            Array.isArray(data)
                ? data
                : (
                    data.orders ||
                    data.data ||
                    []
                );

        if (loading) {
            loading.style.display = "none";
        }

        updateOrderSummary(orders);

        if (!orders.length) {

            container.innerHTML = "";

            if (noOrders) {
                noOrders.style.display = "flex";
            }

            return;
        }

        if (noOrders) {
            noOrders.style.display = "none";
        }

        container.innerHTML = "";

        orders.forEach(function (order, index) {

            const orderElement =
                createOrderElement(order, index);

            container.appendChild(orderElement);

        });

    } catch (error) {

        console.error(
            "Unable to load order history:",
            error
        );

        if (loading) {
            loading.style.display = "none";
        }

        container.innerHTML = "";

        if (noOrders) {
            noOrders.style.display = "flex";
        }
    }
}

/* =========================================================
   ORDER SUMMARY
========================================================= */

function updateOrderSummary(orders) {

    const totalOrders =
        document.getElementById("totalOrders");

    const activeOrders =
        document.getElementById("activeOrders");

    const deliveredOrders =
        document.getElementById("deliveredOrders");


    let activeCount = 0;
    let deliveredCount = 0;


    orders.forEach(function (order) {

        const status =
            String(order.status || "")
                .toLowerCase();


        if (
            status === "delivered" ||
            status === "completed"
        ) {

            deliveredCount++;

        } else {

            activeCount++;

        }

    });


    if (totalOrders) {
        totalOrders.textContent =
            orders.length;
    }


    if (activeOrders) {
        activeOrders.textContent =
            activeCount;
    }


    if (deliveredOrders) {
        deliveredOrders.textContent =
            deliveredCount;
    }

}


/* =========================================================
   CREATE ORDER ELEMENT
========================================================= */

function createOrderElement(order, index) {

    const orderItem =
        document.createElement("div");

    orderItem.className =
        "order-item";


    const orderId =
        order.id ||
        order.order_id ||
        ("ORD-" + String(index + 1).padStart(4, "0"));


    const status =
        order.status ||
        "Processing";


    const productName =
        order.product_name ||
        order.productName ||
        order.name ||
        "Product";


    const quantity =
        Number(order.quantity) || 1;


    const price =
        Number(
            order.price ||
            order.total ||
            0
        );


    const orderDate =
        formatOrderDate(
            order.date ||
            order.order_date ||
            order.created_at
        );


    const totalAmount =
        Number(
            order.total_amount ||
            order.total ||
            (price * quantity)
        );


    orderItem.innerHTML = `

        <div class="order-item-header">

            <h3>
                Order #${escapeHtml(orderId)}
            </h3>

            <span class="order-status">
                ${escapeHtml(status)}
            </span>

        </div>


        <div class="order-item-details">

            <div class="order-detail">

                <label>
                    Product
                </label>

                <span>
                    ${escapeHtml(productName)}
                </span>

            </div>


            <div class="order-detail">

                <label>
                    Quantity
                </label>

                <span>
                    ${quantity}
                </span>

            </div>


            <div class="order-detail">

                <label>
                    Total Amount
                </label>

                <span>
                    ₹${totalAmount.toFixed(2)}
                </span>

            </div>


            <div class="order-detail">

                <label>
                    Order Date
                </label>

                <span>
                    ${escapeHtml(orderDate)}
                </span>

            </div>


            <div class="order-detail">

                <label>
                    Price
                </label>

                <span>
                    ₹${price.toFixed(2)}
                </span>

            </div>

        </div>

    `;


    return orderItem;

}


/* =========================================================
   FORMAT ORDER DATE
========================================================= */

function formatOrderDate(dateValue) {

    if (!dateValue) {
        return "Not available";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return String(dateValue);
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
   OPEN CART
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


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
