cmake_minimum_required(VERSION 3.20)

project(NishandhiniMart LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# vcpkg
set(VCPKG_ROOT "C:/Users/Dell/vcpkg/installed/x64-windows")

# Dependency paths
set(CMAKE_PREFIX_PATH "${VCPKG_ROOT}")

set(Drogon_DIR "${VCPKG_ROOT}/share/drogon")
set(Trantor_DIR "${VCPKG_ROOT}/share/trantor")

set(OPENSSL_ROOT_DIR "${VCPKG_ROOT}")
set(OPENSSL_INCLUDE_DIR "${VCPKG_ROOT}/include")

set(ZLIB_INCLUDE_DIR "${VCPKG_ROOT}/include")
set(ZLIB_LIBRARY "${VCPKG_ROOT}/lib/z.lib")

set(PostgreSQL_INCLUDE_DIR "${VCPKG_ROOT}/include")
set(PostgreSQL_LIBRARY "${VCPKG_ROOT}/lib/libpq.lib")

# Find packages
find_package(Drogon CONFIG REQUIRED)
find_package(PostgreSQL REQUIRED)

# Backend executable
add_executable(NishandhiniMart
    backend/test_main.cpp
    backend/Chatbot/ChatbotController.cpp
    backend/Chatbot/ChatbotService.cpp

    backend/AI/Providers/GeminiAIProvider.cpp
    backend/AI/Providers/MockAIProvider.cpp

    backend/AI/Factory/AIProviderFactory.cpp

    backend/Controllers/AuthController.cpp
    backend/Controllers/ProductController.cpp
    backend/Controllers/OrderController.cpp
    backend/Controllers/AdminController.cpp
    backend/Controllers/CartController.cpp
    backend/Controllers/ReviewController.cpp

    backend/Services/AuthService.cpp
    backend/Services/ProductService.cpp
    backend/Services/OrderService.cpp

    backend/database/Database.cpp

    backend/Routes/routes.cpp
)
# Link libraries
target_link_libraries(NishandhiniMart PRIVATE
    Drogon::Drogon
    PostgreSQL::PostgreSQL
)