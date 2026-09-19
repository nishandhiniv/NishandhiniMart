/* =========================================================
   NISHANDHINIMART - ADD / EDIT PRODUCT
========================================================= */

const PRODUCTS_API =
    "http://127.0.0.1:8090/api/products";

const CREATE_PRODUCT_API =
    "http://127.0.0.1:8090/api/create-product";

const UPDATE_PRODUCT_API =
    "http://127.0.0.1:8090/api/update-product";

let selectedImages = [];
let additionalDetailCount = 0;
let editProductId = null;


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadSellerInfo();

    setupProductForm();

    setupImageUpload();

    setupAdditionalDetails();

    setupClearButton();

    checkEditMode();

});


/* =========================================================
   SELLER INFORMATION
========================================================= */

function loadSellerInfo() {

    const sellerName =
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        "Seller";

    const sellerDisplay =
        document.getElementById("sellerDisplayName");

    const topName =
        document.getElementById("topProfileName");

    const topAvatar =
        document.getElementById("topProfileAvatar");

    if (sellerDisplay) {
        sellerDisplay.value = sellerName;
    }

    if (topName) {
        topName.textContent = sellerName;
    }

    if (topAvatar) {
        topAvatar.textContent =
            sellerName.charAt(0).toUpperCase();
    }

}


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
   SETUP FORM
========================================================= */

function setupProductForm() {

    const form =
        document.getElementById("productForm");

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        handleProductSubmit
    );

}


/* =========================================================
   SUBMIT PRODUCT
========================================================= */

