#ifndef USER_MODEL_H
#define USER_MODEL_H

#include <string>

struct User
{
    int id;

    std::string name;
    std::string username;
    std::string email;
    std::string role;
};

#endif