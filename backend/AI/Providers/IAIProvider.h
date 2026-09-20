#pragma once

#include <string>

class IAIProvider
{
public:
    virtual ~IAIProvider() = default;

    virtual std::string getResponse(
        const std::string& prompt) = 0;
};