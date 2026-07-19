from fastapi import APIRouter
from api.v1 import (
    roles,
    auth,
    users,
    machines,
    parts,
    part_categories,
    part_compatibilities,
    departments,
    failures,
    failure_parts,
    attachments,
    order_types,
)

api_router = APIRouter()


api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(roles.router, prefix="/roles", tags=["Roles"])
api_router.include_router(machines.router, prefix="/machines", tags=["Machines"])
api_router.include_router(parts.router, prefix="/parts", tags=["Parts"])
api_router.include_router(
    part_categories.router, prefix="/part-categories", tags=["Part Categories"]
)
api_router.include_router(
    part_compatibilities.router,
    prefix="/part-compatibilities",
    tags=["Part Compatibilities"],
)
api_router.include_router(
    departments.router, prefix="/departments", tags=["Departments"]
)
api_router.include_router(failures.router, prefix="/failures", tags=["Failures"])
api_router.include_router(
    failure_parts.router, prefix="/failure-parts", tags=["Failure Parts"]
)
api_router.include_router(
    attachments.router, prefix="/attachments", tags=["Attachments"]
)
api_router.include_router(
    order_types.router, prefix="/order-types", tags=["Order Types"]
)
