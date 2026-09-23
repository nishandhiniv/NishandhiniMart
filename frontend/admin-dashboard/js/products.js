/* =========================================================
   NISHANDHINIMART ADMIN - PRODUCTS PAGE
   ========================================================= */

const BASE_URL = "https://nishandhinimart.onrender.com/api";

let allProducts = [];
let filteredProducts = [];


/* =========================================================
   ADMIN LOGIN CHECK
   ========================================================= */

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


/* =========================================================
   GET ARRAY FROM API RESPONSE
   ========================================================= */

function getArray(result, key = null) {

    if (Array.isArray(result)) {
        return result;
    }

    if (key && Array.isArray(result?.[key])) {
        return result[key];
    }

    if (Array.isArray(result?.data)) {
        return result.data;
    }

    if (Array.isArray(result?.products)) {
        return result.products;
    }

    if (Array.isArray(result?.result)) {
        return result.result;
    }

    return [];
}


/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

async function loadProducts() {

    const tableBody =
        document.getElementById("productsTableBody");


    if (tableBody) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="7">

                    <div class="loading-box">

                        <div class="spinner"></div>

                        <p>
                            Loading products...
                        </p>

                    </div>

                </td>

            </tr>
        `;
    }


    try {

        const response = await fetch(
            `${BASE_URL}/products`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const result =
            await response.json();


        console.log(
            "Products API response:",
            result
        );


        allProducts =
            getArray(result, "products");


        filteredProducts =
            [...allProducts];


        updateProductMetrics();

        populateCategoryFilter();

        renderProducts();


    } catch (error) {

        console.error(
            "Failed to load products:",
            error
        );


        allProducts = [];

        filteredProducts = [];


        updateProductMetrics();


        if (tableBody) {

            tableBody.innerHTML = `
                <tr>

                    <td colspan="7">

                        <div class="empty-box">

                            <div style="font-size:32px;">
                                ⚠️
                            </div>

                            <h3>
                                Unable to load products
                            </h3>

                            <p>
                                Please make sure the backend
                                is running on port 8090.
                            </p>

                            <button
                                type="button"
                                class="refresh-btn"
                                onclick="loadProducts()"
                            >
                                🔄 Try Again
                            </button>

                        </div>

                    </td>

                </tr>
            `;
        }
    }
}


/* =========================================================
   UPDATE PRODUCT METRICS
   ========================================================= */

function updateProductMetrics() {

    const totalProductsElement =
        document.getElementById(
            "totalProducts"
        );


    const totalStockElement =
        document.getElementById(
            "totalStock"
        );


    const lowStockElement =
        document.getElementById(
            "lowStock"
        );


    const outOfStockElement =
        document.getElementById(
            "outOfStock"
        );


    let totalStock = 0;

    let lowStock = 0;

    let outOfStock = 0;


    allProducts.forEach(product => {

        const quantity =
            getProductQuantity(product);


        totalStock += quantity;


        if (quantity === 0) {

            outOfStock++;

        } else if (quantity < 10) {

            lowStock++;
        }

    });


    if (totalProductsElement) {

        totalProductsElement.textContent =
            allProducts.length;
    }


    if (totalStockElement) {

        totalStockElement.textContent =
            totalStock;
    }


    if (lowStockElement) {

        lowStockElement.textContent =
            lowStock;
    }


    if (outOfStockElement) {

        outOfStockElement.textContent =
            outOfStock;
    }
}


/* =========================================================
   GET PRODUCT QUANTITY
   ========================================================= */

function getProductQuantity(product) {

    const value =
        product.quantity ??
        product.stock ??
        product.stock_quantity ??
        0;


    const quantity =
        Number(value);


    if (!Number.isFinite(quantity)) {
        return 0;
    }


    return Math.max(
        0,
        quantity
    );
}


/* =========================================================
   GET PRODUCT PRICE
   ========================================================= */

function getProductPrice(product) {

    const value =
        product.price ??
        product.product_price ??
        0;


    const price =
        Number(value);


    if (!Number.isFinite(price)) {
        return 0;
    }


    return price;
}


/* =========================================================
   POPULATE CATEGORY FILTER
   ========================================================= */

function populateCategoryFilter() {

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    if (!categoryFilter) {
        return;
    }


    const currentValue =
        categoryFilter.value;


    const categories =
        [
            ...new Set(
                allProducts
                    .map(product =>
                        String(
                            product.category || ""
                        ).trim()
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                a.localeCompare(b)
        );


    categoryFilter.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement("option");


        option.value =
            category.toLowerCase();


        option.textContent =
            category;


        categoryFilter.appendChild(
            option
        );
    });


    if (
        categories.some(
            category =>
                category.toLowerCase() ===
                currentValue
        )
    ) {

        categoryFilter.value =
            currentValue;

    } else {

        categoryFilter.value =
            "all";
    }
}


/* =========================================================
   GET STOCK STATUS
   ========================================================= */

function getStockStatus(quantity) {

    if (quantity <= 0) {

        return {
            text: "Out of Stock",
            className: "stock-out"
        };
    }


    if (quantity < 10) {

        return {
            text: "Low Stock",
            className: "stock-low"
        };
    }


    return {
        text: "Available",
        className: "stock-available"
    };
}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts() {

    const tableBody =
        document.getElementById(
            "productsTableBody"
        );


    if (!tableBody) {
        return;
    }


    if (!filteredProducts.length) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="7">

                    <div class="empty-box">

                        <div style="font-size:32px;">
                            📦
                        </div>

                        <h3>
                            No products found
                        </h3>

                        <p>
                            No products match the
                            selected filters.
                        </p>

                    </div>

                </td>

            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        filteredProducts
            .map(product =>
                createProductRow(product)
            )
            .join("");
}


/* =========================================================
   CREATE PRODUCT ROW
   ========================================================= */

function createProductRow(product) {

    const productId =
        Number(product.id) || 0;


    const productName =
        escapeHtml(
            product.product_name ||
            product.productName ||
            "Unnamed Product"
        );


    const category =
        escapeHtml(
            product.category ||
            "Uncategorized"
        );


    const price =
        formatCurrency(
            getProductPrice(product)
        );


    const quantity =
        getProductQuantity(product);


    const sellerId =
        product.seller_id ??
        product.sellerId ??
        "-";


    const stockStatus =
        getStockStatus(quantity);


    return `
        <tr>

            <td>

                <div class="user-name-cell">

                    <div class="user-table-avatar">
                        ${getInitial(
                            product.product_name ||
                            product.productName ||
                            "P"
                        )}
                    </div>

                    <strong>
                        ${productName}
                    </strong>

                </div>

            </td>


            <td>
                ${category}
            </td>


            <td>
                ${price}
            </td>


            <td>
                <strong>
                    ${quantity}
                </strong>
            </td>


            <td>
                ${escapeHtml(
                    String(sellerId)
                )}
            </td>


            <td>

                <span class="
                    status-badge
                    ${stockStatus.className}
                ">
                    ${stockStatus.text}
                </span>

            </td>


            <td>

                <button
                    type="button"
                    class="delete-product-btn"
                    onclick="deleteProduct(${productId})"
                >
                    🗑️ Delete
                </button>

            </td>

        </tr>
    `;
}


/* =========================================================
   SEARCH AND FILTER PRODUCTS
   ========================================================= */

function filterProducts() {

    const searchInput =
        document.getElementById(
            "productSearch"
        );


    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    const stockFilter =
        document.getElementById(
            "stockFilter"
        );


    const searchTerm =
        String(
            searchInput?.value || ""
        )
        .trim()
        .toLowerCase();


    const selectedCategory =
        String(
            categoryFilter?.value ||
            "all"
        )
        .toLowerCase();


    const selectedStock =
        String(
            stockFilter?.value ||
            "all"
        )
        .toLowerCase();


    filteredProducts =
        allProducts.filter(product => {


            const name =
                String(
                    product.product_name ||
                    product.productName ||
                    ""
                ).toLowerCase();


            const category =
                String(
                    product.category ||
                    ""
                ).toLowerCase();


            const quantity =
                getProductQuantity(product);


            const matchesSearch =
                !searchTerm ||
                name.includes(searchTerm) ||
                category.includes(searchTerm);


            const matchesCategory =
                selectedCategory === "all" ||
                category === selectedCategory;


            let matchesStock = true;


            if (
                selectedStock ===
                "available"
            ) {

                matchesStock =
                    quantity >= 10;

            } else if (
                selectedStock ===
                "low"
            ) {

                matchesStock =
                    quantity > 0 &&
                    quantity < 10;

            } else if (
                selectedStock ===
                "out"
            ) {

                matchesStock =
                    quantity <= 0;
            }


            return (
                matchesSearch &&
                matchesCategory &&
                matchesStock
            );
        });


    renderProducts();
}


/* =========================================================
   DELETE PRODUCT
   ========================================================= */

async function deleteProduct(productId) {

    if (!productId) {

        alert(
            "Invalid product ID."
        );

        return;
    }


    const product =
        allProducts.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    const productName =
        product?.product_name ||
        product?.productName ||
        "this product";


    const confirmed =
        confirm(
            `Are you sure you want to delete "${productName}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${BASE_URL}/admin-delete-product/${productId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const responseText =
            await response.text();


        let result = {};


        try {

            result =
                responseText
                    ? JSON.parse(responseText)
                    : {};

        } catch {

            result = {};
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                result.error ||
                `HTTP ${response.status}`
            );
        }


        /*
           Remove immediately from the
           local list after successful
           backend deletion.
        */

        allProducts =
            allProducts.filter(
                item =>
                    Number(item.id) !==
                    Number(productId)
            );


        filteredProducts =
            filteredProducts.filter(
                item =>
                    Number(item.id) !==
                    Number(productId)
            );


        updateProductMetrics();

        populateCategoryFilter();

        renderProducts();


        alert(
            "Product deleted successfully."
        );


    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );


        alert(
            "Unable to delete product.\n\n" +
            error.message
        );
    }
}


/* =========================================================
   FORMAT CURRENCY
   ========================================================= */

function formatCurrency(value) {

    const amount =
        Number(value) || 0;


    return "₹" +
        amount.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
}


/* =========================================================
   GET INITIAL
   ========================================================= */

function getInitial(value) {

    const text =
        String(
            value || "P"
        ).trim();


    return escapeHtml(
        text.charAt(0).toUpperCase() ||
        "P"
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
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


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {
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


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!checkAdminLogin()) {
            return;
        }


        const searchInput =
            document.getElementById(
                "productSearch"
            );


        const categoryFilter =
            document.getElementById(
                "categoryFilter"
            );


        const stockFilter =
            document.getElementById(
                "stockFilter"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                filterProducts
            );
        }


        if (categoryFilter) {

            categoryFilter.addEventListener(
                "change",
                filterProducts
            );
        }


        if (stockFilter) {

            stockFilter.addEventListener(
                "change",
                filterProducts
            );
        }


        loadProducts();
    }
);


