# TrackNow AI Detection Server

A small local Python service that does the actual deep-learning work for
the "AI Camera Detection" toggle in the Security > Add User screen:

1. **Vehicle type** - YOLOv8n (Ultralytics, pretrained on COCO)
2. **Plate location** - YOLOv8 fine-tuned for license plates
   (`keremberke/yolov8n-license-plate` from Hugging Face)
3. **Plate text** - EasyOCR (deep learning OCR)

It runs **only on your laptop**, next to your existing Node backend. The
React app sends it a single photo (only when you press "Capture & Detect"),
gets back a suggested plate number + vehicle type, and you confirm/edit
before generating the pass. Nothing here touches your MongoDB or the
existing Node API.

## 1. Setup (one time)

```bash
cd ai-server
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

This will take a while the first time (PyTorch + EasyOCR + Ultralytics are
large packages — a few GB). Grab a coffee.

> No GPU needed. It runs on CPU; each "Capture & Detect" click takes
> roughly 1-3 seconds on a normal laptop.

## 2. Run it

```bash
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

The first time you run it, it will also auto-download:
- `yolov8n.pt` (~6 MB, vehicle detector)
- the license-plate model from Hugging Face (~6 MB)

Leave this terminal window running while you use the Security dashboard.
Check it's alive by visiting **http://localhost:8001/health** — you should
see `{"status":"ok","plate_model_loaded":true}`.

## 3. If the plate model fails to download

`plate_model_loaded` will show `false` in the health check, and the server
log will print a warning. This can happen if the Hugging Face repo's file
name ever changes, or if you have no internet access on first run. The
server **still works** in this case — it falls back to cropping the
lower-middle portion of the detected vehicle box for OCR — it's just less
precise about exactly where the plate is. To fix it properly:

1. Visit https://huggingface.co/keremberke/yolov8n-license-plate/tree/main
2. Check the actual weights filename listed there.
3. If it's not `best.pt`, update the `filename="best.pt"` argument in
   `app.py` (search for `hf_hub_download`) to match.

Alternatively, swap in any other YOLOv8 `.pt` file you trust that's been
trained on license plates — just point `plate_model = YOLO("...")` at it.

## 4. Connecting the frontend

The React app expects this server at `http://localhost:8001` by default
(see `AI_SERVER_URL` in `frontend/src/config.js`). Change that constant if
you run it on a different port.

## API

- `GET /health` → `{ status, plate_model_loaded }`
- `POST /detect` (multipart form, field name `file` = image) →
  ```json
  {
    "plateNumber": "MH12AB1234",
    "plateConfidence": 0.91,
    "plateDetectionUsed": true,
    "vehicleType": "private",
    "vehicleConfidence": 0.87,
    "plateCrop": "<base64 jpeg of the cropped plate, for preview>"
  }
  ```
