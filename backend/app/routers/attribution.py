from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from backend.src.ais_engine import generate_synthetic_vessels
from backend.src.attribution import rank_suspect_vessels

router = APIRouter()


class AttributionRequest(BaseModel):
    slick_lat: float = Field(18.8500, example=18.8500)
    slick_lon: float = Field(72.3000, example=72.3000)
    detection_time_utc: Optional[str] = Field("2026-08-24T14:22:00Z", example="2026-08-24T14:22:00Z")
    vessels: Optional[List[Dict[str, Any]]] = None


@router.post("/attribution/rank")
def get_suspect_ranking(payload: AttributionRequest):
    vessels = payload.vessels
    if not vessels:
        vessels = generate_synthetic_vessels(
            slick_lat=payload.slick_lat,
            slick_lon=payload.slick_lon,
            detection_time_iso=payload.detection_time_utc or "2026-08-24T14:22:00Z",
        )

    ranked_leads = rank_suspect_vessels(
        slick_lat=payload.slick_lat,
        slick_lon=payload.slick_lon,
        detection_time_iso=payload.detection_time_utc or "2026-08-24T14:22:00Z",
        vessels=vessels,
    )
    return ranked_leads
