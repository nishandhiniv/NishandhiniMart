// =========================================
// NishandhiniMart - Checkout
// =========================================

const ORDERS_API =
    "http://127.0.0.1:10000/api/user-orders/";

const CREATE_ORDER_API =
    "http://127.0.0.1:10000/api/create-order";

const ORDER_ITEM_API =
    "http://127.0.0.1:10000/api/order-item";


// =========================================
// GLOBAL VARIABLES
// =========================================

let cart = [];

let currentOrderId = null;

let currentOrderTotal = 0;

let currentOrderDate = null;


// =========================================
// PAGE LOAD
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCart();

        loadUserDetails();

        updateCartCount();

    }
);


// =========================================
// LOAD CART
// =========================================

function loadCart() {

    try {

        // Check if this checkout came from Buy Now
        const buyNowItem =
            JSON.parse(
                localStorage.getItem("buyNowItem")
            );

        if (buyNowItem) {

            // Buy Now → checkout only this product
            cart = [buyNowItem];

        } else {

            // Normal Cart → checkout all cart products
            cart =
                JSON.parse(
                    localStorage.getItem("cart")
                ) || [];
        }

    } catch (error) {

        console.error(
            "Unable to load checkout items:",
            error
        );

        cart = [];
    }

    displayCheckoutItems();
}
// =========================================
// DISPLAY CHECKOUT ITEMS
// =========================================

