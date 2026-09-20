#include <drogon/drogon.h>
#include <json/json.h>

#include "../database/Database.h"

#include <functional>
#include <string>
#include <sstream>
#include <vector>
#include <memory>
#include <algorithm>

using namespace drogon;
using namespace drogon::orm;


// =========================================================
// HELPER
// Trim spaces
// =========================================================

static std::string trim(const std::string &text)
{
    size_t start = 0;

    while (start < text.size() &&
           (text[start] == ' ' ||
            text[start] == '\t' ||
            text[start] == '\r'))
    {
        start++;
    }

    size_t end = text.size();

    while (end > start &&
           (text[end - 1] == ' ' ||
            text[end - 1] == '\t' ||
            text[end - 1] == '\r'))
    {
        end--;
    }

    return text.substr(start, end - start);
}


// =========================================================
// HELPER
// Extract Additional Details from description
// =========================================================

static std::vector<std::pair<std::string, std::string>>
extractAdditionalDetails(const std::string &description)
{
    std::vector<std::pair<std::string, std::string>> details;

    const std::string marker = "Additional Details:";

    size_t pos = description.find(marker);

    if (pos == std::string::npos)
    {
        return details;
    }

    std::string section =
        description.substr(pos + marker.length());

    std::stringstream ss(section);
    std::string line;

    while (std::getline(ss, line))
    {
        line = trim(line);

        if (line.empty())
        {
            continue;
        }

        // Find the first colon
        size_t colon = line.find(':');

        if (colon == std::string::npos)
        {
            continue;
        }

        std::string name =
            trim(line.substr(0, colon));

        std::string value =
            trim(line.substr(colon + 1));

        // If value starts with another colon,
        // remove it.
        while (!value.empty() &&
               value.front() == ':')
        {
            value.erase(value.begin());
            value = trim(value);
        }

        if (!name.empty() && !value.empty())
        {
            details.push_back(
                {name, value}
            );
        }
    }

    return details;
}


// =========================================================
// FETCH ALL PRODUCTS
// =========================================================

void fetchAllProducts(
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient =
        app().getDbClient("default");

    dbClient->execSqlAsync(
        "SELECT "
        "p.id, "
        "p.product_name, "
        "p.description, "
        "p.price, "
        "p.image, "
        "p.category, "
        "p.quantity, "
        "p.seller_id, "
        "u.name AS seller_name, "
        "u.store_name AS store_name, "
        "COALESCE("
        "json_agg("
        "json_build_object("
        "'name', d.detail_name, "
        "'value', d.detail_value"
        ") ORDER BY d.id"
        ") FILTER (WHERE d.id IS NOT NULL), "
        "'[]'::json"
        ")::text AS additional_details "
        "FROM products p "
        "LEFT JOIN users u "
        "ON u.id = p.seller_id "
        "LEFT JOIN product_additional_details d "
        "ON d.product_id = p.id "
        "GROUP BY "
        "p.id, "
        "u.name, "
        "u.store_name "
        "ORDER BY p.id DESC",

        [callback](const Result &result)
        {
            Json::Value products(
                Json::arrayValue);

            for (const auto &row : result)
            {
                Json::Value product;

                product["id"] =
                    row["id"].as<int>();

                product["product_name"] =
                    row["product_name"]
                        .as<std::string>();

                product["description"] =
                    row["description"]
                        .as<std::string>();

                product["price"] =
                    row["price"].as<double>();

                product["image"] =
                    row["image"].isNull()
                        ? ""
                        : row["image"]
                            .as<std::string>();

                product["category"] =
                    row["category"].isNull()
                        ? ""
                        : row["category"]
                            .as<std::string>();

                product["quantity"] =
                    row["quantity"].as<int>();

                product["seller_id"] =
                    row["seller_id"].as<int>();

                product["seller_name"] =
                    row["seller_name"].isNull()
                        ? ""
                        : row["seller_name"]
                            .as<std::string>();

                product["store_name"] =
                    row["store_name"].isNull()
                        ? ""
                        : row["store_name"]
                            .as<std::string>();

                Json::CharReaderBuilder builder;
                Json::Value details;
                std::string errors;

                std::istringstream stream(
                    row["additional_details"]
                        .as<std::string>());

                if (Json::parseFromStream(
                        builder,
                        stream,
                        &details,
                        &errors) &&
                    details.isArray())
                {
                    product["additional_details"] =
                        details;
                }
                else
                {
                    product["additional_details"] =
                        Json::Value(
                            Json::arrayValue);
                }

                products.append(product);
            }

            callback(products);
        },

        [callback](const DrogonDbException &error)
        {
            Json::Value response;

            response["success"] = false;
            response["message"] =
                error.base().what();

            callback(response);
        });
}


