import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const storedToken = localStorage.getItem("token");

  // allow access if we already have a token OR if a temp token is present in query
  const params = new URLSearchParams(location.search);
  const Token = params.get("token");

  if (storedToken || Token) {
    return children;
  }
  //console.log("storedToken(inside link):", storedToken);
  //console.log("Token:", Token);
  return <Navigate to="/" replace />;
};

const TempProtectedRoute = ({ children }) => {
  const tempToken = localStorage.getItem("token");
  if (!tempToken) return <Navigate to="/error" replace />;
  return children;
};

export { ProtectedRoute, TempProtectedRoute };
