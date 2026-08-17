"""
TrackNow AI Detection Server
=============================
A small local FastAPI service that runs two deep learning models on a single
captured camera frame and returns the vehicle's plate number + vehicle type:

  Stage 1 - Vehicle detection & type classification
            -> YOLOv8n (Ultralytics), pretrained on COCO.
               Weights auto-download on first run.

  Stage 2 - License plate detection
            -> A YOLOv8 model fine-tuned specifically to find plates
               (keremberke/yolov8n-license-plate on Hugging Face).
               Downloaded automatically on first run via huggingface_hub.
               If this model can't be fetched/loaded for any reason, the
               server falls back to a heuristic crop (lower-middle portion
               of the vehicle box) so plate reading still works, just less
               precisely.

  Stage 3 - Plate text recognition (OCR)
            -> EasyOCR (CRNN-based deep learning OCR engine).

Run with:
    uvicorn app:app --host 0.0.0.0 --port 8001 --reload

This is meant to run locally on the same laptop as the camera, alongside
the existing Node/Express backend. It does NOT touch the project's
MongoDB/Node backend at all - the React frontend calls this service
directly only to get a suggested plate number + vehicle type, then submits
the existing /adduser/tempadd flow exactly as before.
"""

import base64
import logging
import re

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tracknow-ai-server")

app = FastAPI(title="TrackNow AI Detection Server")

# Local-only dev server, the React app (on localhost:3000) calls this directly
# from the browser, so CORS must be open for local origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Model loading (happens once, at server startup)
# ---------------------------------------------------------------------------

logger.info("Loading vehicle detector (YOLOv8n / COCO)...")
vehicle_model = YOLO("yolov8n.pt")  # auto-downloads weights on first run

COCO_TO_FORM_TYPE = {
    "car": "private",
    "bus": "bus",
    "truck": "delivery",
    "motorcycle": "two-wheeler",
}

plate_model = None
try:
    logger.info("Loading license-plate detector (YOLOv8, fine-tuned for plates)...")
    from huggingface_hub import hf_hub_download

    plate_weights_path = hf_hub_download(
        repo_id="Koushim/yolov8-license-plate-detection", filename="best.pt"
    )
    plate_model = YOLO(plate_weights_path)
    logger.info("Plate detector loaded successfully.")
except Exception as exc:  # noqa: BLE001
    logger.warning(
        "Could not load the dedicated plate-detector model (%s). "
        "Falling back to a heuristic crop of the vehicle's lower-middle "
        "region for OCR. See ai-server/README.md to fix this.",
        exc,
    )

logger.info("Loading OCR engine (EasyOCR)...")
import easyocr  # noqa: E402  (imported after logging setup on purpose)

ocr_reader = easyocr.Reader(["en"], gpu=False)

PLATE_CLEAN_RE = re.compile(r"[^A-Z0-9]")


def clean_plate_text(text: str) -> str:
    return PLATE_CLEAN_RE.sub("", text.upper())


def heuristic_plate_crop(frame, vehicle_box):
    """Fallback when no dedicated plate model is available: assume the
    plate sits in the lower-middle ~25% of the vehicle's bounding box."""
    x1, y1, x2, y2 = vehicle_box
    h = y2 - y1
    crop_y1 = int(y2 - 0.28 * h)
    return frame[max(0, crop_y1):y2, max(0, x1):x2]


@app.get("/health")
def health():
    return {"status": "ok", "plate_model_loaded": plate_model is not None}


@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Could not decode image")

    # ---- Stage 1: vehicle type ----
    vehicle_type = "other"
    vehicle_conf = 0.0
    vehicle_box = None
    v_results = vehicle_model(frame, verbose=False)[0]
    for box in v_results.boxes:
        cls_name = vehicle_model.names[int(box.cls[0])]
        conf = float(box.conf[0])
        if cls_name in COCO_TO_FORM_TYPE and conf > vehicle_conf:
            vehicle_conf = conf
            vehicle_type = COCO_TO_FORM_TYPE[cls_name]
            vehicle_box = tuple(map(int, box.xyxy[0]))

    # ---- Stage 2: plate region ----
    crop = None
    plate_conf = 0.0
    if plate_model is not None:
        p_results = plate_model(frame, verbose=False)[0]
        if len(p_results.boxes) > 0:
            best_box = max(p_results.boxes, key=lambda b: float(b.conf[0]))
            x1, y1, x2, y2 = map(int, best_box.xyxy[0])
            plate_conf = float(best_box.conf[0])
            crop = frame[max(0, y1):y2, max(0, x1):x2]
    elif vehicle_box is not None:
        crop = heuristic_plate_crop(frame, vehicle_box)

    # ---- Stage 3: OCR ----
    plate_text = ""
    plate_crop_b64 = None
    if crop is not None and crop.size > 0:
        upscaled = cv2.resize(crop, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        gray = cv2.cvtColor(upscaled, cv2.COLOR_BGR2GRAY)
        ocr_results = ocr_reader.readtext(gray)
        if ocr_results:
            ocr_results.sort(key=lambda r: r[2], reverse=True)
            plate_text = clean_plate_text(ocr_results[0][1])

        ok, buf = cv2.imencode(".jpg", crop)
        if ok:
            plate_crop_b64 = base64.b64encode(buf).decode("utf-8")

    return {
        "plateNumber": plate_text,
        "plateConfidence": round(plate_conf, 2),
        "plateDetectionUsed": plate_model is not None,
        "vehicleType": vehicle_type,
        "vehicleConfidence": round(vehicle_conf, 2),
        "plateCrop": plate_crop_b64,
    }