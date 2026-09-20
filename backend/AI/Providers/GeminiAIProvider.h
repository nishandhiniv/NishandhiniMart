#pragma once

#include "IAIProvider.h"

#include <string>

class GeminiAIProvider : public IAIProvider
{
public:
    GeminiAIProvider();

    std::string getResponse(
        const std::string& prompt) override;

private:
    std::string apiKey_;
    std::string model_;
    int timeoutSeconds_;
};