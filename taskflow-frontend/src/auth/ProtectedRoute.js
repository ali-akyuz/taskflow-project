import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Token yoksa başlangıç sayfasına yönlendir
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
