import math
from datetime import datetime, timedelta
from typing import List, Dict, Any


VESSEL_TEMPLATES = [
    {"name": "MV Samudra Prerna", "mmsi": "419000111", "type": "Tanker", "risk_weight": 1.15, "base_heading": 215.0, "offset_nm": 0.2},
    {"name": "MT Ocean Pioneer", "mmsi": "311009820", "type": "Chemical Tanker", "risk_weight": 1.12, "base_heading": 210.0, "offset_nm": 2.5},
    {"name": "MV Malacca Star", "mmsi": "412998110", "type": "Cargo", "risk_weight": 1.0, "base_heading": 35.0, "offset_nm": 4.8},
    {"name": "SS Arabian Horizon", "mmsi": "563004210", "type": "Bulk Carrier", "risk_weight": 0.95, "base_heading": 40.0, "offset_nm": 8.2},
    {"name": "MV Coral Sea", "mmsi": "211234560", "type": "Container Ship", "risk_weight": 0.90, "base_heading": 225.0, "offset_nm": 12.0},
]


def generate_synthetic_vessels(
    slick_lat: float = 18.8500,
    slick_lon: float = 72.3000,
    detection_time_iso: str = "2026-08-24T14:22:00Z",
    vessel_count: int = 5,
    seed: int = 42,
) -> List[Dict[str, Any]]:
    """
    Generates realistic, smooth maritime shipping lane tracks through open ocean.
    """
    try:
        dt_detection = datetime.fromisoformat(detection_time_iso.replace("Z", "+00:00"))
    except Exception:
        dt_detection = datetime(2026, 8, 24, 14, 22, 0)

    vessels = []
    num_to_gen = min(vessel_count, len(VESSEL_TEMPLATES))

    for i in range(num_to_gen):
        template = VESSEL_TEMPLATES[i]
        heading = template["base_heading"]
        rad_heading = math.radians(heading)

        # Calculate closest point of approach (CPA) in open ocean
        offset_distance_deg = template["offset_nm"] / 60.0
        perp_angle = rad_heading + math.pi / 2.0
        
        cpa_lat = round(slick_lat + offset_distance_deg * math.cos(perp_angle), 5)
        cpa_lon = round(slick_lon + offset_distance_deg * math.sin(perp_angle), 5)

        # Vessel speed in knots (nautical miles per hour)
        sog = 12.5 if i == 0 else (10.0 + i * 1.5)
        speed_deg_per_hour = (sog * 1.852) / 111.0

        # Build clean sequential shipping lane track waypoints from T-48h to T-0h
        waypoints = []
        lookback_hours = [48, 36, 24, 12, 4, 1.5, 0]

        for h in sorted(lookback_hours, reverse=True):
            t_point = dt_detection - timedelta(hours=h)
            
            # Position along shipping lane trajectory
            time_from_cpa = (1.5 - h)  # CPA occurs at T - 1.5 hours
            dist_along_lane = time_from_cpa * speed_deg_per_hour

            p_lat = round(cpa_lat + dist_along_lane * math.cos(rad_heading), 5)
            p_lon = round(cpa_lon + dist_along_lane * math.sin(rad_heading), 5)

            waypoints.append({
                "t": t_point.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "hours_offset": f"-{h}h" if h > 0 else "0h",
                "lat": p_lat,
                "lon": p_lon,
                "sog": sog,
                "cog": heading,
            })

        vessels.append({
            "mmsi": template["mmsi"],
            "name": template["name"],
            "type": template["type"],
            "risk_weight": template["risk_weight"],
            "cpa_lat": cpa_lat,
            "cpa_lon": cpa_lon,
            "track": waypoints,
        })

    return vessels