async function handleProductSubmit(event) {

    event.preventDefault();

    const sellerId = getSellerId();

    if (!sellerId) {

        showMessage(
            "Seller login information not found. Please login again.",
            "error"
        );

        return;
    }


    /* -----------------------------------------------------
       GET FORM VALUES
    ----------------------------------------------------- */

    const productName =
        document.getElementById("productName")?.value.trim();

    const brand =
        document.getElementById("productBrand")?.value.trim();

    const category =
        document.getElementById("productCategory")?.value;

    const price =
        Number(
            document.getElementById("productPrice")?.value
        );

    const quantity =
        Number(
            document.getElementById("productQuantity")?.value
        );

    const description =
        document.getElementById("productDescription")?.value.trim();


    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (!productName) {

        showMessage(
            "Please enter the product name.",
            "error"
        );

        return;
    }

    if (!category) {

        showMessage(
            "Please select a category.",
            "error"
        );

        return;
    }

    if (
        !Number.isFinite(price) ||
        price <= 0
    ) {

        showMessage(
            "Please enter a valid product price.",
            "error"
        );

        return;
    }

    if (
        !Number.isInteger(quantity) ||
        quantity < 0
    ) {

        showMessage(
            "Please enter a valid quantity.",
            "error"
        );

        return;
    }

    if (!description) {

        showMessage(
            "Please enter a product description.",
            "error"
        );

        return;
    }


    /* -----------------------------------------------------
       ADDITIONAL DETAILS
    ----------------------------------------------------- */

    const additionalDetails =
        collectAdditionalDetails();


    /* -----------------------------------------------------
   IMAGE
----------------------------------------------------- */

let imageValue = "";

if (selectedImages.length > 0) {

    const formData = new FormData();

    formData.append(
        "file",
        selectedImages[0]
    );

    const uploadResponse =
        await fetch(
            "http://127.0.0.1:8090/api/upload-product-image",
            {
                method: "POST",
                body: formData
            }
        );

    const uploadResult =
        await uploadResponse.json();

    if (
        !uploadResponse.ok ||
        !uploadResult.success
    ) {
        throw new Error(
            uploadResult.message ||
            "Image upload failed"
        );
    }

    imageValue =
        uploadResult.image;
}

if (
    editProductId &&
    !imageValue &&
    window.currentProductImage
) {
    imageValue =
        window.currentProductImage;
}
/*
 * During edit:
 * Keep existing image if no new image selected.
 */

if (
    editProductId &&
    !imageValue &&
    window.currentProductImage
) {

    imageValue =
        window.currentProductImage;

}
    /*
     * During edit:
     * Keep existing image if no new image selected.
     */

    if (
        editProductId &&
        !imageValue &&
        window.currentProductImage
    ) {

        imageValue =
            window.currentProductImage;

    }


    /* -----------------------------------------------------
       BUILD PRODUCT DATA
    ----------------------------------------------------- */

    const productData = {

        product_name:
            productName,

        description:
            buildDescription(
                description,
                brand,
                additionalDetails
            ),

        price:
            price,

        image:
            imageValue,

        category:
            category,

        quantity:
            quantity,

        seller_id:
            Number(sellerId)

    };


    /* -----------------------------------------------------
       BUTTON
    ----------------------------------------------------- */

    const publishButton =
        document.getElementById(
            "publishProductBtn"
        );

    const isEditMode =
        !!editProductId;

    if (publishButton) {

        publishButton.disabled = true;

        publishButton.textContent =
            isEditMode
                ? "Updating..."
                : "Publishing...";

    }


    /* -----------------------------------------------------
       API REQUEST
    ----------------------------------------------------- */

    try {

        let url;
        let method;


        if (isEditMode) {

            /*
             * PUT /api/update-product/{id}
             */

            url =
                `${UPDATE_PRODUCT_API}/${editProductId}`;

            method =
                "PUT";

        } else {

            /*
             * POST /api/create-product
             */

            url =
                CREATE_PRODUCT_API;

            method =
                "POST";

        }


        console.log(
            isEditMode
                ? "Updating product:"
                : "Creating product:",
            productData
        );


        const response =
            await fetch(
                url,
                {
                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            productData
                        )
                }
            );


        const responseText =
            await response.text();


        let result = null;


        try {

            result =
                responseText
                    ? JSON.parse(responseText)
                    : null;

        } catch {

            result =
                responseText;

        }


        if (!response.ok) {

            console.error(
                "Product API error:",
                result
            );

            throw new Error(
                getApiErrorMessage(
                    result,
                    response.status
                )
            );

        }


        console.log(
            isEditMode
                ? "Product updated successfully:"
                : "Product created successfully:",
            result
        );


        showMessage(
            isEditMode
                ? "Product updated successfully! 🎉"
                : "Product published successfully! 🎉",
            "success"
        );


        setTimeout(() => {

            window.location.href =
                "my-products.html";

        }, 1200);


    } catch (error) {

        console.error(
            "Product save error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to save product. Please try again.",
            "error"
        );


    } finally {

        if (publishButton) {

            publishButton.disabled = false;

            publishButton.textContent =
                isEditMode
                    ? "Update Product"
                    : "+ Publish Product";

        }

    }

}


/* =========================================================
   BUILD DESCRIPTION
========================================================= */

function buildDescription(
    description,
    brand,
    details
) {

    let finalDescription =
        description;


    if (brand) {

        finalDescription =
            `Brand: ${brand}\n\n${finalDescription}`;

    }


    if (
        details &&
        details.length > 0
    ) {

        const detailText =
            details
                .map(
                    detail =>
                        `${detail.name}: ${detail.value}`
                )
                .join("\n");


        finalDescription =
            `${finalDescription}\n\nAdditional Details:\n${detailText}`;

    }


    return finalDescription;

}


/* =========================================================
   IMAGE UPLOAD
========================================================= */

function setupImageUpload() {

    const input =
        document.getElementById(
            "productImages"
        );

    if (!input) {
        return;
    }

    input.addEventListener(
        "change",
        handleImageSelection
    );

}


/* =========================================================
   HANDLE IMAGE SELECTION
========================================================= */

