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
        "SELECT id, name, username, email, role, "
        "store_name, phone, address "
        "FROM users "
        "WHERE (username = $1 OR email = $1) "
        "AND password_hash = $2",

        [callback](const Result &result)
        {
            Json::Value response;

            if (result.empty())
            {
                response["success"] = false;
                response["message"] =
                    "Invalid username/email or password";

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

            if (!row["store_name"].isNull())
                user["store_name"] =
                    row["store_name"].as<std::string>();
            else
                user["store_name"] = "";

            if (!row["phone"].isNull())
                user["phone"] =
                    row["phone"].as<std::string>();
            else
                user["phone"] = "";

            if (!row["address"].isNull())
                user["address"] =
                    row["address"].as<std::string>();
            else
                user["address"] = "";

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
    const std::string &storeName,
    const std::string &phone,
    const std::string &address,
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient = app().getDbClient("default");

    dbClient->execSqlAsync(
        "INSERT INTO users "
        "(name, username, email, password_hash, role, "
        "store_name, phone, address) "
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8) "
        "RETURNING id",

        [callback](const Result &result)
        {
            Json::Value response;
            response["success"] = true;
            response["message"] =
                "Registration successful";

            if (!result.empty())
            {
                response["user_id"] =
                    result[0]["id"].as<int>();
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
        role,
        storeName,
        phone,
        address
    );
}
void updateUserProfile(
    int userId,
    const std::string &username,
    const std::string &email,
    const std::string &storeName,
    const std::string &phone,
    const std::string &address,
    std::function<void(const Json::Value &)> callback
);
void updateSellerVerification(
    int userId,
    const std::string &gstNumber,
    const std::string &businessLicense,
    std::function<void(const Json::Value &)> callback
);
// =========================================================
// CHANGE PASSWORD - DATABASE LOGIC
// =========================================================

void changeUserPassword(
    int userId,
    const std::string &currentPassword,
    const std::string &newPassword,
    std::function<void(const Json::Value &)> callback)
{
    auto dbClient = app().getDbClient("default");

    // First verify the current password.
    dbClient->execSqlAsync(
        "SELECT id FROM users "
        "WHERE id = $1 AND password_hash = $2",

        [dbClient, userId, newPassword, callback]
        (const Result &result)
        {
            Json::Value response;

            if (result.empty())
            {
                response["success"] = false;
                response["message"] =
                    "Current password is incorrect";

                callback(response);
                return;
            }

            // Current password is correct.
            // Now update it.
            dbClient->execSqlAsync(
                "UPDATE users "
                "SET password_hash = $1 "
                "WHERE id = $2",

                [callback](const Result &updateResult)
                {
                    Json::Value response;

                    response["success"] = true;
                    response["message"] =
                        "Password changed successfully";

                    callback(response);
                },

                [callback](const DrogonDbException &error)
                {
                    Json::Value response;

                    response["success"] = false;
                    response["message"] =
                        error.base().what();

                    callback(response);
                },

                newPassword,
                userId
            );
        },

        [callback](const DrogonDbException &error)
        {
            Json::Value response;

            response["success"] = false;
            response["message"] =
                error.base().what();

            callback(response);
        },

        userId,
        currentPassword
    );
}// =========================================================
// UPDATE SELLER PROFILE
// =========================================================

void updateUserProfile(
    int userId,
    const std::string &username,
    const std::string &email,
    const std::string &storeName,
    const std::string &phone,
    const std::string &address,
    std::function<void(const Json::Value &)> callback
)
{
    auto dbClient =
        app().getDbClient("default");

    dbClient->execSqlAsync(

        "UPDATE users "
        "SET username = $1, "
        "email = $2, "
        "store_name = $3, "
        "phone = $4, "
        "address = $5 "
        "WHERE id = $6",

        [callback](const Result &result)
        {
            Json::Value response;

            response["success"] = true;
            response["message"] =
                "Profile updated successfully";

            callback(response);
        },

        [callback](const DrogonDbException &error)
        {
            Json::Value response;

            response["success"] = false;
            response["message"] =
                error.base().what();

            callback(response);
        },

        username,
        email,
        storeName,
        phone,
        address,
        userId
    );
}
// =========================================================
// UPDATE SELLER VERIFICATION DETAILS
// =========================================================

void updateSellerVerification(
    int userId,
    const std::string &gstNumber,
    const std::string &businessLicense,
    std::function<void(const Json::Value &)> callback
)
{
    auto dbClient =
        app().getDbClient("default");

    dbClient->execSqlAsync(

        "UPDATE users "
        "SET gst_number = $1, "
        "business_license = $2 "
        "WHERE id = $3",

        [callback](const Result &result)
        {
            Json::Value response;

            response["success"] = true;
            response["message"] =
                "Verification details updated successfully";

            callback(response);
        },

        [callback](const DrogonDbException &error)
        {
            Json::Value response;

            response["success"] = false;
            response["message"] =
                error.base().what();

            callback(response);
        },

        gstNumber,
        businessLicense,
        userId
    );
}