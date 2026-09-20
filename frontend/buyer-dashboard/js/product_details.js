const API_URL = "http://127.0.0.1:8090/api/products";

let product = null;
let selectedQuantity = 1;
let currentStock = 0;

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");


/* =========================================================
   IMAGE PATH
========================================================= */

function getImagePath(image) {

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

    /*
        Old image values may be:

        images/mobile.jpg
        seller-dashboard/images/mobile.jpg
        mobile.jpg
    */

    cleanImage = cleanImage.replace(
        /^seller-dashboard\/images\//i,
        ""
    );

    cleanImage = cleanImage.replace(
        /^images\//i,
        ""
    );

    return (
        "http://127.0.0.1:5500/frontend/" +
        "seller-dashboard/images/" +
        encodeURIComponent(cleanImage)
    );
}


/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(value) {

    return "₹" +
        Number(value || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );
}


/* =========================================================
   NORMALIZE ADDITIONAL DETAILS
========================================================= */

function normalizeAdditionalDetails(details) {

    if (!details) {
        return [];
    }

    /*
        Case 1:
        [
            { name: "Material", value: "Cotton" },
            { name: "Size", value: "XL" }
        ]
    */

    if (Array.isArray(details)) {

        return details
            .map(item => {

                if (!item) {
                    return null;
                }

                const name =
                    item.name ??
                    item.detail_name ??
                    item.label ??
                    "";

                const value =
                    item.value ??
                    item.detail_value ??
                    "";

                if (
                    String(name).trim() &&
                    String(value).trim()
                ) {
                    return {
                        name: String(name).trim(),
                        value: String(value).trim()
                    };
                }

                return null;
            })
            .filter(Boolean);
    }


    /*
        Case 2:
        JSON string
    */

    if (typeof details === "string") {

        const trimmed = details.trim();

        if (!trimmed) {
            return [];
        }

        try {

            const parsed = JSON.parse(trimmed);

            return normalizeAdditionalDetails(parsed);

        } catch (error) {

            return [];
        }
    }


    /*
        Case 3:
        Object format

        {
            "Material": "Cotton",
            "Size": "XL"
        }
    */

    if (
        typeof details === "object" &&
        !Array.isArray(details)
    ) {

        return Object.entries(details)
            .map(([name, value]) => {

                if (
                    String(name).trim() &&
                    String(value).trim()
                ) {
                    return {
                        name: String(name).trim(),
                        value: String(value).trim()
                    };
                }

                return null;
            })
            .filter(Boolean);
    }

    return [];
}


/* =========================================================
   PARSE ADDITIONAL DETAILS FROM DESCRIPTION
========================================================= */

function parseDescriptionContent(description) {

    const result = {
        cleanDescription: "",
        additionalDetails: []
    };

    if (!description) {
        return result;
    }

    let text = String(description).trim();

    /*
        Find the section created by Seller Add Product.

        Example:

        Brand: Samsung

        Original product description...

        Additional Details:
        RAM: 16 GB
        Storage: 512 GB
        Color: Blue
    */

    const marker = "Additional Details:";

    const markerIndex =
        text.indexOf(marker);


    /* -----------------------------------------
       Extract Additional Details
    ----------------------------------------- */

    if (markerIndex !== -1) {

        const detailsText =
            text
                .substring(
                    markerIndex + marker.length
                )
                .trim();


        const detailLines =
            detailsText
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(Boolean);


        detailLines.forEach(line => {

            const colonIndex =
                line.indexOf(":");

            if (colonIndex === -1) {
                return;
            }

            const name =
                line
                    .substring(0, colonIndex)
                    .trim();

            const value =
                line
                    .substring(colonIndex + 1)
                    .trim();

            if (name && value) {

                result.additionalDetails.push({
                    name: name,
                    value: value
                });

            }

        });


        /*
            Keep only the description before
            "Additional Details:"
        */

        text =
            text
                .substring(0, markerIndex)
                .trim();
    }


    /* -----------------------------------------
       Remove Brand line from description
    ----------------------------------------- */

    const brandMatch =
        text.match(
            /^Brand\s*:\s*(.+?)(?:\r?\n\r?\n|\r?\n|$)/i
        );

    if (brandMatch) {

        text =
            text
                .substring(
                    brandMatch[0].length
                )
                .trim();
    }


    result.cleanDescription = text;

    return result;
}


