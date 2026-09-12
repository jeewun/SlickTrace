import os
import uuid
import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

from backend.src.inference import load_slicktrace_model, predict_oil_probability
from backend.src.opencv_pipeline import extract_sar_candidates

router = APIRouter()

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "slicktrace_mobilenetv3.pth")
_model_cache = None


def get_model():
    global _model_cache
    if _model_cache is None:
        _model_cache = load_slicktrace_model(MODEL_PATH)
    return _model_cache


@router.post("/detect")
async def detect_oil_slick(
    file: UploadFile = File(...),
    method: str = Form("percentile"),
    min_area: float = Form(100.0),
    manual_thresh: int = Form(90),
):
    try:
        model = get_model()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model loading error: {e}")

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    original = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

    if original is None:
        raise HTTPException(status_code=400, detail="Invalid image file uploaded.")

    # 1. Overall Image Score
    overall_prob = predict_oil_probability(original, model)

    # 2. OpenCV Sub-Region Candidates
    extraction_res = extract_sar_candidates(
        image_gray=original,
        method=method,
        min_area=min_area,
        manual_thresh=manual_thresh,
        border_margin=2,
        allow_border_touch=True,
    )

    candidates = extraction_res["candidates"]
    result_img = cv2.cvtColor(original, cv2.COLOR_GRAY2BGR)

    formatted_candidates = []
    ai_confirmed_count = 0

    for idx, (contour, (x, y, w, h), crop) in enumerate(candidates):
        prob = predict_oil_probability(crop, model)
        
        is_confirmed = False
        if prob >= 0.75 or (overall_prob >= 0.75 and prob >= 0.15):
            is_confirmed = True
            ai_confirmed_count += 1
            color = (0, 0, 255)  # Red
            label = "high"
        elif 0.45 <= prob < 0.75:
            is_confirmed = True
            ai_confirmed_count += 1
            color = (0, 255, 255)  # Yellow
            label = "medium"
        else:
            label = "low"
            color = (128, 128, 128)

        if is_confirmed:
            cv2.rectangle(result_img, (x, y), (x + w, y + h), color, 2)

        formatted_candidates.append({
            "id": f"c_{idx+1}",
            "bbox": {"x": x, "y": y, "w": w, "h": h},
            "probability": round(prob, 4),
            "label": label,
        })

    # Save annotated image to static folder
    filename = f"detection_{uuid.uuid4().hex[:8]}.png"
    static_dir = os.path.join(os.path.dirname(__file__), "..", "..", "static", "results")
    os.makedirs(static_dir, exist_ok=True)
    out_path = os.path.join(static_dir, filename)
    cv2.imwrite(out_path, result_img)

    return {
        "overall_probability": round(overall_prob, 4),
        "candidates": formatted_candidates,
        "annotated_image_url": f"/static/results/{filename}",
        "opencv_candidate_count": len(candidates),
        "ai_confirmed_count": ai_confirmed_count,
    }