function handleImageSelection(event) {

    const files =
        Array.from(
            event.target.files || []
        );


    if (files.length > 4) {

        alert(
            "You can select a maximum of 4 images."
        );

        event.target.value = "";

        selectedImages = [];

        renderImagePreview();

        return;
    }


    const invalidFile =
        files.find(
            file =>
                !file.type.startsWith("image/")
        );


    if (invalidFile) {

        alert(
            "Please select image files only."
        );

        event.target.value = "";

        selectedImages = [];

        renderImagePreview();

        return;
    }


    const largeFile =
        files.find(
            file =>
                file.size > 5 * 1024 * 1024
        );


    if (largeFile) {

        alert(
            "Each image must be smaller than 5 MB."
        );

        event.target.value = "";

        selectedImages = [];

        renderImagePreview();

        return;
    }


    selectedImages =
        files;


    renderImagePreview();

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function renderImagePreview() {

    const container =
        document.getElementById(
            "imagePreviewContainer"
        );

    if (!container) {
        return;
    }


    container.innerHTML = "";


    selectedImages.forEach(
        (file, index) => {

            const wrapper =
                document.createElement("div");


            wrapper.style.cssText = `
                position:relative;
                border:1px solid #e7e3f4;
                border-radius:12px;
                overflow:hidden;
                background:#faf9ff;
                aspect-ratio:1;
            `;


            const image =
                document.createElement("img");


            image.src =
                URL.createObjectURL(file);

            image.alt =
                `Product image ${index + 1}`;


            image.style.cssText = `
                width:100%;
                height:100%;
                object-fit:cover;
                display:block;
            `;


            const number =
                document.createElement("span");


            number.textContent =
                index + 1;


            number.style.cssText = `
                position:absolute;
                top:7px;
                left:7px;
                width:25px;
                height:25px;
                border-radius:50%;
                background:#6654df;
                color:white;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:10px;
                font-weight:700;
            `;


            wrapper.appendChild(image);

            wrapper.appendChild(number);

            container.appendChild(wrapper);

        }
    );

}


/* =========================================================
   ADDITIONAL DETAILS
========================================================= */

function setupAdditionalDetails() {

    const button =
        document.getElementById(
            "addDetailBtn"
        );


    if (!button) {
        console.error(
            "addDetailBtn not found."
        );
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            addAdditionalDetail();

        }
    );

}


/* =========================================================
   ADD DETAIL
========================================================= */

function addAdditionalDetail(
    nameValue = "",
    valueValue = ""
) {

    const container =
        document.getElementById(
            "additionalDetailsContainer"
        );


    const hint =
        document.getElementById(
            "detailsHint"
        );


    if (!container) {

        console.error(
            "additionalDetailsContainer not found."
        );

        return;
    }


    additionalDetailCount++;


    const row =
        document.createElement("div");


    row.className =
        "additional-detail-row";


    row.dataset.detailId =
        additionalDetailCount;


    /*
     * Do NOT use innerHTML for user-entered values.
     */

    const nameInput =
        document.createElement("input");

    nameInput.type =
        "text";

    nameInput.className =
        "detail-name";

    nameInput.placeholder =
        "Detail Name";

    nameInput.maxLength =
        80;

    nameInput.value =
        nameValue;


    const valueInput =
        document.createElement("input");

    valueInput.type =
        "text";

    valueInput.className =
        "detail-value";

    valueInput.placeholder =
        "Detail Value";

    valueInput.maxLength =
        150;

    valueInput.value =
        valueValue;


    const removeButton =
        document.createElement("button");

    removeButton.type =
        "button";

    removeButton.className =
        "remove-detail-btn";

    removeButton.title =
        "Remove";

    removeButton.textContent =
        "×";


    removeButton.addEventListener(
        "click",
        () => {

            row.remove();

            if (
                container.children.length === 0 &&
                hint
            ) {

                hint.style.display =
                    "block";

            }

        }
    );


    row.appendChild(nameInput);

    row.appendChild(valueInput);

    row.appendChild(removeButton);


    container.appendChild(row);


    if (hint) {

        hint.style.display =
            "none";

    }

}


