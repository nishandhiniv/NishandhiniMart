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