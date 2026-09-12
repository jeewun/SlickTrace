from typing import List, Tuple, Dict, Any
import cv2
import numpy as np


def extract_sar_candidates(
    image_gray: np.ndarray,
    method: str = "percentile",
    min_area: float = 100.0,
    manual_thresh: int = 90,
    border_margin: int = 2,
    allow_border_touch: bool = True,
) -> Dict[str, Any]:
    """
    Extracts candidate dark regions from SAR imagery using relative percentile
    thresholding, adaptive thresholding, Otsu, or manual thresholding.
    
    Args:
        image_gray: 2D uint8 numpy array (grayscale image).
        method: Candidate extraction strategy - "percentile", "adaptive", "otsu", or "manual".
        min_area: Minimum contour area threshold in pixels.
        manual_thresh: Manual threshold value (used when method="manual").
        border_margin: Margin in pixels from image edge.
        allow_border_touch: If True, candidate contours touching image edges are retained.
        
    Returns:
        dict containing:
            - 'candidates': List of tuples (contour, (x, y, w, h), crop_image)
            - 'binary_mask': Processed binary mask (uint8)
            - 'total_contours': Total contours found before filtering
    """
    if image_gray is None or image_gray.size == 0:
        return {"candidates": [], "binary_mask": None, "total_contours": 0}

    image_height, image_width = image_gray.shape

    if method == "percentile":
        blurred = cv2.GaussianBlur(image_gray, (5, 5), 0)
        p25_val = int(np.percentile(blurred, 25))
        thresh_val = max(15, min(p25_val, 220))
        _, binary_mask = cv2.threshold(
            blurred,
            thresh_val,
            255,
            cv2.THRESH_BINARY_INV,
        )
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        binary_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_CLOSE, kernel)

    elif method == "adaptive":
        blurred = cv2.GaussianBlur(image_gray, (5, 5), 0)
        binary_mask = cv2.adaptiveThreshold(
            blurred,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV,
            blockSize=51,
            C=10,
        )
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        binary_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_CLOSE, kernel)

    elif method == "otsu":
        blurred = cv2.GaussianBlur(image_gray, (5, 5), 0)
        _, binary_mask = cv2.threshold(
            blurred,
            0,
            255,
            cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU,
        )
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        binary_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_CLOSE, kernel)

    else:  # "manual"
        _, binary_mask = cv2.threshold(
            image_gray,
            manual_thresh,
            255,
            cv2.THRESH_BINARY_INV,
        )

    # Extract external contours
    contours, _ = cv2.findContours(
        binary_mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE,
    )

    candidates = []
    for contour in contours:
        area = cv2.contourArea(contour)
        x, y, w, h = cv2.boundingRect(contour)

        if allow_border_touch:
            touches_edge = False
        else:
            touches_edge = (
                x <= border_margin
                or y <= border_margin
                or x + w >= image_width - border_margin
                or y + h >= image_height - border_margin
            )

        if area > min_area and not touches_edge:
            crop = image_gray[y : y + h, x : x + w]
            candidates.append((contour, (x, y, w, h), crop))

    return {
        "candidates": candidates,
        "binary_mask": binary_mask,
        "total_contours": len(contours),
    }
