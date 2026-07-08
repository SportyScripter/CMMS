from fastapi import FastAPI

app = FastAPI(
    title="CMMS API",
    description="Backend dla systemu utrzymania ruchu",
    version="1.0.0",
)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Witaj w API systemu CMMS!"}
