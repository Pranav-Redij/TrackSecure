const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5001"
    : "https://tracknow-backend.onrender.com";
export default BASE_URL;

// Local Python AI detection server (see /ai-server). This only ever runs
// on localhost since it needs the laptop's own camera + GPU/CPU - it has
// no production/remote counterpart.
export const AI_SERVER_URL = "http://localhost:8001";