#include "MockAIProvider.h"

std::string MockAIProvider::getResponse(
    const std::string& prompt)
{
    return "Mock NishandhiniMart AI response: " + prompt;
}