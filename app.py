import os
import cv2
import numpy as np
import streamlit as st

from src.inference import load_slicktrace_model, predict_oil_probability

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

threshold = st.sidebar.slider(
    "Darkness threshold",
    min_value=0,
    max_value=255,
    value=90,
)

minimum_area = st.sidebar.slider(
    "Minimum detection area",
    min_value=100,
    max_value=10000,
    value=1000,
    step=100,
)

if uploaded_file is None:
    st.info("Upload an image to begin. You can use data/input.png for now.")

else:
    file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
    original = cv2.imdecode(file_bytes, cv2.IMREAD_GRAYSCALE)

    if original is None:
        st.error("Error decoding uploaded image. Please provide a valid PNG or JPEG image.")
    else:
        _, mask = cv2.threshold(
            original,
            threshold,
            255,
            cv2.THRESH_BINARY_INV,
        )

        contours, _ = cv2.findContours(
            mask,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE,
        )

        result = cv2.cvtColor(original, cv2.COLOR_GRAY2BGR)
        image_height, image_width = original.shape
        detections = 0

        for contour in contours:
            area = cv2.contourArea(contour)
            x, y, width, height = cv2.boundingRect(contour)

            touches_edge = (
                x <= 10
                or y <= 10
                or x + width >= image_width - 10
                or y + height >= image_height - 10
            )

            if area > minimum_area and not touches_edge:
                crop = original[y:y + height, x:x + width]

                # Model scoring using PyTorch MobileNetV3
                if model is not None:
                    prob = predict_oil_probability(crop, model)
                else:
                    prob = 0.0

                # Score confidence threshold logic
                if prob >= 0.75:
                    detections += 1
                    label = f"High oil-like confidence — human review required ({prob * 100:.1f}%)"
                    color = (0, 0, 255)  # Red for high confidence
                elif 0.45 <= prob < 0.75:
                    detections += 1
                    label = f"Possible slick — human review required ({prob * 100:.1f}%)"
                    color = (0, 255, 255)  # Yellow for medium confidence
                else:
                    # Below 0.45: do not show a positive alert
                    continue

                cv2.rectangle(
                    result,
                    (x, y),
                    (x + width, y + height),
                    color,
                    3,
                )

                cv2.putText(
                    result,
                    label,
                    (x, max(25, y - 10)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    color,
                    2,
                )

        st.metric("Possible slick areas found", detections)

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