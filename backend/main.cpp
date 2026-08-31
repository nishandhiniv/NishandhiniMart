#include <drogon/drogon.h>
#include <iostream>

using namespace drogon;
using namespace drogon::orm;

int main()
{
    std::cout << "======================================" << std::endl;
    std::cout << "       NishandhiniMart Backend        " << std::endl;
    std::cout << "======================================" << std::endl;

    // =================================================
    // PostgreSQL DATABASE CONNECTION
    // =================================================

    try
    {
        std::cout << "Creating PostgreSQL client..." << std::endl;

        app().createDbClient(
            "postgresql",
            "127.0.0.1",
            5432,
            "nishandhinimart",
            "postgres",
            "vanitha123",
            1
        );

        std::cout << "PostgreSQL client created successfully."
                  << std::endl;
    }
    catch (const std::exception &e)
    {
        std::cerr << "Database connection error: "
                  << e.what() << std::endl;

        return 1;
    }

    // =================================================
    // TEST API
    // GET /api/test
    // =================================================

    app().registerHandler(
        "/api/test",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            Json::Value json;

            json["message"] =
                "NishandhiniMart Backend is working!";

            auto response =
                HttpResponse::newHttpJsonResponse(json);

            response->addHeader(
                "Access-Control-Allow-Origin", "*");

            response->addHeader(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS");

            response->addHeader(
                "Access-Control-Allow-Headers",
                "Content-Type");

            callback(response);
        });

    // =================================================
    // DATABASE TEST API
    // GET /api/db-test
    // =================================================

    app().registerHandler(
        "/api/db-test",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            auto dbClient = app().getDbClient();

            dbClient->execSqlAsync(
                "SELECT 1",

                // SUCCESS
                [callback](const Result &result)
                {
                    Json::Value json;

                    json["message"] =
                        "PostgreSQL connection successful!";

                    auto response =
                        HttpResponse::newHttpJsonResponse(json);

                    response->addHeader(
                        "Access-Control-Allow-Origin", "*");

                    callback(response);
                },

                // ERROR
                [callback](const DrogonDbException &e)
                {
                    Json::Value json;

                    json["message"] =
                        "PostgreSQL connection failed";

                    json["error"] =
                        e.base().what();

                    auto response =
                        HttpResponse::newHttpJsonResponse(json);

                    response->setStatusCode(
                        k500InternalServerError);

                    response->addHeader(
                        "Access-Control-Allow-Origin", "*");

                    callback(response);
                });
        });

    // =================================================
    // REGISTER API
    // POST /api/register
    // =================================================

    app().registerHandler(
        "/api/register",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            Json::Value jsonResponse;

            auto json = req->getJsonObject();

            // Check JSON
            if (!json)
            {
                jsonResponse["success"] = false;
                jsonResponse["message"] =
                    "Invalid JSON data";

                auto response =
                    HttpResponse::newHttpJsonResponse(
                        jsonResponse);

                response->setStatusCode(
                    k400BadRequest);

                response->addHeader(
                    "Access-Control-Allow-Origin", "*");

                callback(response);
                return;
            }

            // Get values
            std::string name =
                (*json)["name"].asString();

            std::string username =
                (*json)["username"].asString();

            std::string email =
                (*json)["email"].asString();

            std::string password =
                (*json)["password"].asString();

            std::string role =
                (*json)["role"].asString();

            // Validate
            if (name.empty() ||
                username.empty() ||
                email.empty() ||
                password.empty() ||
                role.empty())
            {
                jsonResponse["success"] = false;
                jsonResponse["message"] =
                    "All fields are required";

                auto response =
                    HttpResponse::newHttpJsonResponse(
                        jsonResponse);

                response->setStatusCode(
                    k400BadRequest);

                response->addHeader(
                    "Access-Control-Allow-Origin", "*");

                callback(response);
                return;
            }

            // Only buyer / seller
            if (role != "buyer" &&
                role != "seller")
            {
                jsonResponse["success"] = false;
                jsonResponse["message"] =
                    "Only buyer and seller can register";

                auto response =
                    HttpResponse::newHttpJsonResponse(
                        jsonResponse);

                response->setStatusCode(
                    k400BadRequest);

                response->addHeader(
                    "Access-Control-Allow-Origin", "*");

                callback(response);
                return;
            }

            auto dbClient =
                app().getDbClient();

            // Check username
            dbClient->execSqlAsync(
                "SELECT id FROM users WHERE username = ?",

                [dbClient,
                 name,
                 username,
                 email,
                 password,
                 role,
                 callback](const Result &result)
                {
                    // Username exists
                    if (result.size() > 0)
                    {
                        Json::Value jsonResponse;

                        jsonResponse["success"] = false;
                        jsonResponse["message"] =
                            "Username already exists";

                        auto response =
                            HttpResponse::newHttpJsonResponse(
                                jsonResponse);

                        response->setStatusCode(
                            k409Conflict);

                        response->addHeader(
                            "Access-Control-Allow-Origin",
                            "*");

                        callback(response);
                        return;
                    }

                    // Insert user
                    dbClient->execSqlAsync(
                        "INSERT INTO users "
                        "(name, username, email, password_hash, role) "
                        "VALUES (?, ?, ?, ?, ?)",

                        [callback](const Result &result)
                        {
                            Json::Value jsonResponse;

                            jsonResponse["success"] = true;
                            jsonResponse["message"] =
                                "Registration successful";

                            auto response =
                                HttpResponse::newHttpJsonResponse(
                                    jsonResponse);

                            response->addHeader(
                                "Access-Control-Allow-Origin",
                                "*");

                            callback(response);
                        },

                        // Insert error
                        [callback](const DrogonDbException &e)
                        {
                            Json::Value jsonResponse;

                            jsonResponse["success"] = false;
                            jsonResponse["message"] =
                                "Registration failed";

                            jsonResponse["error"] =
                                e.base().what();

                            auto response =
                                HttpResponse::newHttpJsonResponse(
                                    jsonResponse);

                            response->setStatusCode(
                                k500InternalServerError);

                            response->addHeader(
                                "Access-Control-Allow-Origin",
                                "*");

                            callback(response);
                        },

                        name,
                        username,
                        email,
                        password,
                        role);
                },

                // SELECT error
                [callback](const DrogonDbException &e)
                {
                    Json::Value jsonResponse;

                    jsonResponse["success"] = false;
                    jsonResponse["message"] =
                        "Database error";

                    jsonResponse["error"] =
                        e.base().what();

                    auto response =
                        HttpResponse::newHttpJsonResponse(
                            jsonResponse);

                    response->setStatusCode(
                        k500InternalServerError);

                    response->addHeader(
                        "Access-Control-Allow-Origin",
                        "*");

                    callback(response);
                },

                username);
        });

    // =================================================
    // LOGIN API
    // POST /api/login
    // =================================================

    app().registerHandler(
        "/api/login",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            Json::Value jsonResponse;

            auto json =
                req->getJsonObject();

            if (!json)
            {
                jsonResponse["success"] = false;
                jsonResponse["message"] =
                    "Invalid JSON data";

                auto response =
                    HttpResponse::newHttpJsonResponse(
                        jsonResponse);

                response->setStatusCode(
                    k400BadRequest);

                response->addHeader(
                    "Access-Control-Allow-Origin", "*");

                callback(response);
                return;
            }

            std::string username =
                (*json)["username"].asString();

            std::string password =
                (*json)["password"].asString();

            if (username.empty() ||
                password.empty())
            {
                jsonResponse["success"] = false;
                jsonResponse["message"] =
                    "Username and password are required";

                auto response =
                    HttpResponse::newHttpJsonResponse(
                        jsonResponse);

                response->setStatusCode(
                    k400BadRequest);

                response->addHeader(
                    "Access-Control-Allow-Origin", "*");

                callback(response);
                return;
            }

            auto dbClient =
                app().getDbClient();

            dbClient->execSqlAsync(
                "SELECT id, name, username, email, role "
                "FROM users "
                "WHERE username = 1$ AND password_hash = 2$",

                // SUCCESS
                [callback](const Result &result)
                {
                    Json::Value jsonResponse;

                    if (result.size() == 0)
                    {
                        jsonResponse["success"] = false;
                        jsonResponse["message"] =
                            "Invalid username or password";

                        auto response =
                            HttpResponse::newHttpJsonResponse(
                                jsonResponse);

                        response->setStatusCode(
                            k401Unauthorized);

                        response->addHeader(
                            "Access-Control-Allow-Origin",
                            "*");

                        callback(response);
                        return;
                    }

                    const auto &row =
                        result[0];

                    jsonResponse["success"] =
                        true;

                    jsonResponse["message"] =
                        "Login successful";

                    jsonResponse["user"]["id"] =
                        row["id"].as<int>();

                    jsonResponse["user"]["name"] =
                        row["name"].as<std::string>();

                    jsonResponse["user"]["username"] =
                        row["username"].as<std::string>();

                    jsonResponse["user"]["email"] =
                        row["email"].as<std::string>();

                    jsonResponse["user"]["role"] =
                        row["role"].as<std::string>();

                    auto response =
                        HttpResponse::newHttpJsonResponse(
                            jsonResponse);

                    response->addHeader(
                        "Access-Control-Allow-Origin",
                        "*");

                    callback(response);
                },

                // ERROR
                [callback](const DrogonDbException &e)
                {
                    Json::Value jsonResponse;

                    jsonResponse["success"] = false;
                    jsonResponse["message"] =
                        "Database error";

                    jsonResponse["error"] =
                        e.base().what();

                    auto response =
                        HttpResponse::newHttpJsonResponse(
                            jsonResponse);

                    response->setStatusCode(
                        k500InternalServerError);

                    response->addHeader(
                        "Access-Control-Allow-Origin",
                        "*");

                    callback(response);
                },

                username,
                password);
        });

    // =================================================
    // PRODUCTS API
    // GET /api/products
    // =================================================

    app().registerHandler(
        "/api/products",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            auto dbClient =
                app().getDbClient();

            dbClient->execSqlAsync(
                "SELECT id, product_name, description, "
                "price, image, category "
                "FROM products "
                "ORDER BY id",

                // SUCCESS
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
                            row["image"]
                                .as<std::string>();

                        product["category"] =
                            row["category"]
                                .as<std::string>();

                        products.append(product);
                    }

                    auto response =
                        HttpResponse::newHttpJsonResponse(
                            products);

                    response->addHeader(
                        "Access-Control-Allow-Origin",
                        "*");

                    callback(response);
                },

                // ERROR
                [callback](const DrogonDbException &e)
                {
                    Json::Value jsonResponse;

                    jsonResponse["success"] =
                        false;

                    jsonResponse["message"] =
                        "Failed to fetch products";

                    jsonResponse["error"] =
                        e.base().what();

                    auto response =
                        HttpResponse::newHttpJsonResponse(
                            jsonResponse);

                    response->setStatusCode(
                        k500InternalServerError);

                    response->addHeader(
                        "Access-Control-Allow-Origin",
                        "*");

                    callback(response);
                });
        });

    // =================================================
    // CREATE ORDER API
    // POST /api/orders
    // =================================================

    app().registerHandler(
        "/api/orders",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            Json::Value responseJson;

            auto json =
                req->getJsonObject();

            if (!json)
            {
                responseJson["success"] = false;
                responseJson["message"] =
                    "Invalid JSON data";

                auto response =
                    HttpResponse::newHttpJsonResponse(
                        responseJson);

                response->setStatusCode(
                    k400BadRequest);

                response->addHeader(
                    "Access-Control-Allow-Origin",
                    "*");

                callback(response);
                return;
            }

            int userId =
                (*json)["user_id"].asInt();

            double totalAmount =
                (*json)["total_amount"].asDouble();

            if (userId <= 0 ||
                totalAmount <= 0)
            {
                responseJson["success"] = false;
                responseJson["message"] =
                    "Invalid user ID or total amount";

                auto response =
                    HttpResponse::newHttpJsonResponse(
                        responseJson);

                response->setStatusCode(
                    k400BadRequest);

                response->addHeader(
                    "Access-Control-Allow-Origin",
                    "*");

                callback(response);
                return;
            }

            auto dbClient =
                app().getDbClient();

            dbClient->execSqlAsync(
                "INSERT INTO orders "
                "(user_id, total_amount, status) "
                "VALUES ($1, $2, 'Pending') "
                "RETURNING id",

                // SUCCESS
                [callback](const Result &result)
                {
                    Json::Value jsonResponse;

                    if (result.empty())
                    {
                        jsonResponse["success"] =
                            false;

                        jsonResponse["message"] =
                            "Order creation failed";

                        auto response =
                            HttpResponse::newHttpJsonResponse(
                                jsonResponse);

                        response->setStatusCode(
                            k500InternalServerError);

                        callback(response);
                        return;
                    }

                    int orderId =
                        result[0]["id"].as<int>();

                    jsonResponse["success"] =
                        true;

                    jsonResponse["message"] =
                        "Order created successfully";

                    jsonResponse["order_id"] =
                        orderId;

                    auto response =
                        HttpResponse::newHttpJsonResponse(
                            jsonResponse);

                    response->addHeader(
                        "Access-Control-Allow-Origin",
                        "*");

                    callback(response);
                },

                // ERROR
                [callback](const DrogonDbException &e)
                {
                    Json::Value jsonResponse;

                    jsonResponse["success"] =
                        false;

                    jsonResponse["message"] =
                        "Database error";

                    jsonResponse["error"] =
                        e.base().what();

                    auto response =
                        HttpResponse::newHttpJsonResponse(
                            jsonResponse);

                    response->setStatusCode(
                        k500InternalServerError);

                    response->addHeader(
                        "Access-Control-Allow-Origin",
                        "*");

                    callback(response);
                },

                userId,
                totalAmount);
        });

    // =================================================
    // CREATE ORDER ITEM API
    // POST /api/order-items
    // =================================================

    app().registerHandler(
        "/api/order-items",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback)
        {
            Json::Value responseJson;

            // -----------------------------------------
            // Get JSON
            // -----------------------------------------

            auto json =
                req->getJsonObject();

            if (!json)
            {
                responseJson["success"] = false;
                responseJson["message"] =
                    "Invalid JSON data";

                auto response =
                    HttpResponse::newHttpJsonResponse(
                        responseJson);

                response->setStatusCode(
                    k400BadRequest);

                response->addHeader(
                    "Access-Control-Allow-Origin",
                    "*");

                callback(response);
                return;
            }

            // -----------------------------------------
            // Get values
            // -----------------------------------------

            int orderId =
                (*json)["order_id"].asInt();

            int productId =
                (*json)["product_id"].asInt();

            int quantity =
                (*json)["quantity"].asInt();

            double price =
                (*json)["price"].asDouble();

            // -----------------------------------------
            // Validate
            // -----------------------------------------

            if (orderId <= 0 ||
                productId <= 0 ||
                quantity <= 0 ||
                price <= 0)
            {
                responseJson["success"] = false;

                responseJson["message"] =
                    "Invalid order ID, product ID, "
                    "quantity or price";

                auto response =
                    HttpResponse::newHttpJsonResponse(
                        responseJson);

                response->setStatusCode(
                    k400BadRequest);

                response->addHeader(
                    "Access-Control-Allow-Origin",
                    "*");

                callback(response);
                return;
            }

            // -----------------------------------------
            // Database client
            // -----------------------------------------

            auto dbClient =
                app().getDbClient();

            // -----------------------------------------
            // INSERT ORDER ITEM
            // -----------------------------------------

            dbClient->execSqlAsync(
                "INSERT INTO order_items "
                "(order_id, product_id, quantity, price) "
                "VALUES ($1, $2, $3, $4) "
                "RETURNING id",

                // -------------------------------------
                // SUCCESS
                // -------------------------------------

                [callback](const Result &result)
                {
                    Json::Value jsonResponse;

                    if (result.empty())
                    {
                        jsonResponse["success"] =
                            false;

                        jsonResponse["message"] =
                            "Order item creation failed";

                        auto response =
                            HttpResponse::newHttpJsonResponse(
                                jsonResponse);

                        response->setStatusCode(
                            k500InternalServerError);

                        response->addHeader(
                            "Access-Control-Allow-Origin",
                            "*");

                        callback(response);
                        return;
                    }

                    int itemId =
                        result[0]["id"].as<int>();

                    jsonResponse["success"] =
                        true;

                    jsonResponse["message"] =
                        "Order item added successfully";

                    jsonResponse["item_id"] =
                        itemId;

                    auto response =
                        HttpResponse::newHttpJsonResponse(
                            jsonResponse);

                    response->addHeader(
                        "Access-Control-Allow-Origin",
                        "*");

                    callback(response);
                },

                // -------------------------------------
                // ERROR
                // -------------------------------------

                [callback](const DrogonDbException &e)
                {
                    Json::Value jsonResponse;

                    jsonResponse["success"] =
                        false;

                    jsonResponse["message"] =
                        "Database error";

                    jsonResponse["error"] =
                        e.base().what();

                    auto response =
                        HttpResponse::newHttpJsonResponse(
                            jsonResponse);

                    response->setStatusCode(
                        k500InternalServerError);

                    response->addHeader(
                        "Access-Control-Allow-Origin",
                        "*");

                    callback(response);
                },

                orderId,
                productId,
                quantity,
                price);
        });
     // -------------------------------------------------
