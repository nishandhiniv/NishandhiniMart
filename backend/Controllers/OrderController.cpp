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
        "INSERT INTO orders (user_id, total_amount, status) "
        "VALUES ($1, $2, 'Pending') RETURNING id",
        [callback](const Result &result)
        {
            Json::Value responseJson;
            responseJson["success"] = true;
            responseJson["message"] = "Order created";
            responseJson["order_id"] = result[0]["id"].as<int>();

            callback(HttpResponse::newHttpJsonResponse(responseJson));
        },
        [callback](const DrogonDbException &error)
        {
            Json::Value responseJson;
            responseJson["success"] = false;
            responseJson["message"] = error.base().what();

            callback(HttpResponse::newHttpJsonResponse(responseJson));
        },
        userId,
        totalAmount);
}

// =========================================================
// ADD ORDER ITEM
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

    int orderId = (*json)["order_id"].asInt();
    int productId = (*json)["product_id"].asInt();
    int quantity = (*json)["quantity"].asInt();
    double price = (*json)["price"].asDouble();

    if (orderId <= 0 || productId <= 0 || quantity <= 0)
    {
        Json::Value responseJson;
        responseJson["success"] = false;
        responseJson["message"] = "Invalid order item details";

        callback(HttpResponse::newHttpJsonResponse(responseJson));
        return;
    }

    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "INSERT INTO order_items "
        "(order_id, product_id, quantity, price) "
        "VALUES ($1, $2, $3, $4)",
        [callback](const Result &result)
        {
            Json::Value responseJson;
            responseJson["success"] = true;
            responseJson["message"] = "Order item added";

            callback(HttpResponse::newHttpJsonResponse(responseJson));
        },
        [callback](const DrogonDbException &error)
        {
            Json::Value responseJson;
            responseJson["success"] = false;
            responseJson["message"] = error.base().what();

            callback(HttpResponse::newHttpJsonResponse(responseJson));
        },
        orderId,
        productId,
        quantity,
        price);
}

// =========================================================
// GET USER ORDERS
// =========================================================

void getUserOrders(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    std::string userId = req->getParameter("user_id");

    if (userId.empty())
    {
        Json::Value responseJson;
        responseJson["success"] = false;
        responseJson["message"] = "User ID is required";

        callback(HttpResponse::newHttpJsonResponse(responseJson));
        return;
    }

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

                order["id"] = row["id"].as<int>();
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

            callback(HttpResponse::newHttpJsonResponse(responseJson));
        },
        [callback](const DrogonDbException &error)
        {
            Json::Value responseJson;
            responseJson["success"] = false;
            responseJson["message"] = error.base().what();

            callback(HttpResponse::newHttpJsonResponse(responseJson));
        },
        userId);
}