#include <drogon/drogon.h>
#include <json/json.h>
#include "../database/Database.h"

using namespace drogon;
using namespace drogon::orm;

// Get all users
void getAllUsers(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
            "SELECT id, name, username, email, role, "
            "store_name, gst_number, business_license, verification_status "
            "FROM users ORDER BY id",
        [callback](const Result &result)
        {
            Json::Value response(Json::arrayValue);

            for (const auto &row : result)
            {
                Json::Value user;
                user["id"] = row["id"].as<int>();
                user["name"] = row["name"].as<std::string>();
                user["username"] = row["username"].as<std::string>();
                user["email"] = row["email"].as<std::string>();
                user["role"] = row["role"].as<std::string>();
                user["store_name"] = row["store_name"].as<std::string>();
                user["gst_number"] = row["gst_number"].as<std::string>();
                user["business_license"] = row["business_license"].as<std::string>();
                user["verification_status"] = row["verification_status"].as<std::string>();

                response.append(user);
            }

            callback(HttpResponse::newHttpJsonResponse(response));
        },

        [callback](const DrogonDbException &e)
        {
            Json::Value error;
            error["success"] = false;
            error["message"] = e.base().what();

            auto resp = HttpResponse::newHttpJsonResponse(error);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        });
}
// =========================================================
// GET ADMIN USER DETAILS
// =========================================================
// =========================================================
// GET ADMIN USER DETAILS
// =========================================================

