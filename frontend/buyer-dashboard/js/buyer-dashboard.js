const API_URL = "https://nishandhinimart.onrender.com/api/products";

let products = [];
let cart = [];
let selectedCategory = "all";


// =========================================================
// LOAD PRODUCTS
// =========================================================

async function loadProducts() {

    const loading = document.getElementById("loading");
    const productsGrid = document.getElementById("productsGrid");

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        const data = await response.json();

        // Backend returns:
        // { success: true, products: [...] }

        products = Array.isArray(data)
            ? data
            : (
                Array.isArray(data.products)
                    ? data.products
                    : []
            );

        if (loading) {
            loading.style.display = "none";
        }

        loadCategories();
        displayProducts(products);

    } catch (error) {

        console.error("Product loading error:", error);

        if (loading) {
            loading.style.display = "none";
        }

        if (productsGrid) {

            productsGrid.innerHTML = `
                <div
                    class="empty-box"
                    style="grid-column:1/-1;"
                >
                    <div class="empty-icon">⚠️</div>

                    <h3>
                        Unable to Load Products
                    </h3>

                    <p>
                        Please make sure the backend server is running.
                    </p>
                </div>
            `;
        }
    }
}


// =========================================================
// LOAD CATEGORY OPTIONS
// =========================================================

function loadCategories() {

    const categoryNav =
        document.getElementById("categoryNav");

    if (!categoryNav) {
        return;
    }

    const categories = [
        ...new Set(
            products
                .map(product => product.category)
                .filter(
                    category =>
                        category &&
                        String(category).trim() !== ""
                )
        )
    ];

    categoryNav.innerHTML = "";


    // -----------------------------------------------------
    // ALL PRODUCTS
    // -----------------------------------------------------

    const allButton =
        document.createElement("button");

    allButton.className =
        "category-btn active";

    allButton.dataset.category = "all";

    allButton.textContent =
        "🛒 All Products";

    allButton.onclick = () => {

        selectedCategory = "all";

        setActiveCategory(allButton);

        filterProducts();
    };

    categoryNav.appendChild(allButton);


    // -----------------------------------------------------
    // DYNAMIC CATEGORIES
    // -----------------------------------------------------

    categories.forEach(category => {

        const button =
            document.createElement("button");

        button.className =
            "category-btn";

        button.dataset.category =
            category;

        const icons = {

            "Snacks": "🍿",
            "Electronics": "💻",
            "Fashion": "👕",
            "Home & Kitchen": "🏠",
            "Grocery": "🛍️",
            "Books": "📚"

        };

        const icon =
            icons[category] || "📦";

        button.textContent =
            `${icon} ${category}`;


        button.onclick = () => {

            selectedCategory = category;

            setActiveCategory(button);

            filterProducts();

        };


        categoryNav.appendChild(button);

    });
}


// =========================================================
// GET CORRECT IMAGE PATH
// =========================================================

