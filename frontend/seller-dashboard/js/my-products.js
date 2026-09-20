/* =========================================================
   NISHANDHINIMART - MY PRODUCTS
========================================================= */

const PRODUCTS_API = "http://127.0.0.1:8090/api/products";

let allProducts = [];
let filteredProducts = [];


/* =========================================================
   GET SELLER ID
========================================================= */

function getSellerId() {
    return (
        localStorage.getItem("userId") ||
        localStorage.getItem("sellerId") ||
        ""
    );
}


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadSellerInfo();

    loadProducts();

    setupSearch();

    setupFilters();

    setupRefresh();

});


/* =========================================================
   SELLER INFORMATION
========================================================= */

function loadSellerInfo() {

    const sellerName =
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        "Seller";

    const storeName =
        localStorage.getItem("store_name") ||
        sellerName;

    const avatar =
        sellerName.charAt(0).toUpperCase();


    const topName =
        document.getElementById("topProfileName");

    const topAvatar =
        document.getElementById("topProfileAvatar");


    if (topName) {
        topName.textContent = sellerName;
    }

    if (topAvatar) {
        topAvatar.textContent = avatar;
    }

}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    const loading =
        document.getElementById("productsLoading");

    const grid =
        document.getElementById("productsGrid");

    const empty =
        document.getElementById("productsEmpty");

    const noSearch =
        document.getElementById("noSearchResult");

    const resultText =
        document.getElementById("productResultText");


    if (loading) {
        loading.style.display = "block";
    }

    if (grid) {
        grid.style.display = "none";
        grid.innerHTML = "";
    }

    if (empty) {
        empty.style.display = "none";
    }

    if (noSearch) {
        noSearch.style.display = "none";
    }


    const sellerId = getSellerId();


    if (!sellerId) {

        showProductsError(
            "Seller login information not found. Please login again."
        );

        return;
    }


    try {

        /*
         * Existing backend API
         */
        const response =
            await fetch(PRODUCTS_API);


        if (!response.ok) {

            throw new Error(
                "Products API returned " + response.status
            );

        }


        const data =
            await response.json();


        /*
         * Backend may return:
         *
         * [...]
         *
         * or
         *
         * { products: [...] }
         */

        if (Array.isArray(data)) {

            allProducts = data;

        } else if (Array.isArray(data.products)) {

            allProducts = data.products;

        } else {

            allProducts = [];

        }


        /*
         * Show only products belonging
         * to the logged-in seller.
         */

        allProducts =
            allProducts.filter(product => {

                return String(
                    product.seller_id
                ) === String(sellerId);

            });


        filteredProducts = [...allProducts];


        populateCategoryFilter();

        updateSummary();

        renderProducts();


        if (resultText) {

            resultText.textContent =
                `${allProducts.length} product${
                    allProducts.length === 1 ? "" : "s"
                } found`;

        }


    } catch (error) {

        console.error(
            "Error loading seller products:",
            error
        );


        showProductsError(
            "Unable to load products. Please make sure the backend is running."
        );

    }

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary() {

    const productCount =
        document.getElementById("productCount");

    const totalAddedStock =
        document.getElementById("totalAddedStock");

    const totalSold =
        document.getElementById("totalSold");

    const totalRemainingStock =
        document.getElementById("totalRemainingStock");


    const added =
        allProducts.reduce(
            (sum, product) =>
                sum + getQuantity(product),
            0
        );


    /*
     * Important:
     *
     * Products API currently gives quantity.
     * Actual sold quantity will come from
     * order data when the Orders system is connected.
     *
     * Until then, sold = 0.
     */

    const sold =
        allProducts.reduce(
            (sum, product) =>
                sum + getSoldQuantity(product),
            0
        );


    const remaining =
        allProducts.reduce(
            (sum, product) =>
                sum + getRemainingQuantity(product),
            0
        );


    if (productCount) {
        productCount.textContent =
            allProducts.length;
    }

    if (totalAddedStock) {
        totalAddedStock.textContent =
            added;
    }

    if (totalSold) {
        totalSold.textContent =
            sold;
    }

    if (totalRemainingStock) {
        totalRemainingStock.textContent =
            remaining;
    }


    updateLowStockAlert();

}


/* =========================================================
   QUANTITY
========================================================= */

function getQuantity(product) {

    const quantity =
        Number(product.quantity);

    return Number.isFinite(quantity)
        ? quantity
        : 0;
}


/* =========================================================
   SOLD QUANTITY
========================================================= */

