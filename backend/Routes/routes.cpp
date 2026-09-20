#include "./route.h"
#include <drogon/drogon.h>
#include <functional>
#include <string>
#include <utility>
#include "../Chatbot/ChatbotController.h"

using namespace drogon;


// =========================================================
// AUTH SERVICE FUNCTIONS
// =========================================================

void authenticateUser(
    const std::string &username,
    const std::string &password,
    std::function<void(const Json::Value &)> callback
);


// =========================================================
// AUTH CONTROLLER FUNCTIONS
// =========================================================

void loginUser(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);

void registerUser(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);

void changePassword(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);
void updateSellerProfile(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);
void updateSellerVerificationDetails(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);

// =========================================================
// PRODUCT CONTROLLER FUNCTIONS
// =========================================================

void getProducts(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);

void createProduct(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);

void uploadProductImage(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);

void updateProduct(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    int productId
);

void removeProduct(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    int productId
);


// =========================================================
// ADMIN CONTROLLER FUNCTIONS
// =========================================================

void getAllUsers(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);
void getAllOrders(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback
);

void deleteUser(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    int userId
);

void getAllProducts(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);

void deleteProduct(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    int productId
);

void updateVerificationStatus(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);

// =========================================================
// ORDER CONTROLLER FUNCTIONS
// =========================================================

void createOrder(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);

void addOrderItem(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);

void getUserOrders(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    int userId
);
void getSellerOrders(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);
void updateOrderStatus(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback
);


// =========================================================
// CART CONTROLLER FUNCTIONS
// =========================================================

void addToCart(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);

void getCart(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);

void removeFromCart(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);


// =========================================================
// REVIEW CONTROLLER FUNCTIONS
// =========================================================

void addReview(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);

void getProductReviews(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
);


// =========================================================
// REGISTER ALL ROUTES
// =========================================================

void registerRoutes()
{
    // =====================================================
    // BASIC CONTROLLER TEST
    // =====================================================

    app().registerHandler(
        "/api/controller",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            Json::Value response;
            response["success"] = true;
            response["message"] =
                "Controller test route is working";

            callback(
                HttpResponse::newHttpJsonResponse(response)
            );
        },
        {Get}
    );


    // =====================================================
    // PRODUCT - GET PRODUCTS
    // =====================================================

    app().registerHandler(
        "/api/products",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            getProducts(
                req,
                std::move(callback)
            );
        },
        {Get}
    );


    // =====================================================
    // AUTH SERVICE - LOGIN DATABASE TEST
    // =====================================================

    app().registerHandler(
        "/api/auth",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            auto jsonBody = req->getJsonObject();

            if (!jsonBody)
            {
                Json::Value response;
                response["success"] = false;
                response["message"] = "Invalid JSON body";

                callback(
                    HttpResponse::newHttpJsonResponse(response)
                );

                return;
            }

            std::string username =
                (*jsonBody)["username"].asString();

            std::string password =
                (*jsonBody)["password"].asString();

            authenticateUser(
                username,
                password,

                [callback](const Json::Value &response)
                {
                    callback(
                        HttpResponse::newHttpJsonResponse(response)
                    );
                }
            );
        },
        {Post}
    );


    // =====================================================
    // AUTH CONTROLLER - LOGIN
    // =====================================================

    app().registerHandler(
        "/api/login",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            loginUser(
                req,
                std::move(callback)
            );
        },
        {Post}
    );


    // =====================================================
    // AUTH CONTROLLER - REGISTER
    // =====================================================

    app().registerHandler(
        "/api/register",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            registerUser(
                req,
                std::move(callback)
            );
        },
        {Post}
    );

    // =====================================================
// AUTH CONTROLLER - CHANGE PASSWORD
// =====================================================

app().registerHandler(
    "/api/change-password",
    [](const HttpRequestPtr &req,
       std::function<void(const HttpResponsePtr &)> &&callback)
    {
        changePassword(
            req,
            std::move(callback)
        );
    },
    {Post}
);
app().registerHandler(
    "/api/update-seller-profile",
    [](const HttpRequestPtr &req,
       std::function<void(const HttpResponsePtr &)> &&callback)
    {
        updateSellerProfile(
            req,
            std::move(callback)
        );
    },
    {Post}
);
app().registerHandler(
    "/api/update-seller-verification",
    [](const HttpRequestPtr &req,
       std::function<void(const HttpResponsePtr &)> &&callback)
    {
        updateSellerVerificationDetails(
            req,
            std::move(callback)
        );
    },
    {Post}
);
    // =====================================================
    // ADMIN - GET ALL USERS
    // =====================================================

    app().registerHandler(
        "/api/admin-users",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            getAllUsers(
                req,
                std::move(callback)
            );
        },
        {Get}
    );
  // =========================================================
// ADMIN - GET ALL ORDERS
// =========================================================

