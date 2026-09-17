#ifndef DATABASE_H
#define DATABASE_H

#include <drogon/drogon.h>

std::shared_ptr<drogon::orm::DbClient> getDatabaseClient();

#endif // DATABASE_H