#include <drogon/drogon.h>
#include "../database/Database.h"

using namespace drogon;
using namespace drogon::orm;

// =========================================================
// CREATE ORDER
// =========================================================

void createOrder(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();

    if (!json)
    {
        Json::Value responseJson;
        responseJson["success"] = false;
        responseJson["message"] = "Invalid JSON data";

        callback(HttpResponse::newHttpJsonResponse(responseJson));
        return;
    }

    int userId = (*json)["user_id"].asInt();
    double totalAmount = (*json)["total_amount"].asDouble();

    if (userId <= 0 || totalAmount <= 0)
    {
        Json::Value responseJson;
        responseJson["success"] = false;
        responseJson["message"] = "Invalid order details";

        callback(HttpResponse::newHttpJsonResponse(responseJson));
        return;
    }

    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "INSERT INTO orders "
        "(user_id, total_amount, status) "
        "VALUES ($1, $2, 'Pending') "
        "RETURNING id",

        [callback](const Result &result)
        {
            Json::Value responseJson;

            responseJson["success"] = true;
            responseJson["message"] = "Order created";
            responseJson["order_id"] =
                result[0]["id"].as<int>();

            callback(
                HttpResponse::newHttpJsonResponse(responseJson));
        },

        [callback](const DrogonDbException &error)
        {
            Json::Value responseJson;

            responseJson["success"] = false;
            responseJson["message"] =
                error.base().what();

            auto response =
                HttpResponse::newHttpJsonResponse(responseJson);

            response->setStatusCode(k500InternalServerError);

            callback(response);
        },

        userId,
        totalAmount);
}


// =========================================================
// ADD ORDER ITEM + REDUCE PRODUCT STOCK
// =========================================================

void addOrderItem(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();

    if (!json)
    {
        Json::Value responseJson;
        responseJson["success"] = false;
        responseJson["message"] = "Invalid JSON data";

        callback(HttpResponse::newHttpJsonResponse(responseJson));
        return;
    }

    int orderId =
        (*json)["order_id"].asInt();

    int productId =
        (*json)["product_id"].asInt();

    int quantity =
        (*json)["quantity"].asInt();

    double price =
        (*json)["price"].asDouble();

    if (orderId <= 0 ||
        productId <= 0 ||
        quantity <= 0 ||
        price <= 0)
    {
        Json::Value responseJson;
        responseJson["success"] = false;
        responseJson["message"] =
            "Invalid order item details";

        callback(HttpResponse::newHttpJsonResponse(responseJson));
        return;
    }

    auto dbClient = getDatabaseClient();

    // -----------------------------------------------------
    // Step 1: Check available stock
    // -----------------------------------------------------

    dbClient->execSqlAsync(
        "SELECT quantity "
        "FROM products "
        "WHERE id = $1",

        [callback, dbClient, orderId, productId, quantity, price](
            const Result &result)
        {
            if (result.empty())
            {
                Json::Value responseJson;
                responseJson["success"] = false;
                responseJson["message"] =
                    "Product not found";

                callback(
                    HttpResponse::newHttpJsonResponse(responseJson));
                return;
            }

            int availableStock =
                result[0]["quantity"].as<int>();

            if (availableStock <= 0)
            {
                Json::Value responseJson;
                responseJson["success"] = false;
                responseJson["message"] =
                    "Product is out of stock";

                callback(
                    HttpResponse::newHttpJsonResponse(responseJson));
                return;
            }

            if (quantity > availableStock)
            {
                Json::Value responseJson;
                responseJson["success"] = false;
                responseJson["message"] =
                    "Insufficient stock available";

                callback(
                    HttpResponse::newHttpJsonResponse(responseJson));
                return;
            }

            // -------------------------------------------------
            // Step 2: Insert order item
            // -------------------------------------------------

            dbClient->execSqlAsync(
                "INSERT INTO order_items "
                "(order_id, product_id, quantity, price) "
                "VALUES ($1, $2, $3, $4)",

                [callback, dbClient, productId, quantity](
                    const Result &result)
                {
                    // -----------------------------------------
                    // Step 3: Reduce product stock
                    // -----------------------------------------

                    dbClient->execSqlAsync(
                        "UPDATE products "
                        "SET quantity = quantity - $1 "
                        "WHERE id = $2 "
                        "AND quantity >= $1",

                        [callback](const Result &updateResult)
                        {
                            Json::Value responseJson;

                            responseJson["success"] = true;
                            responseJson["message"] =
                                "Order item added and stock updated";

                            callback(
                                HttpResponse::newHttpJsonResponse(
                                    responseJson));
                        },

                        [callback](const DrogonDbException &error)
                        {
                            Json::Value responseJson;

                            responseJson["success"] = false;
                            responseJson["message"] =
                                error.base().what();

                            auto response =
                                HttpResponse::newHttpJsonResponse(
                                    responseJson);

                            response->setStatusCode(
                                k500InternalServerError);

                            callback(response);
                        },

                        quantity,
                        productId);
                },

                [callback](const DrogonDbException &error)
                {
                    Json::Value responseJson;

                    responseJson["success"] = false;
                    responseJson["message"] =
                        error.base().what();

                    auto response =
                        HttpResponse::newHttpJsonResponse(
                            responseJson);

                    response->setStatusCode(
                        k500InternalServerError);

                    callback(response);
                },

                orderId,
                productId,
                quantity,
                price);
        },

        [callback](const DrogonDbException &error)
        {
            Json::Value responseJson;

            responseJson["success"] = false;
            responseJson["message"] =
                error.base().what();

            auto response =
                HttpResponse::newHttpJsonResponse(responseJson);

            response->setStatusCode(k500InternalServerError);

            callback(response);
        },

        productId);
}