// =========================================================
// FETCH PRODUCT BY ID
// =========================================================

void fetchProductById(
    int productId,
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient =
        app().getDbClient("default");

    dbClient->execSqlAsync(
        "SELECT "
        "p.id, "
        "p.product_name, "
        "p.description, "
        "p.price, "
        "p.image, "
        "p.category, "
        "p.quantity, "
        "p.seller_id, "
        "u.name AS seller_name, "
        "u.store_name AS store_name, "
        "COALESCE("
        "json_agg("
        "json_build_object("
        "'name', d.detail_name, "
        "'value', d.detail_value"
        ") ORDER BY d.id"
        ") FILTER (WHERE d.id IS NOT NULL), "
        "'[]'::json"
        ")::text AS additional_details "
        "FROM products p "
        "LEFT JOIN users u "
        "ON u.id = p.seller_id "
        "LEFT JOIN product_additional_details d "
        "ON d.product_id = p.id "
        "WHERE p.id = $1 "
        "GROUP BY "
        "p.id, "
        "u.name, "
        "u.store_name",

        [callback](const Result &result)
        {
            Json::Value product;

            if (result.empty())
            {
                product["success"] = false;
                product["message"] =
                    "Product not found";

                callback(product);
                return;
            }

            const auto &row = result[0];

            product["success"] = true;

            product["id"] =
                row["id"].as<int>();

            product["product_name"] =
                row["product_name"]
                    .as<std::string>();

            product["description"] =
                row["description"]
                    .as<std::string>();

            product["price"] =
                row["price"].as<double>();

            product["image"] =
                row["image"].isNull()
                    ? ""
                    : row["image"]
                        .as<std::string>();

            product["category"] =
                row["category"].isNull()
                    ? ""
                    : row["category"]
                        .as<std::string>();

            product["quantity"] =
                row["quantity"].as<int>();

            product["seller_id"] =
                row["seller_id"].as<int>();

            product["seller_name"] =
                row["seller_name"].isNull()
                    ? ""
                    : row["seller_name"]
                        .as<std::string>();

            product["store_name"] =
                row["store_name"].isNull()
                    ? ""
                    : row["store_name"]
                        .as<std::string>();

            Json::CharReaderBuilder builder;
            Json::Value details;
            std::string errors;

            std::istringstream stream(
                row["additional_details"]
                    .as<std::string>());

            if (Json::parseFromStream(
                    builder,
                    stream,
                    &details,
                    &errors) &&
                details.isArray())
            {
                product["additional_details"] =
                    details;
            }
            else
            {
                product["additional_details"] =
                    Json::Value(
                        Json::arrayValue);
            }

            callback(product);
        },

        [callback](const DrogonDbException &error)
        {
            Json::Value response;

            response["success"] = false;
            response["message"] =
                error.base().what();

            callback(response);
        },

        productId);
}


// =========================================================
// INSERT ADDITIONAL DETAILS
// =========================================================

static void insertAdditionalDetails(
    int productId,
    const std::vector<std::pair<std::string, std::string>> &details,
    std::function<void(const Json::Value &)> callback)
{
    if (details.empty())
    {
        Json::Value response;

        response["success"] = true;
        response["message"] =
            "No additional details";

        callback(response);
        return;
    }

    auto dbClient =
        app().getDbClient("default");

    auto remaining =
        std::make_shared<int>(
            static_cast<int>(details.size()));

    auto failed =
        std::make_shared<bool>(false);

    for (const auto &detail : details)
    {
        dbClient->execSqlAsync(
            "INSERT INTO "
            "product_additional_details "
            "(product_id, detail_name, detail_value) "
            "VALUES ($1, $2, $3)",

            [remaining, failed, callback]
            (const Result &)
            {
                if (*failed)
                {
                    return;
                }

                (*remaining)--;

                if (*remaining == 0)
                {
                    Json::Value response;

                    response["success"] = true;
                    response["message"] =
                        "Additional details saved";

                    callback(response);
                }
            },

            [failed, callback]
            (const DrogonDbException &error)
            {
                if (*failed)
                {
                    return;
                }

                *failed = true;

                Json::Value response;

                response["success"] = false;
                response["message"] =
                    error.base().what();

                callback(response);
            },

            productId,
            detail.first,
            detail.second);
    }
}


// =========================================================
// CREATE PRODUCT
// =========================================================