void getAdminUserDetails(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    int userId)
{
    auto dbClient = getDatabaseClient();

    // -----------------------------------------------------
    // 1. PROFILE + ACCOUNT DETAILS
    // -----------------------------------------------------

    dbClient->execSqlAsync(
        "SELECT "
        "u.id, "
        "u.name, "
        "u.username, "
        "u.email, "
        "u.role, "
        "u.phone, "
        "u.address, "
        "u.store_name, "
        "u.gst_number, "
        "u.business_license, "
        "u.verification_status "
        "FROM users u "
        "WHERE u.id = $1",

        [callback, dbClient, userId]
        (const Result &result)
        {
            if (result.empty())
            {
                Json::Value error;
                error["success"] = false;
                error["message"] = "User not found";

                auto response =
                    HttpResponse::newHttpJsonResponse(error);

                response->setStatusCode(k404NotFound);
                callback(response);
                return;
            }

            const auto &row = result[0];

            Json::Value response;

            response["success"] = true;

            // -------------------------------------------------
            // PROFILE DETAILS
            // -------------------------------------------------

            Json::Value profile;

            profile["user_id"] =
                row["id"].as<int>();

            profile["name"] =
                row["name"].as<std::string>();

            profile["username"] =
                row["username"].as<std::string>();

            profile["email"] =
                row["email"].as<std::string>();

            profile["role"] =
                row["role"].as<std::string>();

            profile["phone"] =
                row["phone"].isNull()
                    ? ""
                    : row["phone"].as<std::string>();

            // -------------------------------------------------
            // ACCOUNT DETAILS
            // -------------------------------------------------

            Json::Value account;

            account["address"] =
                row["address"].isNull()
                    ? ""
                    : row["address"].as<std::string>();

            account["store_name"] =
                row["store_name"].isNull()
                    ? ""
                    : row["store_name"].as<std::string>();

            account["gst_number"] =
                row["gst_number"].isNull()
                    ? ""
                    : row["gst_number"].as<std::string>();

            account["business_license"] =
                row["business_license"].isNull()
                    ? ""
                    : row["business_license"].as<std::string>();

            account["verification_status"] =
                row["verification_status"].isNull()
                    ? ""
                    : row["verification_status"].as<std::string>();

            response["profile"] = profile;
            response["account"] = account;

            // -------------------------------------------------
            // 2. PURCHASE HISTORY
            // -------------------------------------------------

            dbClient->execSqlAsync(
                "SELECT "
                "o.id AS order_id, "
                "p.product_name, "
                "oi.quantity, "
                "oi.price AS purchase_price, "
                "(oi.quantity * oi.price) AS item_total, "
                "o.status AS order_status, "
                "o.created_at AS order_date "
                "FROM orders o "
                "JOIN order_items oi "
                "ON oi.order_id = o.id "
                "JOIN products p "
                "ON p.id = oi.product_id "
                "WHERE o.user_id = $1 "
                "ORDER BY o.created_at DESC",

                [callback, dbClient, userId, response]
                (const Result &purchaseResult)
                {
                    Json::Value purchases(
                        Json::arrayValue
                    );

                    for (const auto &purchaseRow :
                         purchaseResult)
                    {
                        Json::Value purchase;

                        purchase["order_id"] =
                            purchaseRow["order_id"].as<int>();

                        purchase["product"] =
                            purchaseRow["product_name"]
                                .as<std::string>();

                        purchase["quantity"] =
                            purchaseRow["quantity"].as<int>();

                        purchase["price"] =
                            purchaseRow["purchase_price"]
                                .as<double>();

                        purchase["total"] =
                            purchaseRow["item_total"]
                                .as<double>();

                        purchase["status"] =
                            purchaseRow["order_status"]
                                .as<std::string>();

                        purchase["date"] =
                            purchaseRow["order_date"]
                                .as<std::string>();

                        purchases.append(purchase);
                    }

                    Json::Value updatedResponse = response;

                    updatedResponse["purchase_history"] =
                        purchases;

                    // -----------------------------------------
                    // 3. ORDERS
                    // -----------------------------------------

                    dbClient->execSqlAsync(
                        "SELECT "
                        "id AS order_id, "
                        "total_amount, "
                        "status, "
                        "created_at AS order_date "
                        "FROM orders "
                        "WHERE user_id = $1 "
                        "ORDER BY created_at DESC",

                        [callback, dbClient, userId,
                         updatedResponse]
                        (const Result &orderResult)
                        {
                            Json::Value orders(
                                Json::arrayValue
                            );

                            for (const auto &orderRow :
                                 orderResult)
                            {
                                Json::Value order;

                                order["order_id"] =
                                    orderRow["order_id"]
                                        .as<int>();

                                order["total_amount"] =
                                    orderRow["total_amount"]
                                        .as<double>();

                                order["status"] =
                                    orderRow["status"]
                                        .as<std::string>();

                                order["order_date"] =
                                    orderRow["order_date"]
                                        .as<std::string>();

                                orders.append(order);
                            }

                            Json::Value finalResponse =
                                updatedResponse;

                            finalResponse["orders"] =
                                orders;

                            // ---------------------------------
                            // 4. REVIEWS GIVEN
                            // ---------------------------------

                            dbClient->execSqlAsync(
                                "SELECT "
                                "p.product_name, "
                                "r.rating, "
                                "r.comment, "
                                "r.created_at AS review_date "
                                "FROM reviews r "
                                "JOIN products p "
                                "ON p.id = r.product_id "
                                "WHERE r.user_id = $1 "
                                "ORDER BY r.created_at DESC",

                                [callback, finalResponse]
                                (const Result &reviewResult)
                                {
                                    Json::Value reviews(
                                        Json::arrayValue
                                    );

                                    for (const auto &reviewRow :
                                         reviewResult)
                                    {
                                        Json::Value review;

                                        review["product"] =
                                            reviewRow[
                                                "product_name"
                                            ].as<std::string>();

                                        review["rating"] =
                                            reviewRow[
                                                "rating"
                                            ].as<int>();

                                        review["review"] =
                                            reviewRow[
                                                "comment"
                                            ].as<std::string>();

                                        review["date"] =
                                            reviewRow[
                                                "review_date"
                                            ].as<std::string>();

                                        reviews.append(review);
                                    }

                                    Json::Value result =
                                        finalResponse;

                                    result["reviews_given"] =
                                        reviews;

                                    callback(
                                        HttpResponse::
                                            newHttpJsonResponse(
                                                result
                                            )
                                    );
                                },

                                [callback](
                                    const DrogonDbException &e)
                                {
                                    Json::Value error;

                                    error["success"] =
                                        false;

                                    error["message"] =
                                        e.base().what();

                                    auto response =
                                        HttpResponse::
                                            newHttpJsonResponse(
                                                error
                                            );

                                    response->setStatusCode(
                                        k500InternalServerError
                                    );

                                    callback(response);
                                },

                                userId
                            );
                        },

                        [callback](
                            const DrogonDbException &e)
                        {
                            Json::Value error;

                            error["success"] =
                                false;

                            error["message"] =
                                e.base().what();

                            auto response =
                                HttpResponse::
                                    newHttpJsonResponse(error);

                            response->setStatusCode(
                                k500InternalServerError
                            );

                            callback(response);
                        },

                        userId
                    );
                },

                [callback](
                    const DrogonDbException &e)
                {
                    Json::Value error;

                    error["success"] = false;
                    error["message"] = e.base().what();

                    auto response =
                        HttpResponse::
                            newHttpJsonResponse(error);

                    response->setStatusCode(
                        k500InternalServerError
                    );

                    callback(response);
                },

                userId
            );
        },

        [callback](const DrogonDbException &e)
        {
            Json::Value error;

            error["success"] = false;
            error["message"] = e.base().what();

            auto response =
                HttpResponse::newHttpJsonResponse(error);

            response->setStatusCode(
                k500InternalServerError
            );

            callback(response);
        },

        userId
    );
}