function getImagePath(image) {

    if (!image) {
        return "";
    }

    let cleanImage = String(image).trim();

    // Full URL
    if (
        cleanImage.startsWith("http://") ||
        cleanImage.startsWith("https://")
    ) {
        return cleanImage;
    }

    // Remove leading slash
    cleanImage = cleanImage.replace(/^\/+/, "");

    // Remove old "images/" prefix if present
    cleanImage = cleanImage.replace(/^images\//i, "");

    // All product images are served from seller-dashboard/images
    return `http://127.0.0.1:5500/frontend/seller-dashboard/images/${encodeURIComponent(cleanImage)}`;
}

// =========================================================
// SET ACTIVE CATEGORY
// =========================================================

function setActiveCategory(activeButton) {

    const buttons =
        document.querySelectorAll(".category-btn");

    buttons.forEach(button => {

        button.classList.remove("active");

    });

    activeButton.classList.add("active");
}


// =========================================================
// DISPLAY PRODUCTS
// =========================================================

function displayProducts(list) {

    const productsGrid =
        document.getElementById("productsGrid");

    const noProducts =
        document.getElementById("noProducts");


    if (!productsGrid) {
        return;
    }


    productsGrid.innerHTML = "";


    if (!list || list.length === 0) {

        if (noProducts) {
            noProducts.style.display = "block";
        }

        return;
    }


    if (noProducts) {
        noProducts.style.display = "none";
    }


    list.forEach(product => {

        const imagePath =
            getImagePath(product.image);


        const card =
            document.createElement("div");

        card.className =
            "product-card";


        // Open product details
        card.addEventListener(
            "click",
            function () {

                window.location.href =
                    `product_details.html?id=${product.id}`;

            }
        );


        card.innerHTML = `

            <div class="product-image">

                ${
                    imagePath
                        ? `
                            <img
                                src="${imagePath}"
                                alt="${product.product_name || "Product"}"

                                onerror="
                                    console.error(
                                        'Image failed:',
                                        this.src
                                    );

                                    this.style.display='none';

                                    this.parentElement.innerHTML =
                                        '<div class=\\'no-image\\'>📦</div>';
                                "
                            >
                        `
                        : `
                            <div class="no-image">
                                📦
                            </div>
                        `
                }

            </div>


            <div class="product-info">

                <span class="product-category">
                    ${product.category || "General"}
                </span>


                <h3
                    title="${product.product_name || ""}"
                >
                    ${product.product_name || "Unnamed Product"}
                </h3>


                <p class="product-description">

                    ${
                        product.description ||
                        "Quality product available at NishandhiniMart."
                    }

                </p>


                <div class="product-bottom">

                    <span class="product-price">
                        ₹${Number(
                            product.price || 0
                        ).toFixed(2)}
                    </span>


                    <button
                        class="add-btn"
                        onclick="
                            event.stopPropagation();
                            addToCart(${product.id});
                        "
                    >
                        + Add
                    </button>
                    <button
                        class="wishlist-btn"
                        onclick="
                            event.stopPropagation();
                            toggleWishlist(${product.id});
                        "
                    >
                        ❤️ Wishlist
                </button>

                </div>

            </div>
        `;


        productsGrid.appendChild(card);

    });
}


// =========================================================
// SEARCH + CATEGORY FILTER
// =========================================================

function filterProducts() {

    const searchInput =
        document.getElementById("searchInput");


    const searchValue =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const selected =
        String(
            selectedCategory || "all"
        )
            .trim()
            .toLowerCase();


    const filteredProducts =
        products.filter(product => {

            const productCategory =
                String(
                    product.category || ""
                )
                    .trim()
                    .toLowerCase();


            const productName =
                String(
                    product.product_name || ""
                )
                    .toLowerCase();


            const description =
                String(
                    product.description || ""
                )
                    .toLowerCase();


            const matchesSearch =

                productName.includes(
                    searchValue
                ) ||

                description.includes(
                    searchValue
                ) ||

                productCategory.includes(
                    searchValue
                );


            const matchesCategory =
                selected === "all" ||
                productCategory === selected;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    displayProducts(filteredProducts);
}


// =========================================================
// ADD TO CART
// =========================================================

function addToCart(productId) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!product) {
        return;
    }


    const existingItem =
        cart.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({

            ...product,

            quantity: 1

        });

    }
    
    localStorage.setItem("cart", JSON.stringify(cart));

    updateCart();


    alert(
        `${product.product_name} added to cart`
    );
}


// =========================================================
// UPDATE CART UI
// =========================================================