/* =========================================================
   COLLECT ADDITIONAL DETAILS
========================================================= */

function collectAdditionalDetails() {

    const rows =
        document.querySelectorAll(
            ".additional-detail-row"
        );


    const details = [];


    rows.forEach(row => {

        const name =
            row.querySelector(
                ".detail-name"
            )?.value.trim();


        const value =
            row.querySelector(
                ".detail-value"
            )?.value.trim();


        if (
            name &&
            value
        ) {

            details.push({
                name: name,
                value: value
            });

        }

    });


    return details;

}


/* =========================================================
   CLEAR FORM
========================================================= */

function setupClearButton() {

    const button =
        document.getElementById(
            "clearProductBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const confirmed =
                window.confirm(
                    "Clear all entered product details?"
                );


            if (!confirmed) {
                return;
            }


            resetProductForm();

        }
    );

}


/* =========================================================
   RESET FORM
========================================================= */

function resetProductForm() {

    const form =
        document.getElementById(
            "productForm"
        );


    if (form) {
        form.reset();
    }


    selectedImages = [];

    additionalDetailCount = 0;


    const imagePreview =
        document.getElementById(
            "imagePreviewContainer"
        );


    if (imagePreview) {

        imagePreview.innerHTML = "";

    }


    const detailsContainer =
        document.getElementById(
            "additionalDetailsContainer"
        );


    if (detailsContainer) {

        detailsContainer.innerHTML = "";

    }


    const hint =
        document.getElementById(
            "detailsHint"
        );


    if (hint) {

        hint.style.display =
            "block";

    }


    const message =
        document.getElementById(
            "productMessage"
        );


    if (message) {

        message.style.display =
            "none";

        message.textContent =
            "";

    }


    loadSellerInfo();

}


/* =========================================================
   EDIT MODE
========================================================= */

async function checkEditMode() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const editId =
        params.get("edit");


    if (!editId) {
        return;
    }


    editProductId =
        Number(editId);


    if (!editProductId) {

        showMessage(
            "Invalid product ID.",
            "error"
        );

        return;
    }


    const title =
        document.getElementById(
            "pageTitle"
        );


    if (title) {

        title.textContent =
            "Edit Product";

    }


    const publishButton =
        document.getElementById(
            "publishProductBtn"
        );


    if (publishButton) {

        publishButton.textContent =
            "Update Product";

    }


    await loadProductForEdit(
        editProductId
    );

}


/* =========================================================
   LOAD PRODUCT FOR EDIT
========================================================= */

async function loadProductForEdit(
    productId
) {

    try {

        showMessage(
            "Loading product details...",
            "success"
        );


        const response =
            await fetch(
                PRODUCTS_API
            );


        if (!response.ok) {

            throw new Error(
                `Unable to load products. Server returned ${response.status}.`
            );

        }


        const products =
            await response.json();


        const product =
            products.find(
                item =>
                    Number(item.id) ===
                    Number(productId)
            );


        if (!product) {

            showMessage(
                "Product not found.",
                "error"
            );

            return;
        }


        const sellerId =
            Number(
                getSellerId()
            );


        if (
            Number(product.seller_id) !==
            sellerId
        ) {

            showMessage(
                "You are not allowed to edit this product.",
                "error"
            );

            return;
        }


        window.currentProductImage =
            product.image || "";


        setFieldValue(
            "productName",
            product.product_name || ""
        );


        setFieldValue(
            "productCategory",
            product.category || ""
        );


        setFieldValue(
            "productPrice",
            product.price ?? ""
        );


        setFieldValue(
            "productQuantity",
            product.quantity ?? 0
        );


        const parsed =
            parseStoredDescription(
                product.description || ""
            );


        setFieldValue(
            "productBrand",
            parsed.brand
        );


        setFieldValue(
            "productDescription",
            parsed.description
        );


        if (
            parsed.details.length > 0
        ) {

            parsed.details.forEach(
                detail => {

                    addAdditionalDetail(
                        detail.name,
                        detail.value
                    );

                }
            );

        }


        if (product.image) {

            const imagePreview =
                document.getElementById(
                    "imagePreviewContainer"
                );


            if (imagePreview) {

                imagePreview.innerHTML = `

                    <div
                        style="
                            padding:10px;
                            border:1px solid #e7e3f4;
                            border-radius:10px;
                            color:#777;
                            font-size:12px;
                        "
                    >
                        Current image:
                        ${escapeHtml(product.image)}
                    </div>

                `;

            }

        }


        const message =
            document.getElementById(
                "productMessage"
            );


        if (message) {

            message.style.display =
                "none";

        }


        console.log(
            "Product loaded for editing:",
            product
        );


    } catch (error) {

        console.error(
            "Load edit product error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to load product details.",
            "error"
        );

    }

}


