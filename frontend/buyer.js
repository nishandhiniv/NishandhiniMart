const API_URL = "http://127.0.0.1:8090/api/products";

let products = [];
let cart = [];


// Load products
async function loadProducts() {
    const loading = document.getElementById("loading");
    const productsGrid = document.getElementById("productsGrid");
    const noProducts = document.getElementById("noProducts");

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        products = await response.json();

        loading.style.display = "none";

        loadCategories();
        displayProducts(products);

    } catch (error) {
        console.error("Product loading error:", error);

        loading.style.display = "none";
        productsGrid.innerHTML = `
            <div class="empty-box" style="grid-column:1/-1;">
                <div class="empty-icon">⚠️</div>
                <h3>Unable to Load Products</h3>
                <p>Please make sure the backend server is running.</p>
            </div>
        `;
    }
}


// Load category options
function loadCategories() {
    const categoryFilter = document.getElementById("categoryFilter");

    const categories = [
        ...new Set(
            products
                .map(product => product.category)
                .filter(category => category)
        )
    ];

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}


// Get image path
function getImagePath(image) {
    if (!image) {
        return "";
    }

    image = image.replace(/^\/+/, "");

    return `http://127.0.0.1:8080/${image}`;
}


// Display products
function displayProducts(list) {
    const productsGrid = document.getElementById("productsGrid");
    const noProducts = document.getElementById("noProducts");

    productsGrid.innerHTML = "";

    if (list.length === 0) {
        noProducts.style.display = "block";
        return;
    }

    noProducts.style.display = "none";

    list.forEach(product => {
        const imagePath = getImagePath(product.image);

        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image">
                ${
                    imagePath
                    ? `<img src="${imagePath}" alt="${product.product_name}"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'no-image\\'>📦</div>';">`
                    : `<div class="no-image">📦</div>`
                }
            </div>

            <div class="product-info">
                <span class="product-category">
                    ${product.category || "General"}
                </span>

                <h3 title="${product.product_name}">
                    ${product.product_name}
                </h3>

                <p class="product-description">
                    ${product.description || "Quality product available at NishandhiniMart."}
                </p>

                <div class="product-bottom">
                    <span class="product-price">
                        ₹${Number(product.price).toFixed(2)}
                    </span>

                    <button
                        class="add-btn"
                        onclick="addToCart(${product.id})"
                    >
                        + Add
                    </button>
                </div>
            </div>
        `;

        productsGrid.appendChild(card);
    });
}


// Search and category filter
function filterProducts() {
    const searchValue = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const categoryValue = document
        .getElementById("categoryFilter")
        .value;

    const filtered = products.filter(product => {
        const matchesSearch =
            product.product_name.toLowerCase().includes(searchValue) ||
            (product.description || "").toLowerCase().includes(searchValue);

        const matchesCategory =
            categoryValue === "all" ||
            product.category === categoryValue;

        return matchesSearch && matchesCategory;
    });

    displayProducts(filtered);
}


// Add product to cart
function addToCart(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) {
        return;
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCart();

    alert(`${product.product_name} added to cart`);
}


// Update cart UI
function updateCart() {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartCount = document.getElementById("cartCount");

    const totalQuantity = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const totalAmount = cart.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    cartCount.textContent = totalQuantity;
    cartTotal.textContent = totalAmount.toFixed(2);

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div>🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add products to continue shopping.</p>
            </div>
        `;
        return;
    }

    cartItems.innerHTML = "";

    cart.forEach(item => {
        const imagePath = getImagePath(item.image);

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            ${
                imagePath
                ? `<img class="cart-item-image"
                        src="${imagePath}"
                        alt="${item.product_name}">`
                : `<div class="cart-item-image"
                        style="display:flex;align-items:center;justify-content:center;">
                        📦
                   </div>`
            }

            <div class="cart-item-info">
                <h4>${item.product_name}</h4>
                <p>
                    ₹${Number(item.price).toFixed(2)}
                    × ${item.quantity}
                </p>
            </div>

            <button
                class="remove-item"
                onclick="removeFromCart(${item.id})"
            >
                ×
            </button>
        `;

        cartItems.appendChild(cartItem);
    });
}


// Remove item
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}


// Open cart
function openCart() {
    document.getElementById("cartPanel").classList.add("active");
    document.getElementById("overlay").classList.add("active");
}


// Close cart
function closeCart() {
    document.getElementById("cartPanel").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
}


// Checkout
async function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please login before placing an order.");
        window.location.href = "login.html";
        return;
    }

    const totalAmount = cart.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    try {
        const orderResponse = await fetch(
            "http://127.0.0.1:8090/api/orders",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: Number(userId),
                    total_amount: totalAmount
                })
            }
        );

        if (!orderResponse.ok) {
            throw new Error("Order creation failed");
        }

        const orderData = await orderResponse.json();
        const orderId = orderData.id || orderData.order_id;

        for (const item of cart) {
            await fetch(
                "http://127.0.0.1:8090/api/order-items",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        order_id: orderId,
                        product_id: item.id,
                        quantity: item.quantity,
                        price: item.price
                    })
                }
            );
        }

        alert(`Order placed successfully!\nOrder ID: ${orderId}`);

        cart = [];
        updateCart();
        closeCart();
        loadMyOrders();

    } catch (error) {
        console.error("Checkout error:", error);
        alert("Checkout failed. Please try again.");
    }
}


// Load user orders
async function loadMyOrders() {
    const userId = localStorage.getItem("userId");
    const ordersContainer = document.getElementById("myOrders");

    if (!userId) {
        return;
    }

    try {
        const response = await fetch(
            "http://127.0.0.1:8090/api/orders/" + userId
        );

        if (!response.ok) {
            throw new Error("Failed to load orders");
        }

        const orders = await response.json();

        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-box">
                    <div class="empty-icon">🧾</div>
                    <h3>No Orders Yet</h3>
                    <p>Your orders will appear here after checkout.</p>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = "";

        orders.forEach(order => {
            const orderCard = document.createElement("div");
            orderCard.className = "order-card";

            orderCard.innerHTML = `
                <div>
                    <h3>Order #${order.id}</h3>
                    <p>
                        Date:
                        ${
                            order.created_at
                            ? new Date(order.created_at).toLocaleDateString()
                            : "Recently placed"
                        }
                    </p>
                </div>

                <div class="order-amount">
                    ₹${Number(order.total_amount).toFixed(2)}
                </div>
            `;

            ordersContainer.appendChild(orderCard);
        });

    } catch (error) {
        console.error("Orders loading error:", error);
    }
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
    loadProducts();
    loadMyOrders();
    updateCart();
});