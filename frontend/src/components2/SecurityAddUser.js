import { useEffect, useRef, useState } from "react";
import "./style2/SecurityAddUser.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL, { AI_SERVER_URL } from "../config";
import { QRCodeCanvas } from "qrcode.react";


const TempUserAdd = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  const [formData, setFormData] = useState({
    platenumber: "",
    allottedTime: "",
    type: "private"
  });
  const [token, setToken] = useState("");

  // ===== AI Camera Detection (optional, toggled on/off) =====
  const [aiMode, setAiMode] = useState(false);
  const [serverStatus, setServerStatus] = useState("checking"); // checking | online | offline
  const [cameraError, setCameraError] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!showPopup || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showPopup, timeLeft]);

  // Start/stop the camera and check the local AI server whenever the
  // toggle changes. Switching it off fully releases the camera.
  useEffect(() => {
    if (!aiMode) {
      stopCamera();
      setDetectionResult(null);
      setCameraError("");
      return;
    }

    checkServerHealth();
    startCamera();

    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiMode]);

  const checkServerHealth = async () => {
    setServerStatus("checking");
    try {
      const res = await axios.get(`${AI_SERVER_URL}/health`, { timeout: 4000 });
      setServerStatus(res.data?.status === "ok" ? "online" : "offline");
    } catch (err) {
      setServerStatus("offline");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError("");
    } catch (err) {
      setCameraError(
        "Could not access the camera. Check browser permissions and make sure no other app is using it."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

   const handleChange = (e) => {
      const { name, value } = e.target;

      setFormData({
        ...formData,
        [name]: name === "platenumber" ? value.toUpperCase() : value
      });
   };

  // Captures the current camera frame and sends it to the local AI
  // detection server (see /ai-server). The server returns a suggested
  // plate number + vehicle type, which we use to pre-fill the form below
  // — the person can still edit either field before submitting.
  const handleCaptureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setDetecting(true);
    setCameraError("");

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setDetecting(false);
          setCameraError("Could not capture a frame, please try again.");
          return;
        }

        const data = new FormData();
        data.append("file", blob, "frame.jpg");

        try {
          const res = await axios.post(`${AI_SERVER_URL}/detect`, data, {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 15000
          });

          const result = res.data;
          setServerStatus("online");
          setDetectionResult(result);

          setFormData((prev) => ({
            ...prev,
            platenumber: result.plateNumber ? result.plateNumber : prev.platenumber,
            type: result.vehicleType ? result.vehicleType : prev.type
          }));
        } catch (err) {
          console.error(err);
          setServerStatus("offline");
          setCameraError(
            "Could not reach the AI detection server. Is it running? See ai-server/README.md."
          );
        } finally {
          setDetecting(false);
        }
      },
      "image/jpeg",
      0.92
    );
  };

