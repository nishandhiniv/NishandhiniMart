#include <drogon/drogon.h>
#include <json/json.h>
#include <iostream>

int main()
{
    std::cout << "Backend starting..." << std::endl;

    // PostgreSQL connection
    drogon::app().createDbClient(
        "postgresql",
        "127.0.0.1",
        5432,
        "nishandhinimart",
        "postgres",
        "vanitha123",
        1
    );

    std::cout << "Database client created..." << std::endl;

    // CORS: Handle browser preflight requests
    drogon::app().registerSyncAdvice(
        [](const drogon::HttpRequestPtr& req)
            -> drogon::HttpResponsePtr
        {
            if (req->method() == drogon::HttpMethod::Options)
            {
                auto response =
                    drogon::HttpResponse::newHttpResponse();

                response->addHeader(
                    "Access-Control-Allow-Origin",
                    "http://127.0.0.1:5500"
                );

                response->addHeader(
                    "Access-Control-Allow-Methods",
                    "GET, POST, OPTIONS"
                );

                response->addHeader(
                    "Access-Control-Allow-Headers",
                    "Content-Type"
                );

                return response;
            }

            return nullptr;
        });

    // CORS: Add header to normal responses
    drogon::app().registerPostHandlingAdvice(
        [](const drogon::HttpRequestPtr& req,
           const drogon::HttpResponsePtr& response)
        {
            const auto& origin = req->getHeader("Origin");

            if (!origin.empty())
            {
                response->addHeader(
                    "Access-Control-Allow-Origin",
                    "http://127.0.0.1:5500"
                );
            }
        });

    // Products API
    drogon::app().registerHandler(
        "/api/products",
        [](const drogon::HttpRequestPtr&,
           std::function<void(
               const drogon::HttpResponsePtr&)>&& callback)
        {
            auto response =
                drogon::HttpResponse::newHttpResponse();

            response->setContentTypeCode(
                drogon::CT_APPLICATION_JSON);

            response->setBody(
                R"({"message":"Products API is working!"})");

            callback(response);
        });

    // Registration API
    drogon::app().registerHandler(
        "/api/register",
        [](const drogon::HttpRequestPtr& req,
           std::function<void(
               const drogon::HttpResponsePtr&)>&& callback)
        {
            auto json = req->getJsonObject();

            if (!json)
            {
                auto response =
                    drogon::HttpResponse::newHttpResponse();

                response->setStatusCode(
                    drogon::k400BadRequest);

                response->setBody("Invalid JSON");

                callback(response);
                return;
            }

            std::string name =
                (*json)["name"].asString();

            std::string username =
                (*json)["username"].asString();

            std::string email =
                (*json)["email"].asString();

            std::string password =
                (*json)["password"].asString();

            auto dbClient =
                drogon::app().getDbClient();

            dbClient->execSqlAsync(
                "INSERT INTO users "
                "(name, username, email, password_hash) "
                "VALUES ($1, $2, $3, $4)",

                [callback](
                    const drogon::orm::Result&)
                {
                    auto response =
                        drogon::HttpResponse::newHttpResponse();

                    response->setContentTypeCode(
                        drogon::CT_APPLICATION_JSON);

                    response->setBody(
                        R"({"message":"Registration successful!"})");

                    callback(response);
                },

                [callback](
                    const drogon::orm::DrogonDbException& e)
                {
                    auto response =
                        drogon::HttpResponse::newHttpResponse();

                    response->setStatusCode(
                        drogon::k500InternalServerError);

                    response->setBody(
                        std::string("Registration failed: ") +
                        e.base().what());

                    callback(response);
                },

                name,
                username,
                email,
                password);
        });

    // Login API
    drogon::app().registerHandler(
        "/api/login",
        [](const drogon::HttpRequestPtr& req,
           std::function<void(
               const drogon::HttpResponsePtr&)>&& callback)
        {
            auto json = req->getJsonObject();

            if (!json)
            {
                auto response =
                    drogon::HttpResponse::newHttpResponse();

                response->setStatusCode(
                    drogon::k400BadRequest);

                response->setBody("Invalid JSON");

                callback(response);
                return;
            }

            std::string username =
                (*json)["username"].asString();

            std::string password =
                (*json)["password"].asString();

            auto dbClient =
                drogon::app().getDbClient();

            dbClient->execSqlAsync(
                "SELECT id, name, username, email, role "
                "FROM users "
                "WHERE username = $1 "
                "AND password_hash = $2",

                [callback](
                    const drogon::orm::Result& result)
                {
                    auto response =
                        drogon::HttpResponse::newHttpResponse();

                    response->setContentTypeCode(
                        drogon::CT_APPLICATION_JSON);

                    if (result.empty())
                    {
                        response->setStatusCode(
                            drogon::k401Unauthorized);

                        response->setBody(
                            R"({"message":"Invalid username or password"})");
                    }
                    else
                    {
                        response->setBody(
                            R"({"message":"Login successful!"})");
                    }

                    callback(response);
                },

                [callback](
                    const drogon::orm::DrogonDbException& e)
                {
                    auto response =
                        drogon::HttpResponse::newHttpResponse();

                    response->setStatusCode(
                        drogon::k500InternalServerError);

                    response->setBody(
                        std::string("Login failed: ") +
                        e.base().what());

                    callback(response);
                },

                username,
                password);
        });

    // PostgreSQL test API
    drogon::app().registerHandler(
        "/api/db-test",
        [](const drogon::HttpRequestPtr&,
           std::function<void(
               const drogon::HttpResponsePtr&)>&& callback)
        {
            auto dbClient =
                drogon::app().getDbClient();

            dbClient->execSqlAsync(
                "SELECT 1",

                [callback](
                    const drogon::orm::Result&)
                {
                    auto response =
                        drogon::HttpResponse::newHttpResponse();

                    response->setContentTypeCode(
                        drogon::CT_APPLICATION_JSON);

                    response->setBody(
                        R"({"message":"PostgreSQL connection successful!"})");

                    callback(response);
                },

                [callback](
                    const drogon::orm::DrogonDbException& e)
                {
                    auto response =
                        drogon::HttpResponse::newHttpResponse();

                    response->setStatusCode(
                        drogon::k500InternalServerError);

                    response->setBody(
                        std::string("Database connection failed: ") +
                        e.base().what());

                    callback(response);
                });
        });

    std::cout << "About to start server..." << std::endl;

    std::cout << "Before server start..." << std::endl;

    drogon::app()
        .addListener("127.0.0.1", 8080)
        .run();

    return 0;
}