function getSoldQuantity(product) {

    /*
     * We do NOT create fake sold values.
     *
     * If backend/order data later contains
     * sold_quantity or sold, this function
     * will automatically use it.
     */

    const sold =
        Number(
            product.sold_quantity ??
            product.sold ??
            0
        );

    return Number.isFinite(sold)
        ? Math.max(0, sold)
        : 0;
}


/* =========================================================
   REMAINING QUANTITY
========================================================= */

function getRemainingQuantity(product) {

    const quantity =
        getQuantity(product);

    const sold =
        getSoldQuantity(product);


    /*
     * If product.quantity is currently
     * the available stock in backend,
     * use it directly.
     *
     * If added_quantity exists,
     * calculate Added - Sold.
     */

    if (
        product.added_quantity !== undefined &&
        product.added_quantity !== null
    ) {

        const added =
            Number(product.added_quantity);

        if (Number.isFinite(added)) {

            return Math.max(
                0,
                added - sold
            );

        }

    }


    return quantity;
}


/* =========================================================
   CATEGORY FILTER
========================================================= */

function populateCategoryFilter() {

    const filter =
        document.getElementById("categoryFilter");

    if (!filter) {
        return;
    }


    const currentValue =
        filter.value;


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
        .sort();


    filter.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        filter.appendChild(option);

    });


    if (
        categories.includes(currentValue)
    ) {

        filter.value = currentValue;

    }

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const search =
        document.getElementById("productSearch");


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        applyFilters
    );

}


/* =========================================================
   FILTERS
========================================================= */

