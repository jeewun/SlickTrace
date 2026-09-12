import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.routers import detection, scenes, ais, attribution

app = FastAPI(
    title="SpillGuard API",
    description="Maritime Pollution Forensic Intelligence API for SAR Oil Slick Detection & AIS Vessel Attribution",
    version="1.0.0",
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static results & scenes directory exist
static_results_dir = os.path.join(os.path.dirname(__file__), "..", "static", "results")
os.makedirs(static_results_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "..", "static")), name="static")

# Mount Routers
app.include_router(detection.router, prefix="/api/v1", tags=["Detection"])
app.include_router(scenes.router, prefix="/api/v1", tags=["Scenes"])
app.include_router(ais.router, prefix="/api/v1", tags=["AIS"])
app.include_router(attribution.router, prefix="/api/v1", tags=["Attribution"])


@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "app": "SpillGuard Maritime Pollution Forensic Intelligence"}
