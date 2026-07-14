from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import Base, engine
from scripts.seed import seed_admin
from api.v1.api_router import api_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CMMS API", description="Main API for CMMS", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["Health Check"])
def root():
    """
    Simple health check endpoint to verify that the API is running.
    """
    return {"message": "API is running successfully.", "docs_url": "/docs"}


@app.post("/startup")
def startup_event():
    """
    Event handler that runs on application startup.
    Seeds the database with an admin user and role if they do not exist.
    """
    seed_admin()