void createProductService(
    const std::string &productName,
    const std::string &description,
    double price,
    const std::string &image,
    const std::string &category,
    int quantity,
    int sellerId,
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient =
        app().getDbClient("default");

    dbClient->execSqlAsync(
        "INSERT INTO products "
        "(product_name, description, price, image, "
        "category, quantity, seller_id) "
        "VALUES ($1, $2, $3, $4, $5, $6, $7) "
        "RETURNING id",

        [callback, description]
        (const Result &result)
        {
            if (result.empty())
            {
                Json::Value response;

                response["success"] = false;
                response["message"] =
                    "Product creation failed";

                callback(response);
                return;
            }

            int productId =
                result[0]["id"].as<int>();

            auto details =
                extractAdditionalDetails(
                    description);

            insertAdditionalDetails(
                productId,
                details,
                [callback, productId]
                (const Json::Value &detailResponse)
                {
                    if (!detailResponse["success"].asBool())
                    {
                        callback(detailResponse);
                        return;
                    }

                    Json::Value response;

                    response["success"] = true;
                    response["message"] =
                        "Product created successfully";
                    response["id"] =
                        productId;

                    callback(response);
                });
        },

        [callback](const DrogonDbException &error)
        {
            Json::Value response;

            response["success"] = false;
            response["message"] =
                error.base().what();

            callback(response);
        },

        productName,
        description,
        price,
        image,
        category,
        quantity,
        sellerId);
}


// =========================================================
// UPDATE PRODUCT
// =========================================================

void updateProductService(
    int productId,
    const std::string &productName,
    const std::string &description,
    double price,
    const std::string &image,
    const std::string &category,
    int quantity,
    int sellerId,
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient =
        app().getDbClient("default");

    dbClient->execSqlAsync(
        "UPDATE products SET "
        "product_name = $1, "
        "description = $2, "
        "price = $3, "
        "image = $4, "
        "category = $5, "
        "quantity = $6 "
        "WHERE id = $7 AND seller_id = $8",

        [callback,
         productId,
         description]
        (const Result &result)
        {
            if (result.affectedRows() == 0)
            {
                Json::Value response;

                response["success"] = false;
                response["message"] =
                    "Product not found or not owned by seller";

                callback(response);
                return;
            }

            auto dbClient =
                app().getDbClient("default");

            dbClient->execSqlAsync(
                "DELETE FROM "
                "product_additional_details "
                "WHERE product_id = $1",

                [callback,
                 productId,
                 description]
                (const Result &)
                {
                    auto details =
                        extractAdditionalDetails(
                            description);

                    insertAdditionalDetails(
                        productId,
                        details,
                        [callback]
                        (const Json::Value &detailResponse)
                        {
                            if (!detailResponse["success"].asBool())
                            {
                                callback(detailResponse);
                                return;
                            }

                            Json::Value response;

                            response["success"] = true;
                            response["message"] =
                                "Product updated successfully";

                            callback(response);
                        });
                },

                [callback]
                (const DrogonDbException &error)
                {
                    Json::Value response;

                    response["success"] = false;
                    response["message"] =
                        error.base().what();

                    callback(response);
                },

                productId);
        },

        [callback](const DrogonDbException &error)
        {
            Json::Value response;

            response["success"] = false;
            response["message"] =
                error.base().what();

            callback(response);
        },

        productName,
        description,
        price,
        image,
        category,
        quantity,
        productId,
        sellerId);
}


// =========================================================
// DELETE PRODUCT
// =========================================================

void removeProductService(
    int productId,
    int sellerId,
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient =
        app().getDbClient("default");

    dbClient->execSqlAsync(
        "DELETE FROM "
        "product_additional_details "
        "WHERE product_id = $1",

        [callback, productId, sellerId]
        (const Result &)
        {
            auto dbClient =
                app().getDbClient("default");

            dbClient->execSqlAsync(
                "DELETE FROM products "
                "WHERE id = $1 "
                "AND seller_id = $2",

                [callback](const Result &result)
                {
                    Json::Value response;

                    if (result.affectedRows() == 0)
                    {
                        response["success"] = false;
                        response["message"] =
                            "Product not found or not owned by seller";
                    }
                    else
                    {
                        response["success"] = true;
                        response["message"] =
                            "Product deleted successfully";
                    }

                    callback(response);
                },

                [callback]
                (const DrogonDbException &error)
                {
                    Json::Value response;

                    response["success"] = false;
                    response["message"] =
                        error.base().what();

                    callback(response);
                },

                productId,
                sellerId);
        },

        [callback]
        (const DrogonDbException &error)
        {
            Json::Value response;

            response["success"] = false;
            response["message"] =
                error.base().what();

            callback(response);
        },

        productId);
}