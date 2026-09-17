#include <drogon/drogon.h>
#include <json/json.h>
#include <iostream>
#include "../database/Database.h"

using namespace drogon;
using namespace drogon::orm;

// =========================================================
// Product Controller
// =========================================================

// Get all products
void getProducts(
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

            auto resp = HttpResponse::newHttpJsonResponse(response);
            callback(resp);
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


// Add product
void createProduct(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();

    if (!json)
    {
        Json::Value error;
        error["success"] = false;
        error["message"] = "Invalid JSON";

        callback(HttpResponse::newHttpJsonResponse(error));
        return;
    }

    std::string productName = (*json)["product_name"].asString();
    std::string description = (*json)["description"].asString();
    double price = (*json)["price"].asDouble();
    std::string image = (*json)["image"].asString();
    std::string category = (*json)["category"].asString();
    int sellerId = (*json)["seller_id"].asInt();

    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "INSERT INTO products "
        "(product_name, description, price, image, category, seller_id) "
        "VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",

        [callback](const Result &result)
        {
            Json::Value response;
            response["success"] = true;
            response["message"] = "Product added successfully";
            response["product_id"] = result[0]["id"].as<int>();

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

        productName,
        description,
        price,
        image,
        category,
        sellerId);
}


// Update product
void updateProduct(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    int productId)
{
    auto json = req->getJsonObject();

    if (!json)
    {
        Json::Value error;
        error["success"] = false;
        error["message"] = "Invalid JSON";

        callback(HttpResponse::newHttpJsonResponse(error));
        return;
    }

    std::string productName = (*json)["product_name"].asString();
    std::string description = (*json)["description"].asString();
    double price = (*json)["price"].asDouble();
    std::string image = (*json)["image"].asString();
    std::string category = (*json)["category"].asString();
    int sellerId = (*json)["seller_id"].asInt();

    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "UPDATE products SET "
        "product_name = $1, description = $2, price = $3, "
        "image = $4, category = $5 "
        "WHERE id = $6 AND seller_id = $7",

        [callback](const Result &result)
        {
            Json::Value response;
            response["success"] = true;
            response["message"] = "Product updated successfully";

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

        productName,
        description,
        price,
        image,
        category,
        productId,
        sellerId);
}


// Delete product
void removeProduct(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    int productId)
{
    auto json = req->getJsonObject();

    if (!json)
    {
        Json::Value error;
        error["success"] = false;
        error["message"] = "Invalid JSON";

        callback(HttpResponse::newHttpJsonResponse(error));
        return;
    }

    int sellerId = (*json)["seller_id"].asInt();

    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "DELETE FROM products WHERE id = $1 AND seller_id = $2",

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

        productId,
        sellerId);
}