/* =========================================================
   GET CLEAN PRODUCT DESCRIPTION
========================================================= */

function getCleanProductDescription(description) {

    const parsed =
        parseDescriptionContent(description);

    return parsed.cleanDescription;
}


/* =========================================================
   GET ADDITIONAL DETAILS
========================================================= */

function getProductAdditionalDetails() {

    /*
        First preference:
        Backend structured field
    */

    const possibleSources = [
        product?.additional_details,
        product?.additionalDetails,
        product?.product_additional_details
    ];


    for (const source of possibleSources) {

        const details =
            normalizeAdditionalDetails(source);

        if (details.length > 0) {
            return details;
        }
    }


    /*
        Fallback:
        Details already stored inside description
    */

    const parsed =
        parseDescriptionContent(
            product?.description || ""
        );

    return parsed.additionalDetails;
}


/* =========================================================
   DISPLAY ADDITIONAL DETAILS
========================================================= */

function displayAdditionalDetails() {

    const box =
        document.getElementById(
            "additionalDetailsBox"
        );

    const container =
        document.getElementById(
            "additionalDetailsContainer"
        );

    if (!box || !container) {
        return;
    }


    const details =
        getProductAdditionalDetails();


    /*
        Remove duplicate rows
    */

    const uniqueDetails = [];

    const seen = new Set();

    details.forEach(detail => {

        const key =
            (
                detail.name +
                "|" +
                detail.value
            ).toLowerCase();

        if (!seen.has(key)) {

            seen.add(key);

            uniqueDetails.push(detail);
        }

    });


    /*
        No details:
        Hide complete section
    */

    if (uniqueDetails.length === 0) {

        container.innerHTML = "";

        box.style.display = "none";

        return;
    }


    /*
        Details exist:
        Show section
    */

    container.innerHTML = "";


    uniqueDetails.forEach(detail => {

        const row =
            document.createElement("div");

        row.className =
            "additional-detail-row";


        const name =
            document.createElement("span");

        name.className =
            "additional-detail-name";

        name.textContent =
            detail.name;


        const value =
            document.createElement("span");

        value.className =
            "additional-detail-value";

        value.textContent =
            detail.value;


        row.appendChild(name);
        row.appendChild(value);

        container.appendChild(row);
    });


    box.style.display = "block";
}


/* =========================================================
   LOAD PRODUCT
========================================================= */

async function loadProduct() {

    const loadingMessage =
        document.getElementById(
            "loadingMessage"
        );

    const productContent =
        document.getElementById(
            "productContent"
        );

    const errorMessage =
        document.getElementById(
            "errorMessage"
        );


    try {

        if (!productId) {
            throw new Error(
                "Product ID missing"
            );
        }


        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "Products API failed"
            );
        }


        const data =
            await response.json();


        /*
            Backend response:

            {
                success: true,
                products: [...]
            }

            Also support direct array.
        */

        const products =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(data.products)
                        ? data.products
                        : []
                );


        product =
            products.find(
                item =>
                    String(item.id) ===
                    String(productId)
            );


        if (!product) {

            throw new Error(
                "Product not found"
            );
        }


        displayProduct();


        loadingMessage.style.display =
            "none";

        productContent.style.display =
            "grid";


    } catch (error) {

        console.error(
            "Product details error:",
            error
        );


        loadingMessage.style.display =
            "none";

        errorMessage.style.display =
            "block";
    }
}


/* =========================================================
   DISPLAY PRODUCT
========================================================= */

