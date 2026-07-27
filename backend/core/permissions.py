from api.dependencies import RoleChecker

# Only users with the "Super Admin" role can perform certain actions
REQUIRE_ADMIN = RoleChecker(["Super Admin"])

# Users with the following roles can create new users
ALLOW_MANAGE_USERS = RoleChecker(
    ["Super Admin", "Kierownik", "Dyrektor", "Manager", "Lider"],
)

# Users with the following roles can edit production orders (example)
ALLOW_MANAGE_ORDERS = RoleChecker(
    ["Super Admin", "Kierownik", "Manager", "Mistrz Zmiany"],
)

# All logged-in employees (e.g., for reading data)
ALLOW_READ_ONLY = RoleChecker(
    [
        "Super Admin",
        "Kierownik",
        "Dyrektor",
        "Manager",
        "Lider",
        "Mechanik",
        "Elektryk",
        "Operator",
    ],
)

# Users with the following roles can manage machines
ALLOW_MANAGE_MACHINES = RoleChecker(
    ["Super Admin", "Kierownik", "Dyrektor", "Manager", "Lider"],
)

# Users with the following roles can manage failures
ALLOW_MANAGE_FAILURES = RoleChecker(
    ["Machanik", "Elektryk", "Super Admin", "Kierownik", "Dyrektor", "Manager", "Lider"]
)
ALLOW_MANAGE_DELETE_FAILURES = RoleChecker(
    ["Super Admin", "Kierownik", "Dyrektor", "Manager", "Lider", "Elektryk", "Mechanik"]
)
# Users with the following roles can manage parts
ALLOW_MANAGE_PARTS = RoleChecker(
    ["Super Admin", "Kierownik", "Magazynier", "Elektryk", "Mechanik"]
)

ALLOW_CHECK_PARTS = RoleChecker(
    [
        "Super Admin",
        "Kierownik",
        "Dyrektor",
        "Manager",
        "Mechanik",
        "Elektryk",
        "Magazynier",
    ],
)

ALLOW_EDIT_PARTS = RoleChecker(
    ["Super Admin", "Kierownik", "Manager", "Magazynier", "Elektryk", "Mechanik"],
)
