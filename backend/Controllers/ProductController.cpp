#include <drogon/drogon.h>
#include "../database/Database.h"

#include <json/json.h>
#include <sstream>
#include <string>
#include <functional>

using namespace drogon;
using namespace drogon::orm;


/* =========================================================
   PARSE ADDITIONAL DETAILS JSON
========================================================= */

Json::Value parseAdditionalDetails(
    const std::string &jsonText)
{
    Json::Value details(Json::arrayValue);

    if (jsonText.empty())
    {
        return details;
    }

    Json::CharReaderBuilder builder;
    std::string errors;

    std::istringstream stream(jsonText);

    bool parsed =
        Json::parseFromStream(
            builder,
            stream,
            &details,
            &errors
        );

    if (!parsed || !details.isArray())
    {
        return Json::Value(Json::arrayValue);
    }

    return details;
}


/* =========================================================
   GET ALL PRODUCTS
========================================================= */

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
            "("
                "SELECT json_agg("
                    "json_build_object("
                        "'name', d.detail_name, "
                        "'value', d.detail_value"
                    ") "
                    "ORDER BY d.id"
                ") "
                "FROM product_additional_details d "
                "WHERE d.product_id = p.id"
            "), "
            "'[]'::json"
        ")::text AS additional_details "

        "FROM products p "

        "LEFT JOIN users u "
        "ON u.id = p.seller_id "

        "ORDER BY p.id DESC",


        /* =================================================
           SUCCESS
        ================================================= */

        [callback](const Result &result)
        {
            Json::Value products(
                Json::arrayValue
            );


            for (const auto &row : result)
            {
                Json::Value product;


                /* -----------------------------------------
                   BASIC PRODUCT INFORMATION
                ----------------------------------------- */

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
                    row["image"]
                        .as<std::string>();


                product["category"] =
                    row["category"]
                        .as<std::string>();


                /* -----------------------------------------
                   QUANTITY
                ----------------------------------------- */

                product["quantity"] =
                    row["quantity"].as<int>();


                /* -----------------------------------------
                   SELLER ID
                ----------------------------------------- */

                product["seller_id"] =
                    row["seller_id"].as<int>();


                /* -----------------------------------------
                   SELLER NAME
                ----------------------------------------- */

                if (!row["seller_name"].isNull())
                {
                    product["seller_name"] =
                        row["seller_name"]
                            .as<std::string>();
                }
                else
                {
                    product["seller_name"] = "";
                }


                /* -----------------------------------------
                   STORE NAME
                ----------------------------------------- */

                if (!row["store_name"].isNull())
                {
                    product["store_name"] =
                        row["store_name"]
                            .as<std::string>();
                }
                else
                {
                    product["store_name"] = "";
                }


                /* -----------------------------------------
                   ADDITIONAL DETAILS
                ----------------------------------------- */

                std::string detailsJson =
                    row["additional_details"]
                        .as<std::string>();


                product["additional_details"] =
                    parseAdditionalDetails(
                        detailsJson
                    );


                products.append(product);
            }


            callback(products);
        },


        /* =================================================
           ERROR
        ================================================= */

        [callback](const DrogonDbException &error)
        {
            Json::Value errorResponse;

            errorResponse["success"] =
                false;

            errorResponse["message"] =
                error.base().what();

            callback(errorResponse);
        }
    );
}


/* =========================================================
   FIND PRODUCT BY ID
========================================================= */

void fetchProductById(
    int productId,
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient =
        getDatabaseClient();


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
            "("
                "SELECT json_agg("
                    "json_build_object("
                        "'name', d.detail_name, "
                        "'value', d.detail_value"
                    ") "
                    "ORDER BY d.id"
                ") "
                "FROM product_additional_details d "
                "WHERE d.product_id = p.id"
            "), "
            "'[]'::json"
        ")::text AS additional_details "

        "FROM products p "

        "LEFT JOIN users u "
        "ON u.id = p.seller_id "

        "WHERE p.id = $1",


        /* =================================================
           SUCCESS
        ================================================= */

        [callback](const Result &result)
        {
            Json::Value product;


            if (result.empty())
            {
                product["success"] =
                    false;

                product["message"] =
                    "Product not found";
            }
            else
            {
                const auto &row =
                    result[0];


                product["success"] =
                    true;


                /* -----------------------------------------
                   BASIC PRODUCT INFORMATION
                ----------------------------------------- */

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
                    row["image"]
                        .as<std::string>();


                product["category"] =
                    row["category"]
                        .as<std::string>();


                /* -----------------------------------------
                   QUANTITY
                ----------------------------------------- */

                product["quantity"] =
                    row["quantity"].as<int>();


                /* -----------------------------------------
                   SELLER ID
                ----------------------------------------- */

                product["seller_id"] =
                    row["seller_id"].as<int>();


                /* -----------------------------------------
                   SELLER NAME
                ----------------------------------------- */

                if (!row["seller_name"].isNull())
                {
                    product["seller_name"] =
                        row["seller_name"]
                            .as<std::string>();
                }
                else
                {
                    product["seller_name"] = "";
                }


                /* -----------------------------------------
                   STORE NAME
                ----------------------------------------- */

                if (!row["store_name"].isNull())
                {
                    product["store_name"] =
                        row["store_name"]
                            .as<std::string>();
                }
                else
                {
                    product["store_name"] = "";
                }


                /* -----------------------------------------
                   ADDITIONAL DETAILS
                ----------------------------------------- */

                std::string detailsJson =
                    row["additional_details"]
                        .as<std::string>();


                product["additional_details"] =
                    parseAdditionalDetails(
                        detailsJson
                    );
            }


            callback(product);
        },


        /* =================================================
           ERROR
        ================================================= */

        [callback](const DrogonDbException &error)
        {
            Json::Value errorResponse;

            errorResponse["success"] =
                false;

            errorResponse["message"] =
                error.base().what();

            callback(errorResponse);
        },


        productId
    );
}