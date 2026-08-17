# 🚗 TrackNow

**TrackNow** is a real-time vehicle tracking and temporary-access management system designed for controlled environments such as campuses.

The system combines **live GPS tracking, role-based authentication, temporary vehicle passes, QR-based access, red-list management, real-time security monitoring, and AI-based vehicle/license-plate detection with OCR**.

---

## ✨ Key Features

### 🗺️ Real-Time Vehicle Tracking

* Drivers continuously share their GPS location.
* Users can optionally share their current location.
* Live locations are displayed on an interactive **Leaflet map**.
* Driver and user locations use different map markers.
* Tracking is implemented using **Socket.IO**.
* Map is restricted to the IIT Bombay area.

### 🔐 Role-Based Authentication

The system supports different user roles:

* **Driver**
* **User**
* **Security**

Authentication uses:

* JWT
* bcrypt password hashing
* Protected API routes

### 🎫 Temporary Vehicle Access

Security personnel can create temporary vehicle passes using:

* Vehicle registration number
* Vehicle type
* Entry time
* Allowed duration

A temporary access pass generates a **QR code** that can be scanned by the vehicle/user.

### 📱 QR-Based Temporary Login

The generated QR code contains a temporary JWT.

The flow is:

```text
Security
   │
   ▼
Enter Vehicle Details
   │
   ▼
Generate Temporary JWT
   │
   ▼
Generate QR Code
   │
   ▼
Vehicle/User Scans QR
   │
   ▼
Temporary Login
   │
   ▼
Temporary Access Granted
```

The temporary token has a limited lifetime and is protected against reuse.

### ⏱️ Automatic Expiry & Red List

Temporary passes automatically expire after the allotted time.

A background `node-cron` job runs every minute and:

1. Finds expired temporary users.
2. Changes their status from `temp` to `red`.
3. Adds/increments the vehicle in the red list.
4. Stores the vehicle type.

```text
Temporary User
      │
      │ Time expires
      ▼
   RED STATUS
      │
      ▼
 Red User Database
```

### 🚨 Red List Management

Security personnel can:

* View active temporary vehicles
* Search vehicles by plate number
* Remove active users
* View red-listed vehicles
* Monitor overstay cases

### 🤖 AI Vehicle & Number Plate Detection

TrackNow includes a separate **FastAPI AI server** for automatic vehicle information extraction.

The pipeline consists of:

```text
Camera Image
     │
     ▼
YOLOv8 Vehicle Detection
     │
     ├── Vehicle Type
     │
     ▼
License Plate Detection
     │
     ▼
EasyOCR
     │
     ▼
License Plate Number
```

The AI server detects:

* Vehicle type
* License plate region
* License plate text

The detected information can then be used by the temporary-user registration flow.

### 🧠 Computer Vision Stack

The AI server uses:

* **YOLOv8** — vehicle detection
* **YOLO license-plate model** — plate detection
* **EasyOCR** — license plate text recognition
* **OpenCV** — image processing
* **FastAPI** — AI inference API

If the dedicated license-plate model cannot be loaded, the system falls back to a heuristic vehicle-region crop before performing OCR.

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │     React Frontend  │
                         │                     │
                         │  Login / Maps / QR  │
                         │  Security Dashboard │
                         └──────────┬──────────┘
                                    │
                      REST API      │      Socket.IO
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
          ┌─────────▼─────────┐          ┌──────────▼─────────┐
          │   Node.js +       │          │     Socket.IO      │
          │     Express       │          │                    │
          │                   │          │ Tracking Namespace │
          │ Authentication    │          │ Security Namespace │
          │ Vehicle Access    │          └──────────┬─────────┘
          │ User Management   │                     │
          └─────────┬─────────┘                     │
                    │                               │
                    ▼                               │
          ┌───────────────────┐                     │
          │     MongoDB       │                     │
          │                   │                     │
          │ Users             │                     │
          │ Temporary Users   │                     │
          │ Red List          │                     │
          └───────────────────┘                     │
                                                    │
                    ┌───────────────────────────────┘
                    │
          ┌─────────▼─────────┐
          │   FastAPI AI      │
          │     Server        │
          │                   │
          │ YOLOv8 + OCR      │
          └───────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| React            | User interface          |
