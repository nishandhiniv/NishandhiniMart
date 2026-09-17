#include <drogon/drogon.h>
#include "../database/Database.h"

using namespace drogon;
using namespace drogon::orm;

// =========================================================
// AUTHENTICATE USER - LOGIN DATABASE LOGIC
// =========================================================

void authenticateUser(
    const std::string &username,
    const std::string &password,
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient = getDatabaseClient();

    dbClient->execSqlAsync(
        "SELECT id, name, username, email, role "
        "FROM users "
        "WHERE username = $1 AND password_hash = $2",

        [callback](const Result &result)
        {
            Json::Value response;

            if (result.empty())
            {
                response["success"] = false;
                response["message"] = "Invalid username or password";

                callback(response);
                return;
            }

            const auto &row = result[0];

            response["success"] = true;
            response["message"] = "Login successful";

            Json::Value user;
            user["id"] = row["id"].as<int>();
            user["name"] = row["name"].as<std::string>();
            user["username"] = row["username"].as<std::string>();
            user["email"] = row["email"].as<std::string>();
            user["role"] = row["role"].as<std::string>();

            response["user"] = user;

            callback(response);
        },

        [callback](const DrogonDbException &error)
        {
            Json::Value response;
            response["success"] = false;
            response["message"] = error.base().what();

            callback(response);
        },

        username,
        password
    );
}


// =========================================================
// CHECK USERNAME EXISTS - REGISTRATION SUPPORT
// =========================================================

void checkUsernameExists(
    const std::string &username,
    std::function<void(bool)> callback)
{
    auto dbClient = app().getDbClient("default");

    dbClient->execSqlAsync(
        "SELECT id FROM users WHERE username = $1",

        [callback](const Result &result)
        {
            callback(!result.empty());
        },

        [callback](const DrogonDbException &error)
        {
            callback(false);
        },

        username
    );
}


// =========================================================
// REGISTER USER - DATABASE INSERT LOGIC
// =========================================================

void registerNewUser(
    const std::string &name,
    const std::string &username,
    const std::string &email,
    const std::string &password,
    const std::string &role,
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient = app().getDbClient("default");

    dbClient->execSqlAsync(
        "INSERT INTO users "
        "(name, username, email, password_hash, role) "
        "VALUES ($1, $2, $3, $4, $5) "
        "RETURNING id",

        [callback](const Result &result)
        {
            Json::Value response;
            response["success"] = true;
            response["message"] = "Registration successful";

            if (!result.empty())
            {
                response["user_id"] = result[0]["id"].as<int>();
            }

            callback(response);
        },

        [callback](const DrogonDbException &error)
        {
            Json::Value response;
            response["success"] = false;
            response["message"] = error.base().what();

            callback(response);
        },

        name,
        username,
        email,
        password,
        role
    );
}