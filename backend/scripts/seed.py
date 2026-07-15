import sys
import os

sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

from db.database import SessionLocal
from schemas.role import RoleCreate
from schemas.user import UserCreate
from crud import crud_roles, crud_users


def seed_admin():
    print("Starting database seeding...")
    db = SessionLocal()

    try:
        admin_role_name = "Super Admin"
        admin_role_description = "Super Admin role with all permissions"
        roles = crud_roles.get_roles(db)
        admin_role = next(
            (role for role in roles if role.name == admin_role_name), None
        )

        if not admin_role:
            print(f"Creating role: {admin_role_name}")
            role_in = RoleCreate(
                name=admin_role_name,
                description=admin_role_description,
            )
            admin_role = crud_roles.create_role(db=db, role_in=role_in)
        else:
            print(f"Role '{admin_role_name}' already exists.")

        admin_sap_number = "245673"
        admin_user = crud_users.get_user_by_sap_number(db, sap_number=admin_sap_number)

        if not admin_user:
            print(f"Creating admin user with SAP number: {admin_sap_number}")
            user_in = UserCreate(
                sap_number=admin_sap_number,
                password="admin123",
                name="Admin",
                lastname="User",
                role_id=admin_role.id,
                is_active=True,
            )
            crud_users.create_user(db=db, user_in=user_in)
            print("Admin user created successfully.")
        else:
            print(f"Admin user with SAP number '{admin_sap_number}' already exists.")
    except Exception as e:
        print(f"An error occurred during seeding: {e}")
    finally:
        db.close()
        print("Database seeding completed.")


if __name__ == "__main__":
    seed_admin()
