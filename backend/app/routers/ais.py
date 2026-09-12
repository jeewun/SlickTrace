from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional

from backend.src.ais_engine import generate_synthetic_vessels

router = APIRouter()


class AISRequest(BaseModel):
    slick_lat: float = Field(18.8500, example=18.8500)
    slick_lon: float = Field(72.3000, example=72.3000)
    detection_time_utc: Optional[str] = Field("2026-08-24T14:22:00Z", example="2026-08-24T14:22:00Z")
    vessel_count: Optional[int] = Field(5, example=5)
    seed: Optional[int] = Field(42, example=42)


@router.post("/ais/synthetic")
def get_synthetic_ais(payload: AISRequest):
    vessels = generate_synthetic_vessels(
        slick_lat=payload.slick_lat,
        slick_lon=payload.slick_lon,
        detection_time_iso=payload.detection_time_utc or "2026-08-24T14:22:00Z",
        vessel_count=payload.vessel_count or 5,
        seed=payload.seed or 42,
    )
    return vessels
