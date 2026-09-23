/* =========================================================
   NishandhiniMart - Seller Dashboard
   ========================================================= */

const PRODUCTS_API =
    "https://nishandhinimart.onrender.com/api/products";

const SELLER_ORDERS_API =
    "https://nishandhinimart.onrender.com/api/seller/orders";


/* =========================================================
   GET SELLER INFORMATION
   ========================================================= */

function getSellerId() {
    return localStorage.getItem("userId");
}

function getSellerName() {
    return (
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        "Seller"
    );
}

function getStoreName() {
    return (
        localStorage.getItem("store_name") ||
        getSellerName()
    );
}


/* =========================================================
   SAFE NUMBER
   ========================================================= */

function safeNumber(value) {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}


/* =========================================================
   NORMALIZE PRODUCT RESPONSE
   ========================================================= */

function normalizeProducts(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (data && Array.isArray(data.products)) {
        return data.products;
    }

    if (data && Array.isArray(data.data)) {
        return data.data;
    }

    return [];
}


/* =========================================================
   NORMALIZE ORDER RESPONSE
   ========================================================= */

function normalizeOrders(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (data && Array.isArray(data.orders)) {
        return data.orders;
    }

    if (data && Array.isArray(data.data)) {
        return data.data;
    }

    return [];
}


/* =========================================================
   LOAD SELLER PRODUCTS
   ========================================================= */

async function loadSellerProducts() {

    try {

        const sellerId = getSellerId();

        if (!sellerId) {
            console.warn("Seller ID not found in localStorage.");
            return [];
        }

        const response = await fetch(PRODUCTS_API);

        if (!response.ok) {
            throw new Error(
                "Product API returned HTTP " + response.status
            );
        }

        const data = await response.json();

        const allProducts = normalizeProducts(data);

        /*
         * Only show products belonging to this seller.
         */
        const sellerProducts = allProducts.filter(product => {

            return String(product.seller_id) === String(sellerId);

        });

        updateProductStatistics(sellerProducts);

        updateStockManagement(sellerProducts);

        updateLowStockAlerts(sellerProducts);

        return sellerProducts;

    } catch (error) {

        console.error(
            "Error loading seller products:",
            error
        );

        return [];
    }
}


/* =========================================================
   UPDATE PRODUCT STATISTICS
   ========================================================= */

function updateProductStatistics(products) {

    const totalProductsElement =
        document.getElementById("totalProducts");

    const totalStockElement =
        document.getElementById("totalStock");


    /* Total Products */

    if (totalProductsElement) {

        totalProductsElement.textContent =
            products.length;
    }


    /* Total Stock */

    let totalStock = 0;

    products.forEach(product => {

        totalStock += safeNumber(product.quantity);

    });


    if (totalStockElement) {

        totalStockElement.textContent =
            totalStock;
    }
}


/* =========================================================
   LOAD SELLER ORDERS
   ========================================================= */

async function loadSellerOrders() {

    try {

        const sellerId = getSellerId();

        if (!sellerId) {
            console.warn("Seller ID not found.");
            return [];
        }

        const url =
            `${SELLER_ORDERS_API}?seller_id=${encodeURIComponent(sellerId)}`;

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error(
                "Orders API returned HTTP " + response.status
            );
        }

        const data = await response.json();

        const orders = normalizeOrders(data);

        updateOrderStatistics(orders);

        updateRecentOrders(orders);

        return orders;

    } catch (error) {

        console.error(
            "Error loading seller orders:",
            error
        );

        return [];
    }
}


/* =========================================================
   UPDATE ORDER STATISTICS
   ========================================================= */

function updateOrderStatistics(orders) {

    const totalOrdersElement =
        document.getElementById("totalOrders");

    const totalSalesElement =
        document.getElementById("totalSales");


    /*
     * Seller order API returns one row per product.
     *
     * So if one order contains 2 products,
     * that order appears twice.
     *
     * We must count each order only once.
     */

    const uniqueOrders = new Map();


    orders.forEach(order => {

        const orderId =
            order.order_id;

        if (
            orderId !== undefined &&
            orderId !== null
        ) {

            if (!uniqueOrders.has(String(orderId))) {

                uniqueOrders.set(
                    String(orderId),
                    order
                );
            }
        }

    });


    const orderCount =
        uniqueOrders.size;


    /* Total Orders */

    if (totalOrdersElement) {

        totalOrdersElement.textContent =
            orderCount;
    }


    /*
     * Calculate sales.
     *
     * Each order's total_amount is counted once.
     */

    let totalSales = 0;


    uniqueOrders.forEach(order => {

        totalSales +=
            safeNumber(order.total_amount);

    });


    if (totalSalesElement) {

        totalSalesElement.textContent =
            "₹" +
            totalSales.toLocaleString("en-IN", {
                maximumFractionDigits: 2
            });
    }
}


