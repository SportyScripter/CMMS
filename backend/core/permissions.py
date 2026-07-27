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
    [
        "Super Admin",
        "Kierownik",
        "Dyrektor",
        "Manager",
        "Lider",
        "Mistrz Zmiany",
        "Mechanik",
        "Elektryk",
        "Magazynier",
        "Operator",
        "Automatyk",
    ]
)

# Users with the following roles can manage machines
ALLOW_MANAGE_MACHINES = RoleChecker(
    ["Super Admin", "Kierownik", "Dyrektor", "Manager", "Lider"]
)

# Users with the following roles can manage failures
ALLOW_MANAGE_FAILURES = RoleChecker(
    [
        "Super Admin",
        "Kierownik",
        "Dyrektor",
        "Manager",
        "Lider",
        "Mechanik",
        "Elektryk",
        "Automatyk",
        "Operator",
    ]
)

ALLOW_MANAGE_DELETE_FAILURES = RoleChecker(
    [
        "Super Admin",
        "Kierownik",
        "Dyrektor",
        "Manager",
        "Lider",
        "Mechanik",
        "Elektryk",
        "Operator",
        "Automatyk",
    ]
)

# Users with the following roles can manage parts
ALLOW_MANAGE_PARTS = RoleChecker(
    [
        "Super Admin",
        "Kierownik",
        "Magazynier",
        "Mechanik",
        "Elektryk",
        "Automatyk",
    ]
)

ALLOW_CHECK_PARTS = RoleChecker(
    [
        "Super Admin",
        "Kierownik",
        "Dyrektor",
        "Manager",
        "Magazynier",
        "Mechanik",
        "Elektryk",
        "Operator",
        "Automatyk",
    ]
)

ALLOW_EDIT_PARTS = RoleChecker(
    [
        "Super Admin",
        "Kierownik",
        "Manager",
        "Magazynier",
        "Mechanik",
        "Elektryk",
        "Automatyk",
    ]
)
