let cart = [];


document.addEventListener("DOMContentLoaded", () => {

    loadCart();

    updateCartCount();

});


/* =========================================================
   LOAD CART
========================================================= */

function loadCart() {

    try {

        cart =
            JSON.parse(
                localStorage.getItem("cart")
            ) || [];

    } catch (error) {

        console.error(
            "Unable to load cart:",
            error
        );

        cart = [];

    }

    displayCart();

}


/* =========================================================
   DISPLAY CART
========================================================= */

function displayCart() {

    const container =
        document.getElementById(
            "cartItemsContainer"
        );

    const emptyCart =
        document.getElementById(
            "emptyCart"
        );

    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (cart.length === 0) {

        emptyCart.style.display = "block";

        updateCartSummary();

        return;
    }


    emptyCart.style.display = "none";


    cart.forEach((item, index) => {

        container.appendChild(
            createCartItem(item, index)
        );

    });


    updateCartSummary();

}


/* =========================================================
   CREATE CART ITEM
========================================================= */

function createCartItem(item, index) {

    const itemElement =
        document.createElement("div");

    itemElement.className =
        "cart-product-item";


    const imagePath =
        getProductImagePath(
            item.image ||
            item.image_url ||
            item.imageUrl ||
            ""
        );


    const quantity =
        Number(item.quantity || 1);


    const price =
        Number(item.price || 0);


    const itemTotal =
        price * quantity;


    itemElement.innerHTML = `

        <div class="cart-product-image">

            ${
                imagePath
                ?
                `
                <img
                    src="${imagePath}"
                    alt="${escapeHtml(
                        item.product_name ||
                        "Product"
                    )}"
                    class="cart-product-img"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >
                `
                :
                ""
            }

            <div
                class="cart-product-placeholder"
                style="${imagePath ? "display:none;" : "display:flex;"}"
            >
                📦
            </div>

        </div>


        <div class="cart-product-info">

            <h3>
                ${escapeHtml(
                    item.product_name ||
                    "Product"
                )}
            </h3>


            <p class="cart-product-description">

                ${
                    escapeHtml(
                        item.description ||
                        "No description available."
                    )
                }

            </p>


            <div class="cart-product-price">

                ₹${price.toFixed(2)}

            </div>

        </div>


        <div class="cart-product-quantity">

            <span class="quantity-label">
                Quantity
            </span>


            <div class="quantity-controls">

                <button
                    type="button"
                    onclick="decreaseQuantity(${index})"
                >
                    −
                </button>


                <span>
                    ${quantity}
                </span>


                <button
                    type="button"
                    onclick="increaseQuantity(${index})"
                >
                    +
                </button>

            </div>

        </div>


        <div class="cart-product-total">

            <span>
                Item Total
            </span>

            <strong>
                ₹${itemTotal.toFixed(2)}
            </strong>

        </div>


        <button
            type="button"
            class="remove-cart-item"
            onclick="removeCartItem(${index})"
            title="Remove item"
        >
            🗑️
        </button>

    `;


    return itemElement;

}


/* =========================================================
   INCREASE QUANTITY
========================================================= */

function increaseQuantity(index) {

    if (!cart[index]) {
        return;
    }


    cart[index].quantity =
        Number(cart[index].quantity || 1) + 1;


    saveCart();

}


/* =========================================================
   DECREASE QUANTITY
========================================================= */

function decreaseQuantity(index) {

    if (!cart[index]) {
        return;
    }


    const currentQuantity =
        Number(cart[index].quantity || 1);


    if (currentQuantity <= 1) {

        removeCartItem(index);

        return;
    }


    cart[index].quantity =
        currentQuantity - 1;


    saveCart();

}


/* =========================================================
   REMOVE CART ITEM
========================================================= */

function removeCartItem(index) {

    if (!cart[index]) {
        return;
    }


    cart.splice(index, 1);


    saveCart();

}


/* =========================================================
   SAVE CART
========================================================= */

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    displayCart();

    updateCartCount();

}


/* =========================================================
   UPDATE CART SUMMARY
========================================================= */

function updateCartSummary() {

    let itemCount = 0;

    let subtotal = 0;


    cart.forEach(item => {

        const quantity =
            Number(item.quantity || 1);

        const price =
            Number(item.price || 0);


        itemCount += quantity;

        subtotal +=
            price * quantity;

    });


    setText(
        "cartItemCount",
        itemCount
    );


    setText(
        "summaryItemCount",
        itemCount
    );


    setText(
        "cartSubtotal",
        subtotal.toFixed(2)
    );


    setText(
        "cartTotal",
        subtotal.toFixed(2)
    );


    const checkoutButton =
        document.getElementById(
            "checkoutButton"
        );


    if (checkoutButton) {

        checkoutButton.disabled =
            cart.length === 0;

    }

}


/* =========================================================
   UPDATE HEADER CART COUNT
========================================================= */

function updateCartCount() {

    let count = 0;


    cart.forEach(item => {

        count +=
            Number(item.quantity || 1);

    });


    setText(
        "cartCount",
        count
    );

}


/* =========================================================
   PROCEED TO CHECKOUT
========================================================= */

function proceedToCheckout() {

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
            "Please login before proceeding to checkout."
        );

        window.location.href =
            "../login.html";

        return;
    }


    window.location.href =
        "checkout.html";

}


/* =========================================================
   CONTINUE SHOPPING
========================================================= */

function continueShopping() {

    window.location.href =
        "buyer_dashboard.html";

}


/* =========================================================
   CART BUTTON
========================================================= */

function openCart() {

    window.location.href =
        "cart.html";

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
   PRODUCT IMAGE PATH
========================================================= */

function getProductImagePath(image) {

    if (!image) {
        return "";
    }


    let cleanImage =
        String(image).trim();


    if (
        cleanImage.startsWith("http://") ||
        cleanImage.startsWith("https://")
    ) {

        return cleanImage;

    }


    cleanImage =
        cleanImage.replace(/^\/+/, "");


    cleanImage =
        cleanImage.replace(
            /^images\/+/i,
            ""
        );


    return (
        "http://127.0.0.1:5500/frontend/" +
        "seller-dashboard/images/" +
        encodeURIComponent(cleanImage)
    );

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