// Delete user
void deleteUser(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    int userId)
{
    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "DELETE FROM users WHERE id = $1",

        [callback](const Result &result)
        {
            Json::Value response;
            response["success"] = true;
            response["message"] = "User deleted successfully";

            callback(HttpResponse::newHttpJsonResponse(response));
        },

        [callback](const DrogonDbException &e)
        {
            Json::Value error;
            error["success"] = false;
            error["message"] = e.base().what();

            auto resp = HttpResponse::newHttpJsonResponse(error);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },

        userId);
}


// Get all products
void getAllProducts(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "SELECT id, product_name, description, price, image, category, quantity, seller_id "
        "FROM products ORDER BY id",

        [callback](const Result &result)
        {
            Json::Value response(Json::arrayValue);

            for (const auto &row : result)
            {
                Json::Value product;
                product["id"] = row["id"].as<int>();
                product["product_name"] =
                    row["product_name"].as<std::string>();
                product["description"] =
                    row["description"].as<std::string>();
                product["price"] =
                    row["price"].as<double>();
                product["image"] =
                    row["image"].as<std::string>();
                product["category"] =
                    row["category"].as<std::string>();
                product["quantity"] =
                    row["quantity"].as<int>();
                product["seller_id"] =
                    row["seller_id"].as<int>();

                response.append(product);
            }

            callback(HttpResponse::newHttpJsonResponse(response));
        },

        [callback](const DrogonDbException &e)
        {
            Json::Value error;
            error["success"] = false;
            error["message"] = e.base().what();

            auto resp = HttpResponse::newHttpJsonResponse(error);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        });
}


