#ifndef ORDER_MODEL_H
#define ORDER_MODEL_H

#include <string>

struct Order
{
    int id;
    int user_id;

    double total_amount;
    std::string status;
    std::string created_at;
};

#endif