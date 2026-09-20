#include <drogon/drogon.h>
#include <json/json.h>

#include <fstream>
#include <string>
#include <functional>

using namespace drogon;


// =========================================================
// PRODUCT SERVICE DECLARATIONS
// =========================================================

void fetchAllProducts(
    std::function<void(const Json::Value &)> callback);

void fetchProductById(
    int productId,
    std::function<void(const Json::Value &)> callback);

void createProductService(
    const std::string &productName,
    const std::string &description,
    double price,
    const std::string &image,
    const std::string &category,
    int quantity,
    int sellerId,
    std::function<void(const Json::Value &)> callback);

void updateProductService(
    int productId,
    const std::string &productName,
    const std::string &description,
    double price,
    const std::string &image,
    const std::string &category,
    int quantity,
    int sellerId,
    std::function<void(const Json::Value &)> callback);

void removeProductService(
    int productId,
    int sellerId,
    std::function<void(const Json::Value &)> callback);


// =========================================================
// GET PRODUCTS
// GET /api/products
// =========================================================

void getProducts(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    fetchAllProducts(
        [callback](const Json::Value &result)
        {
            auto response =
                HttpResponse::newHttpJsonResponse(result);

            response->addHeader(
                "Access-Control-Allow-Origin",
                "*");

            callback(response);
        });
}


// =========================================================
// CREATE PRODUCT
// POST /api/create-product
// =========================================================

void createProduct(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();

    if (!json)
    {
        Json::Value response;

        response["success"] = false;
        response["message"] =
            "Invalid JSON data";

        auto httpResponse =
            HttpResponse::newHttpJsonResponse(response);

        httpResponse->setStatusCode(
            k400BadRequest);

        callback(httpResponse);
        return;
    }

    std::string productName =
        (*json)["product_name"].asString();

    std::string description =
        (*json)["description"].asString();

    double price =
        (*json)["price"].asDouble();

    std::string image =
        (*json)["image"].asString();

    std::string category =
        (*json)["category"].asString();

    int quantity =
        (*json)["quantity"].asInt();

    int sellerId =
        (*json)["seller_id"].asInt();


    if (productName.empty())
    {
        Json::Value response;

        response["success"] = false;
        response["message"] =
            "Product name is required";

        auto httpResponse =
            HttpResponse::newHttpJsonResponse(response);

        httpResponse->setStatusCode(
            k400BadRequest);

        callback(httpResponse);
        return;
    }


    if (price <= 0)
    {
        Json::Value response;

        response["success"] = false;
        response["message"] =
            "Price must be greater than 0";

        auto httpResponse =
            HttpResponse::newHttpJsonResponse(response);

        httpResponse->setStatusCode(
            k400BadRequest);

        callback(httpResponse);
        return;
    }


    if (quantity < 0)
    {
        Json::Value response;

        response["success"] = false;
        response["message"] =
            "Quantity cannot be negative";

        auto httpResponse =
            HttpResponse::newHttpJsonResponse(response);

        httpResponse->setStatusCode(
            k400BadRequest);

        callback(httpResponse);
        return;
    }


    if (sellerId <= 0)
    {
        Json::Value response;

        response["success"] = false;
        response["message"] =
            "Invalid seller ID";

        auto httpResponse =
            HttpResponse::newHttpJsonResponse(response);

        httpResponse->setStatusCode(
            k400BadRequest);

        callback(httpResponse);
        return;
    }


    createProductService(
        productName,
        description,
        price,
        image,
        category,
        quantity,
        sellerId,

        [callback](const Json::Value &result)
        {
            auto response =
                HttpResponse::newHttpJsonResponse(result);

            response->addHeader(
                "Access-Control-Allow-Origin",
                "*");

            callback(response);
        });
}


// =========================================================
// UPDATE PRODUCT
// PUT /api/update-product/{id}
// =========================================================

