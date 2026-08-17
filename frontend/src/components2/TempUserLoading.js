import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";

const TempUserLoading = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    console.log("✅ TempUserLoading mounted");

    const tempToken = searchParams.get("token");
    console.log("🔑 token from URL:", tempToken);

    if (!tempToken) {
      console.error("❌ No token in URL");
      return;
    }

    const run = async () => {
      try {
        console.log("📡 Calling templogin API...");
        const res = await axios.post(
          `${BASE_URL}/adduser/templogin`,
          {},
          { headers: { Authorization: `Bearer ${tempToken}` } }
        );

        console.log("✅ API success:", res.data);

        localStorage.setItem("token", res.data.token);
        console.log("💾 Token stored in localStorage");

        console.log("➡️ Navigating to /tempuserhome");
        navigate("/tempuserhome", { replace: true });
      } catch (err) {
        console.error("❌ templogin failed:", err);
      }
    };

    run();
  }, []);

  return <h1>Loading...</h1>;
};

export default TempUserLoading;
