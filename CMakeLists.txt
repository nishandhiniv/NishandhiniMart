cmake_minimum_required(VERSION 3.20)

project(NishandhiniMart LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# =========================================================
# Windows local build - vcpkg
# Docker/Linux build - system packages
# =========================================================

if(WIN32)

    set(VCPKG_ROOT
        "C:/Users/Dell/vcpkg/installed/x64-windows"
    )

    set(CMAKE_PREFIX_PATH
        "${VCPKG_ROOT}"
    )

    set(Drogon_DIR
        "${VCPKG_ROOT}/share/drogon"
    )

    set(Trantor_DIR
        "${VCPKG_ROOT}/share/trantor"
    )

    set(PostgreSQL_INCLUDE_DIR
        "${VCPKG_ROOT}/include"
    )

    set(PostgreSQL_LIBRARY
        "${VCPKG_ROOT}/lib/libpq.lib"
    )

endif()

# =========================================================
# Find dependencies
# =========================================================

find_package(Drogon CONFIG REQUIRED)
find_package(PostgreSQL REQUIRED)

# =========================================================
# Backend executable
# =========================================================

add_executable(NishandhiniMart

    backend/test_main.cpp

    # Chatbot
    backend/Chatbot/ChatbotController.cpp
    backend/Chatbot/ChatbotService.cpp

    # AI
    backend/AI/Providers/GeminiAIProvider.cpp
    backend/AI/Providers/MockAIProvider.cpp
    backend/AI/Factory/AIProviderFactory.cpp

    # Controllers
    backend/Controllers/AuthController.cpp
    backend/Controllers/ProductController.cpp
    backend/Controllers/OrderController.cpp
    backend/Controllers/AdminController.cpp
    backend/Controllers/CartController.cpp
    backend/Controllers/ReviewController.cpp

    # Services
    backend/Services/AuthService.cpp
    backend/Services/ProductService.cpp
    backend/Services/OrderService.cpp

    # Database
    backend/database/Database.cpp

    # Routes
    backend/Routes/routes.cpp
)

# =========================================================
# Link libraries
# =========================================================

target_link_libraries(NishandhiniMart PRIVATE

    Drogon::Drogon
    PostgreSQL::PostgreSQL

)