function displayCheckoutItems() {

    const checkoutItems =
        document.getElementById(
            "checkoutItems"
        );

    const emptyCheckout =
        document.getElementById(
            "emptyCheckout"
        );

    const checkoutTotalSection =
        document.getElementById(
            "checkoutTotalSection"
        );

    const confirmOrderSection =
        document.getElementById(
            "confirmOrderSection"
        );


    if (!checkoutItems) {
        return;
    }


    checkoutItems.innerHTML = "";


    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        if (emptyCheckout) {
            emptyCheckout.style.display =
                "block";
        }

        if (checkoutTotalSection) {
            checkoutTotalSection.style.display =
                "none";
        }

        if (confirmOrderSection) {
            confirmOrderSection.style.display =
                "none";
        }

        return;

    }


    if (emptyCheckout) {
        emptyCheckout.style.display =
            "none";
    }

    if (checkoutTotalSection) {
        checkoutTotalSection.style.display =
            "block";
    }

    if (confirmOrderSection) {
        confirmOrderSection.style.display =
            "flex";
    }


    let totalAmount = 0;

    let totalItems = 0;


    cart.forEach(
        function (item) {

            const quantity =
                Number(item.quantity || 1);

            const price =
                Number(item.price || 0);

            const itemTotal =
                price * quantity;


            totalAmount += itemTotal;

            totalItems += quantity;


            const itemElement =
                document.createElement(
                    "div"
                );

            itemElement.className =
                "checkout-item";


            const imagePath =
                getProductImagePath(
                    item.image ||
                    item.image_url ||
                    item.imageUrl ||
                    ""
                );


            itemElement.innerHTML = `

                <div class="checkout-item-image">

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
                            class="checkout-product-image"
                            onerror="
                                this.style.display='none';
                                this.nextElementSibling.style.display='flex';
                            "
                        >
                        `
                        :
                        ""
                    }

                    <div
                        class="checkout-product-placeholder"
                        style="
                            display:${imagePath ? "none" : "flex"};
                        "
                    >
                        📦
                    </div>

                </div>


                <div class="checkout-item-info">

                    <h3>
                        ${escapeHtml(
                            item.product_name ||
                            item.name ||
                            "Product"
                        )}
                    </h3>

                    ${
                        item.category
                        ?
                        `
                        <p class="checkout-item-category">
                            ${escapeHtml(
                                item.category
                            )}
                        </p>
                        `
                        :
                        ""
                    }

                    <p class="checkout-item-price">
                        ₹${price.toFixed(2)}
                    </p>

                </div>


                <div class="checkout-item-quantity">

                    <span>
                        Quantity
                    </span>

                    <strong>
                        ${quantity}
                    </strong>

                </div>


                <div class="checkout-item-total">

                    <span>
                        Total
                    </span>

                    <strong>
                        ₹${itemTotal.toFixed(2)}
                    </strong>

                </div>

            `;


            checkoutItems.appendChild(
                itemElement
            );

        }
    );


    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );

    if (checkoutTotal) {

        checkoutTotal.textContent =
            totalAmount.toFixed(2);

    }


    const checkoutTotalItems =
        document.getElementById(
            "checkoutTotalItems"
        );

    if (checkoutTotalItems) {

        checkoutTotalItems.textContent =
            totalItems;

    }


    currentOrderTotal =
        totalAmount;

}


// =========================================
// LOAD USER DETAILS
// =========================================

function loadUserDetails() {

    const userId =
        localStorage.getItem("userId");


    if (!userId) {

        alert(
            "Please login before checkout."
        );

        window.location.href =
            "../login.html";

        return;

    }


    const userName =
        localStorage.getItem(
            "userName"
        ) ||
        localStorage.getItem(
            "username"
        ) ||
        "-";


    const userEmail =
        localStorage.getItem(
            "userEmail"
        ) ||
        "-";


    const userPhone =
        localStorage.getItem(
            "phone"
        ) ||
        "-";


    const userAddress =
        localStorage.getItem(
            "address"
        ) ||
        "-";


    setText(
        "checkoutUserName",
        userName
    );

    setText(
        "checkoutUserEmail",
        userEmail
    );

    setText(
        "checkoutUserPhone",
        userPhone
    );

    setText(
        "checkoutUserAddress",
        userAddress
    );

}


// =========================================
// CONFIRM ORDER
// =========================================

async function confirmOrder() {

    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        showCheckoutMessage(
            "Your cart is empty.",
            "error"
        );

        return;

    }


    const userId =
        localStorage.getItem(
            "userId"
        );


    if (!userId) {

        alert(
            "Please login before placing an order."
        );

        window.location.href =
            "../login.html";

        return;

    }


    const confirmButton =
        document.getElementById(
            "confirmOrderBtn"
        );


    if (confirmButton) {

        confirmButton.disabled =
            true;

        confirmButton.textContent =
            "⏳ Placing Order...";

    }


    showCheckoutMessage(
        "Placing your order...",
        "success"
    );


    try {

        // =====================================
        // CALCULATE TOTAL
        // =====================================

        const totalAmount =
            cart.reduce(
                function (sum, item) {

                    const price =
                        Number(
                            item.price || 0
                        );

                    const quantity =
                        Number(
                            item.quantity || 1
                        );

                    return (
                        sum +
                        (price * quantity)
                    );

                },
                0
            );


        // =====================================
        // CREATE ORDER
        // =====================================

        const orderResponse =
            await fetch(
                CREATE_ORDER_API,
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
                "Order creation failed."
            );

        }


        const orderData =
            await orderResponse.json();


        console.log(
            "Order response:",
            orderData
        );


        const orderId =
            orderData.id ||
            orderData.order_id;


        if (!orderId) {

            throw new Error(
                "Order ID missing from backend response."
            );

        }


        // =====================================
        // CREATE ORDER ITEMS
        // =====================================

        for (
            const item of cart
        ) {

            const itemResponse =
                await fetch(
                    ORDER_ITEM_API,
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
                                Number(
                                    item.quantity || 1
                                ),

                            price:
                                Number(
                                    item.price || 0
                                )

                        })

                    }
                );


            if (!itemResponse.ok) {

                throw new Error(
                    `Failed to add order item for product ${item.id}`
                );

            }

        }

        // Save cart details before clearing the cart
            localStorage.setItem(
                "lastOrderCart",
                JSON.stringify(cart)
            );

        // =====================================
        // SAVE SUCCESS DETAILS
        // =====================================

        currentOrderId =
            orderId;

        currentOrderTotal =
            totalAmount;

        currentOrderDate =
            new Date();


        // Save latest order ID
        localStorage.setItem(
            "latestOrderId",
            String(orderId)
        );


        // Save order date
        localStorage.setItem(
            "latestOrderDate",
            currentOrderDate.toISOString()
        );


        // =====================================
        // SHOW SUCCESS PAGE
        // =====================================

        showOrderSuccess(
            orderId,
            totalAmount,
            currentOrderDate
        );


        // =====================================
        // CLEAR CART
        // =====================================

        cart = [];


        localStorage.setItem(
            "cart",
            JSON.stringify([])
        );


        updateCartCount();


        // =====================================
        // HIDE CHECKOUT VIEW
        // =====================================

        const checkoutView =
            document.getElementById(
                "checkoutView"
            );

        const successView =
            document.getElementById(
                "orderSuccessView"
            );


        if (checkoutView) {

            checkoutView.style.display =
                "none";

        }


        if (successView) {

            successView.style.display =
                "block";

        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Checkout error:",
            error
        );


        showCheckoutMessage(
            error.message ||
            "Checkout failed. Please try again.",
            "error"
        );


        if (confirmButton) {

            confirmButton.disabled =
                false;

            confirmButton.textContent =
                "✅ Confirm Order";

        }

    }

}


// =========================================
// SHOW ORDER SUCCESS
// =========================================

function showOrderSuccess(
    orderId,
    totalAmount,
    orderDate
) {

    setText(
        "successOrderId",
        "#" + orderId
    );


    setText(
        "successTotal",
        Number(
            totalAmount || 0
        ).toFixed(2)
    );


    setText(
        "successOrderDate",
        formatDate(orderDate)
    );


    setText(
        "successOrderStatus",
        "Processing"
    );


    const estimatedDate =
        calculateEstimatedDelivery(
            orderDate
        );


    setText(
        "successDeliveryDate",
        estimatedDate
    );


    const address =
        localStorage.getItem(
            "address"
        ) ||
        "-";


    setText(
        "successAddress",
        address
    );


    displaySuccessProducts();

}


// =========================================
// DISPLAY SUCCESS PRODUCTS
// =========================================

function displaySuccessProducts() {

    const container =
        document.getElementById(
            "successProductDetails"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        /*
         * Cart is cleared after success.
         * Therefore use saved checkout snapshot
         * when available.
         */

        const savedCart =
            getLastOrderCart();


        if (
            Array.isArray(savedCart) &&
            savedCart.length > 0
        ) {

            savedCart.forEach(
                item => {

                    createSuccessProduct(
                        container,
                        item
                    );

                }
            );

        }

        return;

    }


    cart.forEach(
        item => {

            createSuccessProduct(
                container,
                item
            );

        }
    );

}


// =========================================
// CREATE SUCCESS PRODUCT
// =========================================

function createSuccessProduct(
    container,
    item
) {

    const quantity =
        Number(
            item.quantity || 1
        );


    const price =
        Number(
            item.price || 0
        );


    const total =
        price * quantity;


    const product =
        document.createElement(
            "div"
        );


    product.className =
        "success-product";


    product.innerHTML = `

        <div class="success-product-info">

            <h3>
                ${escapeHtml(
                    item.product_name ||
                    item.name ||
                    "Product"
                )}
            </h3>

            ${
                item.category
                ?
                `
                <p>
                    ${escapeHtml(
                        item.category
                    )}
                </p>
                `
                :
                ""
            }

        </div>


        <div class="success-product-quantity">

            <span>
                Quantity
            </span>

            <strong>
                ${quantity}
            </strong>

        </div>


        <div class="success-product-price">

            <span>
                Amount
            </span>

            <strong>
                ₹${total.toFixed(2)}
            </strong>

        </div>

    `;


    container.appendChild(
        product
    );

}


// =========================================
// TRACK SUCCESSFUL ORDER
// =========================================

function trackSuccessfulOrder() {

    if (!currentOrderId) {

        currentOrderId =
            localStorage.getItem(
                "latestOrderId"
            );

    }


    if (!currentOrderId) {

        alert(
            "Order ID is not available."
        );

        return;

    }


    localStorage.setItem(
        "trackOrderId",
        String(currentOrderId)
    );


    window.location.href =
        "order-tracking.html";

}


// =========================================
// CONTINUE SHOPPING
// =========================================

function continueShopping() {

    window.location.href =
        "buyer_dashboard.html";

}


// =========================================
// OPEN CART
// =========================================

function openCart() {

    window.location.href =
        "buyer_dashboard.html";

}


// =========================================
// UPDATE CART COUNT
// =========================================

function updateCartCount() {

    let currentCart = [];


    try {

        currentCart =
            JSON.parse(
                localStorage.getItem(
                    "cart"
                )
            ) || [];

    } catch (error) {

        currentCart = [];

    }


    const count =
        currentCart.reduce(
            function (total, item) {

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
// PRODUCT IMAGE PATH
// =========================================

function getProductImagePath(
    image
) {

    if (!image) {

        return "";

    }


    let cleanImage =
        String(image).trim();


    if (
        cleanImage.startsWith(
            "http://"
        ) ||
        cleanImage.startsWith(
            "https://"
        )
    ) {

        return cleanImage;

    }


    cleanImage =
        cleanImage.replace(
            /^\/+/,
            ""
        );


    cleanImage =
        cleanImage.replace(
            /^images\/+/i,
            ""
        );


    return (
        "http://127.0.0.1:5500/" +
        "frontend/seller-dashboard/images/" +
        encodeURIComponent(
            cleanImage
        )
    );

}


// =========================================
// GET LAST ORDER CART
// =========================================

function getLastOrderCart() {

    try {

        return (
            JSON.parse(
                localStorage.getItem(
                    "lastOrderCart"
                )
            ) || []
        );

    } catch (error) {

        return [];

    }

}


// =========================================
// ESTIMATED DELIVERY
// =========================================

function calculateEstimatedDelivery(
    orderDate
) {

    const date =
        new Date(orderDate);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    date.setDate(
        date.getDate() + 5
    );


    return formatDate(date);

}


// =========================================
// FORMAT DATE
// =========================================

function formatDate(
    date
) {

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
// CHECKOUT MESSAGE
// =========================================

function showCheckoutMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "checkoutMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        "checkout-message";


    if (type) {

        element.classList.add(
            type
        );

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