// Delete product
void deleteProduct(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    int productId)
{
    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "DELETE FROM products WHERE id = $1",

        [callback](const Result &result)
        {
            Json::Value response;
            response["success"] = true;
            response["message"] = "Product deleted successfully";

            callback(HttpResponse::newHttpJsonResponse(response));
        },

        [callback](const DrogonDbException &e)
        {
            Json::Value error;
            error["success"] = false;
            error["message"] = e.base().what();

            auto resp = HttpResponse::newHttpJsonResponse(error);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },

        productId);
}
// Update seller verification status
void updateVerificationStatus(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();

    if (!json ||
        !json->isMember("user_id") ||
        !json->isMember("verification_status"))
    {
        Json::Value error;
        error["success"] = false;
        error["message"] = "user_id and verification_status are required";

        auto resp = HttpResponse::newHttpJsonResponse(error);
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    int userId = (*json)["user_id"].asInt();
    std::string verificationStatus =
        (*json)["verification_status"].asString();

    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "UPDATE users "
        "SET verification_status = $1 "
        "WHERE id = $2 AND role = 'seller'",

        [callback](const Result &result)
        {
            Json::Value response;
            response["success"] = true;
            response["message"] =
                "Seller verification status updated successfully";

            callback(HttpResponse::newHttpJsonResponse(response));
        },

        [callback](const DrogonDbException &e)
        {
            Json::Value error;
            error["success"] = false;
            error["message"] = e.base().what();

            auto resp = HttpResponse::newHttpJsonResponse(error);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },

        verificationStatus,
        userId);
}
// =========================================================
// GET ALL ORDERS FOR ADMIN
// =========================================================

void getAllOrders(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "SELECT "
        "o.id, "
        "o.user_id, "
        "o.total_amount, "
        "o.status, "
        "o.created_at, "

        "u.name AS buyer_name, "
        "u.username AS buyer_username, "
        "u.email AS buyer_email, "

        "s.id AS seller_id, "
        "s.name AS seller_name, "
        "s.store_name AS store_name "

        "FROM orders o "

        "LEFT JOIN users u "
        "ON o.user_id = u.id "

        "LEFT JOIN LATERAL ( "
            "SELECT DISTINCT "
            "su.id, "
            "su.name, "
            "su.store_name "
            "FROM order_items oi "
            "JOIN products p "
            "ON oi.product_id = p.id "
            "JOIN users su "
            "ON p.seller_id = su.id "
            "WHERE oi.order_id = o.id "
            "AND su.role = 'seller' "
            "LIMIT 1 "
        ") s ON true "

        "ORDER BY o.id DESC",

        [callback](const Result &result)
        {
            Json::Value orders(Json::arrayValue);

            for (const auto &row : result)
            {
                Json::Value order;

                order["id"] =
                    row["id"].as<int>();

                order["user_id"] =
                    row["user_id"].as<int>();

                order["total_amount"] =
                    row["total_amount"].as<double>();

                order["status"] =
                    row["status"].as<std::string>();

                if (!row["created_at"].isNull())
                {
                    order["created_at"] =
                        row["created_at"].as<std::string>();
                }

                // Buyer details
                if (!row["buyer_name"].isNull())
                {
                    order["buyer_name"] =
                        row["buyer_name"].as<std::string>();
                }

                if (!row["buyer_username"].isNull())
                {
                    order["buyer_username"] =
                        row["buyer_username"].as<std::string>();
                }

                if (!row["buyer_email"].isNull())
                {
                    order["buyer_email"] =
                        row["buyer_email"].as<std::string>();
                }

                // Seller details
                if (!row["seller_id"].isNull())
                {
                    order["seller_id"] =
                        row["seller_id"].as<int>();
                }

                if (!row["seller_name"].isNull())
                {
                    order["seller_name"] =
                        row["seller_name"].as<std::string>();
                }

                if (!row["store_name"].isNull())
                {
                    order["store_name"] =
                        row["store_name"].as<std::string>();
                }

                orders.append(order);
            }

            Json::Value responseJson;

            responseJson["success"] = true;
            responseJson["orders"] = orders;

            callback(
                HttpResponse::newHttpJsonResponse(
                    responseJson
                )
            );
        },

        [callback](const DrogonDbException &error)
        {
            Json::Value responseJson;

            responseJson["success"] = false;
            responseJson["message"] =
                error.base().what();

            auto response =
                HttpResponse::newHttpJsonResponse(
                    responseJson
                );

            response->setStatusCode(
                k500InternalServerError
            );

            callback(response);
        }
    );
}