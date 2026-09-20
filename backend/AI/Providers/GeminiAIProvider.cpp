#include "GeminiAIProvider.h"

#include <cstdlib>
#include <sstream>
#include <string>

#include <drogon/drogon.h>
#include <json/json.h>

GeminiAIProvider::GeminiAIProvider()
    : model_("gemini-2.5-flash"),
      timeoutSeconds_(10)
{
    const char* key = std::getenv("GEMINI_API_KEY");

    if (key != nullptr)
    {
        apiKey_ = key;
    }

    const char* model = std::getenv("GEMINI_MODEL");

    if (model != nullptr &&
        std::string(model).empty() == false)
    {
        model_ = model;
    }

    const char* timeout =
        std::getenv("AI_CHATBOT_TIMEOUT_SECONDS");

    if (timeout != nullptr)
    {
        try
        {
            timeoutSeconds_ = std::stoi(timeout);
        }
        catch (...)
        {
            timeoutSeconds_ = 10;
        }
    }
}

std::string GeminiAIProvider::getResponse(
    const std::string& prompt)
{
    if (apiKey_.empty())
    {
        return "AI service is not configured. Please try again later.";
    }

    try
    {
        auto request =
            drogon::HttpRequest::newHttpRequest();

        request->setMethod(drogon::Post);

        request->setPath(
            "/v1beta/models/" +
            model_ +
            ":generateContent");

        request->addHeader(
            "x-goog-api-key",
            apiKey_);

        request->setContentTypeCode(
            drogon::CT_APPLICATION_JSON);

        Json::Value root;

        Json::Value systemInstruction;
        Json::Value systemParts(Json::arrayValue);

        Json::Value systemText;

        systemText["text"] =
            "You are the official NishandhiniMart shopping assistant. "
            "Only answer questions related to NishandhiniMart products, "
            "shopping, cart, orders, checkout, payment, reviews, ratings, "
            "and seller information. "
            "Do not invent product prices, stock, orders, or other facts. "
            "If the question is unrelated to NishandhiniMart shopping, "
            "politely say that you can only help with NishandhiniMart "
            "related questions.";

        systemParts.append(systemText);
        systemInstruction["parts"] = systemParts;
        root["system_instruction"] = systemInstruction;

        Json::Value contents(Json::arrayValue);

        Json::Value userContent;
        Json::Value userParts(Json::arrayValue);

        Json::Value userText;
        userText["text"] = prompt;

        userParts.append(userText);

        userContent["role"] = "user";
        userContent["parts"] = userParts;

        contents.append(userContent);
        root["contents"] = contents;

        Json::Value generationConfig;

        generationConfig["temperature"] = 0.3;
        generationConfig["maxOutputTokens"] = 300;

        root["generationConfig"] = generationConfig;

        request->setBody(
            root.toStyledString());

        auto client =
            drogon::HttpClient::newHttpClient(
                "https://generativelanguage.googleapis.com");

        auto result =
            client->sendRequest(
                request,
                static_cast<double>(
                    timeoutSeconds_));

        if (result.first != drogon::ReqResult::Ok)
        {
            return
                "AI service is temporarily unavailable. "
                "Please try again.";
        }

        auto response = result.second;

        if (response == nullptr)
        {
            return
                "AI service is temporarily unavailable. "
                "Please try again.";
        }

        if (response->getStatusCode() != drogon::k200OK)
        {
            return
                "AI service is temporarily unavailable. "
                "Please try again.";
        }

        Json::Value responseJson;

        Json::CharReaderBuilder readerBuilder;
        std::string errors;

        std::string responseBody(
            response->getBody().data(),
            response->getBody().size());

        std::istringstream responseStream(
            responseBody);

        if (!Json::parseFromStream(
                readerBuilder,
                responseStream,
                &responseJson,
                &errors))
        {
            return
                "AI service returned an invalid response.";
        }

        if (!responseJson.isMember("candidates") ||
            !responseJson["candidates"].isArray() ||
            responseJson["candidates"].empty())
        {
            return
                "AI service returned no response.";
        }

        const Json::Value& candidate =
            responseJson["candidates"][0];

        if (!candidate.isMember("content"))
        {
            return
                "AI service returned no response.";
        }

        const Json::Value& content =
            candidate["content"];

        if (!content.isMember("parts") ||
            !content["parts"].isArray() ||
            content["parts"].empty())
        {
            return
                "AI service returned no response.";
        }

        const Json::Value& part =
            content["parts"][0];

        if (!part.isMember("text"))
        {
            return
                "AI service returned no response.";
        }

        return part["text"].asString();
    }
    catch (...)
    {
        return
            "AI service is temporarily unavailable. "
            "Please try again.";
    }
}