/* =========================================================
   RECENT ORDERS
   ========================================================= */

function updateRecentOrders(orders) {

    const container =
        document.getElementById("recentOrdersBody");

    if (!container) {
        return;
    }


    if (!orders || orders.length === 0) {

        container.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:35px;
                        color:#9997aa;
                    "
                >
                    No recent orders available.
                </td>
            </tr>
        `;

        return;
    }


    /*
     * Group products by order ID.
     */

    const groupedOrders = new Map();


    orders.forEach(order => {

        const orderId =
            String(order.order_id);


        if (!groupedOrders.has(orderId)) {

            groupedOrders.set(
                orderId,
                []
            );
        }


        groupedOrders
            .get(orderId)
            .push(order);

    });


    /*
     * Convert grouped orders into array.
     */

    const recentOrders =
        Array.from(groupedOrders.entries())
            .map(([orderId, items]) => {

                return {
                    orderId,
                    items,
                    firstItem: items[0]
                };

            })
            .sort((a, b) => {

                return (
                    Number(b.orderId) -
                    Number(a.orderId)
                );

            })
            .slice(0, 5);


    let html = "";


    recentOrders.forEach(order => {

        const firstItem =
            order.firstItem;


        const productNames =
            order.items
                .map(item =>
                    item.product_name || "Product"
                )
                .join(", ");


        const quantity =
            order.items.reduce(
                (sum, item) =>
                    sum + safeNumber(item.quantity),
                0
            );


        const amount =
            safeNumber(
                firstItem.total_amount
            );


        const status =
            firstItem.status || "Pending";


        let statusClass =
            "pending";


        if (
            status.toLowerCase() ===
            "delivered"
        ) {

            statusClass =
                "delivered";

        } else if (
            status.toLowerCase() ===
            "cancelled"
        ) {

            statusClass =
                "cancelled";
        }


        html += `
            <tr>

                <td>
                    #${order.orderId}
                </td>

                <td>
                    ${escapeHtml(productNames)}
                </td>

                <td>
                    ${quantity}
                </td>

                <td>
                    ₹${amount.toLocaleString("en-IN", {
                        maximumFractionDigits: 2
                    })}
                </td>

                <td>
                    <span class="order-status ${statusClass}">
                        ${escapeHtml(status)}
                    </span>
                </td>

            </tr>
        `;
    });


    container.innerHTML =
        html;
}


/* =========================================================
   STOCK MANAGEMENT
   ========================================================= */

function updateStockManagement(products) {

    const stockList =
        document.getElementById("stockList");

    if (!stockList) {
        return;
    }


    if (!products || products.length === 0) {

        stockList.innerHTML = `
            <div
                class="stock-item"
                style="text-align:center; padding:25px;"
            >
                <span class="stock-product-name">
                    No products available.
                </span>
            </div>
        `;

        return;
    }


    /*
     * Show maximum 5 products on dashboard.
     */

    const displayProducts =
        products.slice(0, 5);


    let html = "";


    displayProducts.forEach(product => {

        const quantity =
            safeNumber(product.quantity);


        /*
         * Dashboard visual percentage.
         *
         * 100 units is treated as full stock
         * for the progress bar only.
         */

        const percentage =
            Math.max(
                0,
                Math.min(
                    100,
                    (quantity / 100) * 100
                )
            );


        html += `
            <div class="stock-item">

                <div class="stock-item-top">

                    <span class="stock-product-name">
                        ${escapeHtml(
                            product.product_name ||
                            "Product"
                        )}
                    </span>

                    <span class="stock-number">
                        ${quantity}
                    </span>

                </div>

                <div class="stock-bar">

                    <div
                        class="stock-progress"
                        style="width:${percentage}%"
                    ></div>

                </div>

            </div>
        `;
    });


    stockList.innerHTML =
        html;
}


/* =========================================================
   LOW STOCK ALERT
   ========================================================= */

function updateLowStockAlerts(products) {

    const container =
        document.getElementById("lowStockContainer");

    if (!container) {
        return;
    }


    /*
     * Products with quantity <= 10
     * are treated as low stock.
     */

    const lowStockProducts =
        products.filter(product => {

            return safeNumber(
                product.quantity
            ) <= 10;

        });


    if (lowStockProducts.length === 0) {

        container.innerHTML = `
            <div class="empty-icon">
                📦
            </div>

            <h3>
                No Stock Alerts
            </h3>

            <p>
                Your products currently have sufficient stock.
            </p>
        `;

        return;
    }


    let html = "";


    lowStockProducts.forEach(product => {

        const quantity =
            safeNumber(product.quantity);


        html += `
            <div
                class="low-stock-item"
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:15px;
                    padding:15px 18px;
                    margin-bottom:10px;
                    border-radius:12px;
                    background:#fff7ed;
                    border:1px solid #fed7aa;
                "
            >

                <div>

                    <strong>
                        ${escapeHtml(
                            product.product_name ||
                            "Product"
                        )}
                    </strong>

                    <p
                        style="
                            margin:5px 0 0;
                            color:#9a3412;
                            font-size:13px;
                        "
                    >
                        Low stock — only ${quantity} available
                    </p>

                </div>

                <span
                    style="
                        font-weight:700;
                        color:#dc2626;
                    "
                >
                    ${quantity}
                </span>

            </div>
        `;
    });


    container.innerHTML =
        html;
}


/* =========================================================
   SELLER ACCOUNT INFORMATION
   ========================================================= */

function loadSellerAccountInformation() {

    const storeName =
        getStoreName();

    const email =
        localStorage.getItem("userEmail") ||
        "Not available";

    const role =
        localStorage.getItem("userRole") ||
        "seller";


    /* Hero Store Name */

    const heroStoreName =
        document.getElementById(
            "heroStoreName"
        );

    if (heroStoreName) {

        heroStoreName.textContent =
            storeName;
    }


    /* Top Profile Name */

    const topProfileName =
        document.getElementById(
            "topProfileName"
        );

    if (topProfileName) {

        topProfileName.textContent =
            getSellerName();
    }


    /* Top Avatar */

    const topProfileAvatar =
        document.getElementById(
            "topProfileAvatar"
        );

    if (topProfileAvatar) {

        topProfileAvatar.textContent =
            getSellerName()
                .charAt(0)
                .toUpperCase();
    }


    /* Account Store */

    const accountStoreName =
        document.getElementById(
            "accountStoreName"
        );

    if (accountStoreName) {

        accountStoreName.textContent =
            storeName;
    }


    /* Account Email */

    const accountEmail =
        document.getElementById(
            "accountEmail"
        );

    if (accountEmail) {

        accountEmail.textContent =
            email;
    }


    /* Account Role */

    const accountRole =
        document.getElementById(
            "accountRole"
        );

    if (accountRole) {

        accountRole.textContent =
            role.charAt(0).toUpperCase() +
            role.slice(1);
    }
}


/* =========================================================
   PROFILE DROPDOWN
   ========================================================= */

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


/* =========================================================
   CLOSE PROFILE MENU
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const menu =
            document.querySelector(
                ".profile-menu"
            );

        const dropdown =
            document.getElementById(
                "profileDropdown"
            );


        if (
            menu &&
            dropdown &&
            !menu.contains(event.target)
        ) {

            dropdown.classList.remove("show");
        }

    }
);


/* =========================================================
   OPEN SELLER PROFILE
   ========================================================= */

function openSellerProfile() {

    window.location.href =
        "seller-profile.html";
}


/* =========================================================
   LOGOUT
   ========================================================= */

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


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   INITIALIZE DASHBOARD
   ========================================================= */

async function initializeSellerDashboard() {

    console.log(
        "NishandhiniMart Seller Dashboard loading..."
    );


    const sellerId =
        getSellerId();


    console.log(
        "Seller ID:",
        sellerId
    );


    if (!sellerId) {

        console.warn(
            "No seller ID found in localStorage."
        );
    }


    /* Load account information */

    loadSellerAccountInformation();


    /* Load products */

    await loadSellerProducts();


    /* Load orders */

    await loadSellerOrders();


    console.log(
        "Seller Dashboard loaded successfully."
    );
}


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeSellerDashboard
);

