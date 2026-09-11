import os
import cv2
import numpy as np
import streamlit as st

from src.inference import load_slicktrace_model, predict_oil_probability
from src.opencv_pipeline import extract_sar_candidates

MODEL_PATH = "models/slicktrace_mobilenetv3.pth"

st.set_page_config(page_title="SlickTrace", page_icon="🌊")

st.title("🌊 SlickTrace")
st.write("Upload a radar-like sea image to highlight unusually dark areas.")


# Load PyTorch Model once with Streamlit resource caching
@st.cache_resource
def get_model(path: str):
    return load_slicktrace_model(path)


model = None
if not os.path.exists(MODEL_PATH):
    st.error(f"⚠️ Model file '{MODEL_PATH}' not found. Please ensure the model file is placed in the models/ directory.")
else:
    try:
        model = get_model(MODEL_PATH)
    except Exception as e:
        st.error(f"⚠️ Failed to load model from '{MODEL_PATH}': {e}")

uploaded_file = st.file_uploader(
    "Choose an image",
    type=["png", "jpg", "jpeg"],
)

st.sidebar.header("Candidate Extraction Settings")

detection_strategy = st.sidebar.selectbox(
    "Detection Strategy",
    options=[
        "Auto-Adaptive (Sentinel-1 SAR)",
        "Otsu Auto-Threshold",
        "Manual Threshold (Legacy)",
    ],
    index=0,
    help="Auto-Adaptive filters radar speckle noise and adjusts to local sea brightness gradients.",
)

strategy_map = {
    "Auto-Adaptive (Sentinel-1 SAR)": "adaptive",
    "Otsu Auto-Threshold": "otsu",
    "Manual Threshold (Legacy)": "manual",
}

selected_method = strategy_map[detection_strategy]

if selected_method == "manual":
    threshold = st.sidebar.slider(
        "Darkness threshold",
        min_value=0,
        max_value=255,
        value=90,
    )
else:
    threshold = 90  # Unused for adaptive/otsu

minimum_area = st.sidebar.slider(
    "Minimum detection area",
    min_value=100,
    max_value=10000,
    value=1000,
    step=100,
)

if uploaded_file is None:
    st.info("Upload an image to begin. You can use sample files from `data/` (e.g. `class_1_01677.jpg` or `class_0_03687.jpg`).")

else:
    file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
    original = cv2.imdecode(file_bytes, cv2.IMREAD_GRAYSCALE)

    if original is None:
        st.error("Error decoding uploaded image. Please provide a valid PNG or JPEG image.")
    else:
        # 1. Evaluate Overall Image Patch with PyTorch MobileNetV3 Model
        if model is not None:
            overall_prob = predict_oil_probability(original, model)
        else:
            overall_prob = 0.0

        # Display Overall Assessment Status Banner
        if overall_prob >= 0.75:
            st.error(f"🚨 **Overall Image Assessment**: High Oil-Like Confidence (**{overall_prob * 100:.1f}%**) — Human Review Required")
        elif 0.45 <= overall_prob < 0.75:
            st.warning(f"⚠️ **Overall Image Assessment**: Possible Slick (**{overall_prob * 100:.1f}%**) — Human Review Required")
        else:
            st.success(f"✅ **Overall Image Assessment**: Low Oil Probability (**{overall_prob * 100:.1f}%**)")

        # 2. Run Advanced OpenCV Sub-Region Candidate Extraction
        extraction_result = extract_sar_candidates(
            image_gray=original,
            method=selected_method,
            min_area=minimum_area,
            manual_thresh=threshold,
            border_margin=10,
        )

        candidates = extraction_result["candidates"]
        result = cv2.cvtColor(original, cv2.COLOR_GRAY2BGR)

        opencv_candidates = len(candidates)
        sub_detections = 0
        scored_candidates = []

        for contour, (x, y, width, height), crop in candidates:
            if model is not None:
                prob = predict_oil_probability(crop, model)
            else:
                prob = 0.0

            scored_candidates.append(prob)

            if prob >= 0.75:
                sub_detections += 1
                label = f"High oil confidence ({prob * 100:.1f}%)"
                color = (0, 0, 255)  # Red
            elif 0.45 <= prob < 0.75:
                sub_detections += 1
                label = f"Possible slick ({prob * 100:.1f}%)"
                color = (0, 255, 255)  # Yellow
            else:
                continue

            cv2.rectangle(
                result,
                (x, y),
                (x + width, y + height),
                color,
                2,
            )

            cv2.putText(
                result,
                label,
                (x, max(20, y - 5)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                color,
                2,
            )

        m_col1, m_col2 = st.columns(2)
        with m_col1:
            st.metric("OpenCV Sub-Candidates Found", opencv_candidates)
        with m_col2:
            st.metric("AI Confirmed Sub-Slicks (≥ 45%)", sub_detections)

        left, right = st.columns(2)

        with left:
            st.subheader("Uploaded image")
            st.image(original, clamp=True)

        with right:
            st.subheader("SlickTrace result")
            st.image(result, channels="BGR")

            # Download button for annotated result image
            success, buffer = cv2.imencode(".png", result)
            if success:
                st.download_button(
                    label="📥 Download Annotated Result Image",
                    data=buffer.tobytes(),
                    file_name="slicktrace_result.png",
                    mime="image/png",
                )

        st.caption(
            "This screening tool flags dark regions with oil-like visual characteristics. "
            "It provides confidence scores for human review, not definitive proof of an oil spill."
        )