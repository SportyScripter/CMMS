from fastapi import APIRouter
from api.v1 import roles, auth, users, machines

api_router = APIRouter()


api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(roles.router, prefix="/roles", tags=["Roles"])
api_router.include_router(machines.router, prefix="/machines", tags=["Machines"])
