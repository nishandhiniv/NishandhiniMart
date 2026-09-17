#include "Database.h"

using namespace drogon;
using namespace drogon::orm;

// =========================================================
// GET DATABASE CLIENT
// =========================================================

std::shared_ptr<DbClient> getDatabaseClient()
{
    return app().getDbClient("default");
}