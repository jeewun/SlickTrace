import cv2
import numpy as np
import streamlit as st

st.set_page_config(page_title="SlickTrace", page_icon="🌊")

st.title("🌊 SlickTrace")
st.write("Upload a radar-like sea image to highlight unusually dark areas.")

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
            detections += 1

            cv2.rectangle(
                result,
                (x, y),
                (x + width, y + height),
                (0, 255, 0),
                3,
            )

            cv2.putText(
                result,
                "Possible slick",
                (x, max(25, y - 10)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
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

    st.caption(
        "This MVP flags dark regions. A real system needs validation "
        "because calm water, shadows, and other features can also look dark."
    )