//have to add logic to check wether the car is already registered or not.
  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  try {
    const redRes = await axios.get(
      `${BASE_URL}/adduser/checkredlist`,
      {
        params: { plate: formData.platenumber },
        headers:{
          Authorization:`Bearer ${token}`,
        },
        withCredentials: true
      }
    );

    if (redRes.data.isRed) {
      const allow = window.confirm(
        "Vehicle is in RED LIST. Allow entry?"
      );

      if (!allow) {
        setFormData({
          platenumber: "",
          allottedTime: "",
          type: "private",
        });
        return;
      }
    }

    
    const response = await axios.post(
      `${BASE_URL}/adduser/tempadd`,
      {
        plate: formData.platenumber,
        type: formData.type,
        time: new Date(),
        tilltime: new Date(
          Date.now() + Number(formData.allottedTime) * 60000
        ),
      },
      {
        headers:{
          Authorization:`Bearer ${token}`,
        },
        withCredentials: true 
      }
    );


    setToken(response.data.token);


    setTimeLeft(120);
    setShowPopup(true);

  } catch (err) {
    const status = err.response?.status;
    if (status === 409) {
    alert("QR already used");
    navigate("/qr-used");   // or show a message page
    } else if (status === 401) {
    alert("Invalid or expired QR");
    navigate("/error");
    } else {
    console.error(err);
    navigate("/error");
  }
  }
};


  const handleLogout = () =>{
      localStorage.clear();
  };

  return (
    <div className="temp-add-page">
      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <h2 className="nav-left">Temp User</h2>
        <div className="nav-center">
          <Link to="/adduser"><span className="nav-text active">Add</span></Link>
          <Link to="/manageuser"><span className="nav-text">Manage</span></Link>
          <Link to="/securitymap"><span className="nav-text">Map</span></Link>
        </div>

       <Link to="/securitylogin"> <button onClick={handleLogout} className="logout-btn">Logout</button> </Link>
      </nav>

      {/* ===== CONTENT ===== */}
      <main className="content">
        <h1 className="title">Add Temporary User</h1>

        {/* ===== AI CAMERA DETECTION TOGGLE ===== */}
        <div className="ai-toggle-row">
          <label className="ai-toggle" htmlFor="ai-toggle-input">
            <input
              id="ai-toggle-input"
              type="checkbox"
              checked={aiMode}
              onChange={(e) => setAiMode(e.target.checked)}
            />
            <span className="ai-toggle-slider" />
          </label>
          <span className="ai-toggle-label">AI Camera Detection</span>

          {aiMode && (
            <span className={`server-badge server-badge--${serverStatus}`}>
              <span className="server-dot" />
              {serverStatus === "online" && "AI server connected"}
              {serverStatus === "offline" && "AI server offline"}
              {serverStatus === "checking" && "Checking..."}
            </span>
          )}
        </div>

        {/* ===== CAMERA PANEL (only when AI mode is on) ===== */}
        {aiMode && (
          <div className="camera-panel">
            <div className="camera-frame">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
              />
              <span className="camera-corner camera-corner--tl" />
              <span className="camera-corner camera-corner--tr" />
              <span className="camera-corner camera-corner--bl" />
              <span className="camera-corner camera-corner--br" />
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {cameraError && <p className="camera-error">{cameraError}</p>}

            <button
              type="button"
              className="capture-btn"
              onClick={handleCaptureAndDetect}
              disabled={detecting || serverStatus !== "online" || !!cameraError}
            >
              {detecting ? "Detecting..." : "Capture & Detect"}
            </button>

            {detectionResult && (
              <div className="detection-card">
                {detectionResult.plateCrop && (
                  <img
                    className="plate-thumb"
                    src={`data:image/jpeg;base64,${detectionResult.plateCrop}`}
                    alt="Detected plate crop"
                  />
                )}
                <div className="detection-info">
                  <p>
                    Plate confidence:{" "}
                    <strong>
                      {Math.round((detectionResult.plateConfidence || 0) * 100)}%
                    </strong>
                  </p>
                  <p>
                    Vehicle type confidence:{" "}
                    <strong>
                      {Math.round((detectionResult.vehicleConfidence || 0) * 100)}%
                    </strong>
                  </p>
                  <p className="detection-hint">
                    Fields below were auto-filled — please verify before
                    generating the pass.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="platenumber"
            placeholder="Car Number"
            required
            value={formData.platenumber}
            onChange={handleChange}
          />

          <select
            name="type"
            required
            value={formData.type}
            onChange={handleChange}
          >
            <option value="private">Private</option>
            <option value="auto">Auto</option>
            <option value="cab">Cab</option>
            <option value="bus">Bus</option>
            <option value="two-wheeler">Two-Wheeler</option>
            <option value="delivery">Delivery</option>
            <option value="construction">Construction</option>
            <option value="other">Other</option>
          </select>

          <input
            type="number"
            name="allottedTime"
            placeholder="Time (in minutes)"
            required
            value={formData.allottedTime}
            onChange={handleChange}
          />

          

          <button className="submit-btn">Generate Pass</button>
        </form>
      </main>

      {/* ===== POPUP ===== */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Temporary Pass</h2>

            {token && (
              <div className="barcode">
                <QRCodeCanvas
                  value={`${window.location.origin}/tempuserloading?token=${token}`}
                  size={180}
                />

                <p className="qr-link">
                  <a
                    href={`${window.location.origin}/tempuserloading?token=${token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {window.location.origin}/tempuserloading?token={token}
                  </a>
                </p>
              </div>
            )}


            <p className="timer">
              Valid for: <strong>{formatTime(timeLeft)}</strong>
            </p>

            {timeLeft <= 0 && (
              <p className="expired">Pass Expired</p>
            )}

            <button
              className="submit-btn"
              onClick={() => {
                setShowPopup(false);
                setTimeLeft(120);
                setToken("");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TempUserAdd;
