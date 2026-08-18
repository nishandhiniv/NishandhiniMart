#include <drogon/drogon.h>

int main()
{
    // PostgreSQL connection
    drogon::app().createDbClient(
        "postgresql",
        "127.0.0.1",
        5432,
        "postgres",
        "postgres",
        "vanitha123",
        1
    );

    // Existing Products API
    drogon::app().registerHandler(
        "/api/products",
        [](const drogon::HttpRequestPtr&,
           std::function<void(const drogon::HttpResponsePtr&)>&& callback)
        {
            auto response = drogon::HttpResponse::newHttpResponse();
            response->setContentTypeCode(drogon::CT_APPLICATION_JSON);
            response->setBody(
                R"({"message":"Products API is working!"})"
            );
            callback(response);
        });

    // PostgreSQL test API
    drogon::app().registerHandler(
        "/api/db-test",
        [](const drogon::HttpRequestPtr&,
           std::function<void(const drogon::HttpResponsePtr&)>&& callback)
        {
            auto dbClient = drogon::app().getDbClient();

            dbClient->execSqlAsync(
                "SELECT 1",
                [callback](const drogon::orm::Result&)
                {
                    auto response =
                        drogon::HttpResponse::newHttpResponse();

                    response->setContentTypeCode(
                        drogon::CT_APPLICATION_JSON);

                    response->setBody(
                        R"({"message":"PostgreSQL connection successful!"})");

                    callback(response);
                },
                [callback](const drogon::orm::DrogonDbException& e)
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

    // User Registration API
    drogon::app().registerHandler(
        "/api/register",
        [](const drogon::HttpRequestPtr& req,
           std::function<void(const drogon::HttpResponsePtr&)>&& callback)
        {
            auto json = req->getJsonObject();

            if (!json ||
                !json->isMember("name") ||
                !json->isMember("username") ||
                !json->isMember("email") ||
                !json->isMember("password") ||
                !json->isMember("role"))
            {
                auto response =
                    drogon::HttpResponse::newHttpResponse();

                response->setStatusCode(
                    drogon::k400BadRequest);

                response->setContentTypeCode(
                    drogon::CT_APPLICATION_JSON);

                response->setBody(
                    R"({"message":"All registration fields are required."})");

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

            std::string role =
                (*json)["role"].asString();

            if (role != "buyer" && role != "seller")
            {
                auto response =
                    drogon::HttpResponse::newHttpResponse();

                response->setStatusCode(
                    drogon::k400BadRequest);

                response->setContentTypeCode(
                    drogon::CT_APPLICATION_JSON);

                response->setBody(
                    R"({"message":"Role must be buyer or seller."})");

                callback(response);
                return;
            }

            auto dbClient = drogon::app().getDbClient();

            dbClient->execSqlAsync(
                "INSERT INTO users "
                "(name, username, email, password_hash, role) "
                "VALUES ($1, $2, $3, $4, $5)",
                
                [callback](const drogon::orm::Result&)
                {
                    auto response =
                        drogon::HttpResponse::newHttpResponse();

                    response->setStatusCode(
                        drogon::k201Created);

                    response->setContentTypeCode(
                        drogon::CT_APPLICATION_JSON);

                    response->setBody(
                        R"({"message":"User registered successfully!"})");

                    callback(response);
                },

                [callback](const drogon::orm::DrogonDbException& e)
                {
                    auto response =
                        drogon::HttpResponse::newHttpResponse();

                    response->setStatusCode(
                        drogon::k400BadRequest);

                    response->setContentTypeCode(
                        drogon::CT_APPLICATION_JSON);

                    response->setBody(
                        std::string(
                            R"({"message":"Registration failed: )") +
                        e.base().what() +
                        R"("})");

                    callback(response);
                },

                name,
                username,
                email,
                password,
                role
            );
        });

    // Start server
    drogon::app()
        .addListener("127.0.0.1", 8080)
        .run();

    return 0;
}