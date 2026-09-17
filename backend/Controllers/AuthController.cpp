#include <drogon/drogon.h>

using namespace drogon;

// Service function declarations

void authenticateUser(
    const std::string &username,
    const std::string &password,
    std::function<void(const Json::Value &)> callback);

void checkUsernameExists(
    const std::string &username,
    std::function<void(bool)> callback);

void registerNewUser(
    const std::string &name,
    const std::string &username,
    const std::string &email,
    const std::string &password,
    const std::string &role,
    std::function<void(const Json::Value &)> callback);


// =========================================================
// LOGIN CONTROLLER
// =========================================================

void loginUser(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();

    if (!json)
    {
        Json::Value response;
        response["success"] = false;
        response["message"] = "Invalid JSON data";

        auto httpResponse = HttpResponse::newHttpJsonResponse(response);
        httpResponse->addHeader("Access-Control-Allow-Origin", "*");

        callback(httpResponse);
        return;
    }

    std::string username = (*json)["username"].asString();
    std::string password = (*json)["password"].asString();

    if (username.empty() || password.empty())
    {
        Json::Value response;
        response["success"] = false;
        response["message"] = "Username and password are required";

        auto httpResponse = HttpResponse::newHttpJsonResponse(response);
        httpResponse->setStatusCode(k400BadRequest);
        httpResponse->addHeader("Access-Control-Allow-Origin", "*");

        callback(httpResponse);
        return;
    }

    authenticateUser(
        username,
        password,

        [callback](const Json::Value &response)
        {
            auto httpResponse = HttpResponse::newHttpJsonResponse(response);

            if (!response["success"].asBool())
            {
                httpResponse->setStatusCode(k401Unauthorized);
            }

            httpResponse->addHeader("Access-Control-Allow-Origin", "*");

            callback(httpResponse);
        }
    );
}


// =========================================================
// REGISTRATION CONTROLLER
// =========================================================

void registerUser(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();

    if (!json)
    {
        Json::Value response;
        response["success"] = false;
        response["message"] = "Invalid JSON data";

        auto httpResponse = HttpResponse::newHttpJsonResponse(response);
        httpResponse->addHeader("Access-Control-Allow-Origin", "*");

        callback(httpResponse);
        return;
    }

    std::string name = (*json)["name"].asString();
    std::string username = (*json)["username"].asString();
    std::string email = (*json)["email"].asString();
    std::string password = (*json)["password"].asString();
    std::string role = (*json)["role"].asString();

    if (name.empty() ||
        username.empty() ||
        email.empty() ||
        password.empty() ||
        role.empty())
    {
        Json::Value response;
        response["success"] = false;
        response["message"] = "All fields are required";

        auto httpResponse = HttpResponse::newHttpJsonResponse(response);
        httpResponse->setStatusCode(k400BadRequest);
        httpResponse->addHeader("Access-Control-Allow-Origin", "*");

        callback(httpResponse);
        return;
    }

    if (role != "buyer" && role != "seller")
    {
        Json::Value response;
        response["success"] = false;
        response["message"] = "Invalid role";

        auto httpResponse = HttpResponse::newHttpJsonResponse(response);
        httpResponse->setStatusCode(k400BadRequest);
        httpResponse->addHeader("Access-Control-Allow-Origin", "*");

        callback(httpResponse);
        return;
    }

    checkUsernameExists(
        username,

        [name, username, email, password, role, callback](bool exists)
        {
            if (exists)
            {
                Json::Value response;
                response["success"] = false;
                response["message"] = "Username already exists";

                auto httpResponse =
                    HttpResponse::newHttpJsonResponse(response);

                httpResponse->setStatusCode(k409Conflict);
                httpResponse->addHeader("Access-Control-Allow-Origin", "*");

                callback(httpResponse);
                return;
            }

            registerNewUser(
                name,
                username,
                email,
                password,
                role,

                [callback](const Json::Value &response)
                {
                    auto httpResponse =
                        HttpResponse::newHttpJsonResponse(response);

                    if (!response["success"].asBool())
                    {
                        httpResponse->setStatusCode(k500InternalServerError);
                    }

                    httpResponse->addHeader(
                        "Access-Control-Allow-Origin", "*");

                    callback(httpResponse);
                }
            );
        }
    );
}