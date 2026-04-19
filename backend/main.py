from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import team, chores, calendar, completions


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    models.Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Office Chore App", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(team.router)
app.include_router(chores.router)
app.include_router(calendar.router)
app.include_router(completions.router)


@app.get("/health")
def health():
    return {"status": "ok"}
