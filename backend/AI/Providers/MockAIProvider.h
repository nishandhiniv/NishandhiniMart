#pragma once

#include "IAIProvider.h"

class MockAIProvider : public IAIProvider
{
public:
    std::string getResponse(
        const std::string& prompt) override;
};