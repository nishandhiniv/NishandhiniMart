#include <drogon/drogon.h>

using namespace drogon;

// Register API
void registerUser(const HttpRequestPtr& req,
                  std::function<void(const HttpResponsePtr&)>&& callback)
{
    auto json = req->getJsonObject();

    if (!json)
    {
        Json::Value response;
        response["success"] = false;
        response["message"] = "Invalid JSON";

        auto resp = HttpResponse::newHttpJsonResponse(response);
        callback(resp);
        return;
    }

    std::string name = (*json)["name"].asString();
    std::string username = (*json)["username"].asString();
    std::string email = (*json)["email"].asString();
    std::string password = (*json)["password"].asString();

    Json::Value response;

    response["success"] = true;
    response["message"] = "Registration request received";
    response["username"] = username;

    auto resp = HttpResponse::newHttpJsonResponse(response);
    callback(resp);
}


// Login API
void loginUser(const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback)
{
    auto json = req->getJsonObject();

    if (!json)
    {
        Json::Value response;
        response["success"] = false;
        response["message"] = "Invalid JSON";

        auto resp = HttpResponse::newHttpJsonResponse(response);
        callback(resp);
        return;
    }

    std::string username = (*json)["username"].asString();
    std::string password = (*json)["password"].asString();

    Json::Value response;

    response["success"] = true;
    response["message"] = "Login request received";
    response["username"] = username;

    auto resp = HttpResponse::newHttpJsonResponse(response);
    callback(resp);
}