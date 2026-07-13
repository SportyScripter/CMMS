from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CMMS API", description="Main API for CMMS", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health Check"])
def root():
    """
    Simple health check endpoint to verify that the API is running.
    """
    return {"message": "API is running successfully.", "docs_url": "/docs"}