| React Router     | Client-side routing     |
| Axios            | REST API communication  |
| Socket.IO Client | Real-time communication |
| Leaflet          | Interactive maps        |
| QRCode React     | QR code generation      |
| CSS              | UI styling              |

## Backend

| Technology | Purpose                     |
| ---------- | --------------------------- |
| Node.js    | Runtime                     |
| Express.js | REST API                    |
| Socket.IO  | Real-time communication     |
| MongoDB    | Database                    |
| Mongoose   | MongoDB ODM                 |
| JWT        | Authentication              |
| bcrypt     | Password hashing            |
| node-cron  | Automatic expiry processing |
| CORS       | Cross-origin communication  |

## AI Server

| Technology               | Purpose                |
| ------------------------ | ---------------------- |
| Python                   | AI service             |
| FastAPI                  | AI REST API            |
| YOLOv8                   | Vehicle detection      |
| YOLO License Plate Model | Plate detection        |
| EasyOCR                  | OCR                    |
| OpenCV                   | Image processing       |
| NumPy                    | Image array processing |

---

# 📁 Project Structure

```text
TrackNow/
│
├── frontend/
│   ├── public/
│   │   └── img/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChangePassword.js
│   │   │   ├── DriverLogin.js
│   │   │   ├── DriverSignup.js
│   │   │   ├── HomePage.js
│   │   │   ├── MapComponent.js
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── SelectRole.js
│   │   │   ├── UserLogin.js
│   │   │   └── UserSignup.js
│   │   │
│   │   ├── components2/
│   │   │   ├── ManageUser.js
│   │   │   ├── SecurityAddUser.js
│   │   │   ├── SecurityLogin.js
│   │   │   ├── SecurityMap.js
│   │   │   ├── SecuritySignup.js
│   │   │   ├── TempUserHome.js
│   │   │   └── TempUserLoading.js
│   │   │
│   │   ├── config.js
│   │   ├── App.js
│   │   └── index.js
│   │
│   └── package.json
│
├── backend/
│   ├── models/
│   │   ├── users.js
│   │   └── tempuser_reduser.js
│   │
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── securityRoutes.js
│   │   ├── adduserRoutes.js
│   │   ├── manageuserRoutes.js
│   │   └── tempuserRoutes.js
│   │
│   ├── socketserver/
│   │   ├── trackingSocket.js
│   │   └── securitySocket.js
│   │
│   ├── jobs/
│   │   └── cron.js
│   │
│   ├── db.js
│   ├── jwt.js
│   ├── server.js
│   └── package.json
│
├── ai-server/
│   ├── app.py
│   ├── requirements.txt
│   └── yolov8n.pt
│
└── package.json
```

---

# 🔑 Authentication

TrackNow uses **JWT-based authentication**.

After successful login, the backend generates a JWT containing information such as:

```json
{
  "id": "user_id",
  "rollNoOrPlate": "vehicle_or_user_id",
  "role": "driver"
}
```

Protected endpoints require:

```http
Authorization: Bearer <TOKEN>
```

Passwords are hashed using **bcrypt** before being stored in MongoDB.

---

# 🔌 REST API

## User

### Signup

```http
POST /user/signup
```

Request:

```json
{
  "rollNoOrPlate": "USER001",
  "password": "password"
}
```

### Login

```http
POST /user/login
```

---

## Driver

### Signup

```http
POST /driver/signup
```

### Login

```http
POST /driver/login
```

---

## Security

### Signup

```http
POST /security/signup
```

### Login

```http
POST /security/login
```

---

## Password

### Change Password

```http
PUT /changepassword/:id
```