function setupFilters() {

    const categoryFilter =
        document.getElementById("categoryFilter");

    const stockFilter =
        document.getElementById("stockFilter");


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
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


/* =========================================================
   APPLY FILTERS
========================================================= */

function applyFilters() {

    const search =
        (
            document.getElementById(
                "productSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const category =
        document.getElementById(
            "categoryFilter"
        )?.value || "all";


    const stock =
        document.getElementById(
            "stockFilter"
        )?.value || "all";


    filteredProducts =
        allProducts.filter(product => {


            /* Search */

            const name =
                String(
                    product.product_name ||
                    product.name ||
                    ""
                ).toLowerCase();


            const description =
                String(
                    product.description ||
                    ""
                ).toLowerCase();


            const productCategory =
                String(
                    product.category ||
                    ""
                ).toLowerCase();


            const matchesSearch =
                !search ||
                name.includes(search) ||
                description.includes(search) ||
                productCategory.includes(search);


            if (!matchesSearch) {
                return false;
            }


            /* Category */

            if (
                category !== "all" &&
                String(
                    product.category || ""
                ) !== category
            ) {

                return false;

            }


            /* Stock */

            const quantity =
                getRemainingQuantity(product);


            if (
                stock === "available" &&
                quantity <= 0
            ) {

                return false;

            }


            if (
                stock === "low" &&
                (
                    quantity <= 0 ||
                    quantity > 10
                )
            ) {

                return false;

            }


            if (
                stock === "out" &&
                quantity > 0
            ) {

                return false;

            }


            return true;

        });


    renderProducts();

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const loading =
        document.getElementById("productsLoading");

    const grid =
        document.getElementById("productsGrid");

    const empty =
        document.getElementById("productsEmpty");

    const noSearch =
        document.getElementById("noSearchResult");

    const resultText =
        document.getElementById("productResultText");


    if (loading) {
        loading.style.display = "none";
    }


    if (resultText) {

        resultText.textContent =
            `${filteredProducts.length} product${
                filteredProducts.length === 1
                    ? ""
                    : "s"
            } found`;

    }


    /*
     * No products at all
     */

    if (
        allProducts.length === 0
    ) {

        if (grid) {
            grid.style.display = "none";
        }

        if (empty) {
            empty.style.display = "block";
        }

        if (noSearch) {
            noSearch.style.display = "none";
        }

        return;
    }


    /*
     * Products exist but filters
     * produced no result.
     */

    if (
        filteredProducts.length === 0
    ) {

        if (grid) {
            grid.style.display = "none";
        }

        if (empty) {
            empty.style.display = "none";
        }

        if (noSearch) {
            noSearch.style.display = "block";
        }

        return;
    }


    if (empty) {
        empty.style.display = "none";
    }

    if (noSearch) {
        noSearch.style.display = "none";
    }

    if (grid) {

        grid.style.display = "grid";

        grid.innerHTML = "";

        filteredProducts.forEach(
            product => {

                grid.appendChild(
                    createProductCard(product)
                );

            }
        );

    }

}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(product) {

    const card =
        document.createElement("article");

    card.className =
        "seller-product-card";


    const productId =
        product.id;


    const name =
        escapeHtml(
            product.product_name ||
            product.name ||
            "Unnamed Product"
        );


    const category =
        escapeHtml(
            product.category ||
            "Uncategorized"
        );


    const description =
        escapeHtml(
            product.description ||
            "No description available."
        );


    const price =
        Number(product.price || 0);


    const quantity =
        getQuantity(product);


    const sold =
        getSoldQuantity(product);


    const remaining =
        getRemainingQuantity(product);


    const stockStatus =
        getStockStatus(remaining);


    const progress =
        calculateProgress(
            quantity,
            remaining
        );


    const image =
        String(
            product.image || ""
        ).trim();


    let imageHTML;


if (image) {

    const cleanImage =
    image.replace(/^images[\\/]+/i, "");

const imageUrl =
    `http://127.0.0.1:5500/frontend/seller-dashboard/images/${encodeURIComponent(cleanImage)}`;
    
    imageHTML = `
        <img
            src="${imageUrl}"
            alt="${name}"
            onerror="this.style.display='none'; this.parentElement.querySelector('.no-image').style.display='block';"
        >

        <div
            class="no-image"
            style="display:none;"
        >
            📦
        </div>
    `;
}else {

        imageHTML = `
            <div class="no-image">
                📦
            </div>
        `;

    }


    card.innerHTML = `

        <div class="seller-product-image">

            ${imageHTML}

        </div>


        <div class="seller-product-info">

            <span class="product-category">
                ${category}
            </span>


            <h3>
                ${name}
            </h3>


            <p>
                ${description}
            </p>


            <div class="seller-product-bottom">

                <span class="seller-product-price">
                    ₹${price.toFixed(2)}
                </span>


                <span class="
                    status-badge
                    ${stockStatus.className}
                ">
                    ${stockStatus.text}
                </span>

            </div>


            <div
                style="
                    margin-top:16px;
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:8px;
                "
            >

                <div
                    style="
                        background:#faf9ff;
                        border:1px solid #eeeef5;
                        border-radius:9px;
                        padding:9px;
                    "
                >

                    <small
                        style="
                            display:block;
                            color:#9997aa;
                            font-size:9px;
                        "
                    >
                        ADDED
                    </small>

                    <strong
                        style="
                            color:#45415f;
                            font-size:13px;
                        "
                    >
                        ${quantity}
                    </strong>

                </div>


                <div
                    style="
                        background:#faf9ff;
                        border:1px solid #eeeef5;
                        border-radius:9px;
                        padding:9px;
                    "
                >

                    <small
                        style="
                            display:block;
                            color:#9997aa;
                            font-size:9px;
                        "
                    >
                        SOLD
                    </small>

                    <strong
                        style="
                            color:#45415f;
                            font-size:13px;
                        "
                    >
                        ${sold}
                    </strong>

                </div>

            </div>


            <div
                style="
                    margin-top:10px;
                "
            >

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        margin-bottom:6px;
                    "
                >

                    <span
                        style="
                            color:#9290a5;
                            font-size:10px;
                        "
                    >
                        Remaining
                    </span>

                    <strong
                        style="
                            color:#514d6d;
                            font-size:10px;
                        "
                    >
                        ${remaining}
                    </strong>

                </div>


                <div class="stock-bar">

                    <div
                        class="
                            stock-progress
                            ${getProgressClass(remaining)}
                        "
                        style="
                            width:${progress}%;
                        "
                    ></div>

                </div>

            </div>


            <div
                class="product-actions"
                style="
                    margin-top:14px;
                    justify-content:flex-end;
                "
            >

                <button
                    type="button"
                    class="edit-product-btn"
                    onclick="editProduct(${Number(productId)})"
                >
                    ✏️ Edit
                </button>


                <button
                    type="button"
                    class="delete-product-btn"
                    onclick="deleteProduct(${Number(productId)})"
                >
                    🗑️ Delete
                </button>

            </div>

        </div>

    `;


    return card;

}


/* =========================================================
   STOCK STATUS
========================================================= */

function getStockStatus(quantity) {

    if (quantity <= 0) {

        return {
            text: "Out of Stock",
            className: "status-out"
        };

    }


    if (quantity <= 10) {

        return {
            text: "Low Stock",
            className: "status-low"
        };

    }


    return {
        text: "In Stock",
        className: "status-active"
    };

}


/* =========================================================
   PROGRESS
========================================================= */

function calculateProgress(
    added,
    remaining
) {

    if (added <= 0) {
        return remaining > 0 ? 100 : 0;
    }


    const percentage =
        (remaining / added) * 100;


    return Math.min(
        100,
        Math.max(
            0,
            percentage
        )
    );

}


/* =========================================================
   PROGRESS CLASS
========================================================= */

function getProgressClass(
    remaining
) {

    if (remaining <= 0) {
        return "danger";
    }


    if (remaining <= 10) {
        return "low";
    }


    return "";

}


/* =========================================================
   LOW STOCK ALERT
========================================================= */

function updateLowStockAlert() {

    const alert =
        document.getElementById(
            "lowStockAlert"
        );

    const list =
        document.getElementById(
            "lowStockList"
        );


    if (!alert || !list) {
        return;
    }


    const lowStockProducts =
        allProducts.filter(
            product =>
                getRemainingQuantity(product) <= 10
        );


    if (
        lowStockProducts.length === 0
    ) {

        alert.style.display = "none";

        list.innerHTML = "";

        return;
    }


    alert.style.display = "block";


    list.innerHTML =
        lowStockProducts
            .map(product => {

                const name =
                    escapeHtml(
                        product.product_name ||
                        product.name ||
                        "Unnamed Product"
                    );


                const quantity =
                    getRemainingQuantity(product);


                const status =
                    quantity <= 0
                        ? "Out of Stock"
                        : "Only " + quantity + " left";


                return `

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            gap:15px;
                            padding:13px 0;
                            border-bottom:1px solid #f0eef6;
                        "
                    >

                        <div>

                            <strong
                                style="
                                    color:#45415f;
                                    font-size:12px;
                                "
                            >
                                ${name}
                            </strong>

                            <p
                                style="
                                    color:#9997aa;
                                    font-size:10px;
                                    margin-top:4px;
                                "
                            >
                                ${status}
                            </p>

                        </div>


                        <span
                            class="
                                status-badge
                                ${
                                    quantity <= 0
                                        ? "status-out"
                                        : "status-low"
                                }
                            "
                        >
                            ${
                                quantity <= 0
                                    ? "Out of Stock"
                                    : "Low Stock"
                            }
                        </span>

                    </div>

                `;

            })
            .join("");

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(productId) {

    if (!productId) {
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
        "this product";


    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${productName}"?`
        );


    if (!confirmed) {
        return;
    }

    try {

    const sellerId =
        localStorage.getItem("userId") ||
        localStorage.getItem("sellerId") ||
        "";

    const response =
        await fetch(
            `http://127.0.0.1:8090/api/delete-product/${productId}`,
            {
                method: "DELETE",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    seller_id: Number(sellerId)
                })
            }
        );    
        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                `Delete failed: ${response.status}`
            );

        }


        alert(
            "Product deleted successfully."
        );


        await loadProducts();


    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );


        alert(
            "Unable to delete the product. Please try again."
        );

    }

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(productId) {

    if (!productId) {
        return;
    }


    /*
     * Add Product page will handle
     * edit mode later.
     */

    window.location.href =
        `add-product.html?edit=${encodeURIComponent(productId)}`;

}


