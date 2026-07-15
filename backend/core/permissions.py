from api.dependencies import RoleChecker

# Only users with the "Super Admin" role can perform certain actions
REQUIRE_ADMIN = RoleChecker(["Super Admin"])

# Users with the following roles can create new users
ALLOW_MANAGE_USERS = RoleChecker(
    ["Super Admin", "Kierownik", "Dyrektor", "Manager", "Lider"]
)

# Users with the following roles can edit production orders (example)
ALLOW_MANAGE_ORDERS = RoleChecker(
    ["Super Admin", "Kierownik", "Manager", "Mistrz Zmiany"]
)

# All logged-in employees (e.g., for reading data)
ALLOW_READ_ONLY = RoleChecker(
    ["Super Admin", "Kierownik", "Dyrektor", "Manager", "Lider", "Mechanik", "Elektryk"]
)

# Users with the following roles can manage machines
ALLOW_MANAGE_MACHINES = RoleChecker(
    ["Super Admin", "Kierownik", "Dyrektor", "Manager", "Lider"]
)