Requires JWT authentication.

Request:

```json
{
  "password": "newPassword"
}
```

---

# 🚘 Temporary Vehicle Access APIs

## Check Red List

```http
GET /adduser/checkredlist?plate=MH12AB1234
```

Requires authentication.

Response:

```json
{
  "isRed": false
}
```

---

## Generate Temporary Pass

```http
POST /adduser/tempadd
```

Request:

```json
{
  "plate": "MH12AB1234",
  "type": "private",
  "time": "2026-08-18T10:00:00.000Z",
  "tilltime": "2026-08-18T12:00:00.000Z"
}
```

The endpoint generates a temporary JWT instead of immediately inserting the temporary user into the database.

---

## Temporary Login

```http
POST /adduser/templogin
```

The temporary JWT is supplied through:

```http
Authorization: Bearer <TEMP_TOKEN>
```

On the first valid scan, the temporary vehicle is created in MongoDB.

A second attempt to use the same QR token is rejected.

---

# 👮 Temporary User Management

## Get Active Users

```http
GET /manageuser/activeuser
```

Returns currently stored temporary users.

## Get Red Users

```http
GET /manageuser/reduser
```

Returns users with red status.

## Remove User

```http
DELETE /manageuser/removeuser/:id
```

Removes a temporary user from the active list.

---

# ⏱️ Automatic Red-List Processing

A background cron task runs every minute:

```text
* * * * *
```

It searches for:

```text
status = temp
tilltime < current time
```

For every expired vehicle:

```text
tempUser.status → red
        │
        ▼
redUser.count++
```

This allows security personnel to identify vehicles that have exceeded their permitted access duration.

---

# 📡 Socket.IO

TrackNow uses two Socket.IO namespaces.

## `/tracking`

Used for normal vehicle and user location tracking.

### Driver Location

```text
driverLocation
```

Driver sends:

```json
{
  "plate": "MH12AB1234",
  "lat": 19.1334,
  "lng": 72.9133
}
```

The server broadcasts:

```text
driversUpdate
```

---

### User Location

```text
userLocation
```

The server broadcasts:

```text
usersUpdate
```

Users can stop sharing their location through:

```text
stopUserLocation
```

---

# 🛡️ Security Socket

Namespace:

```text
/security
```

Temporary users send:

```text
tempUserLocation
```

with:

```json
{
  "token": "TEMP_USER_TOKEN",
  "lat": 19.1334,
  "lng": 72.9133
}
```

The server:

1. Verifies the JWT.
2. Finds the temporary user in MongoDB.
3. Checks whether the pass has expired.
4. Stores the current location.
5. Broadcasts valid temporary users.

The security map receives:

```text
tempUsersUpdate
```

---

# 🤖 AI Detection API

The AI server runs independently from the Node.js backend.

Default address:

```text
http://localhost:8001
```

## Health Check

```http
GET /health
```

Example:

```json
{
  "status": "ok",
  "plate_model_loaded": true
}
```

---

## Vehicle & Plate Detection

```http
POST /detect
```

Send an image using multipart form data:

```text
file=<image>
```

Example response:

```json
{
  "plateNumber": "MH12AB1234",
  "plateConfidence": 0.91,
  "plateDetectionUsed": true,
  "vehicleType": "private",
  "vehicleConfidence": 0.88,
  "plateCrop": "<base64-image>"
}
```

---

# 🧠 AI Processing Pipeline

```text
Captured Camera Frame
        │
        ▼
     YOLOv8
        │
        ▼
 Vehicle Detection
        │
        ├── Car
        ├── Bus
        ├── Truck
        └── Motorcycle
        │
        ▼
License Plate Detection
        │
        ▼
     Plate Crop
        │
        ▼
    Image Upscaling
        │
        ▼
 Grayscale Conversion
        │
        ▼
     EasyOCR
        │
        ▼
 Plate Number
```

The frontend can use the AI result to automatically populate vehicle information in the temporary-pass form.