// GET MY ORDERS API
// -------------------------------------------------

app().registerHandler(
    "/api/orders/{user_id}",
    [](const HttpRequestPtr &req,
       std::function<void(const HttpResponsePtr &)> &&callback,
       int userId)
    {
        auto dbClient = app().getDbClient();

        dbClient->execSqlAsync(
            "SELECT id, user_id, total_amount, status, created_at "
            "FROM orders "
            "WHERE user_id = $1 "
            "ORDER BY id DESC",

            [callback](const Result &result)
            {
                Json::Value orders(Json::arrayValue);

                for (const auto &row : result)
                {
                    Json::Value order;

                    order["id"] =
                        row["id"].as<int>();

                    order["user_id"] =
                        row["user_id"].as<int>();

                    order["total_amount"] =
                        row["total_amount"].as<double>();

                    order["status"] =
                        row["status"].as<std::string>();

                    order["created_at"] =
                        row["created_at"].as<std::string>();

                    orders.append(order);
                }

                auto response =
                    HttpResponse::newHttpJsonResponse(orders);

                response->addHeader(
                    "Access-Control-Allow-Origin",
                    "*");

                callback(response);
            },

            [callback](const DrogonDbException &e)
            {
                Json::Value json;

                json["success"] = false;
                json["message"] =
                    "Failed to fetch orders";

                json["error"] =
                    e.base().what();

                auto response =
                    HttpResponse::newHttpJsonResponse(json);

                response->setStatusCode(
                    k500InternalServerError);

                response->addHeader(
                    "Access-Control-Allow-Origin",
                    "*");

                callback(response);
            },

            userId);
    });
    // =================================================
    // SERVER CONFIGURATION
    // =================================================

    app().addListener(
        "127.0.0.1",
        8080);

    std::cout << "Server starting..." << std::endl;

    std::cout << "URL: http://127.0.0.1:8080"
              << std::endl;

    // =================================================
    // START DROGON
    // =================================================

    app().run();

    return 0;
}