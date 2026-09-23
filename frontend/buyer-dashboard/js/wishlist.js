document.addEventListener("DOMContentLoaded", function () {
    loadWishlist();
    updateCartCount();
});


/* =========================
   LOAD WISHLIST
========================= */

function loadWishlist() {

    const loading = document.getElementById("wishlistLoading");
    const container = document.getElementById("wishlistContainer");
    const noWishlist = document.getElementById("noWishlist");

    if (!container) return;

    let wishlist = [];

    try {
        wishlist = JSON.parse(
            localStorage.getItem("wishlist")
        ) || [];
    } catch (error) {

        console.error(
            "Unable to read wishlist:",
            error
        );

        wishlist = [];
    }

    if (loading) {
        loading.style.display = "none";
    }

    if (!wishlist.length) {

        container.innerHTML = "";

        if (noWishlist) {
            noWishlist.style.display = "flex";
        }

        return;
    }

    if (noWishlist) {
        noWishlist.style.display = "none";
    }

    container.innerHTML = "";

    wishlist.forEach(function (product, index) {

        const wishlistItem =
            createWishlistItem(product, index);

        container.appendChild(wishlistItem);

    });
}

function getWishlistImagePath(image) {

    if (!image) {
        return "";
    }

    let cleanImage = String(image).trim();

    if (
        cleanImage.startsWith("http://") ||
        cleanImage.startsWith("https://")
    ) {
        return cleanImage;
    }

    cleanImage = cleanImage.replace(/^\/+/, "");

    cleanImage = cleanImage.replace(
        /^images\/+/i,
        ""
    );

    return `https://nishandhiniv.github.io/NishandhiniMart/seller-dashboard/images/${encodeURIComponent(cleanImage)}`;
}

/* =========================
   CREATE WISHLIST ITEM
========================= */

function createWishlistItem(product, index) {

    const item = document.createElement("div");

    item.className = "wishlist-item";

    const productId =
        product.id ||
        product.product_id ||
        index;

    const productName =
        product.product_name ||
        product.productName ||
        product.name ||
        "Product";

    const description =
        product.description ||
        "No description available.";

    const price =
        Number(
            product.price ||
            product.amount ||
            0
        );

    const image = getWishlistImagePath(
    product.image ||
    product.image_url ||
    product.imageUrl ||
    ""
);

    let imageHTML = "";

    if (image) {

        imageHTML = `
            <img
                src="${escapeHtml(image)}"
                alt="${escapeHtml(productName)}"
                class="wishlist-product-image"
                onerror="this.style.display='none';"
            >
        `;

    } else {

        imageHTML = `
            <div class="wishlist-product-placeholder">
                🛍️
            </div>
        `;

    }


    item.innerHTML = `

        <div class="wishlist-item-image">
            ${imageHTML}
        </div>

        <div class="wishlist-item-info">

            <h3>
                ${escapeHtml(productName)}
            </h3>

            <p class="wishlist-description">
                ${escapeHtml(description)}
            </p>

            <div class="wishlist-price">
                ₹${price.toFixed(2)}
            </div>

        </div>

        <div class="wishlist-item-actions">

            <button
                class="wishlist-cart-btn"
                onclick="addWishlistItemToCart(${index})"
            >
                🛒 Add to Cart
            </button>

            <button
                class="wishlist-remove-btn"
                onclick="removeFromWishlist(${index})"
            >
                🗑️ Remove
            </button>

        </div>

    `;

    return item;
}


/* =========================
   REMOVE FROM WISHLIST
========================= */

function removeFromWishlist(index) {

    let wishlist = [];

    try {

        wishlist =
            JSON.parse(
                localStorage.getItem("wishlist")
            ) || [];

    } catch (error) {

        wishlist = [];

    }

    if (
        index < 0 ||
        index >= wishlist.length
    ) {
        return;
    }

    wishlist.splice(index, 1);

    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );

    loadWishlist();

}


/* =========================
   ADD WISHLIST ITEM TO CART
========================= */

function addWishlistItemToCart(index) {

    let wishlist = [];

    try {

        wishlist =
            JSON.parse(
                localStorage.getItem("wishlist")
            ) || [];

    } catch (error) {

        wishlist = [];

    }

    if (
        index < 0 ||
        index >= wishlist.length
    ) {
        return;
    }

    const product = wishlist[index];

    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem("cart")
            ) || [];

    } catch (error) {

        cart = [];

    }


    const productId =
        product.id ||
        product.product_id;


    const existingItem =
        cart.find(function (item) {

            return String(
                item.id ||
                item.product_id
            ) === String(productId);

        });


    if (existingItem) {

        existingItem.quantity =
            (Number(existingItem.quantity) || 1) + 1;

    } else {

        cart.push({

            id: product.id,

            product_id:
                product.product_id ||
                product.id,

            product_name:
                product.product_name ||
                product.productName ||
                product.name ||
                "Product",

            name:
                product.name ||
                product.product_name ||
                product.productName ||
                "Product",

            price:
                Number(product.price) || 0,

            image:
                product.image ||
                product.image_url ||
                "",

            quantity: 1

        });

    }


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    updateCartCount();

    alert("Product added to cart successfully!");

}


/* =========================
   CART COUNT
========================= */

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


/* =========================
   OPEN CART
========================= */

function openCart() {

    window.location.href =
        "buyer_dashboard.html";

}


/* =========================
   LOGOUT
========================= */

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


/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(value) {

    return String(value)

        .replace(/&/g, "&amp;")

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