---

# 🗺️ Map

The tracking map is implemented using **Leaflet** and OpenStreetMap tiles.

The default map is centered around IIT Bombay:

```text
Latitude:  19.1334
Longitude: 72.9133
```

The map:

* Starts at zoom level 15
* Supports zooming up to level 18
* Restricts the visible area around IIT Bombay
* Displays driver markers
* Displays user markers
* Updates positions in real time

---

# ⚙️ Environment Variables

Create:

```text
backend/.env
```

Example:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5001
```

The frontend automatically uses:

```text
Local:
http://localhost:5001

Production:
https://tracknow-backend.onrender.com
```

The AI server uses:

```text
http://localhost:8001
```

> Never commit your real `.env` file or database credentials to GitHub.

---

# 🚀 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Pranav-Redij/thegame_backend.git
cd TrackNow
```

---

## 2. Start MongoDB

Configure your MongoDB connection string in:

```text
backend/.env
```

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5001
```

---

## 3. Start Backend

```bash
cd backend
npm install
npm start
```

Backend:

```text
http://localhost:5001
```

---

## 4. Start Frontend

Open another terminal:

```bash
cd frontend
npm install
npm start
```

Frontend:

```text
http://localhost:3000
```

---

## 5. Start AI Server

Open another terminal:

```bash
cd ai-server
python -m venv venv
```

Activate the environment.

### macOS / Linux

```bash
source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the AI server:

```bash
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

AI API:

```text
http://localhost:8001
```

---

# 🔄 Complete System Flow

```text
                    TRACKNOW
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
     Driver           User         Security
        │              │              │
        │              │              │
        ▼              ▼              ▼
   GPS Tracking   GPS Sharing    Vehicle Entry
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
                   Socket.IO
                       │
                       ▼
                  Live Map
                       │
                       │
Security ──► AI Detection ──► Plate + Type
                       │
                       ▼
                 Temporary Pass
                       │
                       ▼
                    QR Code
                       │
                       ▼
                 Temporary User
                       │
                       ▼
                Live GPS Sharing
                       │
                       ▼
                 Security Map
                       │
                 Time Expires
                       │
                       ▼
                   Red List
```

---

# 🔒 Security Features

* JWT authentication
* Temporary JWT tokens
* Temporary token purpose validation
* Temporary token reuse protection
* Password hashing using bcrypt
* Protected REST endpoints
* Expiry validation for temporary users
* Vehicle registration-number validation
* CORS configuration
* Server-side temporary-user validation

---

# 📌 Main Modules

### 1. Tracking Module

Provides:

* Driver GPS tracking
* User GPS sharing
* Real-time map updates
* Driver/user markers

### 2. Security Module

Provides:

* Security authentication
* Temporary vehicle registration
* QR pass generation
* Active-user management
* Red-list management
* Security map

### 3. AI Module

Provides:

* Vehicle detection
* Vehicle classification
* License plate detection
* OCR
* Automatic plate-number extraction

### 4. Access-Control Module

Provides:

* Temporary JWT
* QR-based login
* Time-limited access
* Automatic expiry
* Red-list generation

---

# 🔮 Future Improvements

* Store complete vehicle entry/exit history
* Add notifications for expired passes
* Improve OCR accuracy for Indian license plates
* Add analytics dashboard for security personnel
* Add geofencing alerts
* Add historical GPS tracking
* Add admin dashboard
* Add role-specific authorization in middleware
* Add automated violation reports
* Deploy the AI inference service separately
* Add vehicle-entry/exit timestamps and audit logs

---

# 👨‍💻 Author

**Pranav Redij**

TrackNow — Real-Time Vehicle Tracking & Security Management System

---

## ⭐ Project Highlights

> **TrackNow combines real-time GPS tracking, Socket.IO communication, QR-based temporary access, automated red-list management, and an AI-powered YOLOv8 + OCR pipeline into a single vehicle security platform.**