function updateCart() {
    cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];

    const cartItems =
        document.getElementById("cartItems");

    const cartTotal =
        document.getElementById("cartTotal");

    const cartCount =
        document.getElementById("cartCount");


    if (!cartCount) {
    return;
}


    const totalQuantity =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    const totalAmount =
        cart.reduce(
            (sum, item) =>

                sum +
                Number(item.price || 0) *
                item.quantity,

            0
        );


    cartCount.textContent =
        totalQuantity;


    cartTotal.textContent =
        totalAmount.toFixed(2);


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <div>🛒</div>

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add products to continue shopping.
                </p>

            </div>
        `;

        return;
    }


    cartItems.innerHTML = "";


    cart.forEach(item => {

        const imagePath =
            getImagePath(item.image);


        const cartItem =
            document.createElement("div");

        cartItem.className =
            "cart-item";


        cartItem.innerHTML = `

            ${
                imagePath
                    ? `
                        <img
                            class="cart-item-image"
                            src="${imagePath}"
                            alt="${item.product_name || "Product"}"
                            onerror="this.style.display='none';"
                        >
                    `
                    : `
                        <div
                            class="cart-item-image"
                            style="
                                display:flex;
                                align-items:center;
                                justify-content:center;
                            "
                        >
                            📦
                        </div>
                    `
            }


            <div class="cart-item-info">

                <h4>
                    ${item.product_name}
                </h4>


                <p>
                    ₹${Number(
                        item.price || 0
                    ).toFixed(2)}

                    × ${item.quantity}
                </p>

            </div>


            <button
                class="remove-item"
                onclick="
                    removeFromCart(${item.id})
                "
            >
                ×
            </button>

        `;


        cartItems.appendChild(cartItem);

    });
}


// =========================================================
// REMOVE ITEM FROM CART
// =========================================================

function removeFromCart(productId) {

    cart =
        cart.filter(
            item =>
                Number(item.id) !==
                Number(productId)
        );


    updateCart();
}


// =========================================================
// OPEN CART
// =========================================================

function openCart() {
    window.location.href = "cart.html";
}

// =========================================================
// CLOSE CART
// =========================================================

function closeCart() {

    const cartPanel =
        document.getElementById("cartPanel");

    const overlay =
        document.getElementById("overlay");


    if (cartPanel) {
        cartPanel.classList.remove("active");
    }


    if (overlay) {
        overlay.classList.remove("active");
    }
}


// =========================================================
// CHECKOUT
// =========================================================

async function checkout() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;
    }


    const userId =
        localStorage.getItem("userId");


    if (!userId) {

        alert(
            "Please login before placing an order."
        );


        window.location.href =
            "../login.html";


        return;
    }


    const totalAmount =
        cart.reduce(
            (sum, item) =>

                sum +
                Number(item.price || 0) *
                item.quantity,

            0
        );


    try {

        const orderResponse =
            await fetch(
                "https://nishandhinimart.onrender.com/api/create-order",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_id:
                            Number(userId),

                        total_amount:
                            totalAmount

                    })
                }
            );


        if (!orderResponse.ok) {
            throw new Error(
                "Order creation failed"
            );
        }


        const orderData =
            await orderResponse.json();


        const orderId =
            orderData.id ||
            orderData.order_id;


        if (!orderId) {

            throw new Error(
                "Order ID missing from backend response"
            );
        }


        for (const item of cart) {

            const itemResponse =
                await fetch(
                    "https://nishandhinimart.onrender.com/api/order-item",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            order_id:
                                Number(orderId),

                            product_id:
                                Number(item.id),

                            quantity:
                                Number(item.quantity),

                            price:
                                Number(item.price)

                        })
                    }
                );


            if (!itemResponse.ok) {

                throw new Error(
                    `Failed to add order item for product ${item.id}`
                );
            }
        }


        alert(
            `Order placed successfully!\nOrder ID: ${orderId}`
        );


        cart = [];


        updateCart();


        closeCart();


        loadMyOrders();


    } catch (error) {

        console.error(
            "Checkout error:",
            error
        );


        alert(
            "Checkout failed. Please try again."
        );
    }
}


// =========================================================
// LOAD USER ORDERS
// =========================================================

async function loadMyOrders() {

    const userId =
        localStorage.getItem("userId");


    const ordersContainer =
        document.getElementById("myOrders");


    if (
        !userId ||
        !ordersContainer
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                "https://nishandhinimart.onrender.com/api/user-orders/" +
                userId
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load orders"
            );
        }


        const data =
            await response.json();


        const orders =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(data.orders)
                        ? data.orders
                        : []
                );


        if (orders.length === 0) {

            ordersContainer.innerHTML = `

                <div class="empty-box">

                    <div class="empty-icon">
                        🧾
                    </div>

                    <h3>
                        No Orders Yet
                    </h3>

                    <p>
                        Your orders will appear here after checkout.
                    </p>

                </div>

            `;

            return;
        }


        ordersContainer.innerHTML = "";


        orders.forEach(order => {

            const orderCard =
                document.createElement("div");

            orderCard.className =
                "order-card";


            orderCard.innerHTML = `

                <div>

                    <h3>
                        Order #${order.id}
                    </h3>


                    <p>

                        Date:

                        ${
                            order.created_at
                                ? new Date(
                                    order.created_at
                                ).toLocaleDateString()
                                : "Recently placed"
                        }

                    </p>


                    <p>

                        Status:

                        ${order.status || "Processing"}

                    </p>

                </div>


                <div class="order-amount">

                    ₹${Number(
                        order.total_amount || 0
                    ).toFixed(2)}

                </div>

            `;


            ordersContainer.appendChild(
                orderCard
            );

        });


    } catch (error) {

        console.error(
            "Orders loading error:",
            error
        );


        ordersContainer.innerHTML = `

            <div class="empty-box">

                <h3>
                    Unable to load orders
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>

        `;
    }
}


// =========================================================
// LOGOUT
// =========================================================

function logout() {

    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");

    window.location.href =
        "../login.html";
}


// =========================================================
// INITIAL LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProducts();

        loadMyOrders();

        updateCart();

    }
);
// =========================================================
// WISHLIST
// =========================================================

function getWishlist() {

    try {
        return JSON.parse(
            localStorage.getItem("wishlist")
        ) || [];
    } catch (error) {
        console.error(
            "Unable to read wishlist:",
            error
        );

        return [];
    }
}


function toggleWishlist(productId) {

    const product = products.find(
        item =>
            Number(item.id) === Number(productId)
    );

    if (!product) {
        return;
    }

    let wishlist = getWishlist();

    const existingIndex = wishlist.findIndex(
        item =>
            Number(item.id) === Number(productId)
    );


    if (existingIndex !== -1) {

        wishlist.splice(existingIndex, 1);

        localStorage.setItem(
            "wishlist",
            JSON.stringify(wishlist)
        );

        alert(
            `${product.product_name} removed from wishlist`
        );

    } else {

        wishlist.push({
            ...product
        });

        localStorage.setItem(
            "wishlist",
            JSON.stringify(wishlist)
        );

        alert(
            `${product.product_name} added to wishlist ❤️`
        );
    }

}
function openChatbot() {
    window.location.href =
        "../chatbot/chatbot.html";
}

