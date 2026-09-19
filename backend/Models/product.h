#ifndef PRODUCT_MODEL_H
#define PRODUCT_MODEL_H

#include <string>

struct Product
{
    int id;

    std::string product_name;
    std::string description;
    double price;

    std::string image;
    std::string category;
    
    int quantity;
    int seller_id;
};

#endif