void updateProduct(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    int productId)
{
    auto json = req->getJsonObject();

    if (!json)
    {
        Json::Value response;

        response["success"] = false;
        response["message"] =
            "Invalid JSON data";

        auto httpResponse =
            HttpResponse::newHttpJsonResponse(response);

        httpResponse->setStatusCode(
            k400BadRequest);

        callback(httpResponse);
        return;
    }


    std::string productName =
        (*json)["product_name"].asString();

    std::string description =
        (*json)["description"].asString();

    double price =
        (*json)["price"].asDouble();

    std::string image =
        (*json)["image"].asString();

    std::string category =
        (*json)["category"].asString();

    int quantity =
        (*json)["quantity"].asInt();

    int sellerId =
        (*json)["seller_id"].asInt();


    if (productId <= 0)
    {
        Json::Value response;

        response["success"] = false;
        response["message"] =
            "Invalid product ID";

        auto httpResponse =
            HttpResponse::newHttpJsonResponse(response);

        httpResponse->setStatusCode(
            k400BadRequest);

        callback(httpResponse);
        return;
    }


    if (productName.empty())
    {
        Json::Value response;

        response["success"] = false;
        response["message"] =
            "Product name is required";

        auto httpResponse =
            HttpResponse::newHttpJsonResponse(response);

        httpResponse->setStatusCode(
            k400BadRequest);

        callback(httpResponse);
        return;
    }


    if (price <= 0)
    {
        Json::Value response;

        response["success"] = false;
        response["message"] =
            "Price must be greater than 0";

        auto httpResponse =
            HttpResponse::newHttpJsonResponse(response);

        httpResponse->setStatusCode(
            k400BadRequest);

        callback(httpResponse);
        return;
    }


    updateProductService(
        productId,
        productName,
        description,
        price,
        image,
        category,
        quantity,
        sellerId,

        [callback](const Json::Value &result)
        {
            auto response =
                HttpResponse::newHttpJsonResponse(result);

            response->addHeader(
                "Access-Control-Allow-Origin",
                "*");

            callback(response);
        });
}


// =========================================================
// DELETE PRODUCT
// DELETE /api/delete-product/{id}
// =========================================================

void removeProduct(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    int productId)
{
    auto json = req->getJsonObject();

    int sellerId = 0;

    if (json)
    {
        sellerId =
            (*json)["seller_id"].asInt();
    }

    if (sellerId <= 0)
    {
        sellerId =
            req->getParameter("seller_id").empty()
                ? 0
                : std::stoi(
                    req->getParameter("seller_id"));
    }


    if (sellerId <= 0)
    {
        Json::Value response;

        response["success"] = false;
        response["message"] =
            "Seller ID is required";

        auto httpResponse =
            HttpResponse::newHttpJsonResponse(response);

        httpResponse->setStatusCode(
            k400BadRequest);

        callback(httpResponse);
        return;
    }


    removeProductService(
        productId,
        sellerId,

        [callback](const Json::Value &result)
        {
            auto response =
                HttpResponse::newHttpJsonResponse(result);

            response->addHeader(
                "Access-Control-Allow-Origin",
                "*");

            callback(response);
        });
}


// =========================================================
// UPLOAD PRODUCT IMAGE
// POST /api/upload-product-image
// =========================================================

void uploadProductImage(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    MultiPartParser parser;

    if (parser.parse(req) != 0)
    {
        Json::Value response;

        response["success"] = false;
        response["message"] =
            "Failed to parse uploaded image";

        auto httpResponse =
            HttpResponse::newHttpJsonResponse(response);

        httpResponse->setStatusCode(
            k400BadRequest);

        callback(httpResponse);
        return;
    }


    const auto &files =
        parser.getFiles();

    if (files.empty())
    {
        Json::Value response;

        response["success"] = false;
        response["message"] =
            "No image uploaded";

        auto httpResponse =
            HttpResponse::newHttpJsonResponse(response);

        httpResponse->setStatusCode(
            k400BadRequest);

        callback(httpResponse);
        return;
    }


    const auto &file =
        files[0];


    std::string originalName =
        file.getFileName();

    std::string extension;

    size_t dot =
        originalName.find_last_of('.');

    if (dot != std::string::npos)
    {
        extension =
            originalName.substr(dot);
    }

    if (extension.empty())
    {
        extension = ".jpg";
    }


    std::string fileName =
        "product_" +
        std::to_string(
            std::chrono::high_resolution_clock::now()
                .time_since_epoch()
                .count()) +
        extension;


    std::string savePath =
        "C:/Users/Dell/Desktop/capstone/"
        "NishandhiniMart/frontend/"
        "seller-dashboard/images/" +
        fileName;


    try
    {
        file.saveAs(savePath);

        Json::Value response;

        response["success"] = true;
        response["message"] =
            "Image uploaded successfully";

        response["filename"] =
            fileName;

        auto httpResponse =
            HttpResponse::newHttpJsonResponse(response);

        httpResponse->addHeader(
            "Access-Control-Allow-Origin",
            "*");

        callback(httpResponse);
    }
    catch (const std::exception &e)
    {
        Json::Value response;

        response["success"] = false;
        response["message"] =
            std::string(
                "Image upload failed: ") +
            e.what();

        auto httpResponse =
            HttpResponse::newHttpJsonResponse(response);

        httpResponse->setStatusCode(
            k500InternalServerError);

        callback(httpResponse);
    }
}