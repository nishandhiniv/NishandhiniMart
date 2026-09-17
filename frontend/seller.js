const PRODUCTS_API = "http://127.0.0.1:8090/api/products";

let sellerProducts = [];


// Check seller login
function checkSellerLogin() {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("userRole");

    if (!userId || role !== "seller") {
        alert("Please login as seller.");
        window.location.href = "login.html";
        return false;
    }

    return true;
}


// Get image path
function getSellerImagePath(image) {
    if (!image) {
        return "";
    }

    image = image.replace(/^\/+/, "");

    if (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("data:")
    ) {
        return image;
    }

    return `http://127.0.0.1:8090/${image}`;
}


// Load seller products
async function loadSellerProducts() {
    const grid = document.getElementById("sellerProductsGrid");
    const noProducts = document.getElementById("sellerNoProducts");

    try {
        const response = await fetch(PRODUCTS_API);

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const result = await response.json();

        sellerProducts = Array.isArray(result)
            ? result
            : result.products || [];

        const sellerId = Number(localStorage.getItem("userId"));

        const filteredProducts = sellerProducts.filter(product => {
            return Number(product.seller_id) === sellerId;
        });

        document.getElementById("totalProducts").textContent =
            sellerProducts.length;

        document.getElementById("myListings").textContent =
            filteredProducts.length;

        displaySellerProducts(filteredProducts);

    } catch (error) {
        console.error("Seller products error:", error);

        grid.innerHTML = `
            <div class="empty-box" style="grid-column:1/-1;">
                <div class="empty-icon">⚠️</div>
                <h3>Unable to Load Products</h3>
                <p>Make sure the backend server is running.</p>
            </div>
        `;
    }
}


// Display seller products
function displaySellerProducts(products) {
    const grid = document.getElementById("sellerProductsGrid");
    const noProducts = document.getElementById("sellerNoProducts");

    grid.innerHTML = "";

    if (products.length === 0) {
        noProducts.style.display = "block";
        return;
    }

    noProducts.style.display = "none";

    products.forEach(product => {
        const imagePath = getSellerImagePath(product.image);

        const card = document.createElement("div");
        card.className = "seller-product-card";

        card.innerHTML = `
            <div class="seller-product-image">
                ${
                    imagePath
                    ? `<img src="${imagePath}"
                            alt="${product.product_name}"
                            onerror="this.style.display='none';">`
                    : `<div class="no-image">📦</div>`
                }
            </div>

            <div class="seller-product-info">
                <span class="product-category">
                    ${product.category || "General"}
                </span>

                <h3>${product.product_name}</h3>

                <p>
                    ${product.description || "No description available."}
                </p>

                <div class="seller-product-bottom">
                    <span class="seller-product-price">
                        ₹${Number(product.price).toFixed(2)}
                    </span>

                    <button
                        class="delete-product-btn"
                        onclick="deleteProduct(${product.id})"
                    >
                        Delete
                    </button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}


// Add product
document.getElementById("productForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const sellerId = Number(localStorage.getItem("userId"));

    const productData = {
        product_name: document.getElementById("productName").value.trim(),
        description: document.getElementById("productDescription").value.trim(),
        price: Number(document.getElementById("productPrice").value),
        image: document.getElementById("productImage").value.trim(),
        category: document.getElementById("productCategory").value.trim(),
        seller_id: sellerId
    };

    if (!productData.product_name || !productData.category || !productData.price) {
        alert("Please fill all required fields.");
        return;
    }

    try {
        const response = await fetch(PRODUCTS_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            throw new Error("Product creation failed");
        }

        alert("Product added successfully!");

        document.getElementById("productForm").reset();

        loadSellerProducts();

    } catch (error) {
        console.error("Add product error:", error);
        alert("Failed to add product. Please try again.");
    }
});


// Delete product
async function deleteProduct(productId) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(
            `${PRODUCTS_API}/${productId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        alert("Product deleted successfully.");

        loadSellerProducts();

    } catch (error) {
        console.error("Delete product error:", error);
        alert("Unable to delete product.");
    }
}


// Scroll to add product
function scrollToAddProduct() {
    document.getElementById("addProductSection").scrollIntoView({
        behavior: "smooth"
    });
}


// Logout
function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");

    window.location.href = "login.html";
}


// Initial page load
document.addEventListener("DOMContentLoaded", () => {
    if (!checkSellerLogin()) {
        return;
    }

    loadSellerProducts();
});