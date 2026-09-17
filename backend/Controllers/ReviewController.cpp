#include <drogon/drogon.h>
#include "../database/Database.h"
using namespace drogon;
using namespace drogon::orm;

// =========================================================
// ADD REVIEW
// =========================================================

void addReview(
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
    int productId = (*json)["product_id"].asInt();
    int rating = (*json)["rating"].asInt();
    std::string comment = (*json)["comment"].asString();

    if (userId <= 0 || productId <= 0 ||
        rating < 1 || rating > 5)
    {
        Json::Value responseJson;
        responseJson["success"] = false;
        responseJson["message"] = "Invalid review details";

        callback(HttpResponse::newHttpJsonResponse(responseJson));
        return;
    }

    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "INSERT INTO reviews "
        "(user_id, product_id, rating, comment) "
        "VALUES ($1, $2, $3, $4)",
        [callback](const Result &result)
        {
            Json::Value responseJson;
            responseJson["success"] = true;
            responseJson["message"] = "Review added successfully";

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
        productId,
        rating,
        comment);
}

// =========================================================
// GET PRODUCT REVIEWS
// =========================================================

void getProductReviews(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    std::string productId = req->getParameter("product_id");

    if (productId.empty())
    {
        Json::Value responseJson;
        responseJson["success"] = false;
        responseJson["message"] = "Product ID is required";

        callback(HttpResponse::newHttpJsonResponse(responseJson));
        return;
    }

    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "SELECT r.id, r.rating, r.comment, "
        "r.user_id, u.name AS user_name "
        "FROM reviews r "
        "JOIN users u ON r.user_id = u.id "
        "WHERE r.product_id = $1 "
        "ORDER BY r.id DESC",
        [callback](const Result &result)
        {
            Json::Value reviews(Json::arrayValue);

            for (const auto &row : result)
            {
                Json::Value review;

                review["id"] = row["id"].as<int>();
                review["rating"] = row["rating"].as<int>();
                review["comment"] = row["comment"].as<std::string>();
                review["user_id"] = row["user_id"].as<int>();
                review["user_name"] =
                    row["user_name"].as<std::string>();

                reviews.append(review);
            }

            Json::Value responseJson;
            responseJson["success"] = true;
            responseJson["reviews"] = reviews;

            callback(HttpResponse::newHttpJsonResponse(responseJson));
        },
        [callback](const DrogonDbException &error)
        {
            Json::Value responseJson;
            responseJson["success"] = false;
            responseJson["message"] = error.base().what();

            callback(HttpResponse::newHttpJsonResponse(responseJson));
        },
        productId);
}