function displayProduct() {

    const image =
        document.getElementById(
            "productImage"
        );

    const noImage =
        document.getElementById(
            "noImage"
        );

    const category =
        document.getElementById(
            "productCategory"
        );

    const name =
        document.getElementById(
            "productName"
        );

    const shortDescription =
        document.getElementById(
            "shortDescription"
        );

    const price =
        document.getElementById(
            "productPrice"
        );

    const description =
        document.getElementById(
            "productDescription"
        );

    const stockInfo =
        document.getElementById(
            "stockInfo"
        );

    const stockCount =
        document.getElementById(
            "stockCount"
        );

    const sellerInfo =
        document.getElementById(
            "sellerInfo"
        );

    const productContent =
        document.getElementById(
            "productContent"
        );

    const imageCard =
        document.querySelector(
            ".image-card"
        );


    /* =====================================
       PRODUCT NAME
    ===================================== */

    name.textContent =
        product.product_name ||
        "Unnamed Product";


    /* =====================================
       CATEGORY
    ===================================== */

    category.textContent =
        product.category ||
        "General";


    /* =====================================
       DESCRIPTION
    ===================================== */

    const rawDescription =
        product.description || "";


    const cleanDescription =
        getCleanProductDescription(
            rawDescription
        );


    const finalDescription =
        cleanDescription ||
        "No description available.";


    shortDescription.textContent =
        finalDescription;


    description.textContent =
        finalDescription;


    /* =====================================
       ADDITIONAL DETAILS
    ===================================== */

    displayAdditionalDetails();


    /* =====================================
       PRICE
    ===================================== */

    const productPrice =
        Number(product.price || 0);


    price.textContent =
        formatCurrency(productPrice);


    /* =====================================
       IMAGE
    ===================================== */

    const imagePath =
        getImagePath(product.image);


    if (imagePath) {

        image.src =
            imagePath;

        image.alt =
            product.product_name ||
            "Product Image";

        image.style.display =
            "block";

        noImage.style.display =
            "none";

        if (imageCard) {
            imageCard.style.display =
                "block";
        }

        if (productContent) {
            productContent.style.gridTemplateColumns =
                "1.1fr 1fr";
        }


        image.onerror =
            function () {

                /*
                    Image cannot be loaded.
                    Hide image card so the
                    details use full width.
                */

                image.style.display =
                    "none";

                noImage.style.display =
                    "none";


                if (imageCard) {

                    imageCard.style.display =
                        "none";
                }


                if (productContent) {

                    productContent.style.gridTemplateColumns =
                        "1fr";
                }
            };


    } else {

        /*
            No image provided by seller.
        */

        image.style.display =
            "none";

        noImage.style.display =
            "none";


        if (imageCard) {

            imageCard.style.display =
                "none";
        }


        if (productContent) {

            productContent.style.gridTemplateColumns =
                "1fr";
        }
    }


    /* =====================================
       STOCK
    ===================================== */

    currentStock =
        Number(
            product.quantity ??
            product.stock ??
            0
        );


    stockCount.textContent =
        currentStock;


    stockInfo.classList.remove(
        "stock-available",
        "stock-low",
        "stock-out"
    );


    if (currentStock <= 0) {

        stockInfo.textContent =
            "Out of Stock";

        stockInfo.classList.add(
            "stock-out"
        );

    } else if (currentStock <= 5) {

        stockInfo.textContent =
            "Low Stock";

        stockInfo.classList.add(
            "stock-low"
        );

    } else {

        stockInfo.textContent =
            "Available";

        stockInfo.classList.add(
            "stock-available"
        );
    }


    /* =====================================
       SELLER
    ===================================== */

    const sellerName =
        product.seller_name ||
        product.seller ||
        "NishandhiniMart Seller";


    const storeName =
        product.store_name ||
        product.store ||
        "";


    if (storeName) {

        sellerInfo.textContent =
            `${sellerName} • ${storeName}`;

    } else {

        sellerInfo.textContent =
            sellerName;
    }


    /* =====================================
       QUANTITY
    ===================================== */

    createQuantityOptions();

    updateTotal();
}


/* =========================================================
   QUANTITY OPTIONS
========================================================= */

