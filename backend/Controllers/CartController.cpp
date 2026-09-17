#include <drogon/drogon.h>
#include "../database/Database.h"

using namespace drogon;
using namespace drogon::orm;

// =========================================================
// ADD TO CART
// =========================================================

void addToCart(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();

    if (!json)
    {
        Json::Value result;
        result["success"] = false;
        result["message"] = "Invalid JSON data";

        auto response = HttpResponse::newHttpJsonResponse(result);
        callback(response);
        return;
    }

    int userId = (*json)["user_id"].asInt();
    int productId = (*json)["product_id"].asInt();
    int quantity = (*json)["quantity"].asInt();

    if (userId <= 0 || productId <= 0 || quantity <= 0)
    {
        Json::Value result;
        result["success"] = false;
        result["message"] = "Invalid cart details";

        auto response = HttpResponse::newHttpJsonResponse(result);
        callback(response);
        return;
    }

    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "INSERT INTO cart (user_id, product_id, quantity) "
        "VALUES ($1, $2, $3) "
        "ON CONFLICT (user_id, product_id) "
        "DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity",
        [callback](const Result &result)
        {
            Json::Value responseJson;
            responseJson["success"] = true;
            responseJson["message"] = "Product added to cart";

            auto response =
                HttpResponse::newHttpJsonResponse(responseJson);

            callback(response);
        },
        [callback](const DrogonDbException &error)
        {
            Json::Value responseJson;
            responseJson["success"] = false;
            responseJson["message"] = error.base().what();

            auto response =
                HttpResponse::newHttpJsonResponse(responseJson);

            callback(response);
        },
        userId,
        productId,
        quantity);
}

// =========================================================
// GET CART
// =========================================================

void getCart(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto userId = req->getParameter("user_id");

    if (userId.empty())
    {
        Json::Value responseJson;
        responseJson["success"] = false;
        responseJson["message"] = "User ID is required";

        auto response =
            HttpResponse::newHttpJsonResponse(responseJson);

        callback(response);
        return;
    }

    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "SELECT c.id, c.product_id, p.product_name, "
        "p.price, p.image, c.quantity, "
        "(p.price * c.quantity) AS subtotal "
        "FROM cart c "
        "JOIN products p ON c.product_id = p.id "
        "WHERE c.user_id = $1 "
        "ORDER BY c.id DESC",
        [callback](const Result &result)
        {
            Json::Value items(Json::arrayValue);

            for (const auto &row : result)
            {
                Json::Value item;

                item["id"] = row["id"].as<int>();
                item["product_id"] = row["product_id"].as<int>();
                item["product_name"] =
                    row["product_name"].as<std::string>();
                item["price"] = row["price"].as<double>();
                item["image"] = row["image"].as<std::string>();
                item["quantity"] = row["quantity"].as<int>();
                item["subtotal"] = row["subtotal"].as<double>();

                items.append(item);
            }

            Json::Value responseJson;
            responseJson["success"] = true;
            responseJson["cart"] = items;

            auto response =
                HttpResponse::newHttpJsonResponse(responseJson);

            callback(response);
        },
        [callback](const DrogonDbException &error)
        {
            Json::Value responseJson;
            responseJson["success"] = false;
            responseJson["message"] = error.base().what();

            auto response =
                HttpResponse::newHttpJsonResponse(responseJson);

            callback(response);
        },
        userId);
}

// =========================================================
// REMOVE FROM CART
// =========================================================

void removeFromCart(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();

    if (!json)
    {
        Json::Value responseJson;
        responseJson["success"] = false;
        responseJson["message"] = "Invalid JSON data";

        auto response =
            HttpResponse::newHttpJsonResponse(responseJson);

        callback(response);
        return;
    }

    int userId = (*json)["user_id"].asInt();
    int productId = (*json)["product_id"].asInt();

    if (userId <= 0 || productId <= 0)
    {
        Json::Value responseJson;
        responseJson["success"] = false;
        responseJson["message"] = "Invalid user or product ID";

        auto response =
            HttpResponse::newHttpJsonResponse(responseJson);

        callback(response);
        return;
    }

    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "DELETE FROM cart "
        "WHERE user_id = $1 AND product_id = $2",
        [callback](const Result &result)
        {
            Json::Value responseJson;
            responseJson["success"] = true;
            responseJson["message"] = "Product removed from cart";

            auto response =
                HttpResponse::newHttpJsonResponse(responseJson);

            callback(response);
        },
        [callback](const DrogonDbException &error)
        {
            Json::Value responseJson;
            responseJson["success"] = false;
            responseJson["message"] = error.base().what();

            auto response =
                HttpResponse::newHttpJsonResponse(responseJson);

            callback(response);
        },
        userId,
        productId);
}