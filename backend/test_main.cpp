#include <drogon/drogon.h>
#include <iostream>
#include <cstdlib>
#include "Routes/route.h"

using namespace drogon;

int main()
{
    std::cout << "======================================" << std::endl;
    std::cout << "   NishandhiniMart BACKEND" << std::endl;
    std::cout << "======================================" << std::endl;

    // ======================================
    // Environment Variables
    // ======================================

    const char *dbHostEnv = std::getenv("DB_HOST");
    const char *dbPortEnv = std::getenv("DB_PORT");
    const char *dbNameEnv = std::getenv("DB_NAME");
    const char *dbUserEnv = std::getenv("DB_USER");
    const char *dbPasswordEnv = std::getenv("DB_PASSWORD");

    const char *portEnv = std::getenv("PORT");

    std::string dbHost =
        dbHostEnv ? dbHostEnv : "127.0.0.1";

    int dbPort =
        dbPortEnv ? std::stoi(dbPortEnv) : 5432;

    std::string dbName =
        dbNameEnv ? dbNameEnv : "nishandhinimart";

    std::string dbUser =
        dbUserEnv ? dbUserEnv : "postgres";

    std::string dbPassword =
        dbPasswordEnv ? dbPasswordEnv : "vanitha123";

    int serverPort =
        portEnv ? std::stoi(portEnv) : 8090;


    // ======================================
    // PostgreSQL
    // ======================================

    std::cout << "Creating PostgreSQL client..." << std::endl;

    app().createDbClient(
        "postgresql",
        dbHost,
        dbPort,
        dbName,
        dbUser,
        dbPassword,
        1
    );

    std::cout << "PostgreSQL client created successfully."
              << std::endl;


    // ======================================
    // CORS - Handle browser preflight request
    // ======================================

    app().registerPreRoutingAdvice(
        [](const HttpRequestPtr &req,
           AdviceCallback &&callback,
           AdviceChainCallback &&chainCallback)
        {
            if (req->method() == Options)
            {
                auto response =
                    HttpResponse::newHttpResponse();

                response->setStatusCode(k200OK);

                response->addHeader(
                    "Access-Control-Allow-Origin",
                    "*"
                );

                response->addHeader(
                    "Access-Control-Allow-Methods",
                    "GET, POST, PUT, DELETE, OPTIONS"
                );

                response->addHeader(
                    "Access-Control-Allow-Headers",
                    "Content-Type"
                );

                callback(response);
                return;
            }

            chainCallback();
        }
    );


    // ======================================
    // CORS - Add headers to every response
    // ======================================

    app().registerPreSendingAdvice(
        [](const HttpRequestPtr &req,
           const HttpResponsePtr &response)
        {
            response->addHeader(
                "Access-Control-Allow-Origin",
                "*"
            );

            response->addHeader(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS"
            );

            response->addHeader(
                "Access-Control-Allow-Headers",
                "Content-Type"
            );
        }
    );


    // ======================================
    // Routes
    // ======================================

    registerRoutes();


    // ======================================
    // Start server
    // ======================================

    // IMPORTANT:
    // Render requires 0.0.0.0 instead of 127.0.0.1

    app().addListener(
        "0.0.0.0",
        serverPort
    );

    std::cout << "Backend server starting..."
              << std::endl;

    std::cout << "Listening on:"
              << " 0.0.0.0:"
              << serverPort
              << std::endl;

    app().run();

    return 0;
}