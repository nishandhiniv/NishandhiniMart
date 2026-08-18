cmake_minimum_required(VERSION 3.20)

project(NishandhiniMart LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Drogon CONFIG REQUIRED)
find_package(PostgreSQL REQUIRED)

add_executable(NishandhiniMart backend/main.cpp)

target_link_libraries(NishandhiniMart PRIVATE
    Drogon::Drogon
    PostgreSQL::PostgreSQL
)