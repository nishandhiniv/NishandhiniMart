#include "ChatbotController.h"

#include "ChatbotService.h"

#include <chrono>
#include <deque>
#include <mutex>
#include <string>
#include <unordered_map>

#include <drogon/drogon.h>

namespace
{
    constexpr std::size_t MAX_MESSAGE_LENGTH = 2000;
    constexpr std::size_t MAX_REQUESTS_PER_MINUTE = 10;

    struct SessionRateData
    {
        std::deque<
            std::chrono::steady_clock::time_point>
            requests;
    };

    std::mutex rateLimitMutex;

    std::unordered_map<
        std::string,
        SessionRateData>
        sessionRateData;

    std::unordered_map<
        std::string,
        std::string>
        responseCache;

    std::string getSessionKey(
        const drogon::HttpRequestPtr& req)
    {
        std::string token =
            req->getHeader("X-Auth-Token");

        if (!token.empty())
        {
            return token;
        }

        std::string cookie =
            req->getHeader("Cookie");

        const std::string cookieName =
            "session_token=";

        std::size_t position =
            cookie.find(cookieName);

        if (position != std::string::npos)
        {
            position += cookieName.length();

            std::size_t end =
                cookie.find(";", position);

            if (end == std::string::npos)
            {
                token =
                    cookie.substr(position);
            }
            else
            {
                token =
                    cookie.substr(
                        position,
                        end - position);
            }
        }

        if (!token.empty())
        {
            return token;
        }

        return req->getPeerAddr().toIp();
    }

    bool isRateLimited(
        const std::string& sessionKey)
    {
        auto now =
            std::chrono::steady_clock::now();

        auto& data =
            sessionRateData[sessionKey];

        while (!data.requests.empty())
        {
            auto elapsed =
                std::chrono::duration_cast<
                    std::chrono::seconds>(
                    now -
                    data.requests.front());

            if (elapsed.count() >= 60)
            {
                data.requests.pop_front();
            }
            else
            {
                break;
            }
        }

        if (data.requests.size() >=
            MAX_REQUESTS_PER_MINUTE)
        {
            return true;
        }

        data.requests.push_back(now);

        return false;
    }
}

void registerChatbotRoutes()
{
    drogon::app().registerHandler(
        "/api/chat",

        [](const drogon::HttpRequestPtr& req,
           std::function<void(
               const drogon::HttpResponsePtr&)>&& callback)
        {
            auto json =
                req->getJsonObject();

            // Validate JSON body
            if (!json ||
                !json->isMember("message") ||
                !(*json)["message"].isString())
            {
                Json::Value error;

                error["success"] = false;
                error["message"] =
                    "Message is required";

                auto response =
                    drogon::HttpResponse::
                        newHttpJsonResponse(error);

                response->setStatusCode(
                    drogon::k400BadRequest);

                callback(response);
                return;
            }

            std::string message =
                (*json)["message"].asString();

            // Empty message validation
            if (message.empty())
            {
                Json::Value error;

                error["success"] = false;
                error["message"] =
                    "Message cannot be empty";

                auto response =
                    drogon::HttpResponse::
                        newHttpJsonResponse(error);

                response->setStatusCode(
                    drogon::k400BadRequest);

                callback(response);
                return;
            }

            // Message length validation
            if (message.length() >
                MAX_MESSAGE_LENGTH)
            {
                Json::Value error;

                error["success"] = false;
                error["message"] =
                    "Message is too long. "
                    "Maximum allowed length is "
                    "2000 characters.";

                auto response =
                    drogon::HttpResponse::
                        newHttpJsonResponse(error);

                response->setStatusCode(
                    drogon::k400BadRequest);

                callback(response);
                return;
            }

            // Identify user/session
            std::string sessionKey =
                getSessionKey(req);

            // Rate limit
            {
                std::lock_guard<std::mutex>
                    lock(rateLimitMutex);

                if (isRateLimited(
                        sessionKey))
                {
                    Json::Value error;

                    error["success"] = false;
                    error["message"] =
                        "Too many chatbot requests. "
                        "Please try again later.";

                    auto response =
                        drogon::HttpResponse::
                            newHttpJsonResponse(error);

                    response->setStatusCode(
                        drogon::k429TooManyRequests);

                    callback(response);
                    return;
                }
            }

            // Cache repeated questions
            std::string cacheKey =
                sessionKey + "|" + message;

            {
                std::lock_guard<std::mutex>
                    lock(rateLimitMutex);

                auto cached =
                    responseCache.find(cacheKey);

                if (cached !=
                    responseCache.end())
                {
                    Json::Value result;

                    result["success"] = true;
                    result["reply"] =
                        cached->second;
                    result["cached"] = true;

                    auto response =
                        drogon::HttpResponse::
                            newHttpJsonResponse(
                                result);

                    callback(response);
                    return;
                }
            }

            // Generate chatbot response
            ChatbotService chatbot;

            std::string reply =
                chatbot.getResponse(message);

            // Store response in cache
            {
                std::lock_guard<std::mutex>
                    lock(rateLimitMutex);

                responseCache[cacheKey] =
                    reply;
            }

            // Success response
            Json::Value result;

            result["success"] = true;
            result["reply"] = reply;
            result["cached"] = false;

            auto response =
                drogon::HttpResponse::
                    newHttpJsonResponse(result);

            callback(response);
        },

        {drogon::Post}
    );
}