/* =========================================================
   REFRESH
========================================================= */

function setupRefresh() {

    const button =
        document.getElementById(
            "refreshProductsBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async () => {

            button.disabled = true;

            button.textContent =
                "↻ Loading...";


            await loadProducts();


            button.disabled = false;

            button.textContent =
                "↻ Refresh";

        }
    );

}


/* =========================================================
   ERROR DISPLAY
========================================================= */

function showProductsError(message) {

    const loading =
        document.getElementById(
            "productsLoading"
        );

    const grid =
        document.getElementById(
            "productsGrid"
        );

    const empty =
        document.getElementById(
            "productsEmpty"
        );

    const noSearch =
        document.getElementById(
            "noSearchResult"
        );

    const resultText =
        document.getElementById(
            "productResultText"
        );


    if (loading) {
        loading.style.display = "none";
    }

    if (grid) {
        grid.style.display = "none";
    }

    if (empty) {
        empty.style.display = "none";
    }

    if (noSearch) {

        noSearch.style.display =
            "block";

        noSearch.innerHTML = `

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Unable to Load Products
            </h3>

            <p>
                ${escapeHtml(message)}
            </p>

        `;

    }

    if (resultText) {
        resultText.textContent =
            "Unable to load products";
    }

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   ATTRIBUTE ESCAPE
========================================================= */

function escapeAttribute(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}