/* =========================================================
   PARSE STORED DESCRIPTION
========================================================= */

function parseStoredDescription(
    storedDescription
) {

    let text =
        storedDescription || "";

    let brand =
        "";

    const details = [];


    const brandMatch =
        text.match(
            /^Brand:\s*(.+?)\n\n/s
        );


    if (brandMatch) {

        brand =
            brandMatch[1].trim();


        text =
            text.replace(
                brandMatch[0],
                ""
            );

    }


    const detailsMarker =
        "\n\nAdditional Details:\n";


    const detailsIndex =
        text.indexOf(
            detailsMarker
        );


    if (detailsIndex !== -1) {

        const detailText =
            text.substring(
                detailsIndex +
                detailsMarker.length
            );


        text =
            text.substring(
                0,
                detailsIndex
            );


        detailText
            .split("\n")
            .forEach(line => {

                const separator =
                    line.indexOf(":");


                if (separator !== -1) {

                    const name =
                        line
                            .substring(
                                0,
                                separator
                            )
                            .trim();


                    const value =
                        line
                            .substring(
                                separator + 1
                            )
                            .trim();


                    if (
                        name &&
                        value
                    ) {

                        details.push({
                            name: name,
                            value: value
                        });

                    }

                }

            });

    }


    return {

        brand:
            brand,

        description:
            text.trim(),

        details:
            details

    };

}


/* =========================================================
   SET FIELD VALUE
========================================================= */

function setFieldValue(
    id,
    value
) {

    const field =
        document.getElementById(id);


    if (field) {

        field.value =
            value;

    }

}


/* =========================================================
   API ERROR MESSAGE
========================================================= */

function getApiErrorMessage(
    result,
    status
) {

    if (
        result &&
        typeof result === "object"
    ) {

        if (result.message) {
            return result.message;
        }

        if (result.error) {
            return result.error;
        }

        if (result.errorMessage) {
            return result.errorMessage;
        }

    }


    if (
        typeof result === "string" &&
        result.trim()
    ) {

        return result;

    }


    return (
        `Unable to save product. Server returned ${status}.`
    );

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type
) {

    const box =
        document.getElementById(
            "productMessage"
        );


    if (!box) {
        return;
    }


    box.style.display =
        "block";


    box.textContent =
        message;


    if (type === "success") {

        box.style.background =
            "#eaf8ef";

        box.style.color =
            "#239451";

        box.style.border =
            "1px solid #c9efd7";

    } else {

        box.style.background =
            "#fff0f2";

        box.style.color =
            "#d9586b";

        box.style.border =
            "1px solid #ffd5dc";

    }

}


/* =========================================================
   HTML ESCAPING
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
   CONVERT IMAGE TO DATA URL
========================================================= */

function fileToDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload = () => {

                resolve(
                    reader.result
                );

            };

            reader.onerror = () => {

                reject(
                    new Error(
                        "Unable to read the selected image."
                    )
                );

            };

            reader.readAsDataURL(file);

        }
    );

}