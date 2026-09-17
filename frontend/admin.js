const BASE_URL = "http://127.0.0.1:8090/api";


// Check admin login
function checkAdminLogin() {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("userRole");

    if (!userId || role !== "admin") {
        alert("Please login as admin.");
        window.location.href = "login.html";
        return false;
    }

    return true;
}


// Load users
async function loadUsers() {
    const container = document.getElementById("adminDataContainer");
    const title = document.getElementById("dataTitle");

    title.textContent = "Registered Users";

    container.innerHTML = `
        <div class="loading-box">
            <div class="spinner"></div>
            <p>Loading users...</p>
        </div>
    `;

    try {
        const response = await fetch(`${BASE_URL}/users`);

        if (!response.ok) {
            throw new Error("Users API failed");
        }

        const result = await response.json();

        const users = Array.isArray(result)
            ? result
            : result.users || [];

        document.getElementById("totalUsers").textContent = users.length;

        if (users.length === 0) {
            showEmptyData("No users found.");
            return;
        }

        let rows = "";

        users.forEach(user => {
            rows += `
                <tr>
                    <td>${user.id ?? "-"}</td>
                    <td>${user.name || user.username || "-"}</td>
                    <td>${user.email || "-"}</td>
                    <td>
                        <span class="role-label">
                            ${user.role || "buyer"}
                        </span>
                    </td>
                </tr>
            `;
        });

        container.innerHTML = `
            <div class="data-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;

    } catch (error) {
        console.error("Load users error:", error);
        showApiError("Users API is not available in the current backend.");
    }
}


// Load products
async function loadProducts() {
    const container = document.getElementById("adminDataContainer");
    const title = document.getElementById("dataTitle");

    title.textContent = "All Products";

    container.innerHTML = `
        <div class="loading-box">
            <div class="spinner"></div>
            <p>Loading products...</p>
        </div>
    `;

    try {
        const response = await fetch(`${BASE_URL}/products`);

        if (!response.ok) {
            throw new Error("Products API failed");
        }

        const result = await response.json();

        const products = Array.isArray(result)
            ? result
            : result.products || [];

        document.getElementById("totalProducts").textContent =
            products.length;

        if (products.length === 0) {
            showEmptyData("No products found.");
            return;
        }

        let rows = "";

        products.forEach(product => {
            rows += `
                <tr>
                    <td>${product.id ?? "-"}</td>
                    <td>${product.product_name || "-"}</td>
                    <td>${product.category || "-"}</td>
                    <td>₹${Number(product.price || 0).toFixed(2)}</td>
                    <td>${product.seller_id || "-"}</td>
                </tr>
            `;
        });

        container.innerHTML = `
            <div class="data-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Seller ID</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;

    } catch (error) {
        console.error("Load products error:", error);
        showApiError("Unable to load products.");
    }
}


// Load orders
async function loadOrders() {
    const container = document.getElementById("adminDataContainer");
    const title = document.getElementById("dataTitle");

    title.textContent = "All Orders";

    container.innerHTML = `
        <div class="loading-box">
            <div class="spinner"></div>
            <p>Loading orders...</p>
        </div>
    `;

    try {
        const response = await fetch(`${BASE_URL}/orders`);

        if (!response.ok) {
            throw new Error("Orders API failed");
        }

        const result = await response.json();

        const orders = Array.isArray(result)
            ? result
            : result.orders || [];

        document.getElementById("totalOrders").textContent =
            orders.length;

        if (orders.length === 0) {
            showEmptyData("No orders found.");
            return;
        }

        let rows = "";

        orders.forEach(order => {
            rows += `
                <tr>
                    <td>${order.id ?? order.order_id ?? "-"}</td>
                    <td>${order.user_id ?? "-"}</td>
                    <td>₹${Number(order.total_amount || 0).toFixed(2)}</td>
                    <td>${order.status || "Pending"}</td>
                    <td>
                        ${
                            order.created_at
                            ? new Date(order.created_at).toLocaleDateString()
                            : "-"
                        }
                    </td>
                </tr>
            `;
        });

        container.innerHTML = `
            <div class="data-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>User ID</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;

    } catch (error) {
        console.error("Load orders error:", error);
        showApiError("Unable to load orders.");
    }
}


// Empty data
function showEmptyData(message) {
    document.getElementById("adminDataContainer").innerHTML = `
        <div class="empty-box">
            <div class="empty-icon">📊</div>
            <h3>${message}</h3>
            <p>There is no information to display right now.</p>
        </div>
    `;
}


// API error
function showApiError(message) {
    document.getElementById("adminDataContainer").innerHTML = `
        <div class="empty-box">
            <div class="empty-icon">⚠️</div>
            <h3>${message}</h3>
            <p>Please verify the backend API availability.</p>
        </div>
    `;
}


// Scroll
function scrollToManagement() {
    document.getElementById("managementSection").scrollIntoView({
        behavior: "smooth"
    });
}


// Logout
function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");

    window.location.href = "login.html";
}


// Initial load
document.addEventListener("DOMContentLoaded", () => {
    if (!checkAdminLogin()) {
        return;
    }

    loadProducts();
    loadOrders();
    loadUsers();
});