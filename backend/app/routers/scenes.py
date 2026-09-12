import os
import json
from fastapi import APIRouter, HTTPException

router = APIRouter()

MANIFEST_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "scenes", "scene_manifest.json")


@router.get("/scenes")
def get_scenes_feed():
    if not os.path.exists(MANIFEST_PATH):
        raise HTTPException(status_code=44, detail="Scene manifest file not found.")
    
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        scenes = json.load(f)

    # Attach static thumbnail URLs
    for scene in scenes:
        if "filename" in scene:
            scene["image_url"] = f"/static/scenes/{scene['filename']}"

    return scenes