app().registerHandler(
    "/api/admin-orders",
    [](const HttpRequestPtr &req,
       std::function<void(const HttpResponsePtr &)> &&callback)
    {
        getAllOrders(
            req,
            std::move(callback)
        );
    },
    {Get}
);

    // =====================================================
    // ADMIN - GET ALL PRODUCTS
    // =====================================================

    app().registerHandler(
        "/api/admin-products",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            getAllProducts(
                req,
                std::move(callback)
            );
        },
        {Get}
    );
    // =====================================================
// ADMIN - DELETE PRODUCT
// =====================================================

app().registerHandler(
    "/api/admin-delete-product/{1}",
    [](const HttpRequestPtr &req,
       std::function<void(const HttpResponsePtr &)> &&callback,
       int productId)
    {
        deleteProduct(
            req,
            std::move(callback),
            productId
        );
    },
    {Delete}
);
    // =====================================================
// ADMIN - UPDATE SELLER VERIFICATION STATUS
// =====================================================

app().registerHandler(
    "/api/update-verification-status",
    [](const HttpRequestPtr &req,
       std::function<void(const HttpResponsePtr &)> &&callback)
    {
        updateVerificationStatus(
            req,
            std::move(callback)
        );
    },
    {Put}
);
app().registerHandler(
    "/api/update-order-status",
    &updateOrderStatus,
    {Post}
);
    // =====================================================
// PRODUCT - UPLOAD IMAGE
// =====================================================

app().registerHandler(
    "/api/upload-product-image",
    [](const HttpRequestPtr &req,
       std::function<void(const HttpResponsePtr &)> &&callback)
    {
        uploadProductImage(
            req,
            std::move(callback)
        );
    },
    {Post}
);

    // =====================================================
    // PRODUCT - CREATE PRODUCT
    // =====================================================

    app().registerHandler(
        "/api/create-product",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            createProduct(
                req,
                std::move(callback)
            );
        },
        {Post}
    );


    // =====================================================
    // PRODUCT - UPDATE PRODUCT
    // =====================================================

    app().registerHandler(
        "/api/update-product/{1}",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback,
           int productId)
        {
            updateProduct(
                req,
                std::move(callback),
                productId
            );
        },
        {Put}
    );


    // =====================================================
    // PRODUCT - DELETE PRODUCT
    // =====================================================

    app().registerHandler(
        "/api/delete-product/{1}",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback,
           int productId)
        {
            removeProduct(
                req,
                std::move(callback),
                productId
            );
        },
        {Delete}
    );


    // =====================================================
    // ADMIN - DELETE USER
    // =====================================================

    app().registerHandler(
        "/api/delete-user/{1}",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback,
           int userId)
        {
            deleteUser(
                req,
                std::move(callback),
                userId
            );
        },
        {Delete}
    );


    // =====================================================
    // ORDER - CREATE ORDER
    // =====================================================

    app().registerHandler(
        "/api/create-order",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            createOrder(
                req,
                std::move(callback)
            );
        },
        {Post}
    );


    // =====================================================
    // ORDER - ADD ORDER ITEM
    // =====================================================

    app().registerHandler(
        "/api/order-item",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            addOrderItem(
                req,
                std::move(callback)
            );
        },
        {Post}
    );


    // =====================================================
    // ORDER - GET USER ORDERS
    // =====================================================

    app().registerHandler(
        "/api/user-orders/{1}",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback,
           int userId)
        {
            getUserOrders(
                req,
                std::move(callback),
                userId
            );
        },
        {Get}
    );
// =====================================================
// SELLER - GET SELLER ORDERS
// =====================================================

app().registerHandler(
    "/api/seller/orders",
    [](const HttpRequestPtr &req,
       std::function<void(const HttpResponsePtr &)> &&callback)
    {
        getSellerOrders(
            req,
            std::move(callback)
        );
    },
    {Get}
);

    // =====================================================
    // CART - ADD TO CART
    // =====================================================

    app().registerHandler(
        "/api/add-cart",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            addToCart(
                req,
                std::move(callback)
            );
        },
        {Post}
    );


    // =====================================================
    // CART - GET CART
    // =====================================================

    app().registerHandler(
        "/api/get-cart",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            getCart(
                req,
                std::move(callback)
            );
        },
        {Get}
    );


    // =====================================================
    // CART - REMOVE FROM CART
    // =====================================================

    app().registerHandler(
        "/api/remove-cart",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            removeFromCart(
                req,
                std::move(callback)
            );
        },
        {Delete}
    );


    // =====================================================
    // REVIEW - ADD REVIEW
    // =====================================================

    app().registerHandler(
        "/api/add-review",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            addReview(
                req,
                std::move(callback)
            );
        },
        {Post}
    );


    // =====================================================
    // REVIEW - GET PRODUCT REVIEWS
    // =====================================================

    app().registerHandler(
        "/api/product-reviews",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            getProductReviews(
                req,
                std::move(callback)
            );
        },
        {Get}
    );
        // =====================================================
    // CHATBOT
    // =====================================================

    registerChatbotRoutes();
}