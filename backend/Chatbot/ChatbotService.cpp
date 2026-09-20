#include "ChatbotService.h"

#include "../AI/Factory/AIProviderFactory.h"

#include <algorithm>
#include <cctype>
#include <cstdio>
#include <string>

#include <drogon/drogon.h>

namespace
{
    std::string toLower(std::string text)
    {
        std::transform(
            text.begin(),
            text.end(),
            text.begin(),
            [](unsigned char c)
            {
                return static_cast<char>(
                    std::tolower(c));
            });

        return text;
    }

    std::string getConfiguredProvider()
    {
        const char* provider =
            std::getenv("AI_CHATBOT_PROVIDER");

        if (provider == nullptr ||
            std::string(provider).empty())
        {
            return "mock";
        }

        return toLower(
            std::string(provider));
    }
}

ChatbotService::ChatbotService()
{
    std::string providerName =
        getConfiguredProvider();

    provider_ =
        AIProviderFactory::createProvider(
            providerName);
}

std::string ChatbotService::getResponse(
    const std::string& message)
{
    std::string text =
        toLower(message);

    // Greeting
    if (text.find("hello") != std::string::npos ||
        text.find("hi") != std::string::npos ||
        text.find("hey") != std::string::npos)
    {
        return
            "Hello! Welcome to NishandhiniMart. "
            "How can I help you today?";
    }

    // Cart-related questions
    if (text.find("cart") != std::string::npos ||
        text.find("add to cart") != std::string::npos ||
        text.find("remove from cart") != std::string::npos ||
        text.find("update cart") != std::string::npos)
    {
        return
            "You can add products to your cart, "
            "update quantities, remove products, "
            "and clear your cart.";
    }

    // Order-related questions
    if (text.find("order") != std::string::npos ||
        text.find("checkout") != std::string::npos ||
        text.find("payment") != std::string::npos)
    {
        return
            "You can checkout your cart, place an order, "
            "and view your order history from the "
            "NishandhiniMart buyer dashboard.";
    }

    // Review-related questions
    if (text.find("review") != std::string::npos ||
        text.find("rating") != std::string::npos)
    {
        return
            "You can give a rating from 1 to 5 "
            "and add a review for a product.";
    }

    // Product price / stock questions
    if (text.find("price") != std::string::npos ||
        text.find("cost") != std::string::npos ||
        text.find("how much") != std::string::npos ||
        text.find("stock") != std::string::npos)
    {
        try
        {
            auto client =
                drogon::app().getDbClient();

            auto result =
                client->execSqlSync(
                    "SELECT product_name, price, quantity "
                    "FROM products "
                    "ORDER BY id");

            for (const auto& row : result)
            {
                std::string productName =
                    row["product_name"]
                        .as<std::string>();

                std::string lowerProductName =
                    toLower(productName);

                if (text.find(lowerProductName) !=
                    std::string::npos)
                {
                    double price =
                        row["price"].as<double>();

                    int quantity =
                        row["quantity"].as<int>();

                    if (text.find("stock") !=
                            std::string::npos ||
                        text.find("available") !=
                            std::string::npos)
                    {
                        return
                            productName +
                            " has " +
                            std::to_string(quantity) +
                            " item(s) in stock.";
                    }

                    char priceText[50];

                    std::snprintf(
                        priceText,
                        sizeof(priceText),
                        "%.2f",
                        price);

                    return
                        "The price of " +
                        productName +
                        " is ₹" +
                        priceText +
                        ".";
                }
            }

            return
                "I could not find that product. "
                "Please check the product name.";
        }
        catch (const std::exception&)
        {
            return
                "Sorry, I could not access the "
                "product information right now.";
        }
    }

    // General product questions
     // General product questions
if (text.find("product") != std::string::npos ||
    text.find("products") != std::string::npos ||
    text.find("search") != std::string::npos ||
    text.find("category") != std::string::npos ||
    text.find("available") != std::string::npos)
{
    try
    {
        auto client =
            drogon::app().getDbClient();

        auto result =
            client->execSqlSync(
                "SELECT product_name "
                "FROM products "
                "ORDER BY id");

        if (result.empty())
        {
            return
                "There are no products available "
                "right now.";
        }

        std::string reply =
            "Here are the products available "
            "in NishandhiniMart:\n\n";

        for (const auto& row : result)
        {
            reply += "• ";
            reply += row["product_name"].as<std::string>();
            reply += "\n";
        }

        return reply;
    }
    catch (const std::exception&)
    {
        return
            "Sorry, I could not access the "
            "product list right now.";
    }
}
    // Seller questions
    if (text.find("seller") != std::string::npos ||
        text.find("store") != std::string::npos)
    {
        return
            "NishandhiniMart supports seller stores "
            "where sellers can manage products, stock "
            "and customer orders.";
    }

    // Help
    if (text.find("help") != std::string::npos)
    {
        return
            "I can help with NishandhiniMart products, "
            "cart, orders, checkout, reviews, ratings, "
            "stock and seller information.";
    }

    // Use configured AI provider
    // for other questions.
    try
    {
        if (provider_)
        {
            return provider_->getResponse(message);
        }
    }
    catch (const std::exception&)
    {
        return
            "Sorry, the AI service is temporarily "
            "unavailable. Please try again later.";
    }

    return
        "Sorry, I could not process your request "
        "right now.";
}