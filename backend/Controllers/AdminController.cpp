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
        "SELECT id, name, username, email, role FROM users ORDER BY id",

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
        "SELECT id, product_name, description, price, image, category, seller_id "
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