// =========================================================
// GET USER ORDERS
// =========================================================

void getUserOrders(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    int userId)
{
    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "SELECT id, total_amount, status, created_at "
        "FROM orders "
        "WHERE user_id = $1 "
        "ORDER BY id DESC",

        [callback](const Result &result)
        {
            Json::Value orders(Json::arrayValue);

            for (const auto &row : result)
            {
                Json::Value order;

                order["id"] =
                    row["id"].as<int>();

                order["total_amount"] =
                    row["total_amount"].as<double>();

                order["status"] =
                    row["status"].as<std::string>();

                if (!row["created_at"].isNull())
                {
                    order["created_at"] =
                        row["created_at"].as<std::string>();
                }

                orders.append(order);
            }

            Json::Value responseJson;
            responseJson["success"] = true;
            responseJson["orders"] = orders;

            callback(
                HttpResponse::newHttpJsonResponse(responseJson)
            );
        },

        [callback](const DrogonDbException &error)
        {
            Json::Value responseJson;
            responseJson["success"] = false;
            responseJson["message"] = error.base().what();

            callback(
                HttpResponse::newHttpJsonResponse(responseJson)
            );
        },

        userId
    );
}
// =========================================================
// UPDATE ORDER STATUS
// =========================================================

void updateOrderStatus(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();

    if (!json)
    {
        Json::Value responseJson;
        responseJson["success"] = false;
        responseJson["message"] = "Invalid JSON data";

        callback(
            HttpResponse::newHttpJsonResponse(responseJson)
        );

        return;
    }

    int orderId =
        (*json)["order_id"].asInt();

    std::string status =
        (*json)["status"].asString();

    if (orderId <= 0 || status.empty())
    {
        Json::Value responseJson;
        responseJson["success"] = false;
        responseJson["message"] =
            "Invalid order ID or status";

        callback(
            HttpResponse::newHttpJsonResponse(responseJson)
        );

        return;
    }

    auto dbClient =
        getDatabaseClient();

    dbClient->execSqlAsync(
        "UPDATE orders "
        "SET status = $1 "
        "WHERE id = $2 "
        "RETURNING id, status",

        [callback](const Result &result)
        {
            Json::Value responseJson;

            if (result.empty())
            {
                responseJson["success"] = false;
                responseJson["message"] =
                    "Order not found";

                callback(
                    HttpResponse::newHttpJsonResponse(
                        responseJson
                    )
                );

                return;
            }

            responseJson["success"] = true;
            responseJson["message"] =
                "Order status updated successfully";

            responseJson["order_id"] =
                result[0]["id"].as<int>();

            responseJson["status"] =
                result[0]["status"].as<std::string>();

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
        },

        status,
        orderId
    );
}
// =========================================================
// GET SELLER ORDERS
// =========================================================

void getSellerOrders(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto sellerIdParam =
        req->getParameter("seller_id");

    if (sellerIdParam.empty())
    {
        Json::Value responseJson;
        responseJson["success"] = false;
        responseJson["message"] =
            "Seller ID is required";

        callback(
            HttpResponse::newHttpJsonResponse(
                responseJson
            )
        );

        return;
    }

    int sellerId =
        std::stoi(sellerIdParam);

    auto dbClient =
        getDatabaseClient();

    dbClient->execSqlAsync(
        "SELECT "
        "o.id AS order_id, "
        "o.total_amount, "
        "o.status, "
        "o.created_at, "
        "oi.product_id, "
        "oi.quantity, "
        "oi.price, "
        "p.product_name "

        "FROM orders o "

        "JOIN order_items oi "
        "ON o.id = oi.order_id "

        "JOIN products p "
        "ON oi.product_id = p.id "

        "WHERE p.seller_id = $1 "

        "ORDER BY o.id DESC",

        [callback](const Result &result)
        {
            Json::Value orders(
                Json::arrayValue
            );

            for (const auto &row : result)
            {
                Json::Value order;

                order["order_id"] =
                    row["order_id"].as<int>();

                order["total_amount"] =
                    row["total_amount"].as<double>();

                order["status"] =
                    row["status"].as<std::string>();

                order["product_id"] =
                    row["product_id"].as<int>();

                order["product_name"] =
                    row["product_name"].as<std::string>();

                order["quantity"] =
                    row["quantity"].as<int>();

                order["price"] =
                    row["price"].as<double>();

                if (!row["created_at"].isNull())
                {
                    order["created_at"] =
                        row["created_at"].as<std::string>();
                }

                orders.append(order);
            }

            callback(
                HttpResponse::newHttpJsonResponse(
                    orders
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
        },

        sellerId
    );
}