function createQuantityOptions() {

    const select =
        document.getElementById(
            "quantitySelect"
        );


    select.innerHTML = "";


    if (currentStock <= 0) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            "0";

        option.textContent =
            "Out of stock";


        select.appendChild(
            option
        );


        disableButtons();

        return;
    }


    const maxQuantity =
        Math.min(
            currentStock,
            10
        );


    for (
        let i = 1;
        i <= maxQuantity;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            i;

        option.textContent =
            i;


        select.appendChild(
            option
        );
    }


    select.value =
        "1";

    select.disabled =
        false;


    document.getElementById(
        "addToCartBtn"
    ).disabled = false;


    document.getElementById(
        "buyNowBtn"
    ).disabled = false;
}


/* =========================================================
   UPDATE TOTAL
========================================================= */

function updateTotal() {

    const select =
        document.getElementById(
            "quantitySelect"
        );


    selectedQuantity =
        Number(
            select.value || 1
        );


    const price =
        Number(
            product?.price || 0
        );


    const total =
        price *
        selectedQuantity;


    document.getElementById(
        "totalPrice"
    ).textContent =
        formatCurrency(total);
}


/* =========================================================
   DISABLE BUTTONS
========================================================= */

function disableButtons() {

    const addButton =
        document.getElementById(
            "addToCartBtn"
        );

    const buyButton =
        document.getElementById(
            "buyNowBtn"
        );


    if (addButton) {
        addButton.disabled =
            true;
    }


    if (buyButton) {
        buyButton.disabled =
            true;
    }
}


/* =========================================================
   ADD TO CART
========================================================= */

function addToCart() {

    if (!product) {
        return;
    }


    if (currentStock <= 0) {

        alert(
            "This product is out of stock."
        );

        return;
    }


    const quantity =
        Number(
            document.getElementById(
                "quantitySelect"
            ).value
        );


    let cart =
        JSON.parse(
            localStorage.getItem("cart") ||
            "[]"
        );


    const existingIndex =
        cart.findIndex(
            item =>
                String(item.id) ===
                String(product.id)
        );


    if (existingIndex !== -1) {

        cart[existingIndex].quantity +=
            quantity;

        /*
            Do not allow cart quantity
            to exceed available stock.
        */

        if (
            cart[existingIndex].quantity >
            currentStock
        ) {

            cart[existingIndex].quantity =
                currentStock;
        }


    } else {

        cart.push({

            id:
                product.id,

            product_name:
                product.product_name,

            price:
                Number(product.price || 0),

            image:
                product.image || "",

            category:
                product.category || "",

            quantity:
                quantity,

            seller_id:
                product.seller_id || null
        });
    }


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    alert(
        "Product added to cart successfully!"
    );
}


/* =========================================================
   BUY NOW
========================================================= */

function buyNow() {

    if (!product) {
        return;
    }


    if (currentStock <= 0) {

        alert(
            "This product is out of stock."
        );

        return;
    }


    const quantity =
        Number(
            document.getElementById(
                "quantitySelect"
            ).value
        );


    const buyNowItem = {

        id:
            product.id,

        product_name:
            product.product_name,

        price:
            Number(product.price || 0),

        image:
            product.image || "",

        category:
            product.category || "",

        quantity:
            quantity,

        seller_id:
            product.seller_id || null
    };


    localStorage.setItem(
        "buyNowItem",
        JSON.stringify(
            buyNowItem
        )
    );


    window.location.href = "checkout.html";
}


/* =========================================================
   BACK
========================================================= */

function goBack() {

    window.location.href =
        "buyer_dashboard.html";
}


/* =========================================================
   QUANTITY CHANGE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const quantitySelect =
        document.getElementById("quantitySelect");

    const addToCartBtn =
        document.getElementById("addToCartBtn");

    const buyNowBtn =
        document.getElementById("buyNowBtn");

    if (quantitySelect) {
        quantitySelect.addEventListener(
            "change",
            updateTotal
        );
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener(
            "click",
            addToCart
        );
    }

    if (buyNowBtn) {
        buyNowBtn.addEventListener(
            "click",
            buyNow
        );
    }

    loadProduct();
});