#include <drogon/drogon.h>
#include <iostream>
#include "Routes/route.h"

using namespace drogon;

int main()
{
    std::cout << "======================================" << std::endl;
    std::cout << "   NishandhiniMart TEST BACKEND" << std::endl;
    std::cout << "======================================" << std::endl;

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

    std::cout << "PostgreSQL client created successfully." << std::endl;

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
                auto response = HttpResponse::newHttpResponse();

                response->setStatusCode(k200OK);

                response->addHeader(
                    "Access-Control-Allow-Origin",
                    "http://127.0.0.1:5500"
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
                "http://127.0.0.1:5500"
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
    // Start server
    // ======================================

    app().addListener("127.0.0.1", 8090);

    std::cout << "Test server starting..." << std::endl;
    std::cout << "URL: http://127.0.0.1:8090" << std::endl;

    registerRoutes();

    app().run();

    return 0;
}