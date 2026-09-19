#include <drogon/drogon.h>
#include <functional>
#include <string>

#include "../database/Database.h"

using namespace drogon;


// =========================================================
// AUTH SERVICE DECLARATIONS
// =========================================================

void authenticateUser(
    const std::string &username,
    const std::string &password,
    std::function<void(const Json::Value &)> callback
);

void checkUsernameExists(
    const std::string &username,
    std::function<void(bool)> callback
);
void changeUserPassword(
    int userId,
    const std::string &currentPassword,
    const std::string &newPassword,
    std::function<void(const Json::Value &)> callback
);

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
void registerNewUser(
    const std::string &name,
    const std::string &username,
    const std::string &email,
    const std::string &password,
    const std::string &role,
    const std::string &storeName,
    const std::string &phone,
    const std::string &address,
    std::function<void(const Json::Value &)> callback
);


// =========================================================
// LOGIN USER
// =========================================================

void loginUser(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
)
{
    auto jsonBody = req->getJsonObject();

    Json::Value response;

    if (!jsonBody)
    {
        response["success"] = false;
        response["message"] = "Invalid JSON body";

        callback(
            HttpResponse::newHttpJsonResponse(response)
        );

        return;
    }

    std::string username =
        (*jsonBody)["username"].asString();

    std::string password =
        (*jsonBody)["password"].asString();

    if (username.empty() || password.empty())
    {
        response["success"] = false;
        response["message"] =
            "Username/email and password are required";

        callback(
            HttpResponse::newHttpJsonResponse(response)
        );

        return;
    }

    authenticateUser(
        username,
        password,

        [callback](const Json::Value &serviceResponse)
        {
            callback(
                HttpResponse::newHttpJsonResponse(serviceResponse)
            );
        }
    );
}


// =========================================================
// REGISTER USER
// =========================================================

void registerUser(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
)
{
    auto jsonBody = req->getJsonObject();

    Json::Value response;

    if (!jsonBody)
    {
        response["success"] = false;
        response["message"] = "Invalid JSON body";

        callback(
            HttpResponse::newHttpJsonResponse(response)
        );

        return;
    }

    std::string name =
        (*jsonBody)["name"].asString();

    std::string username =
        (*jsonBody)["username"].asString();

    std::string email =
        (*jsonBody)["email"].asString();

    std::string password =
        (*jsonBody)["password"].asString();

    std::string role =
        (*jsonBody)["role"].asString();

    std::string storeName =
        (*jsonBody)["store_name"].asString();

    std::string phone =
        (*jsonBody)["phone"].asString();

    std::string address =
        (*jsonBody)["address"].asString();


    // Name is not required in frontend.
    // Use username as name if name is empty.
    if (name.empty())
    {
        name = username;
    }


    if (username.empty() ||
        email.empty() ||
        password.empty() ||
        role.empty())
    {
        response["success"] = false;
        response["message"] =
            "Username, email, password and role are required";

        callback(
            HttpResponse::newHttpJsonResponse(response)
        );

        return;
    }


    if (role != "buyer" && role != "seller")
    {
        response["success"] = false;
        response["message"] =
            "Only Buyer and Seller registration are allowed";

        callback(
            HttpResponse::newHttpJsonResponse(response)
        );

        return;
    }


    // Seller-specific validation
    if (role == "seller")
    {
        if (storeName.empty() ||
            phone.empty() ||
            address.empty())
        {
            response["success"] = false;
            response["message"] =
                "Seller store name, phone and address are required";

            callback(
                HttpResponse::newHttpJsonResponse(response)
            );

            return;
        }
    }


    checkUsernameExists(
        username,

        [name,
         username,
         email,
         password,
         role,
         storeName,
         phone,
         address,
         callback](bool exists)
        {
            Json::Value response;

            if (exists)
            {
                response["success"] = false;
                response["message"] =
                    "Username already exists";

                callback(
                    HttpResponse::newHttpJsonResponse(response)
                );

                return;
            }


            registerNewUser(
                name,
                username,
                email,
                password,
                role,
                storeName,
                phone,
                address,

                [callback](const Json::Value &serviceResponse)
                {
                    callback(
                        HttpResponse::newHttpJsonResponse(
                            serviceResponse
                        )
                    );
                }
            );
        }
    );
}
// =========================================================
// CHANGE PASSWORD
// =========================================================

