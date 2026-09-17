#include <drogon/drogon.h>
#include "../database/Database.h"

using namespace drogon;
using namespace drogon::orm;

// =========================================================
// CREATE ORDER
// =========================================================

void saveOrder(
    int userId,
    double totalAmount,
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "INSERT INTO orders (user_id, total_amount, status) "
        "VALUES ($1, $2, 'Pending') "
        "RETURNING id",
        [callback](const Result &result)
        {
            Json::Value response;

            if (result.empty())
            {
                response["success"] = false;
                response["message"] = "Order creation failed";
            }
            else
            {
                response["success"] = true;
                response["message"] = "Order created successfully";
                response["order_id"] =
                    result[0]["id"].as<int>();
            }

            callback(response);
        },
        [callback](const DrogonDbException &error)
        {
            Json::Value response;
            response["success"] = false;
            response["message"] = error.base().what();

            callback(response);
        },
        userId,
        totalAmount);
}

// =========================================================
// SAVE ORDER ITEM
// =========================================================

void saveOrderItem(
    int orderId,
    int productId,
    int quantity,
    double price,
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient = app().getDbClient("default");

    dbClient->execSqlAsync(
        "INSERT INTO order_items "
        "(order_id, product_id, quantity, price) "
        "VALUES ($1, $2, $3, $4)",
        [callback](const Result &result)
        {
            Json::Value response;
            response["success"] = true;
            response["message"] = "Order item saved";

            callback(response);
        },
        [callback](const DrogonDbException &error)
        {
            Json::Value response;
            response["success"] = false;
            response["message"] = error.base().what();

            callback(response);
        },
        orderId,
        productId,
        quantity,
        price);
}

// =========================================================
// GET ORDERS BY USER
// =========================================================

void fetchOrdersByUser(
    int userId,
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient = app().getDbClient("default");

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

            Json::Value response;
            response["success"] = true;
            response["orders"] = orders;

            callback(response);
        },
        [callback](const DrogonDbException &error)
        {
            Json::Value response;
            response["success"] = false;
            response["message"] = error.base().what();

            callback(response);
        },
        userId);
}