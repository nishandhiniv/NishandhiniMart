#include "AIProviderFactory.h"

#include "../Providers/MockAIProvider.h"
#include "../Providers/GeminiAIProvider.h"

#include <stdexcept>

std::unique_ptr<IAIProvider>
AIProviderFactory::createProvider(
    const std::string& provider)
{
    if (provider == "mock")
    {
        return std::make_unique<MockAIProvider>();
    }

    if (provider == "gemini")
    {
        return std::make_unique<GeminiAIProvider>();
    }

    throw std::runtime_error(
        "Unsupported AI provider: " + provider);
}