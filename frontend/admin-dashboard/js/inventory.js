const BASE_URL = "http://127.0.0.1:10000/api";

let allInventory = [];


// ============================================================
// ADMIN LOGIN CHECK
// ============================================================

function checkAdminLogin() {

    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("userRole");

    if (!userId || role !== "admin") {

        alert("Please login as admin.");

        window.location.href = "../login.html";

        return false;
    }

    return true;
}


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    if (!checkAdminLogin()) {
        return;
    }

    loadInventory();

    setupFilters();

});


// ============================================================
// LOAD INVENTORY
// ============================================================

async function loadInventory() {

    const tableBody =
        document.getElementById("inventoryTableBody");

    if (tableBody) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="loading-box">
                        <div class="spinner"></div>
                        <p>Loading inventory...</p>
                    </div>
                </td>
            </tr>
        `;

    }


    try {

        const response =
            await fetch(`${BASE_URL}/products`);


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        /*
         * Backend may return either:
         *
         * [
         *   {...},
         *   {...}
         * ]
         *
         * or:
         *
         * {
         *   products: [...]
         * }
         */

        if (Array.isArray(data)) {

            allInventory = data;

        }
        else if (Array.isArray(data.products)) {

            allInventory = data.products;

        }
        else if (Array.isArray(data.data)) {

            allInventory = data.data;

        }
        else {

            allInventory = [];

        }


        updateInventorySummary();

        renderInventory(allInventory);

    }
    catch (error) {

        console.error(
            "Inventory loading error:",
            error
        );


        allInventory = [];

        updateInventorySummary();

        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="empty-box">
                            <strong>
                                Unable to load inventory
                            </strong>

                            <p>
                                Please make sure the backend
                                is running on port 8090.
                            </p>
                        </div>
                    </td>
                </tr>
            `;

        }

    }

}


// ============================================================
// UPDATE INVENTORY SUMMARY
// ============================================================

function updateInventorySummary() {

    const totalProducts =
        allInventory.length;


    let totalStock = 0;

    let availableProducts = 0;

    let lowStockProducts = 0;

    let outOfStockProducts = 0;


    allInventory.forEach(product => {

        const quantity =
            getQuantity(product);


        totalStock += quantity;


        if (quantity <= 0) {

            outOfStockProducts++;

        }
        else if (quantity < 10) {

            lowStockProducts++;

        }
        else {

            availableProducts++;

        }

    });


    setText(
        "totalInventoryProducts",
        totalProducts
    );


    setText(
        "totalInventoryStock",
        totalStock
    );


    setText(
        "availableInventory",
        availableProducts
    );


    setText(
        "lowInventory",
        lowStockProducts
    );


    setText(
        "outOfStockInventory",
        outOfStockProducts
    );

}


// ============================================================
// GET QUANTITY
// ============================================================

function getQuantity(product) {

    const quantity =
        Number(
            product.quantity ??
            product.stock ??
            product.available_quantity ??
            0
        );


    if (!Number.isFinite(quantity)) {

        return 0;

    }


    return Math.max(
        0,
        quantity
    );

}


// ============================================================
// RENDER INVENTORY
// ============================================================

function renderInventory(products) {

    const tableBody =
        document.getElementById(
            "inventoryTableBody"
        );


    if (!tableBody) {
        return;
    }


    if (!products || products.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-box">
                        <strong>
                            No products found
                        </strong>

                        <p>
                            There are no products
                            matching your search.
                        </p>
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    tableBody.innerHTML =
        products.map(product => {

            const productName =
                escapeHTML(
                    product.product_name ??
                    product.productName ??
                    "Unnamed Product"
                );


            const category =
                escapeHTML(
                    product.category ??
                    "Uncategorized"
                );


            const quantity =
                getQuantity(product);


            const stockInfo =
                getStockInfo(quantity);


            return `
                <tr>

                    <td>

                        <div class="user-name-cell">

                            <div class="user-table-avatar">
                                ${getInitial(productName)}
                            </div>

                            <div>
                                <strong>
                                    ${productName}
                                </strong>
                            </div>

                        </div>

                    </td>


                    <td>
                        ${category}
                    </td>


                    <td>

                        <strong class="quantity-value">
                            ${quantity}
                        </strong>

                    </td>


                    <td>

                        <div class="stock-level">

                            <div class="stock-bar">

                                <span
                                    class="${stockInfo.barClass}"
                                    style="width: ${stockInfo.percentage}%"
                                ></span>

                            </div>

                            <small>
                                ${stockInfo.label}
                            </small>

                        </div>

                    </td>


                    <td>

                        <span
                            class="status-badge ${stockInfo.statusClass}"
                        >
                            ${stockInfo.status}
                        </span>

                    </td>

                </tr>
            `;

        }).join("");

}


// ============================================================
// STOCK STATUS
// ============================================================

function getStockInfo(quantity) {

    if (quantity <= 0) {

        return {

            status: "Out of Stock",

            statusClass:
                "status-inactive",

            barClass:
                "stock-bar-out",

            percentage: 0,

            label:
                "No stock"

        };

    }


    if (quantity < 10) {

        const percentage =
            Math.min(
                100,
                Math.max(
                    15,
                    quantity * 10
                )
            );


        return {

            status: "Low Stock",

            statusClass:
                "status-pending",

            barClass:
                "stock-bar-low",

            percentage:
                percentage,

            label:
                `${quantity} units`

        };

    }


    const percentage =
        Math.min(
            100,
            Math.max(
                25,
                Math.round(
                    (quantity / 50) * 100
                )
            )
        );


    return {

        status: "Available",

        statusClass:
            "status-active",

        barClass:
            "stock-bar-available",

        percentage:
            percentage,

        label:
            `${quantity} units`

    };

}


// ============================================================
// SEARCH + FILTER
// ============================================================

function setupFilters() {

    const searchInput =
        document.getElementById(
            "inventorySearch"
        );


    const stockFilter =
        document.getElementById(
            "inventoryStockFilter"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }


    if (stockFilter) {

        stockFilter.addEventListener(
            "change",
            applyFilters
        );

    }

}


// ============================================================
// APPLY FILTERS
// ============================================================

function applyFilters() {

    const searchInput =
        document.getElementById(
            "inventorySearch"
        );


    const stockFilter =
        document.getElementById(
            "inventoryStockFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const stockType =
        stockFilter
            ? stockFilter.value
            : "all";


    const filtered =
        allInventory.filter(product => {

            const productName =
                String(
                    product.product_name ??
                    product.productName ??
                    ""
                ).toLowerCase();


            const category =
                String(
                    product.category ??
                    ""
                ).toLowerCase();


            const quantity =
                getQuantity(product);


            const matchesSearch =
                !search ||
                productName.includes(search) ||
                category.includes(search);


            let matchesStock = true;


            if (stockType === "available") {

                matchesStock =
                    quantity >= 10;

            }
            else if (stockType === "low") {

                matchesStock =
                    quantity > 0 &&
                    quantity < 10;

            }
            else if (stockType === "out") {

                matchesStock =
                    quantity <= 0;

            }


            return (
                matchesSearch &&
                matchesStock
            );

        });


    renderInventory(filtered);

}


// ============================================================
// LOGOUT
// ============================================================

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


// ============================================================
// HELPER - SET TEXT
// ============================================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ============================================================
// HELPER - INITIAL
// ============================================================

function getInitial(name) {

    if (!name) {
        return "P";
    }


    return name
        .trim()
        .charAt(0)
        .toUpperCase();

}


// ============================================================
// HELPER - HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}