void changePassword(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
)
{
    auto jsonBody = req->getJsonObject();

    Json::Value response;

    if (!jsonBody)
    {
        response["success"] = false;
        response["message"] = "Invalid JSON body";

        callback(
            HttpResponse::newHttpJsonResponse(response)
        );

        return;
    }

    int userId =
        (*jsonBody)["user_id"].asInt();

    std::string currentPassword =
        (*jsonBody)["current_password"].asString();

    std::string newPassword =
        (*jsonBody)["new_password"].asString();

    if (userId <= 0 ||
        currentPassword.empty() ||
        newPassword.empty())
    {
        response["success"] = false;
        response["message"] =
            "User ID, current password and new password are required";

        callback(
            HttpResponse::newHttpJsonResponse(response)
        );

        return;
    }

    if (newPassword.length() < 6)
    {
        response["success"] = false;
        response["message"] =
            "New password must contain at least 6 characters";

        callback(
            HttpResponse::newHttpJsonResponse(response)
        );

        return;
    }

    if (currentPassword == newPassword)
    {
        response["success"] = false;
        response["message"] =
            "New password must be different from current password";

        callback(
            HttpResponse::newHttpJsonResponse(response)
        );

        return;
    }

    changeUserPassword(
        userId,
        currentPassword,
        newPassword,

        [callback](const Json::Value &serviceResponse)
        {
            callback(
                HttpResponse::newHttpJsonResponse(
                    serviceResponse
                )
            );
        }
    );
}
// =========================================================
// EDIT SELLER PROFILE
// =========================================================

void updateSellerProfile(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
)
{
    auto jsonBody = req->getJsonObject();

    Json::Value response;

    if (!jsonBody)
    {
        response["success"] = false;
        response["message"] = "Invalid JSON body";

        callback(
            HttpResponse::newHttpJsonResponse(response)
        );

        return;
    }

    int userId =
        (*jsonBody)["user_id"].asInt();

    std::string username =
        (*jsonBody)["username"].asString();

    std::string email =
        (*jsonBody)["email"].asString();

    std::string storeName =
        (*jsonBody)["store_name"].asString();

    std::string phone =
        (*jsonBody)["phone"].asString();

    std::string address =
        (*jsonBody)["address"].asString();


    // -----------------------------------------------------
    // Validation
    // -----------------------------------------------------

    if (userId <= 0)
    {
        response["success"] = false;
        response["message"] = "Invalid user ID";

        callback(
            HttpResponse::newHttpJsonResponse(response)
        );

        return;
    }


    if (
        username.empty() ||
        email.empty() ||
        storeName.empty() ||
        phone.empty() ||
        address.empty()
    )
    {
        response["success"] = false;
        response["message"] =
            "Please fill all profile fields";

        callback(
            HttpResponse::newHttpJsonResponse(response)
        );

        return;
    }


    // -----------------------------------------------------
    // Update profile through service
    // -----------------------------------------------------

    updateUserProfile(
        userId,
        username,
        email,
        storeName,
        phone,
        address,

        [callback](const Json::Value &serviceResponse)
        {
            callback(
                HttpResponse::newHttpJsonResponse(
                    serviceResponse
                )
            );
        }
    );
}
// =========================================================
// UPDATE SELLER VERIFICATION DETAILS
// =========================================================

void updateSellerVerificationDetails(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback
)
{
    auto jsonBody = req->getJsonObject();

    Json::Value response;

    if (!jsonBody)
    {
        response["success"] = false;
        response["message"] = "Invalid JSON body";

        callback(
            HttpResponse::newHttpJsonResponse(response)
        );

        return;
    }

    int userId =
        (*jsonBody)["user_id"].asInt();

    std::string gstNumber =
        (*jsonBody)["gst_number"].asString();

    std::string businessLicense =
        (*jsonBody)["business_license"].asString();


    if (userId <= 0)
    {
        response["success"] = false;
        response["message"] = "Invalid user ID";

        callback(
            HttpResponse::newHttpJsonResponse(response)
        );

        return;
    }


    updateSellerVerification(
        userId,
        gstNumber,
        businessLicense,

        [callback](const Json::Value &serviceResponse)
        {
            callback(
                HttpResponse::newHttpJsonResponse(
                    serviceResponse
                )
            );
        }
    );
}