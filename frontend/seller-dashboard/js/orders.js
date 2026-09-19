/* =========================================================
   NISHANDHINIMART
   SELLER ORDERS
========================================================= */


/* =========================================================
   API
========================================================= */

const ORDERS_API =
    "http://127.0.0.1:8090/api/seller/orders";


/* =========================================================
   SELLER INFORMATION
========================================================= */

const sellerId =
    parseInt(
        localStorage.getItem("userId") || "0"
    );


const sellerName =
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    "Seller";


const sellerRole =
    localStorage.getItem("userRole") || "";



/* =========================================================
   CHECK SELLER LOGIN
========================================================= */

if (
    !sellerId ||
    sellerRole !== "seller"
) {

    alert(
        "Please login as seller."
    );

    window.location.href =
        "../login.html";

}



/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupProfile();

        setupSearch();

        loadOrders();

    }
);



/* =========================================================
   PROFILE
========================================================= */

function setupProfile() {

    const nameElement =
        document.getElementById(
            "topProfileName"
        );


    const avatarElement =
        document.getElementById(
            "topProfileAvatar"
        );


    if (nameElement) {

        nameElement.textContent =
            sellerName;

    }


    if (avatarElement) {

        avatarElement.textContent =
            sellerName
                .charAt(0)
                .toUpperCase();

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


    dropdown.classList.toggle(
        "show"
    );

}



/* =========================================================
   CLOSE PROFILE DROPDOWN
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const profileMenu =
            document.querySelector(
                ".profile-menu"
            );


        const dropdown =
            document.getElementById(
                "profileDropdown"
            );


        if (
            !profileMenu ||
            !dropdown
        ) {
            return;
        }


        if (
            !profileMenu.contains(
                event.target
            )
        ) {

            dropdown.classList.remove(
                "show"
            );

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



/* =========================================================
   ALL ORDERS
========================================================= */

let allOrders = [];



/* =========================================================
   LOAD SELLER ORDERS
========================================================= */

async function loadOrders() {

    const tableBody =
        document.getElementById(
            "ordersTableBody"
        );


    const emptyBox =
        document.getElementById(
            "ordersEmpty"
        );


    tableBody.innerHTML = `
        <tr>
            <td
                colspan="6"
                class="orders-message"
            >
                Loading orders...
            </td>
        </tr>
    `;


    emptyBox.style.display =
        "none";


    try {

        const response =
            await fetch(
                ORDERS_API +
                "?seller_id=" +
                encodeURIComponent(
                    sellerId
                )
            );


        console.log(
            "Seller Orders Response:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "Failed to load seller orders"
            );

        }


        const data =
            await response.json();


        console.log(
            "Seller Orders Data:",
            data
        );


        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "Invalid orders response"
            );

        }


        allOrders = data;


        updateSummary(
            allOrders
        );


        renderOrders(
            allOrders
        );

    }


    catch (error) {

        console.error(
            "Orders API Error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="orders-message"
                >
                    Unable to load orders.
                    Please make sure the backend
                    server is running.
                </td>
            </tr>
        `;

    }

}



/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary(
    orders
) {

    const totalOrders =
        document.getElementById(
            "totalOrders"
        );


    const pendingOrders =
        document.getElementById(
            "pendingOrders"
        );


    const totalOrderValue =
        document.getElementById(
            "totalOrderValue"
        );



    /* TOTAL ORDERS */

    totalOrders.textContent =
        orders.length;



    /* PENDING ORDERS */

    const pending =
        orders.filter(
            function (order) {

                const status =
                    String(
                        order.status ||
                        "pending"
                    )
                    .toLowerCase()
                    .trim();


                return (
                    status ===
                    "pending"
                );

            }
        ).length;


    pendingOrders.textContent =
        pending;



    /* TOTAL VALUE */

    const total =
        orders.reduce(
            function (
                sum,
                order
            ) {

                const amount =
                    Number(
                        order.total_amount ??
                        order.amount ??
                        0
                    );


                return (
                    sum + amount
                );

            },
            0
        );


    totalOrderValue.textContent =
        "₹" +
        total.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits:
                    2
            }
        );

}



/* =========================================================
   RENDER ORDERS
========================================================= */

function renderOrders(
    orders
) {

    const tableBody =
        document.getElementById(
            "ordersTableBody"
        );


    const emptyBox =
        document.getElementById(
            "ordersEmpty"
        );



    if (
        !orders ||
        orders.length === 0
    ) {

        tableBody.innerHTML = "";

        emptyBox.style.display =
            "block";

        return;

    }


    emptyBox.style.display =
        "none";



    tableBody.innerHTML =
        orders
            .map(
                function (order) {

                    return createOrderRow(
                        order
                    );

                }
            )
            .join("");

}



/* =========================================================
   CREATE ORDER ROW
========================================================= */

function createOrderRow(
    order
) {

    /* ORDER ID */

    const orderId =
        order.order_id ??
        order.id ??
        "-";



    /* PRODUCT */

    const productName =
        order.product_name ||
        order.name ||
        "Product";



    /* QUANTITY */

    const quantity =
        order.quantity ??
        order.qty ??
        0;



    /* AMOUNT */

    const amount =
        Number(
            order.total_amount ??
            order.amount ??
            (
                Number(
                    order.price || 0
                ) *
                Number(
                    order.quantity || 0
                )
            )
        );



    /* DATE */

    const date =
        order.created_at ||
        order.order_date ||
        order.date ||
        "";



    /* STATUS */

    const status =
        String(
            order.status ||
            "Pending"
        );



    const statusClass =
        getStatusClass(
            status
        );



    return `

        <tr>

            <td>

                <span class="order-id">

                    #${escapeHtml(
                        orderId
                    )}

                </span>

            </td>


            <td>

                <span class="order-product">

                    ${escapeHtml(
                        productName
                    )}

                </span>

            </td>


            <td>

                <span class="order-quantity">

                    ${escapeHtml(
                        quantity
                    )}

                </span>

            </td>


            <td>

                <span class="order-amount">

                    ₹${amount.toLocaleString(
                        "en-IN",
                        {
                            maximumFractionDigits:
                                2
                        }
                    )}

                </span>

            </td>


            <td>

                <span class="order-date">

                    ${formatDate(
                        date
                    )}

                </span>

            </td>


            <td>

                <span
                    class="
                        order-status
                        ${statusClass}
                    "
                >

                    ${escapeHtml(
                        status
                    )}

                </span>

            </td>

        </tr>

    `;

}



/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return escapeHtml(
            value
        );

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
   STATUS CLASS
========================================================= */

function getStatusClass(
    status
) {

    const value =
        String(status)
            .toLowerCase()
            .trim();



    if (
        value === "pending"
    ) {

        return "status-pending";

    }



    if (
        value === "processing" ||
        value === "confirmed"
    ) {

        return "status-processing";

    }



    if (
        value === "shipped"
    ) {

        return "status-shipped";

    }



    if (
        value === "delivered" ||
        value === "completed"
    ) {

        return "status-delivered";

    }



    if (
        value === "cancelled" ||
        value === "canceled"
    ) {

        return "status-cancelled";

    }



    return "status-pending";

}



/* =========================================================
   SEARCH + FILTER
========================================================= */

function setupSearch() {

    const searchInput =
        document.getElementById(
            "orderSearch"
        );


    const statusFilter =
        document.getElementById(
            "orderStatusFilter"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterOrders
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterOrders
        );

    }

}



/* =========================================================
   FILTER ORDERS
========================================================= */

function filterOrders() {

    const searchInput =
        document.getElementById(
            "orderSearch"
        );


    const statusFilter =
        document.getElementById(
            "orderStatusFilter"
        );


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedStatus =
        statusFilter.value
            .toLowerCase();



    const filteredOrders =
        allOrders.filter(
            function (order) {

                const orderId =
                    String(
                        order.order_id ??
                        order.id ??
                        ""
                    )
                    .toLowerCase();


                const productName =
                    String(
                        order.product_name ||
                        order.name ||
                        ""
                    )
                    .toLowerCase();


                const status =
                    String(
                        order.status ||
                        "pending"
                    )
                    .toLowerCase()
                    .trim();



                const matchesSearch =
                    orderId.includes(
                        search
                    ) ||
                    productName.includes(
                        search
                    );


                const matchesStatus =
                    selectedStatus ===
                    "all" ||
                    status ===
                    selectedStatus;



                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderOrders(
        filteredOrders
    );

}



/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(
    value
) {

    return String(value)

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