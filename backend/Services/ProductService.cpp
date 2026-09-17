#include <drogon/drogon.h>
#include "../database/Database.h"

using namespace drogon;
using namespace drogon::orm;

// =========================================================
// GET ALL PRODUCTS
// =========================================================

void fetchAllProducts(
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient = app().getDbClient("default");

    dbClient->execSqlAsync(
        "SELECT id, product_name, description, price, "
        "image, category, seller_id "
        "FROM products "
        "ORDER BY id DESC",
        [callback](const Result &result)
        {
            Json::Value products(Json::arrayValue);

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

                products.append(product);
            }

            callback(products);
        },
        [callback](const DrogonDbException &error)
        {
            Json::Value errorResponse;
            errorResponse["success"] = false;
            errorResponse["message"] = error.base().what();

            callback(errorResponse);
        });
}

// =========================================================
// FIND PRODUCT BY ID
// =========================================================

void fetchProductById(
    int productId,
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient = getDatabaseClient();
    dbClient->execSqlAsync(
        "SELECT id, product_name, description, price, "
        "image, category, seller_id "
        "FROM products "
        "WHERE id = $1",
        [callback](const Result &result)
        {
            Json::Value product;

            if (result.empty())
            {
                product["success"] = false;
                product["message"] = "Product not found";
            }
            else
            {
                const auto &row = result[0];

                product["success"] = true;
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
            }

            callback(product);
        },
        [callback](const DrogonDbException &error)
        {
            Json::Value errorResponse;
            errorResponse["success"] = false;
            errorResponse["message"] = error.base().what();

            callback(errorResponse